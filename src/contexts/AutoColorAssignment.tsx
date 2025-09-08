import React from "react";
import { useAutoColorAssignment } from "../hooks/useAutoColorAssignment";

interface AutoColorAssignmentProps {
  children: React.ReactNode;
  /**
   * Whether auto color assignment should be enabled (default: true)
   */
  enabled?: boolean;
}

/**
 * Component that automatically assigns default colors to axes that don't have colors configured.
 * This should be placed inside the providers tree after DataProvider and AxisConfig providers.
 */
export function AutoColorAssignment({
  children,
  enabled = true,
}: AutoColorAssignmentProps) {
  useAutoColorAssignment(enabled);
  return <>{children}</>;
}
