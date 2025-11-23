import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { uuidArb } from '@/lib/test-utils/generators';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import after mocks are set up
const { getWorkspaceBrandSettings, upsertWorkspaceBrandSettings } = await import('../brand');

// Generator for valid hex colors
const hexColorArb = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 })
).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase());

// Generator for valid font families
const fontFamilyArb = fc.constantFrom('Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins');

// Generator for valid card radius
const cardRadiusArb = fc.constantFrom('none', 'sm', 'md', 'lg', 'xl');

// Generator for valid shadow size
const shadowSizeArb = fc.constantFrom('none', 'sm', 'md', 'lg', 'xl');

// Generator for valid brand colors
const brandColorsArb = fc.record({
  primary: hexColorArb,
  secondary: hexColorArb,
  background: hexColorArb,
  text: hexColorArb,
});

// Generator for valid brand typography
const brandTypographyArb = fc.record({
  fontFamily: fontFamilyArb,
  headingFont: fontFamilyArb,
  bodyFont: fontFamilyArb,
});

// Generator for valid brand components
const brandComponentsArb = fc.record({
  cardRadius: cardRadiusArb,
  shadowSize: shadowSizeArb,
});

// Generator for valid brand SEO
const brandSEOArb = fc.record({
  title: fc.string({ maxLength: 100 }),
  description: fc.string({ maxLength: 300 }),
  ogImage: fc.oneof(fc.webUrl(), fc.constant('')),
});

// Generator for valid brand settings
const brandSettingsArb = fc.record({
  logoUrl: fc.option(fc.webUrl(), { nil: undefined }),
  colors: brandColorsArb,
  typography: brandTypographyArb,
  components: brandComponentsArb,
  seo: brandSEOArb,
});

describe('Brand Settings Tests', () => {
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
        if (!tableChains.has(table)) {
          const chain: any = {
            _table: table,
            insert: vi.fn(() => chain),
            update: vi.fn(() => chain),
            upsert: vi.fn(() => chain),
            delete: vi.fn(() => chain),
            select: vi.fn(() => chain),
            eq: vi.fn(() => chain),
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
   * Test 1: Сохранение и загрузка настроек брендинга (Round-trip)
   * 
   * For any valid brand settings, saving and then loading should return the same data.
   */
  it('should save and load brand settings correctly (round-trip)', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        brandSettingsArb,
        async (workspaceId, brandSettings) => {
          // Setup workspace membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id', role: 'owner' },
            error: null,
          });

          // Setup brand settings upsert
          const brandChain = mockSupabase.from('workspace_brand_settings');
          const savedSettings = {
            id: 'brand-settings-id',
            workspace_id: workspaceId,
            logo_url: brandSettings.logoUrl,
            colors: brandSettings.colors,
            typography: brandSettings.typography,
            components: brandSettings.components,
            seo: brandSettings.seo,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          brandChain.single.mockResolvedValue({
            data: savedSettings,
            error: null,
          });

          // Save brand settings
          const saveResult = await upsertWorkspaceBrandSettings(workspaceId, brandSettings);

          // Verify save succeeded
          expect(saveResult.success).toBe(true);
          if (!saveResult.success) return;

          // Load brand settings
          const loadResult = await getWorkspaceBrandSettings(workspaceId);

          // Verify load succeeded
          expect(loadResult.success).toBe(true);
          if (!loadResult.success) return;

          // Verify data matches (round-trip)
          expect(loadResult.data?.colors).toEqual(brandSettings.colors);
          expect(loadResult.data?.typography).toEqual(brandSettings.typography);
          expect(loadResult.data?.components).toEqual(brandSettings.components);
          expect(loadResult.data?.seo).toEqual(brandSettings.seo);
          expect(loadResult.data?.logoUrl).toEqual(brandSettings.logoUrl);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test 2: Валидация невалидных цветов
   * 
   * For any invalid hex color, the validation should reject it.
   */
  it('should reject invalid hex colors', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)),
        async (workspaceId, invalidColor) => {
          // Setup workspace membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id', role: 'owner' },
            error: null,
          });

          // Create brand settings with invalid color
          const invalidSettings = {
            colors: {
              primary: invalidColor,
              secondary: '#8B5CF6',
              background: '#FFFFFF',
              text: '#1F2937',
            },
            typography: {
              fontFamily: 'Inter' as const,
              headingFont: 'Inter' as const,
              bodyFont: 'Inter' as const,
            },
            components: {
              cardRadius: 'md' as const,
              shadowSize: 'md' as const,
            },
            seo: {
              title: 'Test',
              description: 'Test description',
              ogImage: '',
            },
          };

          // Try to save invalid settings
          const result = await upsertWorkspaceBrandSettings(workspaceId, invalidSettings);

          // Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe('validation');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test 3: Валидация невалидных шрифтов
   * 
   * For any invalid font family, the validation should reject it.
   */
  it('should reject invalid font families', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => 
          !['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'].includes(s)
        ),
        async (workspaceId, invalidFont) => {
          // Setup workspace membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id', role: 'owner' },
            error: null,
          });

          // Create brand settings with invalid font
          const invalidSettings = {
            colors: {
              primary: '#3B82F6',
              secondary: '#8B5CF6',
              background: '#FFFFFF',
              text: '#1F2937',
            },
            typography: {
              fontFamily: invalidFont as any,
              headingFont: 'Inter' as const,
              bodyFont: 'Inter' as const,
            },
            components: {
              cardRadius: 'md' as const,
              shadowSize: 'md' as const,
            },
            seo: {
              title: 'Test',
              description: 'Test description',
              ogImage: '',
            },
          };

          // Try to save invalid settings
          const result = await upsertWorkspaceBrandSettings(workspaceId, invalidSettings);

          // Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe('validation');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test 4: RLS - Доступ только членам воркспейса
   * 
   * For any workspace, only members should be able to access brand settings.
   */
  it('should deny access to non-members (RLS)', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        async (workspaceId) => {
          // Setup workspace membership check - user is NOT a member
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // Not found
          });

          // Try to get brand settings
          const result = await getWorkspaceBrandSettings(workspaceId);

          // Should fail with authorization error
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe('authorization');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test 5: RLS - Только члены могут сохранять настройки
   * 
   * For any workspace, only members should be able to save brand settings.
   */
  it('should deny save access to non-members (RLS)', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        brandSettingsArb,
        async (workspaceId, brandSettings) => {
          // Setup workspace membership check - user is NOT a member
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // Not found
          });

          // Try to save brand settings
          const result = await upsertWorkspaceBrandSettings(workspaceId, brandSettings);

          // Should fail with authorization error
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe('authorization');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test 6: Возврат null для несуществующих настроек
   * 
   * For any workspace without brand settings, loading should return null (not an error).
   */
  it('should return null for non-existent brand settings', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        async (workspaceId) => {
          // Setup workspace membership check - user IS a member
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id', role: 'member' },
            error: null,
          });

          // Setup brand settings query - no settings found
          const brandChain = mockSupabase.from('workspace_brand_settings');
          brandChain.single.mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // Not found
          });

          // Try to get brand settings
          const result = await getWorkspaceBrandSettings(workspaceId);

          // Should succeed but return null
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test 7: Валидация SEO полей
   * 
   * For any SEO fields exceeding max length, validation should reject them.
   */
  it('should reject SEO fields exceeding max length', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        fc.string({ minLength: 101, maxLength: 200 }),
        async (workspaceId, longTitle) => {
          // Setup workspace membership check
          const memberChain = mockSupabase.from('workspace_members');
          memberChain.single.mockResolvedValue({
            data: { id: 'member-id', role: 'owner' },
            error: null,
          });

          // Create brand settings with too long SEO title
          const invalidSettings = {
            colors: {
              primary: '#3B82F6',
              secondary: '#8B5CF6',
              background: '#FFFFFF',
              text: '#1F2937',
            },
            typography: {
              fontFamily: 'Inter' as const,
              headingFont: 'Inter' as const,
              bodyFont: 'Inter' as const,
            },
            components: {
              cardRadius: 'md' as const,
              shadowSize: 'md' as const,
            },
            seo: {
              title: longTitle,
              description: 'Test description',
              ogImage: '',
            },
          };

          // Try to save invalid settings
          const result = await upsertWorkspaceBrandSettings(workspaceId, invalidSettings);

          // Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe('validation');
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
