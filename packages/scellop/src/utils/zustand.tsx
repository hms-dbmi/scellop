import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

import React, {
  PropsWithChildren,
  RefObject,
  useEffect,
  useRef,
  type Context,
  type ReactNode,
} from "react";
import { type StoreApi } from "zustand";

import { TemporalState } from "zundo";
import { createContext, useContext } from "./context";

export type ExtractState<S> = S extends { getState: () => infer X } ? X : never;

/**
 * A curried version of the `useStore` hook from zustand; this hook is bound to a store instance in a context.
 * @param selector A selector function which takes the store state and returns a value
 * @param equalityFn An optional equality function which takes the previous and new values and returns a boolean
 */
export interface CurriedUseStore<T extends StoreApi<unknown>> {
  (): ExtractState<T>;
  <U>(selector: (state: ExtractState<T>) => U): U;
  <U>(
    selector: (state: ExtractState<T>) => U,
    equalityFn?: (state: U, newState: U) => boolean,
  ): U;
}

/**
 * Helper function for creating a `useStore` hook for a context-bound zustand store.
 * @param storeContext the Context object to create the hook for
 * @returns A `useStore` hook for the passed context which can be called with a selector and equality function
 */
export function createTemporalStoreContextHook<MyState>(
  storeContext: Context<MyState | undefined>,
) {
  function useTemporalStore(): TemporalState<MyState>;
  function useTemporalStore<T>(
    selector: (state: TemporalState<MyState>) => TemporalState<T>,
  ): T;
  function useTemporalStore<T>(
    selector: (state: TemporalState<MyState>) => TemporalState<T>,
    equality: (a: TemporalState<T>, b: TemporalState<T>) => boolean,
  ): T;
  function useTemporalStore<T>(
    selector?: (state: TemporalState<MyState>) => TemporalState<T>,
    equality?: (a: TemporalState<T>, b: TemporalState<T>) => boolean,
  ) {
    const store = useContext(storeContext);
    // @ts-expect-error - Zustand types are annoying
    return useStoreWithEqualityFn(store.temporal, selector!, equality);
  }
  return useTemporalStore;
}

type TemporalStore<S> = ReturnType<typeof createTemporalStoreContextHook<S>>;

/**
 * Helper function for creating a `useStore` hook for a context-bound zustand store.
 * @param storeContext the Context object to create the hook for
 * @returns A `useStore` hook for the passed context which can be called with a selector and equality function
 */
export function createStoreContextHook<T, S extends StoreApi<T>>(
  storeContext: Context<S | undefined>,
) {
  function useCurriedZustandContext<U>(selector: (state: T) => U): U;
  function useCurriedZustandContext<U>(
    selector: (state: T) => U = (state: T) => state as unknown as U,
    equalityFn: ((state: U, newState: U) => boolean) | undefined = shallow,
  ): U {
    const store = useContext<S | undefined>(storeContext);
    return useStoreWithEqualityFn(store, selector, equalityFn);
  }
  return useCurriedZustandContext as CurriedUseStore<S>;
}

type CreateStoreContext<
  StoreType extends StoreApi<unknown>,
  CreateStoreArgs,
  Temporal extends boolean = false,
> =
  // If Temporal is true, return an array with the temporal hook and store
  Temporal extends true
    ? [
        (
          props: PropsWithChildren<CreateStoreArgs & ProviderEnhancements>,
        ) => ReactNode,
        CurriedUseStore<StoreType>,
        Context<StoreType | undefined>,
        TemporalStore<StoreType>,
      ]
    : [
        (
          props: PropsWithChildren<CreateStoreArgs & ProviderEnhancements>,
        ) => ReactNode,
        CurriedUseStore<StoreType>,
        Context<StoreType | undefined>,
      ];
export interface ProviderEnhancements {
  // Reactive providers reset the store when the props change
  reactive?: boolean;
}

/**
 * Helper function for creating a context and provider for a zustand store.
 *
 * @param createStore The initializer function that creates the zustand store. Its parameters are the expected props for the provider.
 * @param displayName The display name for the created context
 * @param temporal Whether or not the store is temporal, i.e. whether there is a temporal store associated with it
 * @returns A Context and Provider for the created store
 */
export function createStoreContext<T, CreateStoreArgs>(
  createStore: (initialArgs: CreateStoreArgs) => StoreApi<T>,
  displayName: string,
) {
  type StoreType = StoreApi<T>;
  // Create a context for the passed `createStore` function's return type
  const StoreContext = createContext<StoreType>(displayName);
  // Create a hook for the context
  const hook = createStoreContextHook(StoreContext);
  // Create a provider component which creates the store and passes it to the context
  function Provider({
    children,
    reactive = false,
    ...props
  }: PropsWithChildren<CreateStoreArgs & ProviderEnhancements>) {
    // Keep the store in a ref so it is only created once per instance of the provider
    const store = useRef<StoreType>();
    if (!store.current) {
      store.current = createStore(props as CreateStoreArgs);
    }

    useEffect(() => {
      if (reactive) {
        const newStore = createStore(props as CreateStoreArgs);
        if (store.current) {
          store.current.setState(newStore.getState());
        }
      }
    }, [props]);

    return (
      <StoreContext.Provider value={store.current}>
        {children}
      </StoreContext.Provider>
    );
  }
  return [Provider, hook, StoreContext] as CreateStoreContext<
    StoreApi<T>,
    CreateStoreArgs
  >;
}

export function createTemporalStoreContext<T, CreateStoreArgs>(
  createStore: (initialArgs: CreateStoreArgs) => StoreApi<T>,
  displayName: string,
) {
  type StoreType = StoreApi<T>;
  const [Provider, hook, StoreContext] = createStoreContext<T, CreateStoreArgs>(
    createStore,
    displayName,
  );

  const temporalHook = createTemporalStoreContextHook(StoreContext);
  return [Provider, hook, StoreContext, temporalHook] as CreateStoreContext<
    StoreType,
    CreateStoreArgs,
    true
  >;
}

/**
 * A lot less DRY than ideal, but this was the most straightforward
 * way to make a variant which also instantiates a ref to a DOM element
 * in case we have any further instances of this beyond the dropdown menu store.
 *
 * @param createStore The initializer function that creates the zustand store.
 *                    Its first parameter is the expected props for the provider.
 *                    The second parameter should accept the ref object.
 * @param displayName The display name for the created context
 * @returns A Context and Provider for the created store
 */
export function createStoreContextWithRef<T, CreateStoreArgs, RefType>(
  createStore: (
    initialArgs: CreateStoreArgs,
    ref: RefObject<RefType>,
  ) => StoreApi<T>,
  displayName: string,
) {
  type StoreType = StoreApi<T>;
  // Create a context for the passed `createStore` function's return type
  const StoreContext = createContext<StoreType>(displayName);
  // Create a hook for the context
  const hook = createStoreContextHook(StoreContext);
  // Create a provider component which creates the store and passes it to the context
  function Provider({
    children,
    ...props
  }: PropsWithChildren<CreateStoreArgs>) {
    // Keep the store in a ref so it is only created once per instance of the provider
    const store = useRef<StoreType>();
    const ref = useRef<RefType>(null);
    if (!store.current) {
      store.current = createStore(props as CreateStoreArgs, ref);
      if ("temporal" in store) {
        (store.temporal as TemporalState<unknown>).clear();
      }
    }
    return (
      <StoreContext.Provider value={store.current}>
        {children}
      </StoreContext.Provider>
    );
  }
  return [Provider, hook, StoreContext] as CreateStoreContext<
    StoreApi<T>,
    CreateStoreArgs
  >;
}
