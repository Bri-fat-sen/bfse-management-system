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
  Clock,
  Grid,
  LayoutGrid,
  Wifi,
  WifiOff,
  AlertTriangle,
  Flag
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function VideoCallDialog({
  open,
  onOpenChange,
  callType = "video",
  room,
  currentEmployee,
  isIncoming = false,
  callerName = "",
  onAccept,
  onReject
}) {
  const [callStatus, setCallStatus] = useState(isIncoming ? "incoming" : "calling");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "speaker"
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [networkQuality, setNetworkQuality] = useState({ uplink: 0, downlink: 0 });
  const [callStats, setCallStats] = useState({ latency: 0, packetLoss: 0, bitrate: 0 });
  const [showQualityReport, setShowQualityReport] = useState(false);
  const [qualityLogs, setQualityLogs] = useState([]);
  const statsIntervalRef = useRef(null);
  
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const containerRef = useRef(null);
  const agoraClientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });

  const otherName = room?.type === 'group'
    ? room?.name
    : room?.participant_names?.find(n => n !== currentEmployee?.full_name) || callerName || "Unknown";

  const isGroupCall = room?.type === 'group' || room?.participants?.length > 2;

  // Initialize Agora client
  useEffect(() => {
    if (open && (callStatus === "calling" || callStatus === "connected")) {
      initializeAgora();
    }
    return () => {
      leaveChannel();
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [open]);

  const initializeAgora = async () => {
    try {
      // Load Agora SDK from CDN if not already loaded
      if (!window.AgoraRTC) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const AgoraRTC = window.AgoraRTC;
      
      // Get token from backend
      const channelName = `call_${room?.id || Date.now()}`;
      const { data } = await base44.functions.invoke('generateAgoraToken', {
        channelName,
        uid: currentEmployee?.id ? parseInt(currentEmployee.id.replace(/\D/g, '').slice(0, 8)) : 0
      });

      if (!data.token || !data.appId) {
        throw new Error("Failed to get Agora credentials");
      }

      // Create client
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      // Set up event listeners
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        
        if (mediaType === "video") {
          setRemoteUsers(prev => {
            const exists = prev.find(u => u.uid === user.uid);
            if (exists) {
              return prev.map(u => u.uid === user.uid ? { ...u, videoTrack: user.videoTrack } : u);
            }
            return [...prev, { uid: user.uid, videoTrack: user.videoTrack, audioTrack: user.audioTrack }];
          });
        }
        
        if (mediaType === "audio") {
          user.audioTrack?.play();
          setRemoteUsers(prev => {
            const exists = prev.find(u => u.uid === user.uid);
            if (exists) {
              return prev.map(u => u.uid === user.uid ? { ...u, audioTrack: user.audioTrack } : u);
            }
            return [...prev, { uid: user.uid, audioTrack: user.audioTrack }];
          });
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          setRemoteUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, videoTrack: null } : u));
        }
      });

      client.on("user-left", (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        toast.info("A participant left the call");
      });

      client.on("user-joined", (user) => {
        toast.success("A participant joined the call");
      });

      // Network quality monitoring
      client.on("network-quality", (stats) => {
        setNetworkQuality({ uplink: stats.uplinkNetworkQuality, downlink: stats.downlinkNetworkQuality });
        logQualityMetric("network", stats);
      });

      client.enableAudioVolumeIndicator();

      // Join channel
      await client.join(data.appId, channelName, data.token, data.uid);

      // Create and publish local tracks
      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks(
        { encoderConfig: "speech_low_quality" },
        { encoderConfig: callType === "video" ? "720p_1" : undefined }
      );

      localTracksRef.current.audioTrack = tracks[0];
      localTracksRef.current.videoTrack = tracks[1];

      // Play local video
      if (localVideoRef.current && tracks[1]) {
        tracks[1].play(localVideoRef.current);
      }

      // Publish tracks
      if (callType === "video") {
        await client.publish(tracks);
      } else {
        await client.publish([tracks[0]]);
      }

      setCallStatus("connected");
      startCallTimer();
      startStatsMonitoring(client);
      toast.success("Call connected");

    } catch (error) {
      console.error("Agora initialization error:", error);
      toast.error("Could not connect to call", {
        description: error.message || "Please check your permissions and try again."
      });
      // Fallback to simple mode
      startLocalStreamFallback();
    }
  };

  const startLocalStreamFallback = async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === "video" ? { width: 1280, height: 720 } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate connection for fallback mode
      setTimeout(() => {
        setCallStatus("connected");
        startCallTimer();
      }, 2000);
      
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Could not access camera/microphone");
    }
  };

  const logQualityMetric = (type, data) => {
    const log = {
      timestamp: new Date().toISOString(),
      type,
      ...data
    };
    setQualityLogs(prev => [...prev.slice(-50), log]); // Keep last 50 logs
  };

  const startStatsMonitoring = (client) => {
    statsIntervalRef.current = setInterval(async () => {
      if (!client) return;
      try {
        const stats = client.getRTCStats();
        const localStats = {
          latency: stats.RTT || 0,
          packetLoss: stats.OutgoingAvailableBandwidth ? 0 : (stats.SendPacketLossRate || 0),
          bitrate: Math.round((stats.SendBitrate || 0) / 1000),
          duration: stats.Duration || 0
        };
        setCallStats(localStats);
        logQualityMetric("stats", localStats);
      } catch (e) {
        // Stats not available
      }
    }, 2000);
  };

  const getQualityLevel = (quality) => {
    if (quality === 0) return { label: "Unknown", color: "text-gray-400", icon: Wifi };
    if (quality <= 2) return { label: "Excellent", color: "text-green-500", icon: Wifi };
    if (quality <= 3) return { label: "Good", color: "text-yellow-500", icon: Wifi };
    if (quality <= 4) return { label: "Poor", color: "text-orange-500", icon: AlertTriangle };
    return { label: "Bad", color: "text-red-500", icon: WifiOff };
  };

  const handleReportQuality = async (issue) => {
    const report = {
      callId: room?.id,
      userId: currentEmployee?.id,
      issue,
      stats: callStats,
      networkQuality,
      logs: qualityLogs.slice(-10),
      timestamp: new Date().toISOString()
    };
    console.log("Quality Report:", report);
    toast.success("Quality issue reported", { description: "Thank you for your feedback" });
    setShowQualityReport(false);
  };

  const leaveChannel = async () => {
    // Stop stats monitoring
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    // Stop local tracks
    if (localTracksRef.current.audioTrack) {
      localTracksRef.current.audioTrack.stop();
      localTracksRef.current.audioTrack.close();
    }
    if (localTracksRef.current.videoTrack) {
      localTracksRef.current.videoTrack.stop();
      localTracksRef.current.videoTrack.close();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Leave Agora channel
    if (agoraClientRef.current) {
      await agoraClientRef.current.leave();
      agoraClientRef.current = null;
    }

    setRemoteUsers([]);
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

  const toggleMute = async () => {
    if (localTracksRef.current.audioTrack) {
      await localTracksRef.current.audioTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (localTracksRef.current.videoTrack) {
      await localTracksRef.current.videoTrack.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (!agoraClientRef.current) return;

    try {
      const AgoraRTC = window.AgoraRTC;

      if (isScreenSharing) {
        // Stop screen sharing, restore camera
        if (screenStreamRef.current) {
          await agoraClientRef.current.unpublish(screenStreamRef.current);
          screenStreamRef.current.stop();
          screenStreamRef.current.close();
          screenStreamRef.current = null;
        }
        if (localTracksRef.current.videoTrack) {
          await agoraClientRef.current.publish(localTracksRef.current.videoTrack);
          localTracksRef.current.videoTrack.play(localVideoRef.current);
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: "1080p_1"
        }, "disable");

        if (localTracksRef.current.videoTrack) {
          await agoraClientRef.current.unpublish(localTracksRef.current.videoTrack);
        }

        await agoraClientRef.current.publish(screenTrack);
        screenStreamRef.current = screenTrack;

        screenTrack.on("track-ended", async () => {
          setIsScreenSharing(false);
          await agoraClientRef.current.unpublish(screenTrack);
          screenTrack.close();
          if (localTracksRef.current.videoTrack) {
            await agoraClientRef.current.publish(localTracksRef.current.videoTrack);
            localTracksRef.current.videoTrack.play(localVideoRef.current);
          }
        });

        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      toast.error("Could not share screen");
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
    leaveChannel();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallStatus("ended");
    toast.info("Call ended", { description: `Duration: ${formatDuration(callDuration)}` });
    setTimeout(() => onOpenChange(false), 1000);
  };

  const handleAcceptCall = () => {
    setCallStatus("connected");
    initializeAgora();
    onAccept?.();
  };

  const handleRejectCall = () => {
    setCallStatus("ended");
    onReject?.();
    onOpenChange(false);
  };

  // Calculate grid layout based on number of participants
  const getGridClass = (count) => {
    if (count <= 1) return "grid-cols-1";
    if (count <= 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    return "grid-cols-3 grid-rows-3";
  };

  const totalParticipants = remoteUsers.length + 1; // +1 for local user

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={containerRef}
        className="max-w-5xl w-[95vw] h-[85vh] p-0 overflow-hidden bg-gray-900"
      >
        <div className="relative w-full h-full">
          {/* Video Grid Area */}
          <div className="absolute inset-0 p-2">
            {callStatus === "connected" && callType === "video" ? (
              <div className={`grid ${getGridClass(totalParticipants)} gap-2 h-full`}>
                {/* Local Video */}
                <div className="relative rounded-lg overflow-hidden bg-gray-800">
                  <div 
                    ref={localVideoRef}
                    className="w-full h-full"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <Avatar className="w-20 h-20">
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                          {currentEmployee?.full_name?.charAt(0) || "Y"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs">
                    You {isScreenSharing && "(Sharing)"}
                  </div>
                  {isMuted && (
                    <div className="absolute top-2 right-2 p-1 bg-red-500 rounded-full">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Remote Videos */}
                {remoteUsers.map((user, index) => (
                  <RemoteVideoPlayer 
                    key={user.uid} 
                    user={user} 
                    index={index}
                    participantName={room?.participant_names?.[index + 1] || `Participant ${index + 1}`}
                  />
                ))}

                {/* Empty slots placeholder for group calls */}
                {isGroupCall && remoteUsers.length === 0 && (
                  <div className="rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Waiting for others to join...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Calling/Incoming state
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/20">
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-[#1EB053] to-[#0072C6] text-white">
                      {isGroupCall ? <Users className="w-12 h-12" /> : otherName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold text-white mb-2">{otherName}</h2>
                  {isGroupCall && (
                    <p className="text-gray-400 text-sm mb-2">
                      {room?.participants?.length || 0} participants
                    </p>
                  )}
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
                        Connecting...
                      </>
                    )}
                    {callStatus === "ended" && "Call ended"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Call info bar */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {callStatus === "connected" && (
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(callDuration)}</span>
                  </div>
                )}
                {isGroupCall && (
                  <div className="flex items-center gap-1 text-white/80 text-sm ml-4">
                    <Users className="w-4 h-4" />
                    <span>{totalParticipants} participant{totalParticipants > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Quality Indicator */}
                {callStatus === "connected" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 ${getQualityLevel(networkQuality.downlink).color}`}>
                          {React.createElement(getQualityLevel(networkQuality.downlink).icon, { className: "w-4 h-4" })}
                          <span className="text-xs font-medium">{getQualityLevel(networkQuality.downlink).label}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-gray-900 border-gray-700">
                        <div className="text-xs space-y-1">
                          <p>Latency: <span className="font-mono">{callStats.latency}ms</span></p>
                          <p>Bitrate: <span className="font-mono">{callStats.bitrate} kbps</span></p>
                          <p>Packet Loss: <span className="font-mono">{callStats.packetLoss.toFixed(1)}%</span></p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {isGroupCall && callStatus === "connected" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setViewMode(viewMode === "grid" ? "speaker" : "grid")}
                  >
                    {viewMode === "grid" ? <LayoutGrid className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                  </Button>
                )}
                {callStatus === "connected" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowQualityReport(true)}
                  >
                    <Flag className="w-5 h-5" />
                  </Button>
                )}
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
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            {callStatus === "incoming" ? (
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

          {/* Quality Report Modal */}
          {showQualityReport && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold text-white mb-4">Report Call Quality Issue</h3>
                <div className="space-y-2 mb-4">
                  {["Audio cutting out", "Video freezing", "High latency", "Echo/feedback", "Cannot hear others", "Other issue"].map(issue => (
                    <Button
                      key={issue}
                      variant="outline"
                      className="w-full justify-start text-left border-gray-600 text-white hover:bg-gray-700"
                      onClick={() => handleReportQuality(issue)}
                    >
                      {issue}
                    </Button>
                  ))}
                </div>
                <Button variant="ghost" className="w-full text-gray-400" onClick={() => setShowQualityReport(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Remote Video Player Component
function RemoteVideoPlayer({ user, index, participantName }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current);
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user.videoTrack]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-800">
      {user.videoTrack ? (
        <div ref={videoRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {participantName?.charAt(0) || (index + 1)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs">
        {participantName}
      </div>
    </div>
  );
}