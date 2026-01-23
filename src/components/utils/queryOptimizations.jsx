// ============================================
// REACT QUERY OPTIMIZATION UTILITIES
// Standardized query configurations for better performance
// ============================================

/**
 * Standard stale times for different data types
 */
export const STALE_TIMES = {
  // Static/rarely changing data
  ORGANISATION: 10 * 60 * 1000, // 10 minutes
  USER: 5 * 60 * 1000, // 5 minutes
  EMPLOYEE: 5 * 60 * 1000, // 5 minutes
  PRODUCTS: 2 * 60 * 1000, // 2 minutes
  CATEGORIES: 10 * 60 * 1000, // 10 minutes
  SETTINGS: 10 * 60 * 1000, // 10 minutes
  
  // Moderately changing data
  INVENTORY: 60 * 1000, // 1 minute
  CUSTOMERS: 2 * 60 * 1000, // 2 minutes
  SUPPLIERS: 5 * 60 * 1000, // 5 minutes
  VEHICLES: 5 * 60 * 1000, // 5 minutes
  
  // Frequently changing data
  SALES: 30 * 1000, // 30 seconds
  ATTENDANCE: 30 * 1000, // 30 seconds
  STOCK_LEVELS: 30 * 1000, // 30 seconds
  NOTIFICATIONS: 30 * 1000, // 30 seconds
  CHAT_MESSAGES: 10 * 1000, // 10 seconds
  
  // Real-time data (use subscriptions instead)
  LIVE_UPDATES: 0, // Always fresh
};

/**
 * Standard refetch intervals for real-time-ish data
 */
export const REFETCH_INTERVALS = {
  SALES: 30 * 1000, // 30 seconds
  INVENTORY: 60 * 1000, // 1 minute
  NOTIFICATIONS: 30 * 1000, // 30 seconds
  CHAT_ROOMS: 30 * 1000, // 30 seconds
  ATTENDANCE: 60 * 1000, // 1 minute
};

/**
 * Get optimized query config for entity type
 */
export function getQueryConfig(entityType, options = {}) {
  const configs = {
    organisation: {
      staleTime: STALE_TIMES.ORGANISATION,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 2,
    },
    user: {
      staleTime: STALE_TIMES.USER,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 3,
    },
    employee: {
      staleTime: STALE_TIMES.EMPLOYEE,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 2,
    },
    products: {
      staleTime: STALE_TIMES.PRODUCTS,
      refetchOnWindowFocus: true,
      retry: 2,
    },
    inventory: {
      staleTime: STALE_TIMES.INVENTORY,
      refetchOnWindowFocus: true,
      refetchInterval: REFETCH_INTERVALS.INVENTORY,
      retry: 2,
    },
    sales: {
      staleTime: STALE_TIMES.SALES,
      refetchOnWindowFocus: true,
      refetchInterval: REFETCH_INTERVALS.SALES,
      retry: 2,
    },
    attendance: {
      staleTime: STALE_TIMES.ATTENDANCE,
      refetchOnWindowFocus: true,
      refetchInterval: REFETCH_INTERVALS.ATTENDANCE,
      retry: 2,
    },
    notifications: {
      staleTime: STALE_TIMES.NOTIFICATIONS,
      refetchOnWindowFocus: true,
      refetchInterval: REFETCH_INTERVALS.NOTIFICATIONS,
      retry: 1,
    },
    chat: {
      staleTime: STALE_TIMES.CHAT_MESSAGES,
      refetchOnWindowFocus: true,
      refetchInterval: REFETCH_INTERVALS.CHAT_ROOMS,
      retry: 1,
    },
    default: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    }
  };
  
  const config = configs[entityType] || configs.default;
  return { ...config, ...options };
}

/**
 * Optimized mutation config with proper invalidation
 */
export function getMutationConfig(entityType, queryClient, additionalQueries = []) {
  return {
    onSuccess: () => {
      // Invalidate related queries
      const queriesToInvalidate = [
        [entityType],
        ...additionalQueries
      ];
      
      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
    onError: (error) => {
      console.error(`${entityType} mutation error:`, error);
    },
    retry: 1,
  };
}

/**
 * Batch invalidation helper
 */
export function invalidateRelatedQueries(queryClient, primaryEntity, relatedEntities = []) {
  const entitiesToInvalidate = [primaryEntity, ...relatedEntities];
  
  entitiesToInvalidate.forEach(entity => {
    queryClient.invalidateQueries({ queryKey: [entity] });
  });
}

/**
 * Prefetch helper for better UX
 */
export function prefetchEntity(queryClient, entityName, orgId, filterFn) {
  return queryClient.prefetchQuery({
    queryKey: [entityName, orgId],
    queryFn: filterFn,
    staleTime: getQueryConfig(entityName).staleTime,
  });
}

export default {
  STALE_TIMES,
  REFETCH_INTERVALS,
  getQueryConfig,
  getMutationConfig,
  invalidateRelatedQueries,
  prefetchEntity,
};