import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useRealtimeEntity } from "./useRealtimeEntity";

/**
 * Optimized query hook with built-in real-time subscriptions
 * Combines useQuery with automatic real-time updates
 */
export function useOptimizedQuery(entityName, orgId, options = {}) {
  const {
    enabled = true,
    sort = '-created_date',
    limit = 500,
    filter = {},
    staleTime = 60 * 1000,
    refetchInterval,
    refetchOnWindowFocus = true,
    enableRealtime = false,
  } = options;

  // Build query key
  const queryKey = [entityName.toLowerCase(), orgId, filter, sort, limit];

  // Fetch data
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const fullFilter = { ...filter, organisation_id: orgId };
      return await base44.entities[entityName].filter(fullFilter, sort, limit);
    },
    enabled: enabled && !!orgId,
    staleTime,
    refetchInterval,
    refetchOnWindowFocus,
    retry: 2,
  });

  // Subscribe to real-time updates if enabled
  useRealtimeEntity(entityName, orgId, {
    enabled: enableRealtime && enabled && !!orgId,
  });

  return query;
}

/**
 * Hook for fetching current user with caching
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
  });
}

/**
 * Hook for fetching current employee with caching
 */
export function useCurrentEmployee(userEmail) {
  return useQuery({
    queryKey: ['currentEmployee', userEmail],
    queryFn: async () => {
      const employees = await base44.entities.Employee.filter({ user_email: userEmail });
      return employees[0] || null;
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for fetching organisation data
 */
export function useOrganisation(orgId) {
  return useQuery({
    queryKey: ['organisation', orgId],
    queryFn: async () => {
      const orgs = await base44.entities.Organisation.filter({ id: orgId });
      return orgs[0] || null;
    },
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export default useOptimizedQuery;