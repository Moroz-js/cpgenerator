import * as fc from 'fast-check';
import type {
  User,
  Workspace,
  Case,
  Proposal,
  Template,
  Comment,
  TeamEstimate,
  Timeline,
  PaymentScheduleItem,
  FAQItem,
} from '@/types';

// Arbitrary generators for property-based testing using fast-check

// Basic generators
export const uuidArb = fc.uuid();

// Generate realistic emails that pass Zod validation (alphanumeric + common chars only)
export const emailArb = fc.tuple(
  fc.stringMatching(/^[a-z0-9]+$/), // Start with alphanumeric
  fc.stringMatching(/^[a-z0-9]+$/), // Domain must be alphanumeric
  fc.constantFrom('com', 'org', 'net', 'io', 'dev')
).map(([local, domain, tld]) => `${local}@${domain}.${tld}`)
  .filter(email => email.length >= 5 && email.length <= 100);

export const urlArb = fc.webUrl();
export const dateStringArb = fc.date().map(d => d.toISOString());
export const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 });
export const shortStringArb = fc.string({ minLength: 1, maxLength: 50 });
export const longStringArb = fc.string({ minLength: 1, maxLength: 5000 });

// User generator
export const userArb: fc.Arbitrary<User> = fc.record({
  id: uuidArb,
  email: emailArb,
  fullName: fc.option(nonEmptyStringArb, { nil: undefined }),
  avatarUrl: fc.option(urlArb, { nil: undefined }),
});

// Workspace generator
export const workspaceArb: fc.Arbitrary<Workspace> = fc.record({
  id: uuidArb,
  name: nonEmptyStringArb,
  ownerId: uuidArb,
  createdAt: dateStringArb,
  updatedAt: dateStringArb,
});

// Case link generator
export const caseLinkArb = fc.record({
  type: fc.constantFrom('website', 'github', 'app_store', 'google_play', 'demo', 'other'),
  url: urlArb,
  title: nonEmptyStringArb,
});

// Case generator
export const caseArb: fc.Arbitrary<Case> = fc.record({
  id: uuidArb,
  workspaceId: uuidArb,
  title: nonEmptyStringArb,
  description: fc.option(longStringArb, { nil: undefined }),
  technologies: fc.array(shortStringArb, { minLength: 0, maxLength: 10 }),
  results: fc.option(longStringArb, { nil: undefined }),
  images: fc.array(urlArb, { minLength: 0, maxLength: 5 }),
  links: fc.array(caseLinkArb, { minLength: 0, maxLength: 5 }),
  createdBy: uuidArb,
  createdAt: dateStringArb,
  updatedAt: dateStringArb,
});

// Team estimate generator
export const teamEstimateArb: fc.Arbitrary<TeamEstimate> = fc.record({
  role: nonEmptyStringArb,
  hours: fc.nat({ max: 1000 }),
  rate: fc.nat({ max: 500 }),
  total: fc.nat({ max: 500000 }),
});

// Timeline generator
export const timelineArb: fc.Arbitrary<Timeline> = fc.record({
  startDate: dateStringArb,
  endDate: dateStringArb,
  milestones: fc.array(
    fc.record({
      title: nonEmptyStringArb,
      date: dateStringArb,
      description: fc.option(nonEmptyStringArb, { nil: undefined }),
    }),
    { minLength: 0, maxLength: 10 }
  ),
});

// Payment schedule item generator
export const paymentScheduleItemArb: fc.Arbitrary<PaymentScheduleItem> = fc.record({
  date: dateStringArb,
  amount: fc.nat({ max: 1000000 }),
  description: nonEmptyStringArb,
});

// FAQ item generator
export const faqItemArb: fc.Arbitrary<FAQItem> = fc.record({
  question: nonEmptyStringArb,
  answer: nonEmptyStringArb,
});

