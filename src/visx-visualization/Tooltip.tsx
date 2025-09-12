import {
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { defaultStyles, useTooltipInPortal } from "@visx/tooltip";
import React, { useEffect } from "react";
import { useParentRef } from "../contexts/ContainerRefContext";
import {
  useSetTooltipData,
  useTooltipData,
} from "../contexts/TooltipDataContext";

function formatTooltipKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTooltipValue(value: unknown): React.ReactNode {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (value === null || value === undefined) {
    return <>&mdash;</>;
  }
  return String(value);
}

/**
 * Component which renders a basic tooltip with the data set in the tooltip data context.
 * @returns
 */
export default function Tooltip() {
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, contextMenuOpen } =
    useTooltipData();
  const { closeTooltip } = useSetTooltipData();

  const parentRef = useParentRef();
  const visualizationBounds = parentRef.current?.getBoundingClientRect();
  const theme = useTheme();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // Use document.body as the container
    detectBounds: true,
    scroll: true,
  });

  useEffect(() => {
    // Set the container to document.body
    containerRef(document.body);
  }, [containerRef]);

  if (!tooltipOpen || contextMenuOpen || !tooltipData) {
    return null;
  }

  // Calculate the absolute position by adding the visualization's offset to the relative coordinates
  const absoluteTop = tooltipTop + (window?.scrollY ?? 0);
  const absoluteLeft = tooltipLeft + (window?.scrollX ?? 0);

  return (
    <TooltipInPortal
      top={absoluteTop}
      left={absoluteLeft}
      style={{
        ...defaultStyles,
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <Stack gap={0.25}>
        <Typography variant="subtitle1">{tooltipData?.title}</Typography>
        <Divider />
        {tooltipData?.data && (
          <Table size="small" sx={{ minWidth: "auto" }}>
            <TableBody>
              {Object.entries(tooltipData.data).map(([key, value]) => (
                <TableRow key={key} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      px: 0,
                    }}
                  >
                    {formatTooltipKey(key)}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.75rem",
                    }}
                  >
                    {formatTooltipValue(value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Stack>
    </TooltipInPortal>
  );
}
