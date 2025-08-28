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
  Add,
  Close,
  DragHandle,
  ExpandMoreRounded,
  FilterAlt,
  Restore,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  Icon,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  useEventCallback,
} from "@mui/material";
import { filter } from "d3";
import React from "react";
import {
  FilterOrder,
  useAllColumnSubFilters,
  useAllRowSubFilters,
  useAvailableColumnFilters,
  useAvailableRowFilters,
  useData,
} from "../../contexts/DataContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import {
  useFilterableFields,
  useGetFieldDisplayName,
} from "../../contexts/MetadataConfigContext";
import { usePlotControlsContext } from "./PlotControlsContext";
import { LeftAlignedButton } from "./style";

function useAvailableFilters() {
  const section = usePlotControlsContext();
  const rows = useAvailableRowFilters();
  const columns = useAvailableColumnFilters();
  return section === "Column" ? columns : rows;
}

function useAllSubFilters(key: string) {
  const section = usePlotControlsContext();
  const rows = useAllRowSubFilters(key);
  const columns = useAllColumnSubFilters(key);
  return section === "Column" ? columns : rows;
}

function useCurrentFilterValues(key: string) {
  const section = usePlotControlsContext();
  const allValues = useAllSubFilters(key);
  const currentValues = useData((s) =>
    section === "Column"
      ? s.columnFilters.find(f => f.key === key)?.values ?? []
      : s.rowFilters.find(f => f.key === key)?.values ?? []
  );
  const availableValues = allValues.filter(v => !currentValues.includes(v));
  return availableValues;
}

function AddFilter() {
  const section = usePlotControlsContext();

  const availableFilters = useAvailableFilters();
  const addFilter = useData((s) =>
    section === "Column" ? s.addColumnFilter : s.addRowFilter,
  );
  const disabled = availableFilters.length === 0;

  const onClick = useEventCallback(() => {
    if (availableFilters.length > 0) {
      addFilter(availableFilters[0]);
    }
  });
  return (
    <LeftAlignedButton
      variant="text"
      startIcon={<Add />}
      disabled={disabled}
      onClick={onClick}
    >
      Add Filter
    </LeftAlignedButton>
  );
}

function useResetFilters() {
  const section = usePlotControlsContext();
  const resetFilters = useData((s) =>
    section === "Column" ? s.clearColumnFilters : s.clearRowFilters,
  );
  const currentFilters = useData((s) =>
    section === "Column" ? s.columnFilters : s.rowFilters,
  );
  const disabled = currentFilters.length === 0;
  const onClick = useEventCallback(() => {
    resetFilters();
  });
  return { disabled, onClick };
}

export function FilterControls() {
  const section = usePlotControlsContext();
  const { filters, setFilters } = useData((s) => ({
    filters: section === "Column" ? s.columnFilters : s.rowFilters,
    setFilters: section === "Column" ? s.setColumnFilters : s.setRowFilters,
  }));

  const trackEvent = useTrackEvent();

  const allowedFilters = useFilterableFields(filters.map((filter) => filter.key));
  const filteredFilters = filters.filter((filter) => allowedFilters.includes(filter.key));

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
      const oldIndex = filters.findIndex((filter) => filter.key === active.id);
      const newIndex = filters.findIndex((filter) => filter.key === over.id);

      const newFilters = arrayMove(filters, oldIndex, newIndex);

      setFilters(newFilters);
      trackEvent("Update Filters", section, { newFilters });
    }
  });

  return (
    <Accordion
      id={`filter-options-${usePlotControlsContext()}`}
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
            alignItems: "center",
            gap: 1,
          },
        }}
      >
        <FilterAlt />
        <Typography variant="subtitle1">Filters</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Typography variant="body2">
          Filter columns by selecting which fields to show from the metadata fields.
        </Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filters.map((f) => f.key)}
            strategy={verticalListSortingStrategy}
          >
            <Stack>
              {filteredFilters.map((filter, i) => (
                <FilterItem key={filter.key} sort={filter} index={i} />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
        <Stack direction="column">
          <AddFilter />
          <LeftAlignedButton
            variant="text"
            startIcon={<Restore />}
            {...useResetFilters()}
          >
            Reset Filter
          </LeftAlignedButton>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

const useFilterItemActions = () => {
  const section = usePlotControlsContext();
  const editFilter = useData((s) =>
    section === "Column" ? s.editColumnFilter : s.editRowFilter,
  );
  const removeFilter = useData((s) =>
    section === "Column" ? s.removeColumnFilter : s.removeRowFilter,
  );
  const editSubFilters = useData((s) => 
    section === "Column" ? s.editColumnSubFilters : s.editRowSubFilters
  );
  return { editFilter, removeFilter, editSubFilters };
};

function FilterItem({ sort, index }: { sort: FilterOrder<string>; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: sort.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { editFilter, removeFilter, editSubFilters } = useFilterItemActions();

  const FilterText = "Filter By";

  const availableFilters = useAvailableFilters();
  const availableSubFilters = useAllSubFilters(sort.key);
  const currentFilterValues = useCurrentFilterValues(sort.key);

  const onSelectChange = useEventCallback((event: SelectChangeEvent) => {
    const key = event.target.value as string;
    editFilter(index, key);
  });

  const onSelectSubFilterChange = useEventCallback((event: SelectChangeEvent<(string | number | boolean)[]>) => {
    const selectedValues = Array.isArray(event.target.value)
      ? event.target.value
      : [event.target.value];

    const excludedValues = availableSubFilters.filter(v => !selectedValues.includes(v));
    editSubFilters(sort.key, excludedValues);
  });

  const remove = useEventCallback(() => {
    removeFilter(sort.key);
  });
  const getFieldDisplayName = useGetFieldDisplayName();

  return (
    <Stack key={sort.key} style={style} ref={setNodeRef}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Icon
          component={DragHandle}
          {...attributes}
          {...listeners}
          sx={{ cursor: "pointer", mr: 2 }}
          tabIndex={0}
        />
        <Typography variant="subtitle1" noWrap sx={{ flexShrink: 0 }}>
          {FilterText}
        </Typography>
        <Select
          value={sort.key}
          onChange={onSelectChange}
          fullWidth
        >
          {[sort.key, ...availableFilters].map((key) => (
            <MenuItem key={key} value={key}>
              {getFieldDisplayName(key)}
            </MenuItem>
          ))}
        </Select>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <Select<(string | number | boolean)[]>
            multiple
            value={currentFilterValues}
            onChange={onSelectSubFilterChange}
            renderValue={(selected) => selected.join(", ")}
          >
            {availableSubFilters.map((value) => (
              <MenuItem key={value.toString()} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          aria-label={`Remove ${sort.key}`}
          component={IconButton}
          onClick={remove}
          sx={{
            minWidth: 0,
            padding: 0.5,
            aspectRatio: "1/1",
          }}
        >
          <Close />
        </Button>
      </Stack>
    </Stack>
  );
}
