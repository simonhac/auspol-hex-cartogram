/**
 * Wires the Parliament page's Custom-mode state to the URL so a configuration
 * is shareable. Two decoupled halves:
 *
 *  - Hydration: read the initial URL exactly once (via a ref initialiser) and
 *    seed state from it. Never re-reads searchParams for hydration, so our own
 *    writes can't loop back.
 *  - Writing: a debounced effect mirrors state into the URL with `replace`, and
 *    skips entirely when the URL already matches — so a shared link isn't
 *    rewritten on first paint and React 19 StrictMode double-invokes are no-ops.
 */

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  CUSTOM_PARAMS,
  DEFAULT_GEOMETRY,
  decodeCustom,
  encodeCustom,
  type Geometry,
  type Grouping,
} from "./url";

export type Scenario = "results" | "predicted" | "custom";

const WRITE_DEBOUNCE_MS = 250;

export interface CustomConfigState {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  groupings: Grouping[];
  setGroupings: Dispatch<SetStateAction<Grouping[]>>;
  geometry: Geometry;
  setGeometry: Dispatch<SetStateAction<Geometry>>;
}

export function useCustomConfigUrl(
  makeDefaultGroupings: () => Grouping[],
): CustomConfigState {
  const [searchParams, setSearchParams] = useSearchParams();

  // One-time hydration. The ref initialiser runs exactly once and never reads
  // searchParams again, decoupling hydration from our own URL writes.
  const initial = useRef<{
    scenario: Scenario;
    groupings: Grouping[];
    geometry: Geometry;
  } | null>(null);
  if (initial.current === null) {
    const decoded = decodeCustom(searchParams);
    initial.current = decoded
      ? { scenario: "custom", groupings: decoded.groupings, geometry: decoded.geometry }
      : {
          scenario: "results",
          groupings: makeDefaultGroupings(),
          geometry: { ...DEFAULT_GEOMETRY },
        };
  }

  const [scenario, setScenario] = useState<Scenario>(initial.current.scenario);
  const [groupings, setGroupings] = useState<Grouping[]>(initial.current.groupings);
  const [geometry, setGeometry] = useState<Geometry>(initial.current.geometry);

  useEffect(() => {
    const handle = setTimeout(() => {
      const target = new URLSearchParams(searchParams);
      if (scenario === "custom") {
        const params = encodeCustom({ groupings, geometry });
        for (const key of CUSTOM_PARAMS) target.set(key, params[key]);
      } else {
        for (const key of CUSTOM_PARAMS) target.delete(key);
      }
      // Equality guard: never rewrite an already-matching URL.
      if (target.toString() === searchParams.toString()) return;
      setSearchParams(target, { replace: true });
    }, WRITE_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [scenario, groupings, geometry, searchParams, setSearchParams]);

  return { scenario, setScenario, groupings, setGroupings, geometry, setGeometry };
}
