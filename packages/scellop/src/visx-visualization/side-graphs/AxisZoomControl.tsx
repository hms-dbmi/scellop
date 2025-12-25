import React, {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";

import { AxisConfigStore } from "../../contexts/AxisConfigContext";

import UnfoldMoreDouble from "@mui/icons-material/ZoomIn";
import UnfoldLessDouble from "@mui/icons-material/ZoomOut";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Tooltip from "@mui/material/Tooltip";

interface AxisZoomControlProps {
  axisConfig: AxisConfigStore;
  resetScroll: () => void;
  axis: "Row" | "Column";
}

export default function AxisZoomControl({
  axisConfig,
  axis: orientation,
  resetScroll,
}: AxisZoomControlProps) {
  const { zoomed, zoomIn, zoomOut } = axisConfig;

  const Icon = zoomed ? UnfoldLessDouble : UnfoldMoreDouble;

  const options = useMemo(() => {
    return [
      {
        label: `Zoom in to ${orientation}s`,
        onClick: () => {
          zoomIn();
          resetScroll();
        },
        disabled: !!zoomed,
      },
      {
        label: `Zoom out of ${orientation}s`,
        onClick: () => {
          zoomOut();
          resetScroll();
        },
        disabled: !zoomed,
      },
    ];
  }, [orientation, resetScroll, zoomIn, zoomOut, zoomed]);

  return (
    <DropdownButton
      icon={
        <Icon
          sx={{
            ...(orientation === "Row"
              ? { transform: "rotate(-90deg) scaleY(-1)" }
              : {}),
          }}
        />
      }
      tooltip={`Zoom ${orientation}s In/Out`}
      tooltipPlacement={orientation === "Row" ? "top" : "bottom"}
      dropdownPlacement={orientation === "Row" ? "bottom" : "right"}
      options={options}
    />
  );
}

type Placement = "bottom" | "top" | "right" | "left";

interface DropdownButtonProps {
  icon: ReactNode;
  tooltip: string;
  tooltipPlacement?: Placement;
  dropdownPlacement?: Placement;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  options: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
}

function DropdownButton({
  icon,
  tooltip,
  tooltipPlacement = "right",
  dropdownPlacement = "bottom",
  options,
}: DropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Tooltip title={tooltip} placement={tooltipPlacement}>
        <IconButton
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select zoom level"
          aria-haspopup="menu"
          onClick={handleToggle}
          ref={anchorRef}
        >
          {icon}
        </IconButton>
      </Tooltip>
      <Popper
        sx={{ zIndex: 10001 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        placement={dropdownPlacement}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {options.map((option) => (
                    <MenuItem
                      key={option.label}
                      onClick={() => {
                        option.onClick();
                        handleClose();
                      }}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}
