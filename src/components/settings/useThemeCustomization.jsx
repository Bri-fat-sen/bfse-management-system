import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";

export function useThemeCustomization(userEmail) {
  const { data: preferences } = useQuery({
    queryKey: ['preferences', userEmail],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: userEmail });
      return prefs[0];
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!preferences) return;

    const root = document.documentElement;

    // Apply colors
    root.style.setProperty('--sl-green', preferences.primary_color || '#1EB053');
    root.style.setProperty('--sl-blue', preferences.secondary_color || '#0072C6');
    root.style.setProperty('--sl-gold', preferences.accent_color || '#D4AF37');
    root.style.setProperty('--sl-navy', preferences.sidebar_color || '#0F1F3C');

    // Apply theme mode
    if (preferences.theme_mode === 'dark') {
      document.body.classList.add('dark');
    } else if (preferences.theme_mode === 'light') {
      document.body.classList.remove('dark');
    }

    // Apply background
    const mainElement = document.querySelector('main');
    if (mainElement) {
      if (preferences.background_style === 'solid') {
        mainElement.style.background = preferences.background_color || '#F9FAFB';
      } else if (preferences.background_style === 'gradient') {
        mainElement.style.background = `linear-gradient(135deg, ${preferences.background_gradient_start || '#F9FAFB'}, ${preferences.background_gradient_end || '#E5E7EB'})`;
      } else if (preferences.background_style === 'image' && preferences.background_image_url) {
        mainElement.style.background = `url(${preferences.background_image_url}) center/cover fixed`;
      } else if (preferences.background_style === 'pattern') {
        mainElement.style.background = preferences.background_color || '#F9FAFB';
        mainElement.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${(preferences.primary_color || '#1EB053').replace('#', '')}' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
      }
    }

    // Apply font size
    if (preferences.font_size === 'small') {
      root.style.fontSize = '14px';
    } else if (preferences.font_size === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }

    // Apply compact mode
    if (preferences.compact_mode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }

    // Apply card style
    document.body.setAttribute('data-card-style', preferences.card_style || 'default');

    // Apply module-specific styles
    if (preferences.module_colors) {
      Object.entries(preferences.module_colors).forEach(([module, color]) => {
        root.style.setProperty(`--module-${module}-color`, color);
      });
    }

    if (preferences.module_backgrounds) {
      Object.entries(preferences.module_backgrounds).forEach(([module, style]) => {
        root.style.setProperty(`--module-${module}-bg`, style);
      });
    }

  }, [preferences]);

  return preferences;
}