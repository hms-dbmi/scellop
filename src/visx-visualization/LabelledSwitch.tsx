import {
  FormHelperText,
  InputLabel,
  Stack,
  Switch,
  SwitchProps,
} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import React from "react";
import InfoTooltip from "./InfoTooltip";

interface LabelledSwitchProps extends SwitchProps {
  leftLabel: string;
  rightLabel: string;
  label: string;
  tooltip?: string;
  tooltipIsHelper?: boolean;
}

export default function LabelledSwitch({
  leftLabel,
  rightLabel,
  label,
  tooltip,
  tooltipIsHelper,
  ...rest
}: LabelledSwitchProps) {
  return (
    <Stack direction="column" gap={1} alignItems="start">
      <FormControlLabel
        control={
          <Stack direction="row" gap={1} alignItems="center">
            <InputLabel>{leftLabel}</InputLabel>
            <Switch {...rest} />
            <InputLabel>{rightLabel}</InputLabel>
          </Stack>
        }
        label={
          <InputLabel
            color="primary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {label} {!tooltipIsHelper && <InfoTooltip title={tooltip} />}
          </InputLabel>
        }
        labelPlacement="top"
      />
      {tooltipIsHelper && tooltip && <FormHelperText>{tooltip}</FormHelperText>}
    </Stack>
  );
}
