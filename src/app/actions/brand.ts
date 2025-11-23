'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  brandSettingsSchema,
  updateBrandSettingsSchema,
  type BrandSettingsInput,
  type UpdateBrandSettingsInput,
} from '@/lib/validations/brand';
import {
  type Result,
  authenticationError,
  authorizationError,
  validationError,
  notFoundError,
  unknownError,
} from '@/types/errors';
import type { WorkspaceBrandSettings } from '@/types/database';

/**
 * Get workspace brand settings
 */
export async function getWorkspaceBrandSettings(
  workspaceId: string
): Promise<Result<WorkspaceBrandSettings | null>> {
  console.log('=== getWorkspaceBrandSettings START ===');
  console.log('Input:', { workspaceId });

  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { userId: user?.id, authError });

    if (authError || !user) {
      console.log('Authentication failed');
      console.log('=== getWorkspaceBrandSettings END ===');
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      console.log('Authorization failed - user is not a member of workspace');
      console.log('=== getWorkspaceBrandSettings END ===');
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Get brand settings
    const { data: brandSettings, error: brandError } = await supabase
      .from('workspace_brand_settings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();

    console.log('Database response:', { brandSettings, brandError });

    if (brandError) {
      // If no settings found, return null (not an error)
      if (brandError.code === 'PGRST116') {
        console.log('No brand settings found for workspace');
        console.log('=== getWorkspaceBrandSettings END ===');
        return {
          success: true,
          data: null,
        };
      }

      console.error('Error fetching brand settings:', brandError);
      console.error('Error details:', JSON.stringify(brandError, null, 2));
      console.log('=== getWorkspaceBrandSettings END ===');
      return {
        success: false,
        error: unknownError('Не удалось получить настройки брендинга'),
      };
    }

    console.log('Brand settings retrieved successfully');
    console.log('=== getWorkspaceBrandSettings END ===');

    return {
      success: true,
      data: {
        id: brandSettings.id,
        workspaceId: brandSettings.workspace_id,
        logoUrl: brandSettings.logo_url,
        colors: brandSettings.colors,
        typography: brandSettings.typography,
        components: brandSettings.components,
        seo: brandSettings.seo,
        createdAt: brandSettings.created_at,
        updatedAt: brandSettings.updated_at,
      },
    };
  } catch (error) {
    console.error('Get workspace brand settings error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== getWorkspaceBrandSettings END ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при получении настроек брендинга'),
    };
  }
}

/**
 * Upsert (create or update) workspace brand settings
 */
export async function upsertWorkspaceBrandSettings(
  workspaceId: string,
  data: Omit<BrandSettingsInput, 'workspaceId'>
): Promise<Result<WorkspaceBrandSettings>> {
  console.log('=== upsertWorkspaceBrandSettings START ===');
  console.log('Input:', { workspaceId, data: JSON.stringify(data, null, 2) });

  try {
    // Validate input
    const validated = brandSettingsSchema.safeParse({ ...data, workspaceId });
    console.log('Validation result:', { 
      success: validated.success, 
      errors: validated.success ? null : validated.error.flatten() 
    });

    if (!validated.success) {
      console.log('Validation failed');
      console.log('=== upsertWorkspaceBrandSettings END ===');
      return {
        success: false,
        error: validationError(
          'Неверные данные настроек брендинга',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { userId: user?.id, authError });

    if (authError || !user) {
      console.log('Authentication failed');
      console.log('=== upsertWorkspaceBrandSettings END ===');
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id, role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      console.log('Authorization failed - user is not a member of workspace');
      console.log('=== upsertWorkspaceBrandSettings END ===');
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Prepare data for upsert
    const upsertData = {
      workspace_id: workspaceId,
      logo_url: validated.data.logoUrl,
      colors: validated.data.colors,
      typography: validated.data.typography,
      components: validated.data.components,
      seo: validated.data.seo,
      updated_at: new Date().toISOString(),
    };

    console.log('Upserting brand settings:', JSON.stringify(upsertData, null, 2));

    // Upsert brand settings
    const { data: brandSettings, error: upsertError } = await supabase
      .from('workspace_brand_settings')
      .upsert(upsertData, {
        onConflict: 'workspace_id',
      })
      .select()
      .single();

    console.log('Database response:', { brandSettings, upsertError });

    if (upsertError) {
      console.error('Error upserting brand settings:', upsertError);
      console.error('Error details:', JSON.stringify(upsertError, null, 2));
      console.log('=== upsertWorkspaceBrandSettings END ===');
      return {
        success: false,
        error: unknownError('Не удалось сохранить настройки брендинга'),
      };
    }

    // Revalidate workspace settings page
    revalidatePath(`/workspace/${workspaceId}/settings`);
    revalidatePath(`/workspace/${workspaceId}/settings/brand`);

    console.log('Brand settings upserted successfully');
    console.log('=== upsertWorkspaceBrandSettings END ===');

    return {
      success: true,
      data: {
        id: brandSettings.id,
        workspaceId: brandSettings.workspace_id,
        logoUrl: brandSettings.logo_url,
        colors: brandSettings.colors,
        typography: brandSettings.typography,
        components: brandSettings.components,
        seo: brandSettings.seo,
        createdAt: brandSettings.created_at,
        updatedAt: brandSettings.updated_at,
      },
    };
  } catch (error) {
    console.error('Upsert workspace brand settings error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== upsertWorkspaceBrandSettings END ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при сохранении настроек брендинга'),
    };
  }
}
