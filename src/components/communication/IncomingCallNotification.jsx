import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Video } from "lucide-react";

export default function IncomingCallNotification({
  show,
  callerName,
  callerPhoto,
  callType = "video",
  onAccept,
  onReject
}) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Play ringtone
      audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleStP5Q==");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current?.pause();
    }
    
    return () => {
      audioRef.current?.pause();
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 right-4 z-[100] bg-white rounded-2xl shadow-2xl border p-6 w-80"
        >
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-20 h-20 border-4 border-[#1EB053]/20">
                <AvatarImage src={callerPhoto} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                  {callerName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1EB053] flex items-center justify-center"
              >
                {callType === "video" ? (
                  <Video className="w-4 h-4 text-white" />
                ) : (
                  <Phone className="w-4 h-4 text-white" />
                )}
              </motion.div>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900">{callerName}</h3>
            <p className="text-gray-500 text-sm mb-6">
              Incoming {callType} call...
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
                onClick={onReject}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
                onClick={onAccept}
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Pulsing ring animation */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-2xl border-2 border-[#1EB053] pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}