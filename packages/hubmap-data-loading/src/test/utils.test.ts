import { describe, expect, it } from "vitest";
import type { ObsSets } from "../types";
import { getCountsAndMetadataFromObsSetsList } from "../utils";

describe("utils", () => {
  describe("getCountsAndMetadataFromObsSetsList", () => {
    it("should extract counts from ObsSets data", () => {
      const obsSetsList: ObsSets[] = [
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000001",
                  set: [[0], [1], [2]],
                },
                {
                  name: "CL:0000002",
                  set: [[3], [4]],
                },
              ],
            },
          ],
        },
      ];
      const rowNames = ["dataset1"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      expect(result.counts).toEqual({
        dataset1: {
          "CL:0000001": 3,
          "CL:0000002": 2,
        },
      });
    });

    it("should extract metadata from ObsSets with labels", () => {
      const obsSetsList: ObsSets[] = [
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000084",
                  set: [
                    [0, 0],
                    [1, 0],
                    [2, 0],
                  ],
                },
                {
                  name: "CL:0000236",
                  set: [
                    [3, 0],
                    [4, 0],
                  ],
                },
              ],
            },
            {
              name: "Cell Ontology Label",
              children: [
                {
                  name: "T cell",
                  set: [
                    [0, 0],
                    [1, 0],
                    [2, 0],
                  ],
                },
                {
                  name: "B cell",
                  set: [
                    [3, 0],
                    [4, 0],
                  ],
                },
              ],
            },
          ],
        },
      ];
      const rowNames = ["dataset1"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      expect(result.metadata).toEqual({
        "CL:0000084": {
          "Cell Ontology Label": "T cell",
        },
        "CL:0000236": {
          "Cell Ontology Label": "B cell",
        },
      });
    });

    it("should handle multiple datasets", () => {
      const obsSetsList: ObsSets[] = [
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000001",
                  set: [
                    [0, 0],
                    [1, 0],
                  ],
                },
              ],
            },
          ],
        },
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000002",
                  set: [
                    [0, 0],
                    [1, 0],
                    [2, 0],
                  ],
                },
              ],
            },
          ],
        },
      ];
      const rowNames = ["dataset1", "dataset2"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      expect(result.counts).toEqual({
        dataset1: {
          "CL:0000001": 2,
        },
        dataset2: {
          "CL:0000002": 3,
        },
      });
    });

    it("should handle multiple metadata trees", () => {
      const obsSetsList: ObsSets[] = [
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000084",
                  set: [
                    [0, 0],
                    [1, 0],
                  ],
                },
              ],
            },
            {
              name: "Cell Ontology Label",
              children: [
                {
                  name: "T cell",
                  set: [
                    [0, 0],
                    [1, 0],
                  ],
                },
              ],
            },
            {
              name: "Marker",
              children: [
                {
                  name: "CD3+",
                  set: [
                    [0, 0],
                    [1, 0],
                  ],
                },
              ],
            },
          ],
        },
      ];
      const rowNames = ["dataset1"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      expect(result.metadata).toEqual({
        "CL:0000084": {
          "Cell Ontology Label": "T cell",
          Marker: "CD3+",
        },
      });
    });

    it("should handle empty ObsSets", () => {
      const obsSetsList: ObsSets[] = [
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [],
            },
          ],
        },
      ];
      const rowNames = ["dataset1"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      expect(result.counts).toEqual({
        dataset1: {},
      });
      expect(result.metadata).toEqual({});
    });

    it("should handle ObsSets with zero cells in a type", () => {
      const obsSetsList: ObsSets[] = [
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000001",
                  set: [],
                },
                {
                  name: "CL:0000002",
                  set: [[0, 0]],
                },
              ],
            },
          ],
        },
      ];
      const rowNames = ["dataset1"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      expect(result.counts).toEqual({
        dataset1: {
          "CL:0000001": 0,
          "CL:0000002": 1,
        },
      });
    });

    it("should only match metadata when cell sets are identical", () => {
      const obsSetsList: ObsSets[] = [
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000001",
                  set: [
                    [0, 0],
                    [1, 0],
                    [2, 0],
                  ],
                },
                {
                  name: "CL:0000002",
                  set: [
                    [3, 0],
                    [4, 0],
                  ],
                },
              ],
            },
            {
              name: "Label",
              children: [
                {
                  name: "Type A",
                  set: [
                    [0, 0],
                    [1, 0],
                    [2, 0],
                  ],
                },
                {
                  name: "Type B",
                  set: [
                    [3, 0],
                    [5, 0],
                  ], // Different cells - shouldn't match CL:0000002
                },
              ],
            },
          ],
        },
      ];
      const rowNames = ["dataset1"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      expect(result.metadata).toEqual({
        "CL:0000001": {
          Label: "Type A",
        },
        // CL:0000002 should not have a Label because the cell sets don't match
      });
    });

    it("should handle complex real-world data structure", () => {
      const obsSetsList: ObsSets[] = [
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000084",
                  set: [[0], [1], [2], [3]],
                },
                {
                  name: "CL:0000236",
                  set: [[4], [5]],
                },
                {
                  name: "CL:0000623",
                  set: [[6], [7], [8]],
                },
              ],
            },
            {
              name: "Cell Ontology Label",
              children: [
                {
                  name: "T cell",
                  set: [[0], [1], [2], [3]],
                },
                {
                  name: "B cell",
                  set: [[4], [5]],
                },
                {
                  name: "natural killer cell",
                  set: [[6], [7], [8]],
                },
              ],
            },
          ],
        },
      ];
      const rowNames = ["HBM123.ABCD.456"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      expect(result.counts["HBM123.ABCD.456"]).toEqual({
        "CL:0000084": 4,
        "CL:0000236": 2,
        "CL:0000623": 3,
      });

      expect(result.metadata).toEqual({
        "CL:0000084": { "Cell Ontology Label": "T cell" },
        "CL:0000236": { "Cell Ontology Label": "B cell" },
        "CL:0000623": { "Cell Ontology Label": "natural killer cell" },
      });
    });

    it("should handle equal lengths for rowNames and obsSetsList", () => {
      const obsSetsList: ObsSets[] = [
        {
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
        {
          version: "0.1.0",
          datatype: "obs-sets",
          tree: [
            {
              name: "Cell Ontology CLID",
              children: [
                {
                  name: "CL:0000002",
                  set: [[0], [1]],
                },
              ],
            },
          ],
        },
      ];
      const rowNames = ["dataset1", "dataset2"];

      const result = getCountsAndMetadataFromObsSetsList(obsSetsList, rowNames);

      // Should process both datasets
      expect(result.counts).toEqual({
        dataset1: {
          "CL:0000001": 1,
        },
        dataset2: {
          "CL:0000002": 2,
        },
      });
    });
  });
});
