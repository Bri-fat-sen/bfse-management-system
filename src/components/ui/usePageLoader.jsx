import { useState, useEffect, useRef } from "react";

export default function usePageLoader(isDataReady, minLoadTime = 400) {
  const [showLoader, setShowLoader] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isDataReady && showLoader) {
      timerRef.current = setTimeout(() => {
        setShowLoader(false);
      }, minLoadTime);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDataReady, minLoadTime, showLoader]);

  return showLoader;
}