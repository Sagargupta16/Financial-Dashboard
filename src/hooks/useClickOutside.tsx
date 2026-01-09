import { type RefObject, useEffect } from "react";

/**
 * Custom hook for detecting clicks outside a specified element
 * @param {RefObject<HTMLElement>} ref - React ref to the element
 * @param {() => void} handler - Callback function to execute on outside click
 * @param {boolean} enabled - Whether the hook is active (default: true)
 *
 * @example
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * useClickOutside(dropdownRef, () => setIsOpen(false));
 *
 * return <div ref={dropdownRef}>Dropdown content</div>;
 */
export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void,
  enabled = true
): void => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, enabled]);
};
