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
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  Close,
  DragHandle,
  ExpandMoreRounded,
  Restore,
  Sort,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  Icon,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  useEventCallback,
} from "@mui/material";
import React from "react";
import {
  SortOrder,
  useAvailableColumnSorts,
  useAvailableRowSorts,
  useData,
} from "../../contexts/DataContext";
import { useTrackEvent } from "../../contexts/EventTrackerProvider";
import {
  useGetFieldDisplayName,
  useSortableFields,
} from "../../contexts/MetadataConfigContext";
import { usePlotControlsContext } from "./PlotControlsContext";
import { LeftAlignedButton } from "./style";

function useAvailableSorts() {
  const section = usePlotControlsContext();
  const columns = useAvailableColumnSorts();
  const rows = useAvailableRowSorts();
  return section === "Column" ? columns : rows;
}

function AddSort() {
  const section = usePlotControlsContext();

  const availableSorts = useAvailableSorts();
  const addSort = useData((s) =>
    section === "Column" ? s.addColumnSortOrder : s.addRowSortOrder,
  );
  const sortIsInvalidated = useSortIsInvalidated();
  const disabled = availableSorts.length === 0;
  const onClick = useEventCallback(() => {
    if (availableSorts.length > 0) {
      addSort({ key: availableSorts[0], direction: "asc" });
    }
  });
  if (sortIsInvalidated) {
    return null;
  }
  return (
    <LeftAlignedButton
      variant="text"
      startIcon={<Add />}
      disabled={disabled}
      onClick={onClick}
    >
      Add Sort
    </LeftAlignedButton>
  );
}

function useResetSorts() {
  const section = usePlotControlsContext();
  const resetSorts = useData((s) =>
    section === "Column" ? s.clearColumnSortOrder : s.clearRowSortOrder,
  );
  const currentSorts = useData((s) =>
    section === "Column" ? s.columnSortOrder : s.rowSortOrder,
  );
  const disabled = currentSorts.length === 0;
  const onClick = useEventCallback(() => {
    resetSorts();
  });
  return { disabled, onClick };
}

function useSortIsInvalidated() {
  const section = usePlotControlsContext();
  return useData((s) =>
    section === "Column" ? s.columnSortInvalidated : s.rowSortInvalidated,
  );
}

function useRevalidateSort() {
  const section = usePlotControlsContext();
  const revalidateSort = useData((s) =>
    section === "Column" ? s.revalidateColumnSort : s.revalidateRowSort,
  );
  const trackEvent = useTrackEvent();
  return useEventCallback(() => {
    revalidateSort();
    trackEvent(`Revalidate ${section} Sort`, "");
  });
}

function InvalidationAlert() {
  const sortIsInvalidated = useSortIsInvalidated();
  const revalidateSort = useRevalidateSort();
  if (!sortIsInvalidated) return null;
  return (
    <Alert
      severity="info"
      variant="outlined"
      sx={{ alignItems: "center", mb: 2 }}
      action={
        <Button color="inherit" size="small" onClick={revalidateSort}>
          Restore Sorts
        </Button>
      }
    >
      The data order has been manually changed and the sort order is no longer
      valid. Sorting is currently disabled.
    </Alert>
  );
}

export function SortControls() {
  const section = usePlotControlsContext();
  const { sorts, setSorts } = useData((s) => ({
    sorts: section === "Column" ? s.columnSortOrder : s.rowSortOrder,
    setSorts: section === "Column" ? s.setColumnSortOrder : s.setRowSortOrder,
  }));

  const trackEvent = useTrackEvent();

  const allowedSorts = useSortableFields(sorts.map((sort) => sort.key));
  const filteredSorts = sorts.filter((sort) => allowedSorts.includes(sort.key));

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
      const oldIndex = sorts.findIndex((sort) => sort.key === active.id);
      const newIndex = sorts.findIndex((sort) => sort.key === over.id);

      const newSorts = arrayMove(sorts, oldIndex, newIndex);

      setSorts(newSorts);
      trackEvent("Update Sort Order", section, { newSorts });
    }
  });

  const sortIsInvalidated = useSortIsInvalidated();

  return (
    <Accordion
      id={`sort-options-${usePlotControlsContext()}`}
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
        <Sort />
        <Typography variant="subtitle1">Sorts</Typography>
      </AccordionSummary>

      <AccordionDetails>
        {sortIsInvalidated ? (
          <InvalidationAlert />
        ) : (
          <Typography variant="body2">
            Customize how columns are sorted by selecting the primary sorting
            field. Drag and reorder sorting fields to adjust their priority.
          </Typography>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sorts.map((s) => s.key)}
            strategy={verticalListSortingStrategy}
          >
            <Stack>
              {filteredSorts.map((sort, i) => (
                <SortItem key={sort.key} sort={sort} index={i} />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
        <Stack direction="column">
          <AddSort />
          <LeftAlignedButton
            variant="text"
            startIcon={<Restore />}
            {...useResetSorts()}
          >
            Reset Sort
          </LeftAlignedButton>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

const useSortItemActions = () => {
  const section = usePlotControlsContext();
  const editSort = useData((s) =>
    section === "Column" ? s.editColumnSortOrder : s.editRowSortOrder,
  );
  const removeSort = useData((s) =>
    section === "Column" ? s.removeColumnSortOrder : s.removeRowSortOrder,
  );
  return { editSort, removeSort };
};

function SortItem({ sort, index }: { sort: SortOrder<string>; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: sort.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { editSort, removeSort } = useSortItemActions();

  const sortText = index === 0 ? "Sort By" : "Then By";

  const availableSorts = useAvailableSorts();

  const onRadioChange = useEventCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
      const direction = value as "asc" | "desc";
      editSort(index, { ...sort, direction });
    },
  );

  const sortIsInvalidated = useSortIsInvalidated();

  const onSelectChange = useEventCallback((event: SelectChangeEvent) => {
    const key = event.target.value as string;
    editSort(index, { ...sort, key });
  });

  const remove = useEventCallback(() => {
    removeSort(sort.key);
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
          {sortText}
        </Typography>
        <Select
          value={sort.key}
          onChange={onSelectChange}
          fullWidth
          disabled={sortIsInvalidated}
        >
          {[sort.key, ...availableSorts].map((key) => (
            <MenuItem key={key} value={key}>
              {getFieldDisplayName(key)}
            </MenuItem>
          ))}
        </Select>
        <Button
          aria-label={`Remove ${sort.key}`}
          component={IconButton}
          onClick={remove}
          disabled={sortIsInvalidated}
          sx={{
            minWidth: 0,
            padding: 0.5,
            aspectRatio: "1/1",
          }}
        >
          <Close />
        </Button>
      </Stack>
      <FormControl disabled={sortIsInvalidated}>
        <RadioGroup onChange={onRadioChange} value={sort.direction}>
          <FormControlLabel
            value="asc"
            control={<Radio />}
            label={
              <Stack alignItems="center" direction="row" spacing={1}>
                <ArrowUpwardRounded />
                <Typography variant="body2">Ascending</Typography>
              </Stack>
            }
          />
          <FormControlLabel
            value="desc"
            control={<Radio />}
            label={
              <Stack alignItems="center" direction="row" spacing={1}>
                <ArrowDownwardRounded />
                <Typography variant="body2">Descending</Typography>
              </Stack>
            }
          />
        </RadioGroup>
      </FormControl>
    </Stack>
  );
}
