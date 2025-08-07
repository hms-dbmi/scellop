import { temporal } from "zundo";
import { createStore } from "zustand";
import { createTemporalStoreContext } from "../utils/zustand";

interface NormalizationProps {
  initialNormalization?: Normalization;
}

export const NORMALIZATIONS = ["None", "Row", "Column"] as const;
export type Normalization = (typeof NORMALIZATIONS)[number];

export const NORMALIZATION_DESCRIPTIONS: Record<Normalization, string> = {
  None: "No normalization applied.",
  Row: "Display each cell's counts as a percentage of the total counts in the row.",
  Column:
    "Display each cell's counts as a percentage of the total counts in the column.",
};

interface NormalizationStore {
  normalization: Normalization;
  normalizeByRow: () => void;
  normalizeByColumn: () => void;
  removeNormalization: () => void;
  setNormalization: (normalization: Normalization) => void;
}

const createNormalizationStore = ({
  initialNormalization = "None",
}: NormalizationProps) => {
  return createStore<NormalizationStore>()(
    temporal((set) => ({
      normalization: initialNormalization,
      normalizeByRow: () => set({ normalization: "Row" }),
      normalizeByColumn: () => set({ normalization: "Column" }),
      removeNormalization: () => set({ normalization: "None" }),
      setNormalization: (normalization: Normalization) =>
        set({ normalization }),
    })),
  );
};

export const [
  NormalizationProvider,
  useNormalization,
  ,
  useNormalizationHistory,
] = createTemporalStoreContext<NormalizationStore, NormalizationProps>(
  createNormalizationStore,
  "NormalizationStore",
);

export const useIsNormalized = () => {
  const normalization = useNormalization((state) => state.normalization);
  return normalization !== "None";
};
