// ============================================
// REAL-TIME SUBSCRIPTION HELPERS
// Utilities for managing Base44 real-time subscriptions
// ============================================

import { base44 } from "@/api/base44Client";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook for entity subscriptions with automatic cleanup
 */
export function useEntitySubscription(entityName, orgId, options = {}) {
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef(null);
  const { 
    enabled = true,
    onUpdate,
    onDelete,
    onCreate,
    invalidateOnChange = true,
  } = options;

  useEffect(() => {
    if (!enabled || !orgId) return;

    const unsubscribe = base44.entities[entityName]?.subscribe((event) => {
      // Custom handlers
      if (event.type === 'create' && onCreate) {
        onCreate(event.data);
      } else if (event.type === 'update' && onUpdate) {
        onUpdate(event.data);
      } else if (event.type === 'delete' && onDelete) {
        onDelete(event.id);
      }

      // Auto-invalidate queries
      if (invalidateOnChange) {
        queryClient.invalidateQueries({ 
          queryKey: [entityName.toLowerCase(), orgId] 
        });
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [entityName, orgId, enabled, onCreate, onUpdate, onDelete, invalidateOnChange, queryClient]);
}

/**
 * Subscribe to multiple entities at once
 */
export function useMultiEntitySubscription(entities, orgId, options = {}) {
  const queryClient = useQueryClient();
  const unsubscribersRef = useRef([]);
  const { enabled = true, invalidateOnChange = true } = options;

  useEffect(() => {
    if (!enabled || !orgId || !Array.isArray(entities)) return;

    // Clean up previous subscriptions
    unsubscribersRef.current.forEach(unsub => unsub());
    unsubscribersRef.current = [];

    // Subscribe to each entity
    entities.forEach(entityName => {
      const unsubscribe = base44.entities[entityName]?.subscribe((event) => {
        if (invalidateOnChange) {
          queryClient.invalidateQueries({ 
            queryKey: [entityName.toLowerCase(), orgId] 
          });
        }
      });

      if (unsubscribe) {
        unsubscribersRef.current.push(unsubscribe);
      }
    });

    return () => {
      unsubscribersRef.current.forEach(unsub => unsub());
      unsubscribersRef.current = [];
    };
  }, [entities, orgId, enabled, invalidateOnChange, queryClient]);
}

/**
 * Optimistic update helper
 */
export function applyOptimisticUpdate(queryClient, queryKey, updateFn) {
  // Cancel outgoing refetches
  queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData(queryKey);

  // Optimistically update
  queryClient.setQueryData(queryKey, updateFn);

  // Return rollback function
  return () => {
    queryClient.setQueryData(queryKey, previousData);
  };
}

/**
 * Batch update helper for multiple records
 */
export async function batchUpdate(entityName, updates, onProgress) {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < updates.length; i++) {
    try {
      const { id, data } = updates[i];
      const result = await base44.entities[entityName].update(id, data);
      results.push({ id, success: true, result });
      
      if (onProgress) {
        onProgress(i + 1, updates.length, null);
      }
    } catch (error) {
      errors.push({ id: updates[i].id, error });
      
      if (onProgress) {
        onProgress(i + 1, updates.length, error);
      }
    }
  }
  
  return {
    success: errors.length === 0,
    results,
    errors,
    total: updates.length,
    succeeded: results.length,
    failed: errors.length
  };
}

/**
 * Debounced search helper for queries
 */
export function useDebouncedValue(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default {
  useEntitySubscription,
  useMultiEntitySubscription,
  applyOptimisticUpdate,
  batchUpdate,
  useDebouncedValue,
};