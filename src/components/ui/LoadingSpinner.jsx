import { } from "react";

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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">🇸🇱</div>
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
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231EB053' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo or Flag */}
        {orgLogo ? (
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-10 p-4 border border-gray-100">
            <img src={orgLogo} alt={orgName} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-32 h-24 rounded-2xl overflow-hidden shadow-2xl mb-10 border-4 border-gray-100">
            <div className="h-1/3 bg-[#1EB053]"></div>
            <div className="h-1/3 bg-white border-y-2 border-gray-200"></div>
            <div className="h-1/3 bg-[#0072C6]"></div>
          </div>
        )}

        {/* Organization Name */}
        {orgName && (
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1EB053] via-[#0072C6] to-[#1EB053] bg-clip-text text-transparent mb-3 text-center px-4">
            {orgName}
          </h1>
        )}
        <p className="text-gray-500 text-base mb-16">Business Management System</p>

        {/* Large Animated Loading Spinner */}
        <div className="relative mb-12">
          <div className="w-32 h-32 relative">
            <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-[#1EB053] animate-spin"></div>
            <div 
              className="absolute inset-3 rounded-full border-8 border-transparent border-t-white animate-spin" 
              style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
            ></div>
            <div 
              className="absolute inset-6 rounded-full border-8 border-transparent border-t-[#0072C6] animate-spin" 
              style={{ animationDuration: '2s' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl">🇸🇱</div>
            </div>
          </div>
          
          {/* Flag colors stripe */}
          <div className="flex h-2 w-32 rounded-full overflow-hidden mt-6 mx-auto shadow-md">
            <div className="flex-1 bg-[#1EB053]"></div>
            <div className="flex-1 bg-white border-y-2 border-gray-200"></div>
            <div className="flex-1 bg-[#0072C6]"></div>
          </div>
        </div>

        <p className="text-gray-700 font-semibold text-lg">Welcome</p>
        <p className="text-gray-400 text-sm mt-2">Preparing your dashboard...</p>
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