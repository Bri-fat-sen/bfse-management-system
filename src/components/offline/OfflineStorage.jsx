import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const OfflineContext = createContext(null);

// LocalStorage keys
const OFFLINE_SALES_KEY = 'bfse_offline_sales';
const OFFLINE_TRIPS_KEY = 'bfse_offline_trips';
const OFFLINE_ATTENDANCE_KEY = 'bfse_offline_attendance';

export function OfflineStorageProvider({ children }) {
  const { toast } = useToast();
  const [pendingSales, setPendingSales] = useState([]);
  const [pendingTrips, setPendingTrips] = useState([]);
  const [pendingAttendance, setPendingAttendance] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const sales = JSON.parse(localStorage.getItem(OFFLINE_SALES_KEY) || '[]');
        const trips = JSON.parse(localStorage.getItem(OFFLINE_TRIPS_KEY) || '[]');
        const attendance = JSON.parse(localStorage.getItem(OFFLINE_ATTENDANCE_KEY) || '[]');
        
        setPendingSales(sales);
        setPendingTrips(trips);
        setPendingAttendance(attendance);
      } catch (e) {
        console.error('Error loading offline data:', e);
      }
    };

    loadOfflineData();
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(pendingSales));
  }, [pendingSales]);

  useEffect(() => {
    localStorage.setItem(OFFLINE_TRIPS_KEY, JSON.stringify(pendingTrips));
  }, [pendingTrips]);

  useEffect(() => {
    localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(pendingAttendance));
  }, [pendingAttendance]);

  // Sync when back online
  useEffect(() => {
    const handleOnline = async () => {
      if (pendingSales.length > 0 || pendingTrips.length > 0 || pendingAttendance.length > 0) {
        await syncOfflineData();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingSales, pendingTrips, pendingAttendance]);

  const queueSale = (saleData) => {
    const newSale = { ...saleData, _offlineId: Date.now(), _queuedAt: new Date().toISOString() };
    setPendingSales(prev => [...prev, newSale]);
    toast({ title: "Sale Queued", description: "Will sync when back online" });
    return newSale;
  };

  const queueTrip = (tripData) => {
    const newTrip = { ...tripData, _offlineId: Date.now(), _queuedAt: new Date().toISOString() };
    setPendingTrips(prev => [...prev, newTrip]);
    toast({ title: "Trip Queued", description: "Will sync when back online" });
    return newTrip;
  };

  const queueAttendance = (attendanceData) => {
    const newAttendance = { ...attendanceData, _offlineId: Date.now(), _queuedAt: new Date().toISOString() };
    setPendingAttendance(prev => [...prev, newAttendance]);
    toast({ title: "Attendance Queued", description: "Will sync when back online" });
    return newAttendance;
  };

  const syncOfflineData = async () => {
    if (!navigator.onLine || isSyncing) return;
    
    setIsSyncing(true);
    let syncedCount = 0;

    try {
      // Sync sales
      for (const sale of pendingSales) {
        const { _offlineId, _queuedAt, ...saleData } = sale;
        await base44.entities.Sale.create(saleData);
        syncedCount++;
      }
      setPendingSales([]);

      // Sync trips
      for (const trip of pendingTrips) {
        const { _offlineId, _queuedAt, ...tripData } = trip;
        await base44.entities.Trip.create(tripData);
        syncedCount++;
      }
      setPendingTrips([]);

      // Sync attendance
      for (const attendance of pendingAttendance) {
        const { _offlineId, _queuedAt, ...attendanceData } = attendance;
        await base44.entities.Attendance.create(attendanceData);
        syncedCount++;
      }
      setPendingAttendance([]);

      if (syncedCount > 0) {
        toast({ 
          title: "Data Synced", 
          description: `${syncedCount} record(s) synced successfully`,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({ 
        title: "Sync Error", 
        description: "Some records failed to sync. Will retry later.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getTotalPending = () => pendingSales.length + pendingTrips.length + pendingAttendance.length;

  return (
    <OfflineContext.Provider value={{
      pendingSales,
      pendingTrips,
      pendingAttendance,
      queueSale,
      queueTrip,
      queueAttendance,
      syncOfflineData,
      isSyncing,
      totalPending: getTotalPending(),
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflineStorage() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineStorage must be used within OfflineStorageProvider');
  }
  return context;
}