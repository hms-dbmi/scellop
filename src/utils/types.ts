import { Dispatch, SetStateAction } from "react";

/**
 * Convenience type for the setter function provided by `useState`.
 * Used to simplify definition of context types.
 */
export type Setter<T> = Dispatch<SetStateAction<T>>;
