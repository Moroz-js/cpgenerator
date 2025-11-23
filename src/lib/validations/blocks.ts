// Zod validation schemas for Proposal Builder blocks
// Based on builder2.0.md specification

import { z } from 'zod';
import { BlockType } from '../builder/block-types';

// ============================================================================
// Hero Block Schema
// ============================================================================

export const heroBlockSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  subtitle: z.string().max(500, 'Subtitle is too long').optional(),
  ctaLabel: z.string().max(50, 'CTA label is too long').optional(),
  clientName: z.string().max(100, 'Client name is too long').optional(),
});

// ============================================================================
// Cases Block Schema
// ============================================================================

export const casesBlockSchema = z.object({
  layout: z.enum(['slider', 'grid', 'row'], {
    message: 'Layout must be one of: slider, grid, row',
  }),
  caseIds: z.array(z.string().uuid('Invalid case ID')),
  showTags: z.boolean().optional().default(true),
  showLinks: z.boolean().optional().default(true),
});

// ============================================================================
// Timeline Block Schema
// ============================================================================

export const timelineItemSchema = z.object({
  title: z.string().min(1, 'Timeline item title is required').max(200, 'Title is too long'),
  date: z.string().optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
});

export const timelineBlockSchema = z.object({
  variant: z.enum(['linear', 'vertical', 'phases'], {
    message: 'Variant must be one of: linear, vertical, phases',
  }),
  items: z.array(timelineItemSchema).min(1, 'At least one timeline item is required'),
});

// ============================================================================
// Team Estimate Block Schema
// ============================================================================

export const teamMemberSchema = z.object({
  role: z.string().min(1, 'Role is required').max(100, 'Role name is too long'),
  qty: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be non-negative'),
});

export const teamEstimateBlockSchema = z.object({
  members: z.array(teamMemberSchema).min(1, 'At least one team member is required'),
  currency: z.string().max(10, 'Currency code is too long').optional().default('RUB'),
  showTotal: z.boolean().optional().default(true),
});

// ============================================================================
// Payment Schedule Block Schema
// ============================================================================

export const paymentItemSchema = z.object({
  label: z.string().min(1, 'Payment label is required').max(200, 'Label is too long'),
  date: z.string().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
});

export const paymentBlockSchema = z.object({
  items: z.array(paymentItemSchema).min(1, 'At least one payment item is required'),
  currency: z.string().max(10, 'Currency code is too long').optional().default('RUB'),
});

// ============================================================================
// FAQ Block Schema
// ============================================================================

export const faqBlockSchema = z.object({
  faqItemIds: z.array(z.string().uuid('Invalid FAQ item ID')),
  layout: z.enum(['accordion', 'list'], {
    message: 'Layout must be one of: accordion, list',
  }),
});

// ============================================================================
// Contacts Block Schema
// ============================================================================

export const contactItemSchema = z.object({
  label: z.string().max(100, 'Label is too long').optional(),
  name: z.string().max(100, 'Name is too long').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone number is too long').optional(),
  linkLabel: z.string().max(100, 'Link label is too long').optional(),
  linkUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const contactsBlockSchema = z.object({
  contacts: z.array(contactItemSchema).min(1, 'At least one contact is required'),
});

// ============================================================================
// Text Block Schema
// ============================================================================

// Tiptap JSONContent schema (simplified)
export const tiptapContentSchema = z.object({
  type: z.string(),
  content: z.array(z.any()).optional(),
  text: z.string().optional(),
  marks: z.array(z.any()).optional(),
  attrs: z.record(z.string(), z.any()).optional(),
});

export const textBlockSchema = z.object({
  content: tiptapContentSchema,
  align: z.enum(['left', 'center', 'right'], {
    message: 'Alignment must be one of: left, center, right',
  }).optional().default('left'),
});

// ============================================================================
// Gallery Block Schema
// ============================================================================

export const galleryBlockSchema = z.object({
  imageUrls: z
    .array(z.string().url('Invalid image URL'))
    .max(12, 'Gallery can contain maximum 12 images'),
});

// ============================================================================
// Style Overrides Schema
// ============================================================================

export const styleOverridesSchema = z.record(z.string(), z.string()).optional();

// ============================================================================
// Proposal Block Schema
// ============================================================================

export const proposalBlockSchema = z.object({
  id: z.string().uuid('Invalid block ID').optional(), // Optional for creation
  proposalId: z.string().uuid('Invalid proposal ID'),
  type: z.nativeEnum(BlockType, {
    message: 'Invalid block type',
  }),
  orderIndex: z.number().int('Order index must be an integer').min(0, 'Order index must be non-negative'),
  props: z.any(), // Will be validated based on block type
  styleOverrides: styleOverridesSchema,
});

// ============================================================================
// Block-specific validation functions
// ============================================================================

/**
 * Validate block props based on block type
 */
export function validateBlockProps(blockType: BlockType, props: unknown) {
  switch (blockType) {
    case BlockType.HERO_SIMPLE:
      return heroBlockSchema.safeParse(props);
    
    case BlockType.CASES_GRID:
    case BlockType.CASES_SLIDER:
    case BlockType.CASES_ROW:
      return casesBlockSchema.safeParse(props);
    
    case BlockType.TIMELINE_LINEAR:
    case BlockType.TIMELINE_VERTICAL:
    case BlockType.TIMELINE_PHASES:
      return timelineBlockSchema.safeParse(props);
    
    case BlockType.TEAM_ESTIMATE:
      return teamEstimateBlockSchema.safeParse(props);
    
    case BlockType.PAYMENT_SCHEDULE:
      return paymentBlockSchema.safeParse(props);
    
    case BlockType.FAQ_ACCORDION:
    case BlockType.FAQ_LIST:
      return faqBlockSchema.safeParse(props);
    
    case BlockType.CONTACTS_CARDS:
    case BlockType.CONTACTS_FOOTER:
      return contactsBlockSchema.safeParse(props);
    
    case BlockType.TEXT:
      return textBlockSchema.safeParse(props);
    
    case BlockType.GALLERY:
      return galleryBlockSchema.safeParse(props);
    
    default:
      // Return a failed parse result for unknown block types
      return z.object({}).safeParse({ _error: `Unknown block type: ${blockType}` });
  }
}

// ============================================================================
// Type exports
// ============================================================================

export type HeroBlockInput = z.infer<typeof heroBlockSchema>;
export type CasesBlockInput = z.infer<typeof casesBlockSchema>;
export type TimelineBlockInput = z.infer<typeof timelineBlockSchema>;
export type TimelineItemInput = z.infer<typeof timelineItemSchema>;
export type TeamEstimateBlockInput = z.infer<typeof teamEstimateBlockSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type PaymentBlockInput = z.infer<typeof paymentBlockSchema>;
export type PaymentItemInput = z.infer<typeof paymentItemSchema>;
export type FAQBlockInput = z.infer<typeof faqBlockSchema>;
export type ContactsBlockInput = z.infer<typeof contactsBlockSchema>;
export type ContactItemInput = z.infer<typeof contactItemSchema>;
export type TextBlockInput = z.infer<typeof textBlockSchema>;
export type GalleryBlockInput = z.infer<typeof galleryBlockSchema>;
export type ProposalBlockInput = z.infer<typeof proposalBlockSchema>;
