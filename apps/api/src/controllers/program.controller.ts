import { Request, Response, NextFunction } from 'express';
import { prisma, ContentStatus, UserRole } from '@shasthi-guru/database';
import { logAuditEvent } from '../services/audit.service';

/**
 * Validates an image URL to ensure it is not a script or dangerous URI scheme
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return true;
}

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

export async function getPublicPrograms(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search } = req.query;

    const where: any = {
      isPublished: true,
      category: {
        status: ContentStatus.PUBLISHED,
      },
    };

    if (category && category !== 'all') {
      where.category = {
        slug: category as string,
        status: ContentStatus.PUBLISHED,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { overview: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const programs = await prisma.program.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { programs },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProgramBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const program = await prisma.program.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!program || !program.isPublished) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Academic program not found or is currently unavailable.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { program },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.programCategory.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { programs: { where: { isPublished: true } } },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN CMS ENDPOINTS
// ============================================================================

export async function getAdminPrograms(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, categoryId, status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { overview: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId as string;
    }

    if (status === 'PUBLISHED') {
      where.isPublished = true;
    } else if (status === 'DRAFT') {
      where.isPublished = false;
    }

    const [total, programs] = await Promise.all([
      prisma.program.count({ where }),
      prisma.program.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }],
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { enquiries: true, students: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        programs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminProgramById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: { enquiries: true, students: true },
        },
      },
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Program not found.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { program },
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminProgram(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const {
      categoryId,
      name,
      slug,
      degreeLevel = 'Undergraduate',
      durationYears = '4 Years',
      overview,
      eligibilityCriteria,
      careerOpportunities,
      imageUrl,
      displayOrder = 0,
      isPublished = true,
    } = req.body;

    if (!categoryId || !name || !slug || !overview) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required program fields (name, slug, categoryId, overview).' },
      });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (!cleanSlug) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid URL slug.' },
      });
    }

    // Check slug uniqueness
    const existingSlug = await prisma.program.findUnique({
      where: { slug: cleanSlug },
    });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_SLUG', message: `A program with the slug '${cleanSlug}' already exists.` },
      });
    }

    // Verify category exists
    const category = await prisma.programCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CATEGORY', message: 'Selected program category does not exist.' },
      });
    }

    // Validate image URL
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_IMAGE_URL', message: 'Image URL contains invalid protocol or characters.' },
      });
    }

    const program = await prisma.program.create({
      data: {
        categoryId,
        name: name.trim(),
        slug: cleanSlug,
        degreeLevel: degreeLevel.trim(),
        durationYears: durationYears.trim(),
        overview: overview.trim(),
        eligibilityCriteria: eligibilityCriteria ? eligibilityCriteria.trim() : null,
        careerOpportunities: careerOpportunities ? careerOpportunities.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
        isPublished: Boolean(isPublished),
      },
      include: { category: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: isPublished ? 'PROGRAM_PUBLISHED' : 'PROGRAM_CREATED',
      entity: 'Program',
      entityId: program.id,
      details: { name: program.name, slug: program.slug, isPublished },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Program created successfully.',
      data: { program },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminProgram(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;
    const {
      categoryId,
      name,
      slug,
      degreeLevel,
      durationYears,
      overview,
      eligibilityCriteria,
      careerOpportunities,
      imageUrl,
      displayOrder,
      isPublished,
    } = req.body;

    const existing = await prisma.program.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Program not found.' },
      });
    }

    const updates: any = {};

    if (name !== undefined) updates.name = name.trim();
    if (degreeLevel !== undefined) updates.degreeLevel = degreeLevel.trim();
    if (durationYears !== undefined) updates.durationYears = durationYears.trim();
    if (overview !== undefined) updates.overview = overview.trim();
    if (eligibilityCriteria !== undefined) updates.eligibilityCriteria = eligibilityCriteria ? eligibilityCriteria.trim() : null;
    if (careerOpportunities !== undefined) updates.careerOpportunities = careerOpportunities ? careerOpportunities.trim() : null;
    if (displayOrder !== undefined) updates.displayOrder = typeof displayOrder === 'number' ? displayOrder : 0;

    if (imageUrl !== undefined) {
      if (imageUrl && !isValidImageUrl(imageUrl)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_IMAGE_URL', message: 'Image URL contains invalid protocol or characters.' },
        });
      }
      updates.imageUrl = imageUrl ? imageUrl.trim() : null;
    }

    // Slug check if changed
    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      if (!cleanSlug) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid URL slug.' },
        });
      }

      if (cleanSlug !== existing.slug) {
        const slugConflict = await prisma.program.findUnique({
          where: { slug: cleanSlug },
        });
        if (slugConflict && slugConflict.id !== id) {
          return res.status(400).json({
            success: false,
            error: { code: 'DUPLICATE_SLUG', message: `A program with the slug '${cleanSlug}' already exists.` },
          });
        }
        updates.slug = cleanSlug;
      }
    }

    // Category check if changed
    if (categoryId !== undefined && categoryId !== existing.categoryId) {
      const category = await prisma.programCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_CATEGORY', message: 'Selected program category does not exist.' },
        });
      }
      updates.categoryId = categoryId;
    }

    // Publication state toggle
    let auditAction = 'PROGRAM_UPDATED';
    if (isPublished !== undefined) {
      const newPublished = Boolean(isPublished);
      if (newPublished !== existing.isPublished) {
        auditAction = newPublished ? 'PROGRAM_PUBLISHED' : 'PROGRAM_UNPUBLISHED';
      }
      updates.isPublished = newPublished;
    }

    const updated = await prisma.program.update({
      where: { id },
      data: updates,
      include: { category: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: auditAction,
      entity: 'Program',
      entityId: id,
      details: { updates, prevPublished: existing.isPublished, newPublished: updated.isPublished },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Program updated successfully.',
      data: { program: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminProgram(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enquiries: true, students: true },
        },
      },
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Program not found.' },
      });
    }

    // If program has historical student or enquiry associations, protect relational integrity
    if (program._count.enquiries > 0 || program._count.students > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_ASSOCIATED_PROGRAM',
          message: `Cannot delete program '${program.name}' because it is linked to ${program._count.enquiries} enquiry record(s). Unpublish it instead to keep records intact.`,
        },
      });
    }

    await prisma.program.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'PROGRAM_DELETED',
      entity: 'Program',
      entityId: id,
      details: { name: program.name, slug: program.slug },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Program '${program.name}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CATEGORY MANAGEMENT ENDPOINTS
// ============================================================================

export async function getAdminCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.programCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { programs: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { name, slug, description, displayOrder = 0 } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Category name and slug are required.' },
      });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const existing = await prisma.programCategory.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_SLUG', message: `Category with slug '${cleanSlug}' already exists.` },
      });
    }

    const category = await prisma.programCategory.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description ? description.trim() : null,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
        status: ContentStatus.PUBLISHED,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'CATEGORY_CREATED',
      entity: 'ProgramCategory',
      entityId: category.id,
      details: { name: category.name, slug: category.slug },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { name, slug, description, displayOrder, status } = req.body;

    const existing = await prisma.programCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found.' },
      });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description ? description.trim() : null;
    if (displayOrder !== undefined) updates.displayOrder = typeof displayOrder === 'number' ? displayOrder : 0;
    if (status !== undefined) updates.status = status;

    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      if (cleanSlug !== existing.slug) {
        const conflict = await prisma.programCategory.findUnique({
          where: { slug: cleanSlug },
        });
        if (conflict && conflict.id !== id) {
          return res.status(400).json({
            success: false,
            error: { code: 'DUPLICATE_SLUG', message: `Category slug '${cleanSlug}' already exists.` },
          });
        }
        updates.slug = cleanSlug;
      }
    }

    const updated = await prisma.programCategory.update({
      where: { id },
      data: updates,
    });

    await logAuditEvent({
      userId: user.id,
      action: 'CATEGORY_UPDATED',
      entity: 'ProgramCategory',
      entityId: id,
      details: updates,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: { category: updated },
    });
  } catch (error) {
    next(error);
  }
}
