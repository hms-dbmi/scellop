import { createStore } from "zustand";
import { createStoreContext } from "../utils/zustand";

interface MetadataConfigContextProps {
  fieldDisplayNames?: Record<string, string>;
  sortableFields?: string[];
  filterableFields?: string[];
  tooltipFields?: string[];
}

interface MetadataConfigContextActions {
  getFieldDisplayName: (field: string) => string;
  getSortableFields: (fields: string[]) => string[];
  getFilterableFields: (fields: string[]) => string[];
  getTooltipFields: (fields: string[]) => string[];
}

interface MetadataConfigContext
  extends MetadataConfigContextProps,
    MetadataConfigContextActions {}

const capitalizeAndReplaceUnderscores = (str: string) => {
  return str
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
};

const createMetadataConfigStore = ({
  fieldDisplayNames,
  sortableFields,
  filterableFields,
  tooltipFields,
}: MetadataConfigContextProps) => {
  return createStore<MetadataConfigContext>()(() => ({
    fieldDisplayNames,
    sortableFields,
    tooltipFields,
    getFieldDisplayName: (field: string) =>
      fieldDisplayNames?.[field] ?? capitalizeAndReplaceUnderscores(field),
    getSortableFields: (fields: string[]) =>
      sortableFields
        ? fields.filter((field) => sortableFields.includes(field))
        : fields,
    getFilterableFields: (fields: string[]) =>
      filterableFields
        ? fields.filter((field) => filterableFields.includes(field))
        : fields,
    getTooltipFields: (fields: string[]) =>
      tooltipFields
        ? fields.filter((field) => tooltipFields.includes(field))
        : fields,
  }));
};

export const [MetadataConfigProvider, useMetadataConfig] = createStoreContext<
  MetadataConfigContext,
  MetadataConfigContextProps
>(createMetadataConfigStore, "FractionContext");

export const useFieldDisplayName = (field: string) =>
  useMetadataConfig().getFieldDisplayName(field);
export const useGetFieldDisplayName = () =>
  useMetadataConfig().getFieldDisplayName;
export const useSortableFields = (fields: string[]) =>
  useMetadataConfig().getSortableFields(fields);
export const useFilterableFields = (fields: string[]) =>
  useMetadataConfig().getFilterableFields(fields);
export const useTooltipFields = (fields: string[]) =>
  useMetadataConfig().getTooltipFields(fields);
