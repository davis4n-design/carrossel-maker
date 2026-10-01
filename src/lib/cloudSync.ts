import { supabase, isSupabaseConfigured } from './supabase';

export interface CloudTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  palette: any;
  slides: any[];
  isCustom?: boolean;
  username?: string;
  avatarUrl?: string;
  headerStyle?: any;
  showHeader?: boolean;
  showFooter?: boolean;
  showVerifiedBadge?: boolean;
  showProgressBar?: boolean;
  showSlideCounter?: boolean;
  showSwipeIndicator?: boolean;
  swipeText?: string;
  showCategoryTag?: boolean;
  categoryTag?: string;
  showWatermark?: boolean;
}

export interface CloudPost {
  id: string;
  name?: string;
  date: string;
  slides: any[];
  username: string;
  avatarUrl: string;
  globalPalette: any;
  headerStyle?: any;
  showHeader?: boolean;
  showFooter?: boolean;
  showVerifiedBadge?: boolean;
  showProgressBar?: boolean;
  showSlideCounter?: boolean;
  showSwipeIndicator?: boolean;
  swipeText?: string;
  showCategoryTag?: boolean;
  categoryTag?: string;
  showWatermark?: boolean;
}

// ==========================================
// TEMPLATES (MODELOS)
// ==========================================

export async function fetchCloudTemplates(fallback: CloudTemplate[] = []): Promise<CloudTemplate[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }
  try {
    const { data, error } = await supabase
      .from('custom_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar modelos da nuvem (usando local):', error.message);
      return fallback;
    }

    if (data && data.length > 0) {
      return data.map(item => {
        const settings = item.palette?._templateSettings || {};
        return {
          id: item.id,
          name: item.name,
          category: item.category || 'Meus Modelos',
          description: item.description || '',
          palette: item.palette,
          slides: item.slides,
          isCustom: true,
          username: settings.username,
          avatarUrl: settings.avatarUrl,
          headerStyle: settings.headerStyle,
          showHeader: settings.showHeader,
          showFooter: settings.showFooter,
          showVerifiedBadge: settings.showVerifiedBadge,
          showProgressBar: settings.showProgressBar,
          showSlideCounter: settings.showSlideCounter,
          showSwipeIndicator: settings.showSwipeIndicator,
          swipeText: settings.swipeText,
          showCategoryTag: settings.showCategoryTag,
          categoryTag: settings.categoryTag,
          showWatermark: settings.showWatermark,
        };
      });
    }
    return fallback;
  } catch (e) {
    console.warn('Falha na comunicação com Supabase (templates):', e);
    return fallback;
  }
}

export async function syncTemplateToCloud(template: CloudTemplate): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const enrichedPalette = {
      ...(template.palette || {}),
      _templateSettings: {
        username: template.username,
        avatarUrl: template.avatarUrl,
        headerStyle: template.headerStyle,
        showHeader: template.showHeader,
        showFooter: template.showFooter,
        showVerifiedBadge: template.showVerifiedBadge,
        showProgressBar: template.showProgressBar,
        showSlideCounter: template.showSlideCounter,
        showSwipeIndicator: template.showSwipeIndicator,
        swipeText: template.swipeText,
        showCategoryTag: template.showCategoryTag,
        categoryTag: template.categoryTag,
        showWatermark: template.showWatermark,
      }
    };

    const { error } = await supabase
      .from('custom_templates')
      .upsert({
        id: template.id,
        name: template.name,
        category: template.category || 'Meus Modelos',
        description: template.description || '',
        palette: enrichedPalette,
        slides: template.slides,
        is_custom: true
      });

    if (error) {
      console.error('Erro ao sincronizar modelo na nuvem:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao sincronizar modelo na nuvem:', e);
    return false;
  }
}

export async function removeTemplateFromCloud(templateId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('custom_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Erro ao excluir modelo na nuvem:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao excluir modelo na nuvem:', e);
    return false;
  }
}

// ==========================================
// POSTS (CARROSSÉIS / HISTÓRICO)
// ==========================================

export async function fetchCloudPosts(fallback: CloudPost[] = []): Promise<CloudPost[]> {
  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }
  try {
    const { data, error } = await supabase
      .from('saved_carousels')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar carrosséis da nuvem (usando local):', error.message);
      return fallback;
    }

    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        date: item.updated_at,
        slides: item.slides,
        username: item.username,
        avatarUrl: item.avatar_url,
        globalPalette: item.global_palette,
        headerStyle: item.settings?.headerStyle,
        showHeader: item.settings?.showHeader,
        showFooter: item.settings?.showFooter,
        showVerifiedBadge: item.settings?.showVerifiedBadge,
        showProgressBar: item.settings?.showProgressBar,
        showSlideCounter: item.settings?.showSlideCounter,
        showSwipeIndicator: item.settings?.showSwipeIndicator,
        swipeText: item.settings?.swipeText,
        showCategoryTag: item.settings?.showCategoryTag,
        categoryTag: item.settings?.categoryTag,
        showWatermark: item.settings?.showWatermark,
      }));
    }
    return fallback;
  } catch (e) {
    console.warn('Falha na comunicação com Supabase (carrosséis):', e);
    return fallback;
  }
}

export async function syncPostToCloud(post: CloudPost): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('saved_carousels')
      .upsert({
        id: post.id,
        name: post.name || 'Carrossel',
        username: post.username,
        avatar_url: post.avatarUrl,
        global_palette: post.globalPalette,
        slides: post.slides,
        settings: {
          headerStyle: post.headerStyle,
          showHeader: post.showHeader,
          showFooter: post.showFooter,
          showVerifiedBadge: post.showVerifiedBadge,
          showProgressBar: post.showProgressBar,
          showSlideCounter: post.showSlideCounter,
          showSwipeIndicator: post.showSwipeIndicator,
          swipeText: post.swipeText,
          showCategoryTag: post.showCategoryTag,
          categoryTag: post.categoryTag,
          showWatermark: post.showWatermark,
        },
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao sincronizar post no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao sincronizar post no Supabase:', e);
    return false;
  }
}

export async function removePostFromCloud(postId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('saved_carousels')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Erro ao excluir post no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao excluir post no Supabase:', e);
    return false;
  }
}
