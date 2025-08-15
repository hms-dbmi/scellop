import {
  FormHelperText,
  InputLabel,
  Stack,
  Switch,
  SwitchProps,
  Typography,
} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import React, { useId } from "react";
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
  const switchId = useId();
  return (
    <Stack direction="column" gap={1} alignItems="start">
      <FormControlLabel
        control={
          <Stack direction="row" gap={1} alignItems="center">
            <Typography component="label" variant="body2" htmlFor={switchId}>
              {leftLabel}
            </Typography>
            <Switch id={switchId} {...rest} />
            <Typography component="label" variant="body2" htmlFor={switchId}>
              {rightLabel}
            </Typography>
          </Stack>
        }
        label={
          <InputLabel
            color="primary"
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            }}
          >
            {label} {!tooltipIsHelper && <InfoTooltip title={tooltip} />}
          </InputLabel>
        }
        labelPlacement="top"
        sx={{
          alignItems: "start",
          mx: 0,
        }}
      />
      {tooltipIsHelper && tooltip && <FormHelperText>{tooltip}</FormHelperText>}
    </Stack>
  );
}
