import { describe, expect, it, vi } from "vitest";
import { BaseDataLoader } from "../DataLoader";
import type { DataLoaderParams, ScellopData } from "../index";

// Mock implementation for testing
interface TestParams extends DataLoaderParams {
  id: string;
  shouldFail?: boolean;
}

class TestDataLoader extends BaseDataLoader<TestParams> {
  async load(params: TestParams): Promise<ScellopData | undefined> {
    this.validateParams(params);

    if (params.shouldFail) {
      throw new Error("Simulated loading error");
    }

    return {
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
          row1: { id: params.id },
        },
      },
    };
  }
}

describe("DataLoader", () => {
  describe("BaseDataLoader", () => {
    it("should successfully load data with valid parameters", async () => {
      const loader = new TestDataLoader();
      const params: TestParams = { id: "test-123" };

      const result = await loader.load(params);

      expect(result).toBeDefined();
      expect(result?.rowNames).toEqual(["row1", "row2"]);
      expect(result?.colNames).toEqual(["col1", "col2"]);
      expect(result?.metadata.rows?.row1.id).toBe("test-123");
    });

    it("should validate parameters before loading", async () => {
      const loader = new TestDataLoader();

      // @ts-expect-error - Testing invalid params
      await expect(loader.load(null)).rejects.toThrow(
        "Invalid parameters: must be an object",
      );
    });

    it("should validate object parameters", async () => {
      const loader = new TestDataLoader();

      // @ts-expect-error - Testing invalid params
      await expect(loader.load("not an object")).rejects.toThrow(
        "Invalid parameters: must be an object",
      );
    });

    it("should handle loading errors", async () => {
      const loader = new TestDataLoader();
      const params: TestParams = { id: "test-123", shouldFail: true };

      await expect(loader.load(params)).rejects.toThrow(
        "Simulated loading error",
      );
    });

    it("should allow custom validation in subclasses", async () => {
      class CustomLoader extends BaseDataLoader<TestParams> {
        protected validateParams(params: TestParams): void {
          super.validateParams(params);
          if (!params.id || params.id.length === 0) {
            throw new Error("ID is required and must not be empty");
          }
        }

        async load(params: TestParams): Promise<ScellopData | undefined> {
          this.validateParams(params);
          return {
            rowNames: [],
            colNames: [],
            countsMatrix: [],
            countsMatrixOrder: ["row", "col", "value"],
            metadata: {},
          };
        }
      }

      const loader = new CustomLoader();

      await expect(loader.load({ id: "" })).rejects.toThrow(
        "ID is required and must not be empty",
      );
    });

    it("should handle error logging", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      class ErrorHandlingLoader extends BaseDataLoader<TestParams> {
        async load(_params: TestParams): Promise<ScellopData | undefined> {
          try {
            throw new Error("Test error");
          } catch (error) {
            this.handleError(error);
            return undefined;
          }
        }
      }

      const loader = new ErrorHandlingLoader();
      const result = await loader.load({ id: "test" });

      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Data loading error:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it("should allow custom error handling in subclasses", async () => {
      const customErrorHandler = vi.fn();

      class CustomErrorHandlingLoader extends BaseDataLoader<TestParams> {
        protected handleError(error: unknown): void {
          customErrorHandler(error);
        }

        async load(_params: TestParams): Promise<ScellopData | undefined> {
          try {
            throw new Error("Custom error");
          } catch (error) {
            this.handleError(error);
            return undefined;
          }
        }
      }

      const loader = new CustomErrorHandlingLoader();
      await loader.load({ id: "test" });

      expect(customErrorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should return undefined when loading fails gracefully", async () => {
      class GracefulFailureLoader extends BaseDataLoader<TestParams> {
        async load(_params: TestParams): Promise<ScellopData | undefined> {
          return undefined;
        }
      }

      const loader = new GracefulFailureLoader();
      const result = await loader.load({ id: "test" });

      expect(result).toBeUndefined();
    });
  });

  describe("DataLoader interface", () => {
    it("should support custom parameter types", async () => {
      interface CustomParams extends DataLoaderParams {
        apiKey: string;
        endpoint: string;
        options?: {
          timeout?: number;
          retries?: number;
        };
      }

      class CustomDataLoader extends BaseDataLoader<CustomParams> {
        async load(params: CustomParams): Promise<ScellopData | undefined> {
          this.validateParams(params);

          return {
            rowNames: ["row1"],
            colNames: ["col1"],
            countsMatrix: [["row1", "col1", 100]],
            countsMatrixOrder: ["row", "col", "value"],
            metadata: {
              rows: {
                row1: {
                  apiKey: params.apiKey,
                  endpoint: params.endpoint,
                },
              },
            },
          };
        }
      }

      const loader = new CustomDataLoader();
      const result = await loader.load({
        apiKey: "test-key",
        endpoint: "https://api.example.com",
        options: { timeout: 5000 },
      });

      expect(result).toBeDefined();
      expect(result?.metadata.rows?.row1.apiKey).toBe("test-key");
    });

    it("should support loaders with no required parameters", async () => {
      class SimpleLoader extends BaseDataLoader<DataLoaderParams> {
        async load(
          _params: DataLoaderParams,
        ): Promise<ScellopData | undefined> {
          return {
            rowNames: ["default"],
            colNames: ["default"],
            countsMatrix: [["default", "default", 1]],
            countsMatrixOrder: ["row", "col", "value"],
            metadata: {},
          };
        }
      }

      const loader = new SimpleLoader();
      const result = await loader.load({});

      expect(result).toBeDefined();
      expect(result?.rowNames).toEqual(["default"]);
    });
  });
});
