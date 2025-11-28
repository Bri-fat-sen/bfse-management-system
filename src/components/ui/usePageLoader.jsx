import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage page loading states with a minimum display time.
 * @param {boolean} isDataReady - Whether the data has finished loading
 * @param {number} minLoadTime - Minimum time to show loader in ms (default: 400)
 * @returns {boolean} - Whether to show the loader
 */
export default function usePageLoader(isDataReady, minLoadTime = 400) {
  const [showLoader, setShowLoader] = useState(true);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (isDataReady) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minLoadTime - elapsed);

      if (remaining > 0) {
        timerRef.current = setTimeout(() => {
          setShowLoader(false);
        }, remaining);
      } else {
        setShowLoader(false);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDataReady, minLoadTime]);

  return showLoader;
}