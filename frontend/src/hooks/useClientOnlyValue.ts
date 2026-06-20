import { useEffect, useState } from "react";

/** Avoid SSR/client hydration mismatches for values that differ by environment or clock. */
export function useClientOnlyValue<T>(factory: () => T, deps: readonly unknown[] = []): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    setValue(factory());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}
