import React from "react";
import CanvasMetadataValueBar from "./CanvasMetadataValueBar";

interface MetadataValueBarProps {
  axis: "X" | "Y";
  width: number;
  height: number;
}

export default function MetadataValueBar({
  axis,
  width,
  height,
}: MetadataValueBarProps) {
  return <CanvasMetadataValueBar axis={axis} width={width} height={height} />;
}
