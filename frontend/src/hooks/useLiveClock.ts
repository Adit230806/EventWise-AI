import { useEffect, useState } from "react";

/**
 * Returns a formatted clock string that updates every second on the client.
 * Returns undefined during SSR to avoid hydration mismatches.
 */
export function useLiveClock(): string | undefined {
  const [label, setLabel] = useState<string | undefined>(undefined);

  useEffect(() => {
    function format() {
      return new Date().toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    // Set immediately on mount so there's no delay
    setLabel(format());

    const id = setInterval(() => setLabel(format()), 1000);
    return () => clearInterval(id); // cleanup on unmount — no leak
  }, []);

  return label;
}
