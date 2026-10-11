import { Request, Response, NextFunction } from 'express';
import { prisma, ContentStatus } from '@shasthi-guru/database';
import { z } from 'zod';

// ==========================================
// IMPACT STATISTICS
// ==========================================

export const getPublicImpactStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statistics = await prisma.impactStatistic.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: { statistics } });
  } catch (error) {
    next(error);
  }
};

export const getAdminImpactStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statistics = await prisma.impactStatistic.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: { statistics } });
  } catch (error) {
    next(error);
  }
};

export const updateImpactStat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { numberLabel, title, description, displayOrder, status } = req.body;
    
    const statistic = await prisma.impactStatistic.update({
      where: { id },
      data: {
        numberLabel,
        title,
        description,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : undefined,
        status,
      },
    });
    
    return res.status(200).json({ success: true, data: { statistic } });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// STUDENT STORIES
// ==========================================

export const getPublicStudentStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stories = await prisma.studentStory.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: { stories } });
  } catch (error) {
    next(error);
  }
};

export const getAdminStudentStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stories = await prisma.studentStory.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: { stories } });
  } catch (error) {
    next(error);
  }
};

export const createStudentStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, studentName, program, content, coverImage, status, displayOrder } = req.body;
    
    const story = await prisma.studentStory.create({
      data: {
        title,
        studentName,
        program,
        content,
        coverImage,
        status: status || ContentStatus.PUBLISHED,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
      },
    });
    
    return res.status(201).json({ success: true, data: { story } });
  } catch (error) {
    next(error);
  }
};

export const updateStudentStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, studentName, program, content, coverImage, status, displayOrder } = req.body;
    
    const story = await prisma.studentStory.update({
      where: { id },
      data: {
        title,
        studentName,
        program,
        content,
        coverImage,
        status,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : undefined,
      },
    });
    
    return res.status(200).json({ success: true, data: { story } });
  } catch (error) {
    next(error);
  }
};

export const deleteStudentStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.studentStory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    await prisma.studentStory.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    next(error);
  }
};
