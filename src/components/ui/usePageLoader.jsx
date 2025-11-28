import { useState, useEffect } from "react";

export default function usePageLoader(isDataReady, minLoadTime = 800) {
  const [showLoader, setShowLoader] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (isDataReady) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadTime - elapsed);
      
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isDataReady, startTime, minLoadTime]);

  return showLoader;
}