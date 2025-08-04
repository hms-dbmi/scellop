import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
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
  Button,
  Divider,
  FormControl,
  Icon,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  useEventCallback,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  useColumnConfig,
  useRowConfig,
} from "../../contexts/AxisConfigContext";
import { useData } from "../../contexts/DataContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import { useSelectedValues } from "../../contexts/ExpandedValuesContext";
import InfoTooltip from "../InfoTooltip";
import { usePlotControlsContext } from "./PlotControlsContext";

function useItems() {
  const rows = useData((s) => s.rowOrder);
  const columns = useData((s) => s.columnOrder);
  const section = usePlotControlsContext();
  return section === "Column" ? columns : rows;
}

function useItemLabel() {
  const section = usePlotControlsContext();
  return section === "Column"
    ? useColumnConfig((s) => s.label)
    : useRowConfig((s) => s.label);
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

interface StickyColumnHeaderProps {
  gridRow: number;
  gridColumn: number;
  ariaLabel: string;
  topOffset: number;
  children: React.ReactNode;
}

function StickyColumnHeader({
  gridRow,
  gridColumn,
  ariaLabel,
  topOffset,
  children,
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
      })}
      zIndex={1}
    >
      <Typography
        component="label"
        variant="subtitle1"
        role="columnheader"
        display="flex"
        alignItems="center"
        gap={1}
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

  const itemLabel = useItemLabel();
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
          <FormControl fullWidth>
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
          <Stack
            direction="row"
            justifyContent="space-between"
            mt={2}
            useFlexGap
          >
            <Button
              variant="text"
              startIcon={<Restore />}
              onClick={displayItems}
              sx={{
                opacity: hasHiddenItems ? 1 : 0,
                transition: "opacity 0.2s ease-out",
              }}
              disabled={!hasHiddenItems}
              size="small"
            >
              Set all to visible
            </Button>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                visibility:
                  hasHiddenItems || hasSelectedItems ? "visible" : "hidden",
              }}
            />
            <Button
              variant="text"
              endIcon={<UnfoldLess />}
              onClick={collapseAllItems}
              sx={{
                opacity: hasSelectedItems ? 1 : 0,
                transition: "opacity 0.2s ease-out",
              }}
              disabled={!hasSelectedItems}
              size="small"
            >
              Collapse all expanded {pluralItemLabel}
            </Button>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                visibility:
                  displayHideFiltered || hasSelectedItems
                    ? "visible"
                    : "hidden",
              }}
            />
            <Button
              variant="text"
              endIcon={<VisibilityOff />}
              onClick={hideFilteredItems}
              sx={{
                opacity: displayHideFiltered ? 1 : 0,
                transition: "opacity 0.2s ease-out",
              }}
              disabled={!displayHideFiltered}
              size="small"
            >
              Hide all filtered {pluralItemLabel}
            </Button>
          </Stack>
        </Box>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: canBeExpanded
                  ? "1fr auto auto"
                  : "1fr auto",
                gridTemplateRows: "auto",
                position: "relative",
              }}
              role="list"
            >
              <StickyColumnHeader
                gridRow={1}
                gridColumn={1}
                ariaLabel={`${section} name and description`}
                topOffset={topStickySectionHeight}
              >
                <Icon sx={{ visibility: "hidden", pr: 1 }} />
                {itemLabel}
              </StickyColumnHeader>
              <StickyColumnHeader
                gridRow={1}
                gridColumn={2}
                ariaLabel={`Toggle visibility of ${section} items`}
                topOffset={topStickySectionHeight}
              >
                Visible
              </StickyColumnHeader>
              {canBeExpanded && (
                <StickyColumnHeader
                  gridRow={1}
                  gridColumn={3}
                  ariaLabel={`Toggle between displaying ${section} items as heatmap cells or a bar plot.`}
                  topOffset={topStickySectionHeight}
                >
                  Expanded
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

function DisplayItem({ item }: { item: string }) {
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

  return (
    <Box
      style={style}
      ref={setNodeRef}
      role="listitem"
      sx={{
        display: "grid",
        gap: 1,
        gridRow: "auto",
        gridColumn: "span 3",
        gridTemplateColumns: "subgrid",
        gridTemplateRows: "subgrid",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "start",
          spacing: 1,
          gridColumn: 1,
        }}
      >
        <Icon
          component={DragHandle}
          {...attributes}
          {...listeners}
          sx={{ cursor: "pointer", mr: 2 }}
          tabIndex={0}
        />
        <Stack>
          <Typography variant="subtitle2">{item}</Typography>
          {subtitle && <Typography variant="body2">{subtitle}</Typography>}
        </Stack>
      </Box>
      <Box gridColumn={2}>
        <Switch
          name={item}
          onChange={toggleVisibility}
          aria-label={`Toggle visibility of ${section} ${item}`}
          checked={isVisible}
        />
      </Box>
      {canBeExpanded && (
        <Box gridColumn={3}>
          <Switch
            name={item}
            onChange={toggleExpansion}
            checked={isExpanded}
            aria-label={`Toggle between displaying row ${item} as heatmap cells or a bar plot.`}
          />
        </Box>
      )}
    </Box>
  );
}
