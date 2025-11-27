import React, { useState, useEffect, createContext, useContext } from "react";
import { Wifi, WifiOff, Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OfflineContext = createContext();

const OFFLINE_STORAGE_KEY = 'bfse_offline_queue';

export function useOffline() {
  return useContext(OfflineContext);
}

export function OfflineProvider({ children }) {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }
  }, []);

  // Save pending actions to localStorage
  useEffect(() => {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: pendingActions.length > 0 
          ? `${pendingActions.length} actions ready to sync` 
          : "Connected to the internet",
      });
      if (pendingActions.length > 0) {
        setShowSyncDialog(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Your actions will be saved and synced when you're back online",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions.length]);

  // Queue an action for later sync
  const queueAction = (action) => {
    const newAction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...action
    };
    setPendingActions(prev => [...prev, newAction]);
    toast({
      title: "Saved Offline",
      description: "This will sync when you're back online",
    });
    return newAction.id;
  };

  // Sync all pending actions
  const syncPendingActions = async () => {
    if (pendingActions.length === 0 || !isOnline) return;

    setIsSyncing(true);
    const results = [];

    for (const action of pendingActions) {
      try {
        // Import base44 dynamically to avoid circular deps
        const { base44 } = await import("@/api/base44Client");
        
        switch (action.type) {
          case 'create_trip':
            await base44.entities.Trip.create(action.data);
            break;
          case 'update_trip':
            await base44.entities.Trip.update(action.tripId, action.data);
            break;
          case 'create_sale':
            await base44.entities.Sale.create(action.data);
            // Update stock
            for (const item of action.data.items || []) {
              const products = await base44.entities.Product.filter({ id: item.product_id });
              if (products[0]) {
                await base44.entities.Product.update(item.product_id, {
                  stock_quantity: Math.max(0, products[0].stock_quantity - item.quantity)
                });
              }
            }
            break;
          case 'create_stock_movement':
            await base44.entities.StockMovement.create(action.data);
            break;
          case 'update_product_stock':
            await base44.entities.Product.update(action.productId, action.data);
            break;
          case 'clock_in':
          case 'clock_out':
            if (action.type === 'clock_in') {
              await base44.entities.Attendance.create(action.data);
            } else {
              await base44.entities.Attendance.update(action.attendanceId, action.data);
            }
            break;
          default:
            console.warn('Unknown action type:', action.type);
        }
        results.push({ id: action.id, success: true });
      } catch (error) {
        console.error('Sync error:', error);
        results.push({ id: action.id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedIds = results.filter(r => !r.success).map(r => r.id);
    
    // Remove successful actions
    setPendingActions(prev => prev.filter(a => failedIds.includes(a.id)));
    
    setIsSyncing(false);
    setShowSyncDialog(false);

    toast({
      title: "Sync Complete",
      description: `${successCount} of ${results.length} actions synced successfully`,
      variant: failedIds.length > 0 ? "destructive" : "default"
    });
  };

  return (
    <OfflineContext.Provider value={{ 
      isOnline, 
      pendingActions, 
      queueAction, 
      syncPendingActions 
    }}>
      {children}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>You're offline - Changes will sync when connected</span>
          {pendingActions.length > 0 && (
            <Badge className="bg-white text-amber-600">{pendingActions.length} pending</Badge>
          )}
        </div>
      )}

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#1EB053]" />
              Sync Offline Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You have {pendingActions.length} action{pendingActions.length !== 1 ? 's' : ''} saved offline that need to be synced.
            </p>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {pendingActions.map((action) => (
                <div key={action.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="flex-1 truncate">
                    {action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowSyncDialog(false)}
              >
                Later
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                onClick={syncPendingActions}
                disabled={isSyncing}
              >
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </OfflineContext.Provider>
  );
}

export function OfflineStatus() {
  const context = useOffline();
  
  // Handle case where component is used outside of OfflineProvider
  if (!context) {
    return null;
  }
  
  const { isOnline, pendingActions, syncPendingActions } = context;

  if (isOnline && pendingActions.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-amber-500" />
      )}
      {pendingActions.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs"
          onClick={syncPendingActions}
          disabled={!isOnline}
        >
          <Upload className="w-3 h-3 mr-1" />
          Sync ({pendingActions.length})
        </Button>
      )}
    </div>
  );
}