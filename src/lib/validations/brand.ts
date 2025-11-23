import { z } from 'zod';

// Hex color validation regex
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Brand Colors Schema
export const brandColorsSchema = z.object({
  primary: z.string().regex(hexColorRegex, 'Primary color must be a valid hex color (e.g., #3B82F6)'),
  secondary: z.string().regex(hexColorRegex, 'Secondary color must be a valid hex color (e.g., #8B5CF6)'),
  background: z.string().regex(hexColorRegex, 'Background color must be a valid hex color (e.g., #FFFFFF)'),
  text: z.string().regex(hexColorRegex, 'Text color must be a valid hex color (e.g., #1F2937)'),
});

// Brand Typography Schema
export const brandTypographySchema = z.object({
  fontFamily: z.enum(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'], {
    message: 'Font family must be one of: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins',
  }),
  headingFont: z.enum(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'], {
    message: 'Heading font must be one of: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins',
  }),
  bodyFont: z.enum(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'], {
    message: 'Body font must be one of: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins',
  }),
});

// Brand Components Schema
export const brandComponentsSchema = z.object({
  cardRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl'], {
    message: 'Card radius must be one of: none, sm, md, lg, xl',
  }),
  shadowSize: z.enum(['none', 'sm', 'md', 'lg', 'xl'], {
    message: 'Shadow size must be one of: none, sm, md, lg, xl',
  }),
});

// Brand SEO Schema
export const brandSEOSchema = z.object({
  title: z.string().max(100, 'SEO title is too long').default(''),
  description: z.string().max(300, 'SEO description is too long').default(''),
  ogImage: z.string().url('OG image must be a valid URL').or(z.literal('')).default(''),
});

// Full Brand Settings Schema
export const brandSettingsSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional(),
  colors: brandColorsSchema,
  typography: brandTypographySchema,
  components: brandComponentsSchema,
  seo: brandSEOSchema,
});

// Partial update schema (all fields optional except workspaceId)
export const updateBrandSettingsSchema = brandSettingsSchema.partial().extend({
  workspaceId: z.string().uuid('Invalid workspace ID'),
});

// Type exports
export type BrandColorsInput = z.infer<typeof brandColorsSchema>;
export type BrandTypographyInput = z.infer<typeof brandTypographySchema>;
export type BrandComponentsInput = z.infer<typeof brandComponentsSchema>;
export type BrandSEOInput = z.infer<typeof brandSEOSchema>;
export type BrandSettingsInput = z.infer<typeof brandSettingsSchema>;
export type UpdateBrandSettingsInput = z.infer<typeof updateBrandSettingsSchema>;
