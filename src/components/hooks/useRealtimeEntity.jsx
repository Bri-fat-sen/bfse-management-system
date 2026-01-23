import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Hook to subscribe to real-time entity updates
 * Automatically invalidates queries and updates cache
 */
export function useRealtimeEntity(entityName, orgId, options = {}) {
  const queryClient = useQueryClient();
  const { 
    enabled = true,
    onUpdate,
    onDelete,
    onCreate,
    autoInvalidate = true,
  } = options;

  useEffect(() => {
    if (!enabled || !orgId || !entityName) return;

    const unsubscribe = base44.entities[entityName]?.subscribe((event) => {
      // Call custom handlers
      if (event.type === 'create' && onCreate) {
        onCreate(event.data, event);
      } else if (event.type === 'update' && onUpdate) {
        onUpdate(event.data, event);
      } else if (event.type === 'delete' && onDelete) {
        onDelete(event.id, event);
      }

      // Auto-invalidate queries for this entity
      if (autoInvalidate) {
        queryClient.invalidateQueries({ 
          queryKey: [entityName.toLowerCase(), orgId] 
        });
        
        // Also invalidate without orgId for compatibility
        queryClient.invalidateQueries({ 
          queryKey: [entityName.toLowerCase()] 
        });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [entityName, orgId, enabled, onCreate, onUpdate, onDelete, autoInvalidate, queryClient]);
}

/**
 * Hook to subscribe to multiple entities
 */
export function useRealtimeEntities(entities, orgId, options = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, autoInvalidate = true } = options;

  useEffect(() => {
    if (!enabled || !orgId || !Array.isArray(entities)) return;

    const unsubscribers = entities
      .map(entityName => {
        return base44.entities[entityName]?.subscribe((event) => {
          if (autoInvalidate) {
            queryClient.invalidateQueries({ 
              queryKey: [entityName.toLowerCase(), orgId] 
            });
            queryClient.invalidateQueries({ 
              queryKey: [entityName.toLowerCase()] 
            });
          }
        });
      })
      .filter(Boolean);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [entities, orgId, enabled, autoInvalidate, queryClient]);
}

export default useRealtimeEntity;