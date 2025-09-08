import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Close,
  DragHandle,
  ExpandMoreRounded,
  Restore,
  Search,
  UnfoldLess,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControl,
  Icon,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useEventCallback,
} from "@mui/material";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useData } from "../../contexts/DataContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import { initializeDefaultColors } from "../../utils/axis-colors";
import InfoTooltip from "../InfoTooltip";
import { ColorPicker } from "./ColorPicker";
import { usePlotControlsContext } from "./PlotControlsContext";

function useColorConfig() {
  const section = usePlotControlsContext();
  return section === "Column" ? useColumnConfig() : useRowConfig();
}

function GlobalColorControls() {
  const setAllItemsColor = useSetAllItemsColor();
  const pluralItemLabel = usePluralItemLabel();

  return (
    <ColorPicker
      onColorChange={setAllItemsColor}
      tooltip={`Apply a single color to all ${pluralItemLabel}`}
      size={16}
    />
  );
}

function useSetAllItemsColor() {
  const config = useColorConfig();
  const items = useItems();
  const label = usePluralItemLabel();
  const trackEvent = useTrackEvent();

  return useCallback(
    (color: string) => {
      if (color) {
        config.setAllColors(color, items);
        trackEvent(`Set all ${label} to single color`, color);
      } else {
        // Clear all colors
        config.setColors({});
        trackEvent(`Clear all ${label} colors`, `${items.length} ${label}`);
      }
    },
    [config, items, label, trackEvent],
  );
}

function useSetItemColor() {
  const config = useColorConfig();
  const items = useItems();
  const label = usePluralItemLabel();
  const trackEvent = useTrackEvent();

  return useCallback(
    (item: string, color: string) => {
      // If color is empty and no colors are set, generate defaults
      if (
        !color &&
        (!config.colors || Object.keys(config.colors).length === 0)
      ) {
        const defaultColors = initializeDefaultColors(items, config.colors);
        config.setColors(defaultColors);
        trackEvent(`Reset ${label} colors to default`, item);
      } else if (!color) {
        // Remove the color for this item
        config.removeColor(item);
        trackEvent(`Reset ${label} color`, item);
      } else {
        // Set the specific color for this item
        config.setColor(item, color);
        trackEvent(`Set ${label} color`, `${item}: ${color}`);
      }
    },
    [config, items, label, trackEvent],
  );
}

function useItems() {
  const rows = useData((s) => s.rowOrder);
  const columns = useData((s) => s.columnOrder);
  const section = usePlotControlsContext();
  return section === "Column" ? columns : rows;
}

function usePluralItemLabel() {
  const section = usePlotControlsContext();
  return section === "Column"
    ? useColumnConfig((s) => s.pluralLabel)
    : useRowConfig((s) => s.pluralLabel);
}

function useItemMetadata() {
  const section = usePlotControlsContext();
  return useData((s) =>
    section === "Column" ? s.data.metadata.cols : s.data.metadata.rows,
  );
}

function useSetItems() {
  const section = usePlotControlsContext();
  const setItems = useData((s) =>
    section === "Column" ? s.setColumnOrder : s.setRowOrder,
  );
  return setItems;
}

function useRemoveItems() {
  const section = usePlotControlsContext();
  return useData((s) =>
    section === "Column" ? s.removeColumns : s.removeRows,
  );
}

function useDisplayItems() {
  const section = usePlotControlsContext();
  return useData((s) =>
    section === "Column"
      ? {
          displayItems: s.resetRemovedColumns,
          hasHiddenItems: s.removedColumns.size > 0,
          hiddenItemsCount: s.removedColumns.size,
        }
      : {
          displayItems: s.resetRemovedRows,
          hasHiddenItems: s.removedRows.size > 0,
          hiddenItemsCount: s.removedRows.size,
        },
  );
}

function useCanBeExpanded() {
  const section = usePlotControlsContext();
  return section === "Row";
}

interface StickyColumnHeaderProps extends React.PropsWithChildren {
  gridRow: number;
  gridColumn: number;
  ariaLabel: string;
  topOffset: number;
  textCenter?: boolean;
}

