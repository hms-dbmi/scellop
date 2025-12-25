import React, { PropsWithChildren } from "react";
import { createContext, useContext } from "../utils/context";

type EventTrackerContextValue = (
  event: string,
  detail: string,
  extra?: Record<string, unknown>,
) => void;

const EventTrackerContext = createContext<EventTrackerContextValue>(
  "Event Tracker Context Value",
);

// Placeholder function to prevent errors when no event tracker is provided
const noOp = () => {};

export const EventTrackerProvider = ({
  trackEvent = noOp,
  children,
}: PropsWithChildren<{
  trackEvent?: EventTrackerContextValue;
}>) => {
  return (
    <EventTrackerContext.Provider value={trackEvent}>
      {children}
    </EventTrackerContext.Provider>
  );
};

export const useTrackEvent = () => useContext(EventTrackerContext);
