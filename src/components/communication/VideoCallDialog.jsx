import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Maximize2,
  Minimize2,
  Users,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function VideoCallDialog({
  open,
  onOpenChange,
  callType = "video", // "video" or "audio"
  room,
  currentEmployee,
  isIncoming = false,
  callerName = "",
  onAccept,
  onReject
}) {
  const [callStatus, setCallStatus] = useState(isIncoming ? "incoming" : "calling"); // incoming, calling, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const containerRef = useRef(null);

  const otherName = room?.type === 'group'
    ? room?.name
    : room?.participant_names?.find(n => n !== currentEmployee?.full_name) || callerName || "Unknown";

  // Initialize media stream
  useEffect(() => {
    if (open && (callStatus === "calling" || callStatus === "connected")) {
      startLocalStream();
    }
    return () => {
      stopAllStreams();
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [open]);

  // Simulate call connection after 2 seconds (in real implementation, this would be WebRTC signaling)
  useEffect(() => {
    if (callStatus === "calling") {
      const timer = setTimeout(() => {
        // Simulate remote user answering
        setCallStatus("connected");
        startCallTimer();
        toast.success("Call connected");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [callStatus]);

  const startLocalStream = async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === "video" ? { width: 1280, height: 720 } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // In a real implementation, you would set up WebRTC peer connection here
      // and send the stream to the remote peer
      
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Could not access camera/microphone", {
        description: "Please check your permissions and try again."
      });
    }
  };

  const stopAllStreams = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      // Restore camera
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false
        });
        screenStreamRef.current = screenStream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Handle when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
        
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      } catch (error) {
        console.error("Error sharing screen:", error);
        toast.error("Could not share screen");
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = () => {
    stopAllStreams();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallStatus("ended");
    toast.info("Call ended", { description: `Duration: ${formatDuration(callDuration)}` });
    setTimeout(() => onOpenChange(false), 1000);
  };

  const handleAcceptCall = () => {
    setCallStatus("connected");
    startLocalStream();
    startCallTimer();
    onAccept?.();
  };

  const handleRejectCall = () => {
    setCallStatus("ended");
    onReject?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={containerRef}
        className="max-w-4xl w-[95vw] h-[80vh] p-0 overflow-hidden bg-gray-900"
      >
        {/* Main video area */}
        <div className="relative w-full h-full">
          {/* Remote video (or avatar if no video) */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            {callStatus === "connected" && callType === "video" ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/20">
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                    {otherName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-white mb-2">{otherName}</h2>
                <p className="text-gray-400 flex items-center justify-center gap-2">
                  {callStatus === "incoming" && (
                    <>
                      <Phone className="w-4 h-4 animate-pulse" />
                      Incoming {callType} call...
                    </>
                  )}
                  {callStatus === "calling" && (
                    <>
                      <Phone className="w-4 h-4 animate-bounce" />
                      Calling...
                    </>
                  )}
                  {callStatus === "connected" && (
                    <>
                      <Clock className="w-4 h-4" />
                      {formatDuration(callDuration)}
                    </>
                  )}
                  {callStatus === "ended" && "Call ended"}
                </p>
              </div>
            )}
          </div>

          {/* Local video (picture-in-picture) */}
          {callStatus === "connected" && callType === "video" && !isVideoOff && (
            <div className="absolute bottom-24 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              {isScreenSharing && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                  Sharing Screen
                </div>
              )}
            </div>
          )}

          {/* Call info bar */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {room?.type === "group" && (
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{room?.participants?.length || 0} participants</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            {callStatus === "incoming" ? (
              // Incoming call controls
              <div className="flex items-center justify-center gap-8">
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                  onClick={handleRejectCall}
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
                  onClick={handleAcceptCall}
                >
                  <Phone className="w-6 h-6" />
                </Button>
              </div>
            ) : (
              // Active call controls
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className={`h-14 w-14 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                {callType === "video" && (
                  <Button
                    variant="ghost"
                    size="lg"
                    className={`h-14 w-14 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </Button>
                )}

                {callType === "video" && callStatus === "connected" && (
                  <Button
                    variant="ghost"
                    size="lg"
                    className={`h-14 w-14 rounded-full ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
                    onClick={toggleScreenShare}
                  >
                    {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                  </Button>
                )}

                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .mirror {
            transform: scaleX(-1);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}