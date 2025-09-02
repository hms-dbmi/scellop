import {
  Add,
  Close,
  ExpandMoreRounded,
  FilterAlt,
  Restore,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  useEventCallback,
} from "@mui/material";
import React, { useState } from "react";
import {
  Filter,
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
      ? (s.columnFilters.find((f) => f.key === key)?.values ?? [])
      : (s.rowFilters.find((f) => f.key === key)?.values ?? []),
  );
  const availableValues = allValues.filter((v) => !currentValues.includes(v));
  return availableValues;
}

function AddFilter() {
  const section = usePlotControlsContext();

  const availableFilters = useAvailableFilters();
  const addFilter = useData((s) =>
    section === "Column" ? s.addColumnFilter : s.addRowFilter,
  );
  const disabled = availableFilters.length === 0;

  const trackEvent = useTrackEvent();

  const onClick = useEventCallback(() => {
    if (availableFilters.length > 0) {
      addFilter(availableFilters[0]);
      trackEvent(`Filter ${section}s`, `Added ${availableFilters[0]}`);
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

  const trackEvent = useTrackEvent();

  const onClick = useEventCallback(() => {
    resetFilters();
    trackEvent("Reset Filters", "");
  });
  return { disabled, onClick };
}

export function FilterControls() {
  const section = usePlotControlsContext();
  const filters = useData((s) =>
    section === "Column" ? s.columnFilters : s.rowFilters,
  );

  const allowedFilters = useFilterableFields(
    filters.map((filter) => filter.key),
  );
  const filteredFilters = filters.filter((filter) =>
    allowedFilters.includes(filter.key),
  );

  return (
    <Accordion
      id={`filter-options-${section}`}
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
          Filter columns by selecting which fields to show from the metadata
          fields.
        </Typography>
        <Stack spacing={1} sx={{ pl: 4 }}>
          {filteredFilters.map((filter, i) => (
            <FilterItem key={filter.key} filter={filter} index={i} />
          ))}
        </Stack>
        <Stack direction="column">
          <AddFilter />
          <LeftAlignedButton
            variant="text"
            startIcon={<Restore />}
            {...useResetFilters()}
          >
            Reset Filters
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
    section === "Column" ? s.editColumnSubFilters : s.editRowSubFilters,
  );
  return { editFilter, removeFilter, editSubFilters };
};

function FilterItem({
  filter,
  index,
}: {
  filter: Filter<string>;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const { editFilter, removeFilter, editSubFilters } = useFilterItemActions();

  const availableFilters = useAvailableFilters();
  const allSubFilters = useAllSubFilters(filter.key);
  const currentFilterValues = useCurrentFilterValues(filter.key);

  const onSelectChange = useEventCallback((event: SelectChangeEvent) => {
    const key = event.target.value as string;
    editFilter(index, key);
  });

  const onSelectSubFilterChange = useEventCallback(
    (event: SelectChangeEvent<(string | number | boolean)[]>) => {
      const selectedValues = Array.isArray(event.target.value)
        ? event.target.value
        : [event.target.value];

      if (selectedValues.includes("selectAll")) {
        editSubFilters(filter.key, []);
        setOpen(false);
      } else if (selectedValues.includes("deselectAll")) {
        editSubFilters(filter.key, allSubFilters);
        setOpen(false);
      } else {
        const excludedValues = allSubFilters.filter(
          (v) => !selectedValues.includes(v),
        );
        editSubFilters(filter.key, excludedValues);
      }
    },
  );

  const remove = useEventCallback(() => {
    removeFilter(filter.key);
  });

  const getFieldDisplayName = useGetFieldDisplayName();

  return (
    <Stack key={filter.key} spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle1" noWrap sx={{ flexShrink: 0 }}>
          Filter By
        </Typography>
        <Select value={filter.key} onChange={onSelectChange} fullWidth>
          {[filter.key, ...availableFilters].map((key) => (
            <MenuItem key={key} value={key}>
              {getFieldDisplayName(key)}
            </MenuItem>
          ))}
        </Select>
        <Button
          aria-label={`Remove ${filter.key}`}
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
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ pl: 2, pr: 6 }}
      >
        <Typography variant="body2" noWrap sx={{ flexShrink: 0 }}>
          {"Values"}
        </Typography>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <Select<(string | number | boolean)[]>
            multiple
            open={open}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            value={currentFilterValues}
            onChange={onSelectSubFilterChange}
            renderValue={(selected) => selected.join(", ")}
          >
            <MenuItem key="selectAll" value="selectAll">
              Select All
            </MenuItem>
            <MenuItem key="deselectAll" value="deselectAll">
              Deselect All
            </MenuItem>
            <Divider />
            {allSubFilters.map((value) => (
              <MenuItem key={value.toString()} value={String(value)}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}
