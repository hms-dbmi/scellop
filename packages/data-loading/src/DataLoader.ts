import { ScellopData } from "./scellop-schema";

/**
 * Generic parameters for data loaders.
 * Implementations can extend this to add loader-specific parameters.
 */
export interface DataLoaderParams {
  [key: string]: unknown;
}

/**
 * Generic data loader interface for Scellop.
 * Implementations should handle specific data sources (e.g., HuBMAP, local files, APIs).
 *
 * @template TParams - Type of parameters accepted by the loader
 *
 * @example
 * ```typescript
 * interface HuBMAPParams extends DataLoaderParams {
 *   uuids: string[];
 *   ordering?: DataOrdering;
 * }
 *
 * class HuBMAPDataLoader implements DataLoader<HuBMAPParams> {
 *   async load(params: HuBMAPParams): Promise<ScellopData | undefined> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface DataLoader<
  TParams extends DataLoaderParams = DataLoaderParams,
> {
  /**
   * Load data based on the provided parameters.
   *
   * @param params - Parameters specific to this loader implementation
   * @returns Promise resolving to ScellopData or undefined if loading fails
   */
  load(params: TParams): Promise<ScellopData | undefined>;
}

/**
 * Abstract base class for data loaders providing common functionality.
 * Extend this class to create custom data loaders.
 *
 * @template TParams - Type of parameters accepted by the loader
 */
export abstract class BaseDataLoader<
  TParams extends DataLoaderParams = DataLoaderParams,
> implements DataLoader<TParams>
{
  /**
   * Load data based on the provided parameters.
   * Must be implemented by subclasses.
   */
  abstract load(params: TParams): Promise<ScellopData | undefined>;

  /**
   * Validate parameters before loading.
   * Override this method to add custom validation logic.
   *
   * @param params - Parameters to validate
   * @throws Error if validation fails
   */
  protected validateParams(params: TParams): void {
    if (!params || typeof params !== "object") {
      throw new Error("Invalid parameters: must be an object");
    }
  }

  /**
   * Handle errors during data loading.
   * Override this method to customize error handling.
   *
   * @param error - Error that occurred during loading
   */
  protected handleError(error: unknown): void {
    console.error("Data loading error:", error);
  }
}
