import InfoRounded from "@mui/icons-material/InfoRounded";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

interface MuiTooltipProps {
  title?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export default function InfoTooltip({
  title,
  placement = "top",
}: MuiTooltipProps) {
  if (!title) {
    return null;
  }
  return (
    <Tooltip title={title} placement={placement}>
      <Icon component={InfoRounded} color="info" fontSize="small" />
    </Tooltip>
  );
}