// Proposal generator
export const proposalArb: fc.Arbitrary<Proposal> = fc.record({
  id: uuidArb,
  workspaceId: uuidArb,
  title: nonEmptyStringArb,
  clientName: fc.option(nonEmptyStringArb, { nil: undefined }),
  status: fc.constantFrom('draft', 'sent', 'accepted', 'rejected'),
  timeline: fc.option(timelineArb, { nil: undefined }),
  teamEstimate: fc.option(fc.array(teamEstimateArb, { minLength: 0, maxLength: 10 }), { nil: undefined }),
  selectedCases: fc.array(uuidArb, { minLength: 0, maxLength: 10 }),
  contacts: fc.option(
    fc.record({
      email: fc.option(emailArb, { nil: undefined }),
      phone: fc.option(nonEmptyStringArb, { nil: undefined }),
      address: fc.option(nonEmptyStringArb, { nil: undefined }),
    }),
    { nil: undefined }
  ),
  processes: fc.option(longStringArb, { nil: undefined }),
  techStack: fc.array(shortStringArb, { minLength: 0, maxLength: 20 }),
  faq: fc.array(faqItemArb, { minLength: 0, maxLength: 10 }),
  paymentSchedule: fc.array(paymentScheduleItemArb, { minLength: 0, maxLength: 10 }),
  loomVideos: fc.array(
    fc.record({
      url: urlArb,
      section: nonEmptyStringArb,
    }),
    { minLength: 0, maxLength: 5 }
  ),
  createdBy: uuidArb,
  createdAt: dateStringArb,
  updatedAt: dateStringArb,
  lastAutosave: fc.option(dateStringArb, { nil: undefined }),
});

// Template generator
export const templateArb: fc.Arbitrary<Template> = fc.record({
  id: uuidArb,
  workspaceId: uuidArb,
  name: nonEmptyStringArb,
  description: fc.option(nonEmptyStringArb, { nil: undefined }),
  timeline: fc.option(timelineArb, { nil: undefined }),
  teamEstimate: fc.option(fc.array(teamEstimateArb, { minLength: 0, maxLength: 10 }), { nil: undefined }),
  contacts: fc.option(
    fc.record({
      email: fc.option(emailArb, { nil: undefined }),
      phone: fc.option(nonEmptyStringArb, { nil: undefined }),
      address: fc.option(nonEmptyStringArb, { nil: undefined }),
    }),
    { nil: undefined }
  ),
  processes: fc.option(longStringArb, { nil: undefined }),
  techStack: fc.array(shortStringArb, { minLength: 0, maxLength: 20 }),
  faq: fc.array(faqItemArb, { minLength: 0, maxLength: 10 }),
  paymentSchedule: fc.array(paymentScheduleItemArb, { minLength: 0, maxLength: 10 }),
  createdBy: uuidArb,
  createdAt: dateStringArb,
  updatedAt: dateStringArb,
});

// Comment generator
export const commentArb: fc.Arbitrary<Comment> = fc.record({
  id: uuidArb,
  sectionId: uuidArb,
  parentId: fc.option(uuidArb, { nil: undefined }),
  authorId: uuidArb,
  content: nonEmptyStringArb,
  isResolved: fc.boolean(),
  createdAt: dateStringArb,
  updatedAt: dateStringArb,
  author: fc.option(userArb, { nil: undefined }),
  replies: fc.option(fc.constant([]), { nil: undefined }),
});

// Helper to generate valid credentials
export const validCredentialsArb = fc.record({
  email: emailArb,
  password: fc.string({ minLength: 8, maxLength: 50 })
    .filter(s => s.trim().length >= 8), // Ensure password is not just whitespace
});

// Helper to generate invalid credentials
export const invalidEmailArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('@'));
export const shortPasswordArb = fc.string({ minLength: 0, maxLength: 7 });

// Helper to generate whitespace-only strings
export const whitespaceStringArb = fc.string({ minLength: 1, maxLength: 20 })
  .map(s => s.replace(/./g, ' '));

// Helper to generate valid file sizes (under 10MB)
export const validFileSizeArb = fc.nat({ max: 10 * 1024 * 1024 });

// Helper to generate invalid file sizes (over 10MB)
export const invalidFileSizeArb = fc.integer({ min: 10 * 1024 * 1024 + 1, max: 100 * 1024 * 1024 });
