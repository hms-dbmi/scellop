import { useCallback, useState } from "react";

export default function useBoolean(initialValue: boolean = false) {
  const [state, setState] = useState(initialValue);
  const toggle = useCallback(() => setState((prev) => !prev), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  return [state, setTrue, setFalse, toggle, setState] as const;
}
