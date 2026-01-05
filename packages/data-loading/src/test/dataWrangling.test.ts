import { describe, expect, it } from "vitest";
import { loadDataWithCounts, loadDataWithCountsMatrix } from "../dataWrangling";
import type {
  CountsMatrixValue,
  DataOrdering,
  Metadata,
} from "../scellop-schema";

describe("dataWrangling", () => {
  describe("loadDataWithCounts", () => {
    it("should convert counts object to ScellopData with countsMatrix", () => {
      const counts = {
        row1: { col1: 10, col2: 20 },
        row2: { col1: 30, col2: 40 },
      };

      const result = loadDataWithCounts(counts);

      expect(result.rowNames).toEqual(["row1", "row2"]);
      expect(result.colNames).toEqual(["col1", "col2"]);
      expect(result.countsMatrix).toHaveLength(4);
      expect(result.countsMatrixOrder).toEqual(["row", "col", "value"]);
    });

    it("should include metadata when provided", () => {
      const counts = {
        row1: { col1: 10 },
      };
      const metadata: Metadata = {
        rows: {
          row1: { age: 25, name: "Sample A" },
        },
        cols: {
          col1: { type: "TypeA", count: 100 },
        },
      };

      const result = loadDataWithCounts(counts, metadata);

      expect(result.metadata).toEqual(metadata);
      expect(result.metadata.rows?.row1).toEqual({ age: 25, name: "Sample A" });
    });

    it("should apply row ordering when provided", () => {
      const counts = {
        row1: { col1: 10 },
        row2: { col1: 20 },
        row3: { col1: 30 },
      };
      const ordering: DataOrdering = {
        rowNamesOrder: ["row3", "row1", "row2"],
      };

      const result = loadDataWithCounts(counts, undefined, ordering);

      expect(result.rowNames).toEqual(["row3", "row1", "row2"]);
    });

    it("should apply column ordering when provided", () => {
      const counts = {
        row1: { col1: 10, col2: 20, col3: 30 },
      };
      const ordering: DataOrdering = {
        colNamesOrder: ["col2", "col3", "col1"],
      };

      const result = loadDataWithCounts(counts, undefined, ordering);

      expect(result.colNames).toEqual(["col2", "col3", "col1"]);
    });

    it("should apply both row and column ordering", () => {
      const counts = {
        row1: { col1: 10, col2: 20 },
        row2: { col1: 30, col2: 40 },
      };
      const ordering: DataOrdering = {
        rowNamesOrder: ["row2", "row1"],
        colNamesOrder: ["col2", "col1"],
      };

      const result = loadDataWithCounts(counts, undefined, ordering);

      expect(result.rowNames).toEqual(["row2", "row1"]);
      expect(result.colNames).toEqual(["col2", "col1"]);
    });

    it("should handle sparse data by extending countsMatrix with zeros", () => {
      const counts = {
        row1: { col1: 10 },
        row2: { col2: 20 },
      };

      const result = loadDataWithCounts(counts);

      // Should have 4 entries: all combinations of row1/row2 x col1/col2
      expect(result.countsMatrix).toHaveLength(4);

      // Find the zero-filled entries
      const row1col2 = result.countsMatrix.find(
        ([row, col]) => row === "row1" && col === "col2",
      );
      const row2col1 = result.countsMatrix.find(
        ([row, col]) => row === "row2" && col === "col1",
      );

      expect(row1col2).toEqual(["row1", "col2", 0]);
      expect(row2col1).toEqual(["row2", "col1", 0]);
    });

    it("should handle empty counts object", () => {
      const counts = {};

      const result = loadDataWithCounts(counts);

      expect(result.rowNames).toEqual([]);
      expect(result.colNames).toEqual([]);
      expect(result.countsMatrix).toEqual([]);
    });

    it("should handle single row, single column", () => {
      const counts = {
        row1: { col1: 42 },
      };

      const result = loadDataWithCounts(counts);

      expect(result.rowNames).toEqual(["row1"]);
      expect(result.colNames).toEqual(["col1"]);
      expect(result.countsMatrix).toEqual([["row1", "col1", 42]]);
    });

    it("should preserve ordering with missing items in ordering array", () => {
      const counts = {
        row1: { col1: 10 },
        row2: { col1: 20 },
        row3: { col1: 30 },
      };
      const ordering: DataOrdering = {
        rowNamesOrder: ["row3", "row1"], // row2 not in ordering
      };

      const result = loadDataWithCounts(counts, undefined, ordering);

      // Items in ordering come first, then missing items
      expect(result.rowNames[0]).toBe("row3");
      expect(result.rowNames[1]).toBe("row1");
      expect(result.rowNames[2]).toBe("row2");
    });
  });

  describe("loadDataWithCountsMatrix", () => {
    it("should create ScellopData from countsMatrix", () => {
      const countsMatrix: CountsMatrixValue[] = [
        ["row1", "col1", 10],
        ["row1", "col2", 20],
        ["row2", "col1", 30],
        ["row2", "col2", 40],
      ];

      const result = loadDataWithCountsMatrix(countsMatrix);

      expect(result.rowNames).toEqual(["row1", "row2"]);
      expect(result.colNames).toEqual(["col1", "col2"]);
      expect(result.countsMatrix).toHaveLength(4);
    });

    it("should extract unique row and column names", () => {
      const countsMatrix: CountsMatrixValue[] = [
        ["row1", "col1", 10],
        ["row1", "col1", 15], // Duplicate - should be in countsMatrix but rowNames/colNames unique
        ["row2", "col1", 20],
      ];

      const result = loadDataWithCountsMatrix(countsMatrix);

      expect(result.rowNames).toEqual(["row1", "row2"]);
      expect(result.colNames).toEqual(["col1"]);
    });

    it("should extend countsMatrix with zeros for missing combinations", () => {
      const countsMatrix: CountsMatrixValue[] = [
        ["row1", "col1", 10],
        ["row2", "col2", 20],
      ];

      const result = loadDataWithCountsMatrix(countsMatrix);

      // Should have 4 entries after extension
      expect(result.countsMatrix.length).toBeGreaterThanOrEqual(4);

      const hasRow1Col2 = result.countsMatrix.some(
        ([row, col]) => row === "row1" && col === "col2",
      );
      const hasRow2Col1 = result.countsMatrix.some(
        ([row, col]) => row === "row2" && col === "col1",
      );

      expect(hasRow1Col2).toBe(true);
      expect(hasRow2Col1).toBe(true);
    });

    it("should include metadata when provided", () => {
      const countsMatrix: CountsMatrixValue[] = [["row1", "col1", 10]];
      const metadata: Metadata = {
        rows: {
          row1: { info: "test" },
        },
      };

      const result = loadDataWithCountsMatrix(countsMatrix, metadata);

      expect(result.metadata).toEqual(metadata);
    });

    it("should apply ordering when provided", () => {
      const countsMatrix: CountsMatrixValue[] = [
        ["row1", "col1", 10],
        ["row2", "col1", 20],
        ["row3", "col1", 30],
      ];
      const ordering: DataOrdering = {
        rowNamesOrder: ["row2", "row3", "row1"],
      };

      const result = loadDataWithCountsMatrix(
        countsMatrix,
        undefined,
        ordering,
      );

      expect(result.rowNames).toEqual(["row2", "row3", "row1"]);
    });

    it("should handle empty countsMatrix", () => {
      const countsMatrix: CountsMatrixValue[] = [];

      const result = loadDataWithCountsMatrix(countsMatrix);

      expect(result.rowNames).toEqual([]);
      expect(result.colNames).toEqual([]);
      expect(result.countsMatrix).toEqual([]);
    });

    it("should not duplicate entries when matrix is complete", () => {
      const countsMatrix: CountsMatrixValue[] = [
        ["row1", "col1", 10],
        ["row1", "col2", 20],
        ["row2", "col1", 30],
        ["row2", "col2", 40],
      ];

      const result = loadDataWithCountsMatrix(countsMatrix);

      // Should remain 4 entries - no extension needed
      expect(result.countsMatrix).toHaveLength(4);
    });
  });

  describe("integration tests", () => {
    it("should produce equivalent results from counts and countsMatrix", () => {
      const counts = {
        row1: { col1: 10, col2: 20 },
        row2: { col1: 30, col2: 40 },
      };

      const countsMatrix: CountsMatrixValue[] = [
        ["row1", "col1", 10],
        ["row1", "col2", 20],
        ["row2", "col1", 30],
        ["row2", "col2", 40],
      ];

      const resultFromCounts = loadDataWithCounts(counts);
      const resultFromMatrix = loadDataWithCountsMatrix(countsMatrix);

      expect(resultFromCounts.rowNames).toEqual(resultFromMatrix.rowNames);
      expect(resultFromCounts.colNames).toEqual(resultFromMatrix.colNames);
      expect(resultFromCounts.countsMatrix).toHaveLength(
        resultFromMatrix.countsMatrix.length,
      );
    });

    it("should handle complex metadata structure", () => {
      const counts = {
        donor1: { cellTypeA: 100, cellTypeB: 200 },
        donor2: { cellTypeA: 150, cellTypeB: 250 },
      };

      const metadata: Metadata = {
        rows: {
          donor1: { age: 25, sex: "M", tissue: "lung" },
          donor2: { age: 30, sex: "F", tissue: "kidney" },
        },
        cols: {
          cellTypeA: { marker: "CD4", frequency: 0.3 },
          cellTypeB: { marker: "CD8", frequency: 0.7 },
        },
      };

      const result = loadDataWithCounts(counts, metadata);

      expect(result.metadata.rows?.donor1).toEqual({
        age: 25,
        sex: "M",
        tissue: "lung",
      });
      expect(result.metadata.cols?.cellTypeA).toEqual({
        marker: "CD4",
        frequency: 0.3,
      });
    });

    it("should handle numeric values in metadata", () => {
      const counts = { row1: { col1: 10 } };
      const metadata: Metadata = {
        rows: {
          row1: { count: 42, ratio: 0.75 },
        },
      };

      const result = loadDataWithCounts(counts, metadata);

      expect(typeof result.metadata.rows?.row1.count).toBe("number");
      expect(result.metadata.rows?.row1.count).toBe(42);
    });
  });
});
