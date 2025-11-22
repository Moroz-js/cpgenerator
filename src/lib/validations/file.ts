import { z } from 'zod';

// Allowed MIME types for images
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

// Maximum file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    })
    .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type as any), {
      message: `File type must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    }),
});

export const caseImageUploadSchema = z.object({
  caseId: z.string().uuid('Invalid case ID'),
  file: z.instanceof(File, { message: 'File is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    })
    .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type as any), {
      message: `File type must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    }),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type CaseImageUploadInput = z.infer<typeof caseImageUploadSchema>;
