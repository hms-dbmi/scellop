/** DATA */
/**
 * ScellopData represents the data structure used in the scellop visualization.
 * It includes row and column names, a counts matrix, and metadata.
 */
export type ScellopData = {
  /**
   * The names of the rows in the counts matrix.
   */
  rowNames: string[];
  /**
   * The names of the columns in the counts matrix.
   */
  colNames: string[];
  /**
   * The order of the items in each CountsMatrixValue entry
   */
  countsMatrixOrder: string[];
  /**
   * The counts matrix, which is an array of tuples.
   * Each tuple contains a row name, a column name, and a count value.
   */
  countsMatrix: CountsMatrixValue[];
  /**
   * Metadata associated with the rows and columns.
   * It can include additional information about each row and column.
   */
  metadata: Metadata;
};

/**
 * CountsMatrixValue represents a single entry in the counts matrix,
 * as used within the ScellopData structure.
 */
export type CountsMatrixValue = [string, string, number];

/**
 * MetaData represents additional information associated with the rows and columns
 * in the ScellopData structure.
 * It can include various attributes for each row and column.
 * The attributes are keyed by row or column names,
 * and the values can be strings or numbers.
 * @example
 * {
 *  rows: {
 *    "row1": { "attribute1": "value1", "attribute2": 42 },
 *  }
 *  cols: {
 *    "col1": { "attribute1": "value1", "attribute2": 42 },
 *  }
 * }
 */
export type Metadata = {
  rows?: Record<string, Record<string, string | number | undefined>>;
  cols?: Record<string, Record<string, string | number | undefined>>;
};

export type DataOrdering = {
  rowNamesOrder?: string[];
  colNamesOrder?: string[];
};

export type ScellopTheme = "light" | "dark";
