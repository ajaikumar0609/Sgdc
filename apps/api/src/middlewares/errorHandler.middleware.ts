import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError || err?.name === 'ZodError') {
    const fields: Record<string, string> = {};
    err.errors?.forEach((e: any) => {
      const fieldPath = e.path.join('.') || 'body';
      fields[fieldPath] = e.message;
    });

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters.',
        fields,
      },
    });
  }

  console.error(`[API Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
