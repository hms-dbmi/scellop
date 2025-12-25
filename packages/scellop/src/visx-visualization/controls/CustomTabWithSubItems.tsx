import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  styled,
  Tab,
} from "@mui/material";
import React, { MouseEvent, useCallback, useState } from "react";

export interface SubItem {
  id: string;
  label: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  selected?: boolean;
}

export interface CustomTabWithSubItemsProps {
  label: string;
  subItems?: SubItem[];
  orientation?: "horizontal" | "vertical";
  selected?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onTabSelect?: (event: MouseEvent<HTMLElement>) => void;
  id?: string;
  "aria-controls"?: string;
  disabled?: boolean;
  showSubItems?: boolean;
  renderSubItemsExternally?: boolean; // For horizontal mode
}

const StyledTabContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
}));

const StyledSubItemsList = styled(List)(({ theme }) => ({
  padding: 0,
  marginLeft: theme.spacing(2),
  borderLeft: `1px solid ${theme.palette.divider}`,
  width: "100%",
  "& .MuiListItem-root": {
    padding: 0,
    width: "100%",
  },
  "& .MuiListItemButton-root": {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    minHeight: "auto",
    width: "100%",
    textAlign: "left",
    justifyContent: "flex-start",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  "& .MuiListItemText-root": {
    margin: 0,
    width: "100%",
    "& .MuiListItemText-primary": {
      fontSize: "0.875rem",
      fontWeight: 400,
      textAlign: "left",
    },
  },
}));

// Horizontal sub-items styling
const StyledHorizontalSubItemsList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  width: "100%",
  minWidth: 0, // Allow shrinking
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
  overflowX: "hidden", // Prevent horizontal overflow only
  "& .MuiButton-root": {
    padding: `${theme.spacing(0.75)} ${theme.spacing(1)}`,
    minHeight: "auto",
    minWidth: 0, // Allow buttons to shrink
    color: theme.palette.primary.main,
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 0,
    flexGrow: 1,
    flexShrink: 1, // Allow shrinking
    justifyContent: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:not(:last-child)": {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
    "&.selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      textDecoration: "none",
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
        textDecoration: "none",
      },
    },
    // Mobile responsiveness
    [theme.breakpoints.down("md")]: {
      fontSize: "0.75rem",
      padding: `${theme.spacing(0.5)} ${theme.spacing(0.75)}`,
    },
  },
}));

/**
 * HorizontalSubItems component renders sub-items in horizontal layout
 */
export function HorizontalSubItems({
  subItems,
  onSubItemClick,
}: {
  subItems: SubItem[];
  onSubItemClick: (
    subItem: SubItem,
  ) => (event: MouseEvent<HTMLElement>) => void;
}) {
  if (subItems.length === 0) return null;

  return (
    <StyledHorizontalSubItemsList>
      {subItems.map((subItem) => (
        <Button
          key={subItem.id}
          variant="text"
          onClick={onSubItemClick(subItem)}
          className={subItem.selected ? "selected" : ""}
          disableRipple
        >
          {subItem.label}
        </Button>
      ))}
    </StyledHorizontalSubItemsList>
  );
}

const StyledTab = styled(Tab)(() => ({
  alignItems: "flex-start",
  textAlign: "left",
  justifyContent: "flex-start",
  minHeight: 48,
  "& .MuiTab-wrapper": {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  "&.MuiTab-root": {
    textAlign: "left",
    alignItems: "flex-start",
  },
}));

const TabContentContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  textAlign: "left",
}));

/**
 * CustomTabWithSubItems component extends MUI Tab functionality to include
 * collapsible sub-items that are displayed when tabs are vertically aligned.
 *
 * Features:
 * - Sub-items are only shown in vertical orientation
 * - Sub-item events don't propagate to parent Tabs
 * - Expandable/collapsible sub-items list
 * - Individual sub-item selection state
 * - Maintains MUI Tab styling and behavior
 */
export function CustomTabWithSubItems({
  label,
  subItems = [],
  orientation = "horizontal",
  selected = false,
  onClick,
  onTabSelect,
  showSubItems = true,
  ...tabProps
}: CustomTabWithSubItemsProps) {
  const [expanded, setExpanded] = useState(false);

  const isVertical = orientation === "vertical";
  const hasSubItems = subItems.length > 0 && isVertical && showSubItems;

  // Auto-expand when tab is selected and has sub-items
  React.useEffect(() => {
    if (selected && hasSubItems) {
      setExpanded(true);
    }
  }, [selected, hasSubItems]);

  const handleTabClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (hasSubItems) {
        setExpanded((prev) => !prev);
      }

      // Call the original onClick handler
      if (onClick) {
        onClick(event);
      }
    },
    [hasSubItems, onClick],
  );

  const handleSubItemClick = useCallback(
    (subItem: SubItem) => (event: MouseEvent<HTMLElement>) => {
      // Prevent event propagation to parent Tabs
      event.stopPropagation();

      // If the parent tab is not selected, select it first
      if (!selected && onTabSelect) {
        onTabSelect(event);

        // Delay the sub-item action to allow the tab content to render
        setTimeout(() => {
          if (subItem.onClick) {
            subItem.onClick(event);
          }
        }, 100);
      } else {
        // If tab is already selected, execute immediately
        if (subItem.onClick) {
          subItem.onClick(event);
        }
      }
    },
    [selected, onTabSelect],
  );

  if (!isVertical || !hasSubItems) {
    // For horizontal tabs or tabs without sub-items, render a standard Tab
    return (
      <Tab
        label={label}
        onClick={onClick}
        sx={{
          justifyContent: isVertical ? "flex-start" : "center",
          textAlign: isVertical ? "left" : "center",
          alignItems: isVertical ? "flex-start" : "center",
        }}
        {...tabProps}
      />
    );
  }

  const Icon = expanded ? ExpandLess : ExpandMore;

  // For vertical tabs with sub-items, render custom structure
  return (
    <StyledTabContainer>
      <StyledTab
        label={
          <TabContentContainer>
            <span>{label}</span>
            <Box component="span" sx={{ ml: 1 }}>
              <Icon fontSize="small" />
            </Box>
          </TabContentContainer>
        }
        onClick={handleTabClick}
        {...tabProps}
      />

      {hasSubItems && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <StyledSubItemsList>
            {subItems.map((subItem) => (
              <ListItem key={subItem.id} disablePadding>
                <ListItemButton
                  onClick={handleSubItemClick(subItem)}
                  className={subItem.selected ? "selected" : ""}
                  // Prevent event bubbling to parent components
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                >
                  <ListItemText primary={subItem.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </StyledSubItemsList>
        </Collapse>
      )}
    </StyledTabContainer>
  );
}

export default CustomTabWithSubItems;
