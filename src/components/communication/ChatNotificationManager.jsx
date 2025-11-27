import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { toast } from "sonner";
import { MessageSquare, Volume2, VolumeX, Moon, Bell, BellOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const NotificationContext = createContext(null);

export function useNotificationSettings() {
  return useContext(NotificationContext);
}

export function ChatNotificationProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('chat-notification-settings');
    return saved ? JSON.parse(saved) : {
      soundEnabled: true,
      browserNotifications: true,
      quietHoursEnabled: false,
      quietStart: "22:00",
      quietEnd: "07:00",
      mutedRooms: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('chat-notification-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const isQuietHours = () => {
    if (!settings.quietHoursEnabled) return false;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = settings.quietStart.split(':').map(Number);
    const [endH, endM] = settings.quietEnd.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    
    if (start < end) {
      return currentTime >= start && currentTime < end;
    } else {
      return currentTime >= start || currentTime < end;
    }
  };

  const isRoomMuted = (roomId) => {
    return settings.mutedRooms.includes(roomId);
  };

  const toggleRoomMute = (roomId) => {
    setSettings(prev => ({
      ...prev,
      mutedRooms: prev.mutedRooms.includes(roomId)
        ? prev.mutedRooms.filter(id => id !== roomId)
        : [...prev.mutedRooms, roomId]
    }));
  };

  return (
    <NotificationContext.Provider value={{ settings, updateSettings, isQuietHours, isRoomMuted, toggleRoomMute }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useChatNotifications({ 
  messages, 
  currentEmployeeId, 
  selectedRoomId,
  isOpen 
}) {
  const lastMessageIdRef = useRef(null);
  const audioRef = useRef(null);
  const notificationSettings = useNotificationSettings();

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAN7t+Plq2YlR5m91NqsXRhKqNjgoWAUOJvL3rJzJi1SmsTXqWQbOpjC2rZzKStSmb/WrWkfOpO81rRvKS5UmrzTrmwkPZG50rFuKzBYmrnPrmwmQI+2zrBtLjNamrbMrmwoQo2zzK9tMDZdmLPJrW4qRYuwya5vMjhgla/Gq24sR4mtyKxvNDtjkqzDqa0uSYeqxaqtNj5lj6nAp6svS4WnwqisMkFojaa9pKowTYOkv6WqNENqi6O6oqgxT4GhvKOpNkVtiaC3n6YzUX+euZ+mOUdwiJ2znqQ1U3ybtp2kO0lyh5qwnKI3VXqYs5qhPUt1hZetmqA5V3iVsJefP016g5SqmJ4+WXaSpJWcQU97gZGnlZpAW3SPn5KZQlB5f46klZhCXHKMnI+WQ1J3fYuhlZZEXnCJmYySRVR2e4ielJNGYG6GloqQR1Z0eYWblJBIYmyDk4eNSVhyd4KYko1KZGqBkISKS1pvcH+UkIpLZmiAjYGIS1xucH2RjodNaGV+in6FTV5rcHuOi4ROZGN8h3uCT2BpcHmLiIJQZmF6hHh+UGJncHeIhYBRaF94gXV7UmRlb3WFgn1TamB2fnJ4VGZkbXOCf3pWbF90e293V2hjbHF/fHdYbl5yeDxzWWphamt8eXRbbV1vdSlwW2tga2l5dnFdbVxsdCVtXW1gamh3c25fbltqciJqX29gamZ0cGtib1pnbyBnYnFga2RxbWhkclpmayRkZXRgbWJuamVmemZoZiddaHdgb2BsZ2NqfmpqYCRda3pgcF5rZGFsf21sXx9ccH5gcl1qYl5vgW9vXhtbdIBgdFtpX1xyhXFzWxVafINgdllnXFlzh3N3WRFYgIVgeFdkWlZ1intlVw5UhIhgeVRgVlR2j35mVQtPiIpgfFFeU1F5lIF8VAhLjY5hflBeUU97mYN/VQdHkpBif05bTk1+m4aBVgVCl5RjhEtYS0p/noqDVwQ+m5hlhkhUSUeBoomGWAQ6n5xoiUZRRkOFpYuJWgQ2pKBqi0ROREGD');
  }, []);

  // Play notification sound
  const playSound = () => {
    if (notificationSettings?.settings?.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // Request browser notification permission
  useEffect(() => {
    if (notificationSettings?.settings?.browserNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [notificationSettings?.settings?.browserNotifications]);

  // Show browser notification
  const showBrowserNotification = (title, body, icon) => {
    if (!notificationSettings?.settings?.browserNotifications) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (document.hasFocus()) return; // Don't show if app is focused

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chat-message',
        renotify: true,
        silent: true, // We play our own sound
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    } catch (e) {
      // Ignore notification errors
    }
  };

  // Handle new messages
  useEffect(() => {
    if (!messages?.length || !currentEmployeeId) return;

    const latestMessage = messages[messages.length - 1];
    
    // Skip if it's the same message or our own message
    if (latestMessage.id === lastMessageIdRef.current) return;
    if (latestMessage.sender_id === currentEmployeeId) {
      lastMessageIdRef.current = latestMessage.id;
      return;
    }

    // Skip if first load
    if (!lastMessageIdRef.current) {
      lastMessageIdRef.current = latestMessage.id;
      return;
    }

    lastMessageIdRef.current = latestMessage.id;

    // Check quiet hours and muted rooms
    if (notificationSettings?.isQuietHours?.()) return;
    if (notificationSettings?.isRoomMuted?.(latestMessage.room_id)) return;

    // Play sound
    playSound();

    // Show browser notification if app not focused or panel closed
    if (!isOpen || !document.hasFocus()) {
      showBrowserNotification(
        latestMessage.sender_name || 'New Message',
        latestMessage.content?.substring(0, 100) || 'Sent a message',
        latestMessage.sender_photo
      );
    }

    // Show in-app toast with enhanced styling
    toast.custom((t) => (
      <div 
        className={cn(
          "flex items-start gap-3 p-4 bg-white rounded-xl shadow-2xl border border-gray-100 max-w-sm cursor-pointer hover:bg-gray-50 transition-all",
          "animate-in slide-in-from-top-5 duration-300"
        )}
        onClick={() => toast.dismiss(t)}
      >
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={latestMessage.sender_photo} />
          <AvatarFallback className="bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white text-sm">
            {latestMessage.sender_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-gray-900">{latestMessage.sender_name}</p>
            <span className="text-[10px] text-gray-400">just now</span>
          </div>
          <p className="text-sm text-gray-600 truncate mt-0.5">
            {latestMessage.content?.substring(0, 60)}{latestMessage.content?.length > 60 ? '...' : ''}
          </p>
        </div>
        <div className="w-2 h-2 bg-[#1EB053] rounded-full animate-pulse flex-shrink-0 mt-2" />
      </div>
    ), {
      duration: 4000,
      position: 'top-right',
    });

  }, [messages, currentEmployeeId, isOpen]);

  return { playSound };
}

// Notification Settings Dropdown
export function NotificationSettingsButton() {
  const { settings, updateSettings } = useNotificationSettings() || {};

  if (!settings) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative">
          {settings.soundEnabled || settings.browserNotifications ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <p className="text-xs font-medium text-gray-500 mb-3">Notification Settings</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-gray-500" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
              <span className="text-sm">Sound</span>
            </div>
            <Switch 
              checked={settings.soundEnabled} 
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Browser Alerts</span>
            </div>
            <Switch 
              checked={settings.browserNotifications} 
              onCheckedChange={(checked) => updateSettings({ browserNotifications: checked })}
            />
          </div>

          <DropdownMenuSeparator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Quiet Hours</span>
            </div>
            <Switch 
              checked={settings.quietHoursEnabled} 
              onCheckedChange={(checked) => updateSettings({ quietHoursEnabled: checked })}
            />
          </div>

          {settings.quietHoursEnabled && (
            <div className="flex items-center gap-2 pl-6">
              <input 
                type="time" 
                value={settings.quietStart}
                onChange={(e) => updateSettings({ quietStart: e.target.value })}
                className="text-xs border rounded px-2 py-1 w-20"
              />
              <span className="text-xs text-gray-400">to</span>
              <input 
                type="time" 
                value={settings.quietEnd}
                onChange={(e) => updateSettings({ quietEnd: e.target.value })}
                className="text-xs border rounded px-2 py-1 w-20"
              />
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Unread Badge Component
export function UnreadBadge({ count, className }) {
  if (!count || count <= 0) return null;
  
  return (
    <span className={cn(
      "absolute flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold bg-red-500 text-white rounded-full",
      "animate-in zoom-in duration-200",
      className
    )}>
      {count > 99 ? '99+' : count}
    </span>
  );
}