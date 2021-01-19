import { useEffect } from "react";

export function useResize(ref, onResize) {
  useEffect(() => {
    const currRef = ref.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        onResize(entry.target);
      }
    });

    if (currRef) resizeObserver.observe(currRef);
    return () => currRef && resizeObserver.unobserve(currRef);
  }, [ref, onResize]);
}
