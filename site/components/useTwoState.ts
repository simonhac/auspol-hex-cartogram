import { useCallback, useState } from "react";

export type Which = "a" | "b";

/**
 * Two-state animation toggle. Holds which of two prop states (A/B) is active
 * and flips between them — re-rendering the chart with the other dataset so
 * its built-in transitions animate. Used by every chart demo.
 */
export function useTwoState<T>(a: T, b: T, initial: Which = "a") {
  const [which, setWhich] = useState<Which>(initial);
  const value = which === "a" ? a : b;
  const toggle = useCallback(() => setWhich((w) => (w === "a" ? "b" : "a")), []);
  return { value, which, setWhich, toggle };
}
