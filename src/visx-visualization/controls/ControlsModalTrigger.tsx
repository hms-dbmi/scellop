import { Settings } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import React from "react";
import { useControlsVisibilityActions } from "../../contexts/ControlsVisibilityContext";
import useBoolean from "../../hooks/useBoolean";

export default function ControlsModalTrigger() {
  const { showControls } = useControlsVisibilityActions();
  const [isHovered, setIsHovered, setIsNotHovered] = useBoolean(false);
  return (
    // Extra Box wrapper to handle hover and focus events
    // prevents an issue where the onMouseEnter/onMouseLeave functions
    // are repeatedly triggered when the user hovers on the corner of the Fab
    <Box
      onMouseEnter={setIsHovered}
      onMouseLeave={setIsNotHovered}
      onFocus={setIsHovered}
      onBlur={setIsNotHovered}
      sx={{
        position: "absolute",
        right: 8,
        padding: 1,
      }}
    >
      <Fab
        color="primary"
        aria-label="View Plot Settings"
        variant={isHovered ? "extended" : "circular"}
        onClick={showControls}
        sx={{
          transition: "width 0.3s ease-in-out",
          transformOrigin: "right center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            transition:
              "all 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.0s ease-in-out",
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateX(0)" : "translateX(50%)",
            width: isHovered ? "fit-content" : 0,
            marginRight: isHovered ? 1 : 0,
          }}
        >
          Settings
        </Box>
        <Settings />
      </Fab>
    </Box>
  );
}
