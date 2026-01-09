import { useEffect, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Custom hook for tracking window size
 * @returns {WindowSize} - Current window dimensions
 *
 * @example
 * const { width, height } = useWindowSize();
 * const isMobile = width < 768;
 * const isTablet = width >= 768 && width < 1024;
 * const isDesktop = width >= 1024;
 */
export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

/**
 * Breakpoint constants for responsive design
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Hook for responsive breakpoint detection
 * @returns {object} - Breakpoint detection flags
 *
 * @example
 * const { isMobile, isTablet, isDesktop } = useBreakpoint();
 */
export const useBreakpoint = () => {
  const { width } = useWindowSize();

  return {
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isWide: width >= BREAKPOINTS.xl,
    width,
  };
};
