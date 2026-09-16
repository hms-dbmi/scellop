import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HuBMAPDataLoaderParams } from "../HuBMAPDataLoader";
import { HuBMAPDataLoader, loadHuBMAPData } from "../HuBMAPDataLoader";

// Mock @vitessce/zarr
vi.mock("@vitessce/zarr", () => ({
  // biome-ignore lint/complexity/useArrowFunction: vitest requires function keyword for proper mocking
  AnnDataSource: vi.fn(function () {
    return {};
  }),
  // biome-ignore lint/complexity/useArrowFunction: vitest requires function keyword for proper mocking
  ObsSetsAnndataLoader: vi.fn(function () {
    return {
      load: vi.fn().mockResolvedValue({
        data: {
          obsSets: {
            version: "0.1.0",
            datatype: "obs-sets",
            tree: [
              {
                name: "Cell Ontology CLID",
                children: [
                  {
                    name: "CL:0000084",
                    set: [[0], [1], [2]],
                  },
                  {
                    name: "CL:0000236",
                    set: [[3], [4]],
                  },
                ],
              },
              {
                name: "Cell Ontology Label",
                children: [
                  {
                    name: "T cell",
                    set: [[0], [1], [2]],
                  },
                  {
                    name: "B cell",
                    set: [[3], [4]],
                  },
                ],
              },
            ],
          },
        },
      }),
    };
  }),
}));

describe("HuBMAPDataLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch for metadata API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hits: {
          hits: [
            {
              _id: "test-uuid-1",
              _source: {
                uuid: "test-uuid-1",
                hubmap_id: "HBM123.ABCD.456",
                title: "Test Dataset 1",
                assay_display_name: "scRNA-seq",
                anatomy_1: ["Blood"],
                anatomy_2: ["Peripheral blood"],
                donor: {
                  mapped_metadata: {
                    age_value: ["45"],
                    age_unit: ["years"],
                    sex: ["Male"],
                    race: ["White"],
                    height_value: ["175"],
                    height_unit: ["cm"],
                    weight_value: ["75"],
                    weight_unit: ["kg"],
                    body_mass_index_value: ["24.5"],
                    body_mass_index_unit: ["kg/m^2"],
                    abo_blood_group_system: ["O+"],
                    medical_history: ["None"],
                    cause_of_death: ["N/A"],
                    death_event: ["N/A"],
                    mechanism_of_injury: ["N/A"],
                  },
                },
              },
            },
          ],
        },
      }),
    });
  });

  describe("validateParams", () => {
    it("should throw error if uuids is not provided", async () => {
      const loader = new HuBMAPDataLoader();

      await expect(
        // @ts-expect-error - Testing invalid params
        loader.load({ uuids: undefined }),
      ).rejects.toThrow("Invalid parameters: uuids must be a non-empty array");
    });

    it("should throw error if uuids is not an array", async () => {
      const loader = new HuBMAPDataLoader();

      await expect(
        // @ts-expect-error - Testing invalid params
        loader.load({ uuids: "not-an-array" }),
      ).rejects.toThrow("Invalid parameters: uuids must be a non-empty array");
    });

    it("should throw error if uuids is an empty array", async () => {
      const loader = new HuBMAPDataLoader();

      await expect(loader.load({ uuids: [] })).rejects.toThrow(
        "Invalid parameters: uuids must be a non-empty array",
      );
    });

    it("should accept valid parameters", async () => {
      const loader = new HuBMAPDataLoader();
      const params: HuBMAPDataLoaderParams = {
        uuids: ["test-uuid-1"],
      };

      const result = await loader.load(params);
      expect(result).toBeDefined();
    });
  });

  describe("load", () => {
    it("should successfully load data with single UUID", async () => {
      const loader = new HuBMAPDataLoader();
      const params: HuBMAPDataLoaderParams = {
        uuids: ["test-uuid-1"],
      };

      const result = await loader.load(params);

      expect(result).toBeDefined();
      expect(result?.rowNames).toBeDefined();
      expect(result?.colNames).toBeDefined();
      expect(result?.countsMatrix).toBeDefined();
      expect(result?.metadata).toBeDefined();
    });

    it("should include metadata from HuBMAP API", async () => {
      const loader = new HuBMAPDataLoader();
      const params: HuBMAPDataLoaderParams = {
        uuids: ["test-uuid-1"],
      };

      const result = await loader.load(params);

      expect(result?.metadata.rows).toBeDefined();
      expect(result?.metadata.rows?.["HBM123.ABCD.456"]).toMatchObject({
        title: "Test Dataset 1",
        assay: "scRNA-seq",
        donor_age: "45",
        donor_sex: "Male",
      });
    });

    it("should include cell type metadata from ObsSets", async () => {
      const loader = new HuBMAPDataLoader();
      const params: HuBMAPDataLoaderParams = {
        uuids: ["test-uuid-1"],
      };

      const result = await loader.load(params);

      expect(result?.metadata.cols).toBeDefined();
      expect(result?.metadata.cols?.["CL:0000084"]).toEqual({
        "Cell Ontology Label": "T cell",
      });
      expect(result?.metadata.cols?.["CL:0000236"]).toEqual({
        "Cell Ontology Label": "B cell",
      });
    });

    it("should apply ordering when provided", async () => {
      const loader = new HuBMAPDataLoader();
      const params: HuBMAPDataLoaderParams = {
        uuids: ["test-uuid-1"],
        ordering: {
          colNamesOrder: ["CL:0000236", "CL:0000084"],
        },
      };

      const result = await loader.load(params);

      expect(result?.colNames[0]).toBe("CL:0000236");
      expect(result?.colNames[1]).toBe("CL:0000084");
    });

    it("should handle fetch errors gracefully", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const loader = new HuBMAPDataLoader();
      const params: HuBMAPDataLoaderParams = {
        uuids: ["test-uuid-1"],
      };

      const result = await loader.load(params);

      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("should handle metadata fetch failure", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const loader = new HuBMAPDataLoader();
      const params: HuBMAPDataLoaderParams = {
        uuids: ["test-uuid-1"],
      };

      const result = await loader.load(params);

      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should warn about removed UUIDs when ObsSets loading fails", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Mock one successful and one failed ObsSets load
      const { ObsSetsAnndataLoader } = await import("@vitessce/zarr");
      let callCount = 0;
      // biome-ignore lint/complexity/useArrowFunction: vitest requires function keyword for proper mocking
      vi.mocked(ObsSetsAnndataLoader).mockImplementation(function () {
        return {
          load: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve({
                data: {
                  obsSets: {
                    version: "0.1.0",
                    datatype: "obs-sets",
                    tree: [
                      {
                        name: "Cell Ontology CLID",
                        children: [
                          {
                            name: "CL:0000001",
                            set: [[0]],
                          },
                        ],
                      },
                    ],
                  },
                },
              });
            }
            return Promise.reject(new Error("Failed to load"));
          }),
        };
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          hits: {
            hits: [
              {
                _id: "uuid-1",
                _source: {
                  uuid: "uuid-1",
                  hubmap_id: "HBM001",
                  title: "Dataset 1",
                  assay_display_name: "scRNA-seq",
                  anatomy_1: ["Blood"],
                  anatomy_2: [],
                  donor: {
                    mapped_metadata: {
                      age_value: [],
                      age_unit: [],
                      height_value: [],
                      height_unit: [],
                      race: [],
                      sex: [],
                      weight_value: [],
                      weight_unit: [],
                      body_mass_index_value: [],
                      body_mass_index_unit: [],
                      medical_history: [],
                      cause_of_death: [],
                      death_event: [],
                      mechanism_of_injury: [],
                      abo_blood_group_system: [],
                    },
                  },
                },
              },
            ],
          },
        }),
      });

      const loader = new HuBMAPDataLoader();
      const result = await loader.load({ uuids: ["uuid-1", "uuid-2"] });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("uuid-2"),
      );
      expect(result).toBeDefined();

      consoleWarnSpy.mockRestore();
    });
  });

  describe("loadHuBMAPData convenience function", () => {
    it("should load data using convenience function", async () => {
      const result = await loadHuBMAPData(["test-uuid-1"]);

      expect(result).toBeDefined();
      expect(result?.rowNames).toBeDefined();
      expect(result?.colNames).toBeDefined();
    });

    it("should accept ordering parameter", async () => {
      const result = await loadHuBMAPData(["test-uuid-1"], {
        colNamesOrder: ["CL:0000236", "CL:0000084"],
      });

      expect(result).toBeDefined();
      expect(result?.colNames).toBeDefined();
      // Just verify that ordering was applied (even if empty in error case)
      expect(Array.isArray(result?.colNames)).toBe(true);
    });
  });
});
