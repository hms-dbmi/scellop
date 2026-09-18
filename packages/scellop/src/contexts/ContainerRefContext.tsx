import { createContext, useContext } from "../utils/context";

const OuterContainerRefContext =
  createContext<React.RefObject<HTMLDivElement | null> | null>(
    "Outer Container Context",
  );

const ParentRefContext =
  createContext<React.RefObject<HTMLDivElement | null> | null>(
    "Visualization Container Context",
  );

export function useOuterContainerRef() {
  return useContext(OuterContainerRefContext);
}

export function useParentRef() {
  return useContext(ParentRefContext);
}

export const ParentRefProvider = ParentRefContext.Provider;
export const OuterContainerRefProvider = OuterContainerRefContext.Provider;
