import React from "react";

export default function LoadingSpinner({ 
  message = "Loading...", 
  subtitle = "Please wait",
  size = "lg",
  fullScreen = true 
}) {
  const content = (
    <div className="flex flex-col items-center justify-center">
      {/* Large Animated Loading Spinner */}
      <div className="relative mb-10">
        <div className="w-40 h-40 relative">
          <div className="absolute inset-0 rounded-full border-[10px] border-gray-100"></div>
          <div className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-[#1EB053] animate-spin"></div>
          <div 
            className="absolute inset-4 rounded-full border-[10px] border-transparent border-t-white animate-spin" 
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          ></div>
          <div 
            className="absolute inset-8 rounded-full border-[10px] border-transparent border-t-[#0072C6] animate-spin" 
            style={{ animationDuration: '2s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69250a5e2096205358a5c476/e3d7b69e5_file_00000000014871faa409619479a5f0ef.png" 
              alt="BRI-FAT-SEN" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* Flag colors stripe */}
        <div className="flex h-2.5 w-40 rounded-full overflow-hidden mt-6 mx-auto shadow-md">
          <div className="flex-1 bg-[#1EB053]"></div>
          <div className="flex-1 bg-white border-y-2 border-gray-200"></div>
          <div className="flex-1 bg-[#0072C6]"></div>
        </div>
      </div>

      {message && <p className="text-gray-700 font-semibold text-xl">{message}</p>}
      {subtitle && <p className="text-gray-400 text-base mt-2">{subtitle}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-40">
        {content}
      </div>
    );
  }

  return content;
}

// Welcome/Initial loading screen with logo
export function WelcomeLoader({ orgName, orgLogo }) {
  const [fadeStage, setFadeStage] = React.useState(0);
  
  React.useEffect(() => {
    const timer1 = setTimeout(() => setFadeStage(1), 100);
    const timer2 = setTimeout(() => setFadeStage(2), 800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5e] to-[#0F1F3C] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#1EB053] rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#0072C6] rounded-full animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-[#1EB053] rounded-full animate-pulse" style={{ animationDuration: '3.5s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Cinematic Logo Animation */}
        <div 
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: fadeStage >= 1 ? 1 : 0,
            transform: fadeStage >= 1 ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)'
          }}
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69250a5e2096205358a5c476/564ad3427_file_00000000014871faa409619479a5f0ef.png" 
            alt="BRI-FAT-SEN Enterprise"
            className="w-[90vw] max-w-2xl h-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* Loading Animation */}
        <div 
          className="mt-12 transition-all duration-700 delay-500"
          style={{
            opacity: fadeStage >= 2 ? 1 : 0,
            transform: fadeStage >= 2 ? 'translateY(0)' : 'translateY(10px)'
          }}
        >
          {/* Spinner */}
          <div className="relative mb-8">
            <div className="w-20 h-20 relative mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1EB053] animate-spin"></div>
              <div 
                className="absolute inset-2 rounded-full border-4 border-transparent border-t-white animate-spin" 
                style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
              ></div>
              <div 
                className="absolute inset-4 rounded-full border-4 border-transparent border-t-[#0072C6] animate-spin" 
                style={{ animationDuration: '2s' }}
              ></div>
            </div>
          </div>

          {/* Flag Stripe */}
          <div className="flex h-1.5 w-32 rounded-full overflow-hidden mx-auto shadow-lg">
            <div className="flex-1 bg-[#1EB053] animate-pulse"></div>
            <div className="flex-1 bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="flex-1 bg-[#0072C6] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* Loading Text */}
          <div className="text-center mt-8">
            <p className="text-white font-semibold text-lg animate-pulse">Initializing System...</p>
            <p className="text-white/60 text-sm mt-2">Please wait</p>
          </div>
        </div>
      </div>

      {/* Sierra Leone flag corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-1/3 bg-[#1EB053]"></div>
        <div className="w-full h-1/3 bg-white"></div>
        <div className="w-full h-1/3 bg-[#0072C6]"></div>
      </div>
    </div>
  );
}

// Skeleton loader for cards
export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-gradient-to-r from-gray-100 to-gray-50 border-b"></div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex border-b last:border-0">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="flex-1 p-4">
              <div className="h-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}