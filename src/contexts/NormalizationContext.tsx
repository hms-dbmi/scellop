import { temporal } from "zundo";
import { createStore } from "zustand";
import { Normalization } from "../utils/normalizations";
import { createTemporalStoreContext } from "../utils/zustand";

interface NormalizationProps {
  initialNormalization?: Normalization;
}

interface NormalizationStore {
  normalization: Normalization;
  normalizeByRow: () => void;
  normalizeByColumn: () => void;
  normalizeByLog: () => void;
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
      normalizeByLog: () => set({ normalization: "Log" }),
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

export const useIsNormalizedByRowOrColumn = () => {
  const normalization = useNormalization((state) => state.normalization);
  return normalization !== "None" && normalization !== "Log";
};

export const useIsLogTransformed = () => {
  const normalization = useNormalization((state) => state.normalization);
  return normalization === "Log";
};
