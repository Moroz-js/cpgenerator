import { z } from 'zod';

const teamEstimateSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  hours: z.number().min(0, 'Hours must be positive'),
  rate: z.number().min(0, 'Rate must be positive'),
  total: z.number().min(0, 'Total must be positive'),
});

const timelineSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  milestones: z.array(
    z.object({
      title: z.string(),
      date: z.string(),
      description: z.string().optional(),
    })
  ),
});

const paymentScheduleItemSchema = z.object({
  date: z.string(),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string(),
});

const faqItemSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

const contactsSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const createTemplateSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  name: z.string().min(1, 'Template name is required').max(200, 'Name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  timeline: timelineSchema.optional(),
  teamEstimate: z.array(teamEstimateSchema).optional(),
  contacts: contactsSchema.optional(),
  processes: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  faq: z.array(faqItemSchema).default([]),
  paymentSchedule: z.array(paymentScheduleItemSchema).default([]),
});

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string().uuid('Invalid template ID'),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
