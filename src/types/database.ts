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

export interface CaseLink {
  type: 'website' | 'github' | 'app_store' | 'google_play' | 'demo' | 'other';
  url: string;
  title: string;
}

export interface Case {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  technologies: string[];
  results?: string;
  images: string[];
  links: CaseLink[];
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

export interface FAQ {
  id: string;
  workspaceId: string;
  question: string;
  answer: string;
  category?: string;
  orderIndex: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
  videoUrl?: string; // Video URL (Loom, YouTube, Vimeo, etc.)
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

// ============================================================================
// Brand Settings Types
// ============================================================================

export interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface BrandTypography {
  fontFamily: 'Inter' | 'Roboto' | 'Open Sans' | 'Lato' | 'Montserrat' | 'Poppins';
  headingFont: 'Inter' | 'Roboto' | 'Open Sans' | 'Lato' | 'Montserrat' | 'Poppins';
  bodyFont: 'Inter' | 'Roboto' | 'Open Sans' | 'Lato' | 'Montserrat' | 'Poppins';
}

export interface BrandComponents {
  cardRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadowSize: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface BrandSEO {
  title: string;
  description: string;
  ogImage: string;
}

export interface WorkspaceBrandSettings {
  id: string;
  workspaceId: string;
  logoUrl?: string;
  colors: BrandColors;
  typography: BrandTypography;
  components: BrandComponents;
  seo: BrandSEO;
  createdAt: string;
  updatedAt: string;
}

// Note: Result type is now in errors.ts
