import { describe, expect, it } from "vitest";
import type {
  CountsMatrixValue,
  DataOrdering,
  Metadata,
  ScellopData,
  ScellopTheme,
} from "../scellop-schema";

describe("scellop-schema", () => {
  describe("ScellopData type", () => {
    it("should accept valid ScellopData structure", () => {
      const data: ScellopData = {
        rowNames: ["row1", "row2"],
        colNames: ["col1", "col2"],
        countsMatrix: [
          ["row1", "col1", 10],
          ["row1", "col2", 20],
          ["row2", "col1", 30],
          ["row2", "col2", 40],
        ],
        countsMatrixOrder: ["row", "col", "value"],
        metadata: {
          rows: {
            row1: { age: 25 },
          },
          cols: {
            col1: { type: "A" },
          },
        },
      };

      expect(data.rowNames).toHaveLength(2);
      expect(data.colNames).toHaveLength(2);
      expect(data.countsMatrix).toHaveLength(4);
    });

    it("should accept empty metadata", () => {
      const data: ScellopData = {
        rowNames: ["row1"],
        colNames: ["col1"],
        countsMatrix: [["row1", "col1", 10]],
        countsMatrixOrder: ["row", "col", "value"],
        metadata: {},
      };

      expect(data.metadata).toEqual({});
    });

    it("should accept metadata with only rows", () => {
      const data: ScellopData = {
        rowNames: ["row1"],
        colNames: ["col1"],
        countsMatrix: [["row1", "col1", 10]],
        countsMatrixOrder: ["row", "col", "value"],
        metadata: {
          rows: {
            row1: { info: "test" },
          },
        },
      };

      expect(data.metadata.rows).toBeDefined();
      expect(data.metadata.cols).toBeUndefined();
    });

    it("should accept metadata with only cols", () => {
      const data: ScellopData = {
        rowNames: ["row1"],
        colNames: ["col1"],
        countsMatrix: [["row1", "col1", 10]],
        countsMatrixOrder: ["row", "col", "value"],
        metadata: {
          cols: {
            col1: { info: "test" },
          },
        },
      };

      expect(data.metadata.cols).toBeDefined();
      expect(data.metadata.rows).toBeUndefined();
    });
  });

  describe("CountsMatrixValue type", () => {
    it("should accept valid tuple structure", () => {
      const value: CountsMatrixValue = ["row1", "col1", 42];

      expect(value[0]).toBe("row1");
      expect(value[1]).toBe("col1");
      expect(value[2]).toBe(42);
      expect(value).toHaveLength(3);
    });

    it("should accept zero values", () => {
      const value: CountsMatrixValue = ["row1", "col1", 0];

      expect(value[2]).toBe(0);
    });

    it("should accept decimal values", () => {
      const value: CountsMatrixValue = ["row1", "col1", Math.PI];

      expect(value[2]).toBe(Math.PI);
    });

    it("should accept negative values", () => {
      const value: CountsMatrixValue = ["row1", "col1", -10];

      expect(value[2]).toBe(-10);
    });
  });

  describe("Metadata type", () => {
    it("should accept string metadata values", () => {
      const metadata: Metadata = {
        rows: {
          row1: { name: "Sample A", tissue: "lung" },
        },
      };

      expect(metadata.rows?.row1.name).toBe("Sample A");
      expect(typeof metadata.rows?.row1.name).toBe("string");
    });

    it("should accept numeric metadata values", () => {
      const metadata: Metadata = {
        rows: {
          row1: { age: 25, count: 1000 },
        },
      };

      expect(metadata.rows?.row1.age).toBe(25);
      expect(typeof metadata.rows?.row1.age).toBe("number");
    });

    it("should accept mixed string and numeric values", () => {
      const metadata: Metadata = {
        rows: {
          row1: { name: "Sample A", age: 25, ratio: 0.75 },
        },
        cols: {
          col1: { type: "TypeA", frequency: 0.3 },
        },
      };

      expect(typeof metadata.rows?.row1.name).toBe("string");
      expect(typeof metadata.rows?.row1.age).toBe("number");
      expect(typeof metadata.cols?.col1.type).toBe("string");
      expect(typeof metadata.cols?.col1.frequency).toBe("number");
    });

    it("should support multiple metadata attributes per row/column", () => {
      const metadata: Metadata = {
        rows: {
          donor1: {
            age: 30,
            sex: "M",
            tissue: "lung",
            cellCount: 5000,
            quality: 0.95,
          },
        },
      };

      const donor1Meta = metadata.rows?.donor1;
      expect(Object.keys(donor1Meta || {})).toHaveLength(5);
      expect(donor1Meta?.age).toBe(30);
      expect(donor1Meta?.quality).toBe(0.95);
    });

    it("should support multiple rows and columns with metadata", () => {
      const metadata: Metadata = {
        rows: {
          row1: { value: 1 },
          row2: { value: 2 },
          row3: { value: 3 },
        },
        cols: {
          col1: { label: "A" },
          col2: { label: "B" },
        },
      };

      expect(Object.keys(metadata.rows || {})).toHaveLength(3);
      expect(Object.keys(metadata.cols || {})).toHaveLength(2);
    });
  });

  describe("DataOrdering type", () => {
    it("should accept rowNamesOrder only", () => {
      const ordering: DataOrdering = {
        rowNamesOrder: ["row3", "row1", "row2"],
      };

      expect(ordering.rowNamesOrder).toHaveLength(3);
      expect(ordering.colNamesOrder).toBeUndefined();
    });

    it("should accept colNamesOrder only", () => {
      const ordering: DataOrdering = {
        colNamesOrder: ["col2", "col1", "col3"],
      };

      expect(ordering.colNamesOrder).toHaveLength(3);
      expect(ordering.rowNamesOrder).toBeUndefined();
    });

    it("should accept both rowNamesOrder and colNamesOrder", () => {
      const ordering: DataOrdering = {
        rowNamesOrder: ["row2", "row1"],
        colNamesOrder: ["col3", "col2", "col1"],
      };

      expect(ordering.rowNamesOrder).toHaveLength(2);
      expect(ordering.colNamesOrder).toHaveLength(3);
    });

    it("should accept empty ordering object", () => {
      const ordering: DataOrdering = {};

      expect(ordering.rowNamesOrder).toBeUndefined();
      expect(ordering.colNamesOrder).toBeUndefined();
    });

    it("should accept empty arrays for ordering", () => {
      const ordering: DataOrdering = {
        rowNamesOrder: [],
        colNamesOrder: [],
      };

      expect(ordering.rowNamesOrder).toHaveLength(0);
      expect(ordering.colNamesOrder).toHaveLength(0);
    });
  });

  describe("ScellopTheme type", () => {
    it("should accept 'light' theme", () => {
      const theme: ScellopTheme = "light";

      expect(theme).toBe("light");
    });

    it("should accept 'dark' theme", () => {
      const theme: ScellopTheme = "dark";

      expect(theme).toBe("dark");
    });

    it("should only allow 'light' or 'dark' values", () => {
      const lightTheme: ScellopTheme = "light";
      const darkTheme: ScellopTheme = "dark";

      // These should compile without errors
      expect(["light", "dark"]).toContain(lightTheme);
      expect(["light", "dark"]).toContain(darkTheme);
    });
  });

  describe("Integration: Complete data structure", () => {
    it("should represent a complete, real-world dataset", () => {
      const data: ScellopData = {
        rowNames: ["donor1", "donor2", "donor3"],
        colNames: ["CD4+ T cells", "CD8+ T cells", "B cells", "NK cells"],
        countsMatrix: [
          ["donor1", "CD4+ T cells", 1200],
          ["donor1", "CD8+ T cells", 800],
          ["donor1", "B cells", 600],
          ["donor1", "NK cells", 400],
          ["donor2", "CD4+ T cells", 1500],
          ["donor2", "CD8+ T cells", 900],
          ["donor2", "B cells", 700],
          ["donor2", "NK cells", 500],
          ["donor3", "CD4+ T cells", 1100],
          ["donor3", "CD8+ T cells", 750],
          ["donor3", "B cells", 550],
          ["donor3", "NK cells", 350],
        ],
        countsMatrixOrder: ["row", "col", "value"],
        metadata: {
          rows: {
            donor1: { age: 25, sex: "M", tissue: "PBMC" },
            donor2: { age: 32, sex: "F", tissue: "PBMC" },
            donor3: { age: 45, sex: "M", tissue: "PBMC" },
          },
          cols: {
            "CD4+ T cells": { marker: "CD4", type: "T cell" },
            "CD8+ T cells": { marker: "CD8", type: "T cell" },
            "B cells": { marker: "CD19", type: "B cell" },
            "NK cells": { marker: "CD56", type: "NK cell" },
          },
        },
      };

      expect(data.rowNames).toHaveLength(3);
      expect(data.colNames).toHaveLength(4);
      expect(data.countsMatrix).toHaveLength(12); // 3 rows × 4 cols
      expect(data.metadata.rows?.donor1.age).toBe(25);
      expect(data.metadata.cols?.["CD4+ T cells"].marker).toBe("CD4");
    });
  });
});