function StickyColumnHeader({
  gridRow,
  gridColumn,
  ariaLabel,
  topOffset,
  children,
  textCenter = false,
}: StickyColumnHeaderProps) {
  return (
    <Box
      gridRow={gridRow}
      gridColumn={gridColumn}
      aria-label={ariaLabel}
      position="sticky"
      top={topOffset}
      sx={(theme) => ({
        background: `linear-gradient(to bottom, ${theme.palette.background.paper} 75%, transparent 100%)`,
        backdropFilter: "blur(10px)",
        pb: 1,
        minHeight: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: textCenter ? "center" : "flex-start",
      })}
      zIndex={1}
    >
      <Typography
        component="label"
        variant="caption"
        role="columnheader"
        display="flex"
        alignItems="center"
        gap={0.5}
        fontWeight={600}
        fontSize="0.75rem"
      >
        {children}
      </Typography>
    </Box>
  );
}

const ColumnDescription = "Toggle to show or hide a column from view.";
const RowDescription =
  "Toggle to show or hide a row, or enable an embedded detailed plot for the row within the visualization.";

export function DisplayControls() {
  const canBeExpanded = useCanBeExpanded();

  const description = canBeExpanded ? RowDescription : ColumnDescription;

  const items = useItems();
  const metadata = useItemMetadata();
  const setItems = useSetItems();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useEventCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over) {
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      setItems(arrayMove(items, oldIndex, newIndex));
    }
  });

  const [search, setSearch] = useState("");

  const updateSearch = useEventCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  });
  const createSubtitle = useSubtitleFunction();

  // Filter items based on search input
  // It checks both the item name and its metadata subtitle
  // to see if they include the search term (case-insensitive).
  const filteredItems = items.filter(
    (item) =>
      item.toLowerCase().includes(search.toLowerCase()) ||
      createSubtitle(item, metadata?.[item])
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  // Row or Column
  const section = usePlotControlsContext();

  const removeItems = useRemoveItems();
  const { displayItems, hasHiddenItems, hiddenItemsCount } = useDisplayItems();

  const itemsAreFiltered =
    items.length !== filteredItems.length && filteredItems.length > 0;
  const excludedItems = items.length - filteredItems.length;
  const moreItemsCanBeFiltered = hiddenItemsCount >= excludedItems;

  const deselectValues = useSelectedValues((s) => s.deselectValues);

  const trackEvent = useTrackEvent();

  const hideFilteredItems = useEventCallback(() => {
    const hiddenItems = items.filter((item) => !filteredItems.includes(item));
    removeItems(hiddenItems);
    deselectValues(hiddenItems);
    trackEvent(`Hide filtered ${section}`, hiddenItems.join(", "));
  });

  const hasSelectedItems = useSelectedValues((s) => s.selectedValues.size > 0);

  const collapseAllItems = useCollapseAllItems();

  const pluralItemLabel = usePluralItemLabel();

  const [topStickySectionHeight, setTopStickySectionHeight] = useState(0);
  const topStickySectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updateHeight = () => {
      if (topStickySectionRef.current) {
        setTopStickySectionHeight(
          topStickySectionRef.current.getBoundingClientRect().height,
        );
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    if (topStickySectionRef.current) {
      resizeObserver.observe(topStickySectionRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const displayHideFiltered = itemsAreFiltered && !moreItemsCanBeFiltered;

  return (
    <Accordion
      id={`display-options-${section}`}
      defaultExpanded
      elevation={0}
      disableGutters
      sx={{
        "&.MuiAccordion-root::before": { display: "none" },
        scrollMarginTop: 160,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRounded />}
        sx={{
          "& .MuiAccordionSummary-content": {
            display: "flex",
            alignItems: "center",
            gap: 1,
          },
        }}
      >
        <Visibility />
        <Typography variant="subtitle1">Display Options</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          ref={topStickySectionRef}
          position="sticky"
          top={0}
          zIndex={1}
          sx={(theme) => ({
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Typography variant="body2" mb={2}>
            {description}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <FormControl sx={{ flex: 1 }}>
              <TextField
                placeholder="Search"
                aria-label="Search items"
                value={search}
                onChange={updateSearch}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearch("");
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: <Icon component={Search} sx={{ pr: 1 }} />,
                    endAdornment: search ? (
                      <IconButton onClick={() => setSearch("")} size="small">
                        <Close />
                      </IconButton>
                    ) : null,
                  },
                }}
              />
            </FormControl>
          </Stack>
        </Box>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          measuring={{
            droppable: { strategy: MeasuringStrategy.WhileDragging },
          }}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <Box
              sx={{
                display: "grid",
                gap: 0.5,
                gridTemplateColumns: canBeExpanded
                  ? "minmax(0, 1fr) 48px 48px 48px"
                  : "minmax(0, 1fr) 48px 48px",
                gridTemplateRows: "auto",
                position: "relative",
                "& > *": {
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                },
              }}
              role="table"
            >
              <StickyColumnHeader
                gridRow={1}
                gridColumn={1}
                ariaLabel={`${section} name and description`}
                topOffset={topStickySectionHeight}
              >
                <Icon component={DragHandle} sx={{ opacity: 0.3, mr: 0.5 }} />
                {pluralItemLabel} ({filteredItems.length} / {items.length})
                <Stack direction="row" spacing={0.5} mx={1}>
                  <Tooltip title="Set all to visible">
                    <span>
                      <IconButton
                        onClick={displayItems}
                        sx={{
                          opacity: hasHiddenItems ? 1 : 0.3,
                          transition: "opacity 0.2s ease-out",
                        }}
                        disabled={!hasHiddenItems}
                        size="small"
                      >
                        <Restore fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  {canBeExpanded && (
                    <Tooltip title={`Collapse all expanded ${pluralItemLabel}`}>
                      <span>
                        <IconButton
                          onClick={collapseAllItems}
                          sx={{
                            opacity: hasSelectedItems ? 1 : 0.3,
                            transition: "opacity 0.2s ease-out",
                          }}
                          disabled={!hasSelectedItems}
                          size="small"
                        >
                          <UnfoldLess fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  <Tooltip title={`Hide all filtered ${pluralItemLabel}`}>
                    <span>
                      <IconButton
                        onClick={hideFilteredItems}
                        sx={{
                          opacity: displayHideFiltered ? 1 : 0.3,
                          transition: "opacity 0.2s ease-out",
                        }}
                        disabled={!displayHideFiltered}
                        size="small"
                      >
                        <VisibilityOff fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </StickyColumnHeader>
              <StickyColumnHeader
                gridRow={1}
                gridColumn={2}
                ariaLabel={`Toggle visibility of ${section} items`}
                topOffset={topStickySectionHeight}
                textCenter
              >
                <Visibility sx={{ fontSize: "1rem" }} />
              </StickyColumnHeader>
              <StickyColumnHeader
                gridRow={1}
                gridColumn={3}
                ariaLabel={`Set colors for ${section} items`}
                topOffset={topStickySectionHeight}
                textCenter
              >
                <GlobalColorControls />
              </StickyColumnHeader>
              {canBeExpanded && (
                <StickyColumnHeader
                  gridRow={1}
                  gridColumn={4}
                  ariaLabel={`Toggle between displaying ${section} items as heatmap cells or a bar plot.`}
                  topOffset={topStickySectionHeight}
                  textCenter
                >
                  Expand
                  <InfoTooltip title="Toggle between displaying row as heatmap cells or a bar plot." />
                </StickyColumnHeader>
              )}
              {filteredItems.map((item) => (
                <DisplayItem key={item} item={item} />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      </AccordionDetails>
    </Accordion>
  );
}

const useToggleVisibility = () => {
  const section = usePlotControlsContext();
  const hideItem = useData((s) =>
    section === "Column" ? s.removeColumn : s.removeRow,
  );
  const showItem = useData((s) =>
    section === "Column" ? s.restoreColumn : s.restoreRow,
  );
  const columnLabel = useColumnConfig((s) => s.label);
  const rowLabel = useRowConfig((s) => s.label);
  const label = section === "Column" ? columnLabel : rowLabel;
  const trackEvent = useTrackEvent();
  const selectedValues = useSelectedValues((s) => s.selectedValues);
  const deselectValue = useSelectedValues((s) => s.deselectValue);
  const handleChange = useEventCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      showItem(e.target.name);
      trackEvent(`Show ${label}`, e.target.name);
    } else {
      if (section === "Row" && selectedValues.has(e.target.name)) {
        deselectValue(e.target.name);
      }
      hideItem(e.target.name);
      trackEvent(`Hide ${label}`, e.target.name);
    }
  });
  return handleChange;
};

const useToggleExpansion = () => {
  const { toggleItem, selectedValues } = useSelectedValues((s) => ({
    toggleItem: s.toggleValue,
    selectedValues: s.selectedValues,
  }));
  const showItem = useData((s) => s.restoreRow);
  const removedRows = useData((s) => s.removedRows);
  const trackEvent = useTrackEvent();
  const rowLabel = useRowConfig((s) => s.label);
  const handleChange = useEventCallback((e: ChangeEvent<HTMLInputElement>) => {
    const row = e.target.name;
    if (selectedValues.has(row)) {
      trackEvent(`Collapse ${rowLabel}`, row);
    } else {
      const rowIsHidden = removedRows.has(row);
      if (rowIsHidden) {
        showItem(e.target.name);
      }
      trackEvent(`Expand ${rowLabel}`, row);
    }
    toggleItem(e.target.name);
  });
  return handleChange;
};

function useCollapseAllItems() {
  const deselectValues = useSelectedValues((s) => s.deselectValues);
  const items = useItems();
  const trackEvent = useTrackEvent();
  const label = usePluralItemLabel();

  return useEventCallback(() => {
    deselectValues(items);
    trackEvent(`Collapse all ${label}`, `${items.length} ${label}`);
  });
}

const useSubtitleFunction = () => {
  const rowSubtitle = useRowConfig((s) => s.createSubtitle) ?? (() => "");
  const columnSubtitle = useColumnConfig((s) => s.createSubtitle) ?? (() => "");
  const section = usePlotControlsContext();
  return section === "Column" ? columnSubtitle : rowSubtitle;
};

interface DisplayItemProps {
  item: string;
}

function DisplayItem({ item }: DisplayItemProps) {
  const section = usePlotControlsContext();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item });

  const createSubtitle = useSubtitleFunction();
  const metadata = useData((s) =>
    section === "Column" ? s.data.metadata.cols : s.data.metadata.rows,
  );

  const metadataValues = metadata?.[item];

  const subtitle = createSubtitle(item, metadataValues);
  const canBeExpanded = useCanBeExpanded();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleVisibility = useToggleVisibility();
  const isVisible = useData(
    (s) => !s.removedRows.has(item) && !s.removedColumns.has(item),
  );
  const toggleExpansion = useToggleExpansion();
  const isExpanded = useSelectedValues((s) => s.selectedValues.has(item));

  // Color management
  const colorConfig = useColorConfig();
  const setItemColor = useSetItemColor();

  const getItemColor = (itemName: string) => {
    if (!colorConfig.colors) return undefined;
    return colorConfig.colors[itemName] || undefined;
  };

  return (
    <Box
      style={style}
      ref={setNodeRef}
      role="row"
      sx={{
        display: "grid",
        gridRow: "auto",
        gridColumn: `span ${canBeExpanded ? 4 : 3}`,
        gridTemplateColumns: "subgrid",
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:hover": {
          backgroundColor: "action.hover",
        },
        py: 0.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gridColumn: 1,
          minHeight: "40px",
          pr: 1,
          overflow: "hidden",
        }}
        role="cell"
      >
        <Icon
          component={DragHandle}
          {...attributes}
          {...listeners}
          sx={{
            cursor: "grab",
            mr: 1,
            fontSize: "1rem",
            color: "action.active",
            "&:active": { cursor: "grabbing" },
          }}
          tabIndex={0}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            {item}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: "text.secondary",
                fontSize: "0.75rem",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        gridColumn={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "40px",
        }}
        role="cell"
      >
        <Switch
          name={item}
          onChange={toggleVisibility}
          aria-label={`Toggle visibility of ${section} ${item}`}
          checked={isVisible}
          size="small"
        />
      </Box>
      <Box
        gridColumn={3}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "40px",
        }}
        role="cell"
      >
        <ColorPicker
          color={getItemColor(item)}
          onColorChange={(color) => setItemColor(item, color)}
          tooltip={`Set color for ${item}`}
          size={24}
        />
      </Box>
      {canBeExpanded && (
        <Box
          gridColumn={4}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "40px",
          }}
          role="cell"
        >
          <Switch
            name={item}
            onChange={toggleExpansion}
            checked={isExpanded}
            aria-label={`Toggle between displaying row ${item} as heatmap cells or a bar plot.`}
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}
