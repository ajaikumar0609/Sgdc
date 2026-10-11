import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;

export const studentEnquirySchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters.' })
    .max(100, { message: 'First name must not exceed 100 characters.' })
    .trim(),
  
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.' }),
  
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase(),
  
  address: z
    .string()
    .min(5, { message: 'Please provide a valid address with city or area (min 5 characters).' })
    .max(300, { message: 'Address must not exceed 300 characters.' })
    .trim(),
  
  district: z
    .string()
    .min(1, { message: 'Please select your district.' }),
  
  areaOfInterest: z
    .string()
    .min(1, { message: 'Please select an area of interest.' }),
  
  courseProgram: z
    .string()
    .min(1, { message: 'Please specify your desired course or program.' }),
  
  mark12th: z
    .string()
    .min(1, { message: 'Please enter your 12th standard mark or percentage (e.g., 85% or 510/600).' })
    .trim(),
  
  aadhaarNumber: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || aadhaarRegex.test(val.replace(/\s+/g, '')), {
      message: 'Aadhaar number must be a 12-digit number.',
    }),
  
  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must provide consent for Shasthi Guru counselors to contact you regarding educational guidance.',
    }),
  
  source: z.enum([
    'HOME_HERO',
    'ADMISSION_PAGE',
    'ADMISSION_QUERY',
    'PROGRAM_PAGE',
    'COUNSELING_PAGE',
    'ENQUIRY_PAGE',
    'CONTACT_PAGE',
    'DIRECT',
  ]).default('ENQUIRY_PAGE'),
});

export type StudentEnquiryFormData = z.infer<typeof studentEnquirySchema>;
