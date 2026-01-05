import { useCallback, useState } from "react";

/**
 * Custom hook for managing a boolean state.
 * This hook provides a simple way to toggle a boolean value,
 * @param initialValue Initial value for the boolean state, defaults to false.
 * @returns ```[state, setTrue, setFalse, toggle, setState]```
 */
export default function useBoolean(initialValue: boolean = false) {
  const [state, setState] = useState(initialValue);
  const toggle = useCallback(() => setState((prev) => !prev), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  return [state, setTrue, setFalse, toggle, setState] as const;
}
