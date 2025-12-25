import React from "react";

interface SVGBackgroundColorFilterProps {
  color: string;
  id: string;
}

export default function SVGBackgroundColorFilter({
  color,
  id,
}: SVGBackgroundColorFilterProps) {
  return (
    <defs>
      <filter x="0" y="0" width="1" height="1" id={id}>
        <feFlood floodColor={color} result="bg" />
        <feMerge>
          <feMergeNode in="bg" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}
