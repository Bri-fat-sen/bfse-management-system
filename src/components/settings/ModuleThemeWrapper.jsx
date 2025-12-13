import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function ModuleThemeWrapper({ children, moduleName, user }) {
  const { data: preferences } = useQuery({
    queryKey: ['preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user?.email });
      return prefs[0];
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!preferences || !moduleName) return;

    const moduleColor = preferences.module_colors?.[moduleName];
    const moduleBg = preferences.module_backgrounds?.[moduleName];

    if (moduleColor) {
      document.documentElement.style.setProperty('--current-module-color', moduleColor);
    }

    if (moduleBg) {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        if (moduleBg === 'solid') {
          mainElement.style.background = `${moduleColor}11`;
        } else if (moduleBg === 'gradient') {
          mainElement.style.background = `linear-gradient(135deg, ${moduleColor}11, ${moduleColor}33)`;
        } else if (moduleBg === 'pattern') {
          mainElement.style.background = `${moduleColor}08`;
          mainElement.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${moduleColor.replace('#', '%23')}' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
        }
      }
    }
  }, [preferences, moduleName]);

  return children;
}