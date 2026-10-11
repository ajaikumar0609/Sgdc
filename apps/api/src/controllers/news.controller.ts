import { Request, Response, NextFunction } from 'express';
import { prisma, UserRole } from '@shasthi-guru/database';
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

export async function getPublicNews(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isPublished: true };

    if (category && category !== 'all') {
      where.category = category as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        articles,
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

export async function getPublicNewsBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const article = await prisma.news.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    if (!article || !article.isPublished) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Article not found or is currently unpublished.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { article },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN CMS ENDPOINTS
// ============================================================================

export async function getAdminNews(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search, status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category as string;
    }

    if (status === 'PUBLISHED') {
      where.isPublished = true;
    } else if (status === 'DRAFT') {
      where.isPublished = false;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        articles,
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

export async function getAdminNewsById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const article = await prisma.news.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'News article not found.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { article },
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminNews(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { title, slug, category, excerpt, content, coverImage, isPublished = true } = req.body;

    if (!title || !slug || !category || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required news article fields.' },
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
    const existing = await prisma.news.findUnique({
      where: { slug: cleanSlug },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_SLUG', message: `An article with the slug '${cleanSlug}' already exists.` },
      });
    }

    // Validate cover image URL
    if (coverImage && !isValidImageUrl(coverImage)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_IMAGE_URL', message: 'Cover image URL contains invalid protocol or characters.' },
      });
    }

    const article = await prisma.news.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        category: category.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage ? coverImage.trim() : null,
        isPublished: Boolean(isPublished),
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: isPublished ? 'NEWS_PUBLISHED' : 'NEWS_CREATED',
      entity: 'News',
      entityId: article.id,
      details: { title: article.title, slug: article.slug, isPublished },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'News article created successfully.',
      data: { article },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminNews(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { title, slug, category, excerpt, content, coverImage, isPublished } = req.body;

    const existing = await prisma.news.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'News article not found.' },
      });
    }

    const updates: any = {};

    if (title !== undefined) updates.title = title.trim();
    if (category !== undefined) updates.category = category.trim();
    if (excerpt !== undefined) updates.excerpt = excerpt.trim();
    if (content !== undefined) updates.content = content.trim();

    if (coverImage !== undefined) {
      if (coverImage && !isValidImageUrl(coverImage)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_IMAGE_URL', message: 'Cover image URL contains invalid protocol or characters.' },
        });
      }
      updates.coverImage = coverImage ? coverImage.trim() : null;
    }

    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      if (!cleanSlug) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid URL slug.' },
        });
      }

      if (cleanSlug !== existing.slug) {
        const conflict = await prisma.news.findUnique({
          where: { slug: cleanSlug },
        });
        if (conflict && conflict.id !== id) {
          return res.status(400).json({
            success: false,
            error: { code: 'DUPLICATE_SLUG', message: `An article with the slug '${cleanSlug}' already exists.` },
          });
        }
        updates.slug = cleanSlug;
      }
    }

    let auditAction = 'NEWS_UPDATED';
    if (isPublished !== undefined) {
      const newPublished = Boolean(isPublished);
      if (newPublished !== existing.isPublished) {
        auditAction = newPublished ? 'NEWS_PUBLISHED' : 'NEWS_UNPUBLISHED';
      }
      updates.isPublished = newPublished;
    }

    const updated = await prisma.news.update({
      where: { id },
      data: updates,
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: auditAction,
      entity: 'News',
      entityId: id,
      details: { updates, prevPublished: existing.isPublished, newPublished: updated.isPublished },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'News article updated successfully.',
      data: { article: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminNews(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const existing = await prisma.news.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'News article not found.' },
      });
    }

    await prisma.news.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'NEWS_DELETED',
      entity: 'News',
      entityId: id,
      details: { title: existing.title, slug: existing.slug },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `News article '${existing.title}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}
