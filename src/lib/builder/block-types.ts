// Block types for the Proposal Builder
// Based on builder2.0.md specification

import { JSONContent } from '@tiptap/core';

// ============================================================================
// Block Type Enum
// ============================================================================

export enum BlockType {
  // Intro
  HERO_SIMPLE = 'hero_simple',
  
  // Cases
  CASES_GRID = 'cases_grid',
  CASES_SLIDER = 'cases_slider',
  CASES_ROW = 'cases_row',
  
  // Timeline
  TIMELINE_LINEAR = 'timeline_linear',
  TIMELINE_VERTICAL = 'timeline_vertical',
  TIMELINE_PHASES = 'timeline_phases',
  
  // Team & Payment
  TEAM_ESTIMATE = 'team_estimate',
  PAYMENT_SCHEDULE = 'payment_schedule',
  
  // FAQ
  FAQ_ACCORDION = 'faq_accordion',
  FAQ_LIST = 'faq_list',
  
  // Footer
  CONTACTS_FOOTER = 'contacts_footer',
  
  // Content
  TEXT = 'text',
  GALLERY = 'gallery',
}

// ============================================================================
// Block Props Interfaces
// ============================================================================

// Hero Block Props
export interface HeroBlockProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  clientName?: string;
}

// Cases Block Props
export interface CasesBlockProps {
  heading?: {
    text: string;
    align?: 'left' | 'center' | 'right';
  };
  layout: 'slider' | 'grid' | 'row';
  caseIds: string[];
  showTags?: boolean;
  showLinks?: boolean;
}

// Timeline Block Props
export interface TimelineItem {
  title: string;
  date?: string;
  description?: string;
}

export interface TimelineBlockProps {
  heading?: {
    text: string;
    align?: 'left' | 'center' | 'right';
  };
  variant: 'linear' | 'vertical' | 'phases';
  items: TimelineItem[];
}

// Team Estimate Block Props
export interface TeamMember {
  role: string;
  qty: number;
  rate: number;
}

export interface TeamEstimateBlockProps {
  heading?: {
    text: string;
    align?: 'left' | 'center' | 'right';
  };
  members: TeamMember[];
  currency?: string;
  showTotal?: boolean;
}

// Payment Schedule Block Props
export interface PaymentItem {
  label: string;
  date?: string;
  amount: number;
}

export interface PaymentBlockProps {
  heading?: {
    text: string;
    align?: 'left' | 'center' | 'right';
  };
  items: PaymentItem[];
  currency?: string;
}

// FAQ Block Props
export interface FAQBlockProps {
  heading?: {
    text: string;
    align?: 'left' | 'center' | 'right';
  };
  faqItemIds: string[];
  layout: 'accordion' | 'list';
}

// Footer Block Props
export interface ContactItem {
  email?: string;
  phone?: string;
}

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'website';
  url: string;
}

export interface FooterBlockProps {
  contacts: ContactItem[];
  layout?: 'simple' | 'with_cta' | 'full';
  ctaText?: string;
  ctaUrl?: string;
  socialLinks?: SocialLink[];
  copyrightText?: string;
}

// Text Block Props
export interface TextBlockProps {
  content: JSONContent;
  align?: 'left' | 'center' | 'right';
}

// Gallery Block Props
export interface GalleryBlockProps {
  heading?: {
    text: string;
    align?: 'left' | 'center' | 'right';
  };
  imageUrls: string[];
}

// ============================================================================
// Union Type for All Block Props
// ============================================================================

export type BlockProps =
  | HeroBlockProps
  | CasesBlockProps
  | TimelineBlockProps
  | TeamEstimateBlockProps
  | PaymentBlockProps
  | FAQBlockProps
  | FooterBlockProps
  | TextBlockProps
  | GalleryBlockProps;

// ============================================================================
// Style Overrides
// ============================================================================

export interface StyleOverrides {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// Proposal Block Interface
// ============================================================================

export interface ProposalBlock {
  id: string;
  proposalId: string;
  type: BlockType;
  orderIndex: number;
  props: BlockProps;
  styleOverrides?: StyleOverrides;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isHeroBlock(block: ProposalBlock): block is ProposalBlock & { props: HeroBlockProps } {
  return block.type === BlockType.HERO_SIMPLE;
}

export function isCasesBlock(block: ProposalBlock): block is ProposalBlock & { props: CasesBlockProps } {
  return [BlockType.CASES_GRID, BlockType.CASES_SLIDER, BlockType.CASES_ROW].includes(block.type);
}

export function isTimelineBlock(block: ProposalBlock): block is ProposalBlock & { props: TimelineBlockProps } {
  return [BlockType.TIMELINE_LINEAR, BlockType.TIMELINE_VERTICAL, BlockType.TIMELINE_PHASES].includes(block.type);
}

export function isTeamEstimateBlock(block: ProposalBlock): block is ProposalBlock & { props: TeamEstimateBlockProps } {
  return block.type === BlockType.TEAM_ESTIMATE;
}

export function isPaymentBlock(block: ProposalBlock): block is ProposalBlock & { props: PaymentBlockProps } {
  return block.type === BlockType.PAYMENT_SCHEDULE;
}

export function isFAQBlock(block: ProposalBlock): block is ProposalBlock & { props: FAQBlockProps } {
  return [BlockType.FAQ_ACCORDION, BlockType.FAQ_LIST].includes(block.type);
}

export function isContactsBlock(block: ProposalBlock): block is ProposalBlock & { props: FooterBlockProps } {
  return block.type === BlockType.CONTACTS_FOOTER;
}

export function isTextBlock(block: ProposalBlock): block is ProposalBlock & { props: TextBlockProps } {
  return block.type === BlockType.TEXT;
}

export function isGalleryBlock(block: ProposalBlock): block is ProposalBlock & { props: GalleryBlockProps } {
  return block.type === BlockType.GALLERY;
}
