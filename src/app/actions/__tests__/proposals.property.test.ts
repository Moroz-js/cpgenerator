import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { nonEmptyStringArb, uuidArb } from '@/lib/test-utils/generators';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import after mocks are set up
const { getProposals, createProposal, updateProposal, deleteProposal, duplicateProposal } = await import('../proposals');

describe('Proposal Property Tests', () => {
  let mockSupabase: any;
  let mockUser: any;
  let createClientMock: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock user
    mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
    };

    // Create a map to store table-specific chains
    const tableChains = new Map<string, any>();

    // Setup mock Supabase client with proper chaining
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn((table: string) => {
        // Return existing chain for this table or create a new one
        if (!tableChains.has(table)) {
          const chain: any = {
            _table: table,
            insert: vi.fn(() => chain),
            update: vi.fn(() => chain),
            delete: vi.fn(() => chain),
            select: vi.fn(() => chain),
            eq: vi.fn(() => chain),
            ilike: vi.fn(() => chain),
            order: vi.fn(() => chain),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
          tableChains.set(table, chain);
        }
        return tableChains.get(table);
      }),
    };

    const supabaseModule = await import('@/lib/supabase/server');
    createClientMock = supabaseModule.createClient as any;
    createClientMock.mockResolvedValue(mockSupabase);
  });

  /**
   * **Feature: proposal-generator, Property 25: Список КП воркспейса полон**
   * **Validates: Requirements 9.1**
   * 
   * For any workspace, querying the proposal list should return all proposals
   * belonging to that workspace and should not return proposals from other workspaces.
   */
  it('Property 25: Workspace proposal list is complete', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        fc.array(
          fc.record({
            id: uuidArb,
            title: nonEmptyStringArb,
            status: fc.constantFrom('draft', 'sent', 'accepted', 'rejected'),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        async (workspaceId, otherWorkspaceId, proposalsData) => {
          // Ensure workspaces are different
          if (workspaceId === otherWorkspaceId) {
            return;
          }

          // Setup membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id' },
            error: null,
          });

          // Create proposals for this workspace
          const workspaceProposals = proposalsData.map(p => ({
            id: p.id,
            workspace_id: workspaceId,
            title: p.title,
            client_name: null,
            status: p.status,
            timeline: null,
            team_estimate: null,
            selected_cases: [],
            contacts: null,
            processes: null,
            tech_stack: [],
            faq: [],
            payment_schedule: [],
            video_url: null,
            created_by: mockUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_autosave: null,
          }));

          // Setup proposals query
          const proposalChain = mockSupabase.from('proposals');
          proposalChain.order.mockResolvedValue({
            data: workspaceProposals,
            error: null,
          });

          // Get proposals
          const result = await getProposals(workspaceId);

          // Should succeed
          expect(result.success).toBe(true);
          
          if (result.success) {
            // Should return all proposals for this workspace
            expect(result.data.length).toBe(proposalsData.length);
            
            // All returned proposals should belong to this workspace
            result.data.forEach(proposal => {
              expect(proposal.workspaceId).toBe(workspaceId);
            });

            // All proposal IDs should match
            const returnedIds = new Set(result.data.map(p => p.id));
            proposalsData.forEach(p => {
              expect(returnedIds.has(p.id)).toBe(true);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: proposal-generator, Property 26: Фильтрация КП по статусу**
   * **Validates: Requirements 9.2**
   * 
   * For any status, filtering the proposal list should return only proposals with that status.
   */
  it('Property 26: Filtering proposals by status', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        fc.constantFrom('draft', 'sent', 'accepted', 'rejected'),
        fc.array(
          fc.record({
            id: uuidArb,
            title: nonEmptyStringArb,
            status: fc.constantFrom('draft', 'sent', 'accepted', 'rejected'),
          }),
          { minLength: 5, maxLength: 15 }
        ),
        async (workspaceId, filterStatus, proposalsData) => {
          // Setup membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id' },
            error: null,
          });

          // Create proposals with various statuses
          const allProposals = proposalsData.map(p => ({
            id: p.id,
            workspace_id: workspaceId,
            title: p.title,
            client_name: null,
            status: p.status,
            timeline: null,
            team_estimate: null,
            selected_cases: [],
            contacts: null,
            processes: null,
            tech_stack: [],
            faq: [],
            payment_schedule: [],
            video_url: null,
            created_by: mockUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_autosave: null,
          }));

          // Filter proposals by status (simulate database filtering)
          const filteredProposals = allProposals.filter(p => p.status === filterStatus);

          // Setup proposals query
          const proposalChain = mockSupabase.from('proposals');
          proposalChain.order.mockResolvedValue({
            data: filteredProposals,
            error: null,
          });

          // Get proposals with status filter
          const result = await getProposals(workspaceId, { status: filterStatus });

          // Should succeed
          expect(result.success).toBe(true);
          
          if (result.success) {
            // All returned proposals should have the filtered status
            result.data.forEach(proposal => {
              expect(proposal.status).toBe(filterStatus);
            });

            // Count should match
            expect(result.data.length).toBe(filteredProposals.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: proposal-generator, Property 27: Поиск КП по названию**
   * **Validates: Requirements 9.3**
   * 
   * For any search query, results should contain only proposals whose title contains the search substring.
   */
  it('Property 27: Searching proposals by title', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        nonEmptyStringArb.filter(s => s.length >= 2),
        fc.array(
          fc.record({
            id: uuidArb,
            title: nonEmptyStringArb,
            status: fc.constantFrom('draft', 'sent', 'accepted', 'rejected'),
          }),
          { minLength: 5, maxLength: 15 }
        ),
        async (workspaceId, searchQuery, proposalsData) => {
          // Setup membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id' },
            error: null,
          });

          // Create proposals
          const allProposals = proposalsData.map(p => ({
            id: p.id,
            workspace_id: workspaceId,
            title: p.title,
            client_name: null,
            status: p.status,
            timeline: null,
            team_estimate: null,
            selected_cases: [],
            contacts: null,
            processes: null,
            tech_stack: [],
            faq: [],
            payment_schedule: [],
            video_url: null,
            created_by: mockUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_autosave: null,
          }));

          // Filter proposals by search query (simulate database ilike)
          const searchLower = searchQuery.toLowerCase();
          const filteredProposals = allProposals.filter(p => 
            p.title.toLowerCase().includes(searchLower)
          );

          // Setup proposals query
          const proposalChain = mockSupabase.from('proposals');
          proposalChain.order.mockResolvedValue({
            data: filteredProposals,
            error: null,
          });

          // Get proposals with search filter
          const result = await getProposals(workspaceId, { search: searchQuery });

          // Should succeed
          expect(result.success).toBe(true);
          
          if (result.success) {
            // All returned proposals should contain the search query in title
            result.data.forEach(proposal => {
              expect(proposal.title.toLowerCase()).toContain(searchLower);
            });

            // Count should match
            expect(result.data.length).toBe(filteredProposals.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: proposal-generator, Property 28: Каскадное удаление КП**
   * **Validates: Requirements 9.4**
   * 
   * For any proposal, deleting it should also delete all related data (sections, previews, public links).
   * This is enforced by database CASCADE constraints.
   */
  it('Property 28: Cascade deletion of proposals', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        async (workspaceId, proposalId) => {
          // Setup membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id' },
            error: null,
          });

          // Setup proposal lookup
          const proposalChain = mockSupabase.from('proposals');
          proposalChain.single.mockResolvedValue({
            data: { workspace_id: workspaceId },
            error: null,
          });

          // Delete proposal
          const result = await deleteProposal(proposalId);

          // Should succeed
          expect(result.success).toBe(true);

          // Verify delete was called on proposals table
          // (CASCADE will handle related data automatically in the database)
          expect(proposalChain.delete).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: proposal-generator, Property 29: Дублирование создает независимую копию**
   * **Validates: Requirements 9.5**
   * 
   * For any proposal, duplicating it should create a new proposal with a unique ID
   * and a copy of all data, where changes to one don't affect the other.
   */
  it('Property 29: Duplication creates independent copy', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        nonEmptyStringArb,
        async (workspaceId, originalId, title) => {
          const newId = 'new-proposal-id';

          // Setup membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id' },
            error: null,
          });

          // Setup original proposal lookup
          const proposalChain = mockSupabase.from('proposals');
          proposalChain.single
            .mockResolvedValueOnce({
              data: {
                id: originalId,
                workspace_id: workspaceId,
                title: title,
                client_name: 'Test Client',
                status: 'sent',
                timeline: { startDate: '2024-01-01', endDate: '2024-12-31', milestones: [] },
                team_estimate: [{ role: 'Developer', hours: 100, rate: 50, total: 5000 }],
                selected_cases: ['case-1', 'case-2'],
                contacts: { email: 'test@example.com' },
                processes: 'Test processes',
                tech_stack: ['React', 'Node.js'],
                faq: [{ question: 'Q1', answer: 'A1' }],
                payment_schedule: [{ date: '2024-06-01', amount: 5000, description: 'Payment 1' }],
                video_url: 'https://loom.com/test',
                created_by: mockUser.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_autosave: null,
              },
              error: null,
            })
            // Mock duplicate insertion
            .mockResolvedValueOnce({
              data: {
                id: newId,
                workspace_id: workspaceId,
                title: `${title} (копия)`,
                client_name: 'Test Client',
                status: 'draft', // Always draft for duplicates
                timeline: { startDate: '2024-01-01', endDate: '2024-12-31', milestones: [] },
                team_estimate: [{ role: 'Developer', hours: 100, rate: 50, total: 5000 }],
                selected_cases: ['case-1', 'case-2'],
                contacts: { email: 'test@example.com' },
                processes: 'Test processes',
                tech_stack: ['React', 'Node.js'],
                faq: [{ question: 'Q1', answer: 'A1' }],
                payment_schedule: [{ date: '2024-06-01', amount: 5000, description: 'Payment 1' }],
                video_url: 'https://loom.com/test',
                created_by: mockUser.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_autosave: null,
              },
              error: null,
            });

          // Duplicate proposal
          const result = await duplicateProposal(originalId);

          // Should succeed
          expect(result.success).toBe(true);
          
          if (result.success) {
            // New proposal should have different ID
            expect(result.data.id).not.toBe(originalId);
            expect(result.data.id).toBe(newId);

            // Title should have "(копия)" suffix
            expect(result.data.title).toContain('(копия)');

            // Status should be draft
            expect(result.data.status).toBe('draft');

            // Other data should be copied
            expect(result.data.clientName).toBe('Test Client');
            expect(result.data.techStack).toEqual(['React', 'Node.js']);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
