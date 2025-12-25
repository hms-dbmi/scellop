import { useCallback, useState } from "react";

export function useSet<T>(initialValues: T[] = []) {
  const [set, update] = useState<Set<T>>(new Set([...initialValues]));
  const add = useCallback((value: T) => {
    update((prev) => {
      const next = new Set(prev);
      next.add(value);
      return next;
    });
  }, []);
  const remove = useCallback((value: T) => {
    update((prev) => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }, []);
  const toggle = useCallback((value: T) => {
    update((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    update(new Set());
  }, []);
  return { set, add, remove, update, toggle, reset };
}
