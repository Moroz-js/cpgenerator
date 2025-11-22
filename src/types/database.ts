// Database types for the Proposal Generator application

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  user?: User;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  token: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface Case {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  technologies: string[];
  results?: string;
  images: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamEstimate {
  role: string;
  hours: number;
  rate: number;
  total: number;
}

export interface Timeline {
  startDate: string;
  endDate: string;
  milestones: Array<{
    title: string;
    date: string;
    description?: string;
  }>;
}

export interface PaymentScheduleItem {
  date: string;
  amount: number;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Proposal {
  id: string;
  workspaceId: string;
  title: string;
  clientName?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  timeline?: Timeline;
  teamEstimate?: TeamEstimate[];
  selectedCases: string[];
  contacts?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  processes?: string; // Rich text HTML
  techStack: string[];
  faq: FAQItem[];
  paymentSchedule: PaymentScheduleItem[];
  loomVideos: Array<{ url: string; section: string }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastAutosave?: string;
}

export interface ProposalSection {
  id: string;
  proposalId: string;
  sectionType: 'introduction' | 'approach' | 'custom';
  content: any; // Tiptap JSON or similar
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface PreviewAttachment {
  id: string;
  sectionId: string;
  textReference: string;
  attachmentType: 'image' | 'link';
  attachmentUrl: string;
  createdAt: string;
}

export interface PublicLink {
  id: string;
  proposalId: string;
  slug: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  deactivatedAt?: string;
}

export interface Template {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  timeline?: Timeline;
  teamEstimate?: TeamEstimate[];
  contacts?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  processes?: string;
  techStack: string[];
  faq: FAQItem[];
  paymentSchedule: PaymentScheduleItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSection {
  id: string;
  templateId: string;
  sectionType: 'introduction' | 'approach' | 'custom';
  content: any;
  orderIndex: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  sectionId: string;
  parentId?: string;
  authorId: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
  replies?: Comment[];
}

export interface Presence {
  id: string;
  proposalId: string;
  userId: string;
  sectionId?: string;
  lastSeen: string;
  user?: User;
}

// Note: Result type is now in errors.ts
