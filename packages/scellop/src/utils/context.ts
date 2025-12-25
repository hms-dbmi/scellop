import React, {
  createContext as createContextNative,
  useContext as useContextNative,
  type Context,
} from "react";

/**
 * Type-safe `useContext` hook that throws if the context is undefined.
 * @param context The react context to use
 * @returns The value of the context
 * @throws If the context is undefined
 */
export function useContext<T>(context: React.Context<T>): NonNullable<T>;
export function useContext<T>(context: React.Context<T | undefined>): T {
  const contextValue = useContextNative(context);
  if (contextValue === undefined) {
    throw new Error(
      `useContext must be inside a Provider with a value${
        context.displayName && `, missing provider for ${context.displayName}`
      }`,
    );
  }
  return contextValue;
}

/**
 * Overloads for the `createContext` function to ease the creation of new contexts.
 * Allows for the instantiation of typed contexts without having to specify the default values.
 * @param displayName The display name to apply to the context
 */
export function createContext<T>(displayName: string): Context<T | undefined>;
export function createContext<T>(
  displayName: string,
  defaultValue: T,
): Context<T>;
export function createContext<T>(displayName: string, defaultValue?: T) {
  const context =
    defaultValue !== undefined
      ? createContextNative<T>(defaultValue)
      : createContextNative<T | undefined>(undefined);
  context.displayName = displayName;
  return context;
}
