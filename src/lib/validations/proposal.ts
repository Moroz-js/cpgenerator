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

export const createProposalSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  clientName: z.string().max(200, 'Client name is too long').optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']).default('draft'),
  timeline: timelineSchema.optional(),
  teamEstimate: z.array(teamEstimateSchema).optional(),
  selectedCases: z.array(z.string().uuid()).default([]),
  contacts: contactsSchema.optional(),
  processes: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  faq: z.array(faqItemSchema).default([]),
  paymentSchedule: z.array(paymentScheduleItemSchema).default([]),
  loomVideos: z.array(
    z.object({
      url: z.string().url('Invalid URL'),
      section: z.string(),
    })
  ).default([]),
});

export const updateProposalSchema = createProposalSchema.partial().extend({
  id: z.string().uuid('Invalid proposal ID'),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type TeamEstimate = z.infer<typeof teamEstimateSchema>;
export type Timeline = z.infer<typeof timelineSchema>;
export type PaymentScheduleItem = z.infer<typeof paymentScheduleItemSchema>;
export type FAQItem = z.infer<typeof faqItemSchema>;
