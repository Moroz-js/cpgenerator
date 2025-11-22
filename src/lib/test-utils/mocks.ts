import type {
  User,
  Workspace,
  WorkspaceMember,
  Case,
  Proposal,
  Template,
  Comment,
  PublicLink,
} from '@/types';

// Mock user data
export const mockUser: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  fullName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
};

export const mockUser2: User = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'test2@example.com',
  fullName: 'Test User 2',
};

// Mock workspace data
export const mockWorkspace: Workspace = {
  id: '00000000-0000-0000-0000-000000000010',
  name: 'Test Workspace',
  ownerId: mockUser.id,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockWorkspaceMember: WorkspaceMember = {
  id: '00000000-0000-0000-0000-000000000020',
  workspaceId: mockWorkspace.id,
  userId: mockUser.id,
  role: 'owner',
  joinedAt: '2024-01-01T00:00:00Z',
  user: mockUser,
};

// Mock case data
export const mockCase: Case = {
  id: '00000000-0000-0000-0000-000000000030',
  workspaceId: mockWorkspace.id,
  title: 'Test Case',
  description: 'A test case description',
  technologies: ['React', 'TypeScript', 'Next.js'],
  results: 'Successfully delivered the project',
  images: ['https://example.com/image1.jpg'],
  createdBy: mockUser.id,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock proposal data
export const mockProposal: Proposal = {
  id: '00000000-0000-0000-0000-000000000040',
  workspaceId: mockWorkspace.id,
  title: 'Test Proposal',
  clientName: 'Test Client',
  status: 'draft',
  timeline: {
    startDate: '2024-02-01',
    endDate: '2024-06-01',
    milestones: [
      {
        title: 'Project Kickoff',
        date: '2024-02-01',
        description: 'Initial meeting and planning',
      },
    ],
  },
  teamEstimate: [
    {
      role: 'Frontend Developer',
      hours: 160,
      rate: 100,
      total: 16000,
    },
  ],
  selectedCases: [mockCase.id],
  contacts: {
    email: 'client@example.com',
    phone: '+1234567890',
    address: '123 Test St',
  },
  processes: '<p>Our development process</p>',
  techStack: ['React', 'Next.js', 'TypeScript'],
  faq: [
    {
      question: 'What is the timeline?',
      answer: '4 months',
    },
  ],
  paymentSchedule: [
    {
      date: '2024-02-01',
      amount: 5000,
      description: 'Initial payment',
    },
  ],
  loomVideos: [
    {
      url: 'https://loom.com/share/test',
      section: 'introduction',
    },
  ],
  createdBy: mockUser.id,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock template data
export const mockTemplate: Template = {
  id: '00000000-0000-0000-0000-000000000050',
  workspaceId: mockWorkspace.id,
  name: 'Test Template',
  description: 'A test template',
  timeline: {
    startDate: '2024-02-01',
    endDate: '2024-06-01',
    milestones: [],
  },
  teamEstimate: [],
  contacts: {
    email: 'contact@example.com',
  },
  processes: '<p>Template process</p>',
  techStack: ['React', 'TypeScript'],
  faq: [],
  paymentSchedule: [],
  createdBy: mockUser.id,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock comment data
export const mockComment: Comment = {
  id: '00000000-0000-0000-0000-000000000060',
  sectionId: '00000000-0000-0000-0000-000000000070',
  authorId: mockUser.id,
  content: 'This is a test comment',
  isResolved: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  author: mockUser,
};

// Mock public link data
export const mockPublicLink: PublicLink = {
  id: '00000000-0000-0000-0000-000000000080',
  proposalId: mockProposal.id,
  slug: 'test-client-proposal',
  isActive: true,
  createdBy: mockUser.id,
  createdAt: '2024-01-01T00:00:00Z',
};

// Mock Supabase client
// Note: Import vi from vitest in your test files to use this mock
export function createMockSupabaseClient(vi: any) {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  };
}
