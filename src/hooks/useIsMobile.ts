import { useEffect, useState } from "react";

/**
 * Custom hook to determine if the viewport is mobile-sized.
 * @returns {boolean} - True if the viewport is mobile-sized, false otherwise.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}
