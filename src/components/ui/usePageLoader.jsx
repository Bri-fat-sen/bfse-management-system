import { useState, useEffect } from "react";

export default function usePageLoader(isDataReady, minLoadTime = 400) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (isDataReady) {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, minLoadTime);

      return () => clearTimeout(timer);
    }
  }, [isDataReady, minLoadTime]);

  return showLoader;
}