import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone, Monitor, Share } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches 
      || window.navigator?.standalone 
      || document.referrer?.includes('android-app://');
    setIsStandalone(standalone || false);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '') && !window.MSStream;
    setIsIOS(iOS);

    // Check if dismissed recently
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setDismissed(true);
      }
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standalone && !dismissed) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show iOS prompt after delay
    if (iOS && !standalone && !dismissed) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-br from-[#0F1F3C] to-[#1a3a5c] text-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Sierra Leone flag accent */}
        <div className="h-1 flex">
          <div className="flex-1 bg-[#1EB053]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#0072C6]" />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center flex-shrink-0 shadow-lg">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-col">
                <div className="flex-1 bg-[#1EB053]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#0072C6]" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Install BRI-FAT-SEN</h3>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Install our app for faster access, offline support, and a better experience.
              </p>
            </div>
          </div>

          {isIOS ? (
            // iOS installation instructions
            <div className="mt-4 p-3 bg-white/10 rounded-xl">
              <p className="text-xs text-gray-300 flex items-center gap-2">
                <Share className="w-4 h-4" />
                Tap the share button, then "Add to Home Screen"
              </p>
            </div>
          ) : (
            // Android/Desktop install button
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-[#1EB053] to-[#0072C6] hover:opacity-90 text-white gap-2 h-10 rounded-xl"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                Not now
              </Button>
            </div>
          )}

          {/* Features highlight */}
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Works offline
            </span>
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              Quick access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check if app is installed
export function useIsPWAInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkInstalled = () => {
      const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches 
        || window.navigator?.standalone 
        || document.referrer?.includes('android-app://');
      setIsInstalled(standalone || false);
    };

    checkInstalled();
    
    const handleInstalled = () => setIsInstalled(true);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  return isInstalled;
}