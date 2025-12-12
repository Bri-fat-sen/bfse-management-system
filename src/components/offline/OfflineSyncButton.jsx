import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Check,
  Database,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOffline } from "./OfflineManager";
import { format } from "date-fns";

export default function OfflineSyncButton({ orgId }) {
  const offlineContext = useOffline();
  const [isCaching, setIsCaching] = useState(false);
  
  if (!offlineContext) return null;
  
  const { 
    isOnline, 
    pendingActions, 
    syncPendingActions, 
    preCacheData, 
    cachedData,
    lastSyncTime,
    clearCache,
    isSyncing 
  } = offlineContext;

  const handlePreCache = async () => {
    setIsCaching(true);
    await preCacheData(orgId);
    setIsCaching(false);
  };

  const hasCachedData = cachedData && Object.keys(cachedData).length > 0;
  const productCount = cachedData?.products?.length || 0;
  const customerCount = cachedData?.customers?.length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative h-9 gap-2"
        >
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-500" />
          )}
          {pendingActions.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500">
              {pendingActions.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection</span>
            <Badge className={isOnline ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
              {isOnline ? (
                <><Wifi className="w-3 h-3 mr-1" /> Online</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
              )}
            </Badge>
          </div>

          {/* Cached Data Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="w-4 h-4 text-[#0072C6]" />
              Offline Data
            </div>
            {hasCachedData ? (
              <>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• {productCount} products cached</p>
                  <p>• {customerCount} customers cached</p>
                </div>
                {lastSyncTime && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last sync: {format(new Date(lastSyncTime), 'MMM d, HH:mm')}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">No data cached yet</p>
            )}
          </div>

          {/* Pending Actions */}
          {pendingActions.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700">
                  {pendingActions.length} Pending Action{pendingActions.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-xs text-amber-600 max-h-20 overflow-y-auto space-y-1">
                {pendingActions.slice(0, 3).map(action => (
                  <p key={action.id} className="truncate">
                    • {action.type.replace(/_/g, ' ')}
                  </p>
                ))}
                {pendingActions.length > 3 && (
                  <p>...and {pendingActions.length - 3} more</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {pendingActions.length > 0 && isOnline && (
              <Button 
                onClick={syncPendingActions}
                disabled={isSyncing}
                className="w-full bg-gradient-to-r from-[#1EB053] to-[#0072C6]"
                size="sm"
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Sync Now
              </Button>
            )}
            
            <Button 
              onClick={handlePreCache}
              disabled={isCaching || !isOnline}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {isCaching ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {hasCachedData ? 'Refresh Offline Data' : 'Download for Offline'}
            </Button>

            {hasCachedData && (
              <Button 
                onClick={clearCache}
                variant="ghost"
                className="w-full text-gray-500 hover:text-red-500"
                size="sm"
              >
                Clear Cache
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}