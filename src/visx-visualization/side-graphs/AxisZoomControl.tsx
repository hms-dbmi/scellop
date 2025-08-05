import React, {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

import { AxisConfigStore } from "../../contexts/AxisConfigContext";

import UnfoldLessDouble from "@mui/icons-material/UnfoldLessDouble";
import UnfoldMoreDouble from "@mui/icons-material/UnfoldMoreDouble";
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
  orientation: "horizontal" | "vertical";
}

export default function AxisZoomControl({
  axisConfig,
  orientation,
}: AxisZoomControlProps) {
  const { zoomed, zoomIn, zoomOut } = axisConfig;

  const Icon = zoomed ? UnfoldLessDouble : UnfoldMoreDouble;

  const onClick = useCallback(() => {
    if (!zoomed) {
      zoomIn();
    }
  }, [zoomed, zoomIn]);

  return (
    <DropdownButton
      icon={
        <Icon
          sx={{
            ...(orientation === "horizontal"
              ? { transform: "rotate(90deg)" }
              : {}),
          }}
        />
      }
      tooltip="Zoom Control"
      tooltipPlacement={orientation === "horizontal" ? "top" : "bottom"}
      dropdownPlacement={orientation === "horizontal" ? "bottom" : "right"}
      onClick={onClick}
      options={[
        { label: "Zoom In", onClick: zoomIn, disabled: !!zoomed },
        { label: "Zoom Out", onClick: zoomOut, disabled: !zoomed },
      ]}
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

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

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
              <ClickAwayListener
                onClickAway={handleClose}
                onClick={handleClose}
              >
                <MenuList>
                  {options.map((option) => (
                    <MenuItem
                      key={option.label}
                      onClick={(_event) => {
                        option.onClick();
                        handleClose(_event as unknown as Event);
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
