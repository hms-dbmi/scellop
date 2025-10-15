// General data structure
// To create the data structure necessary for the visualization,
// It either needs a countsMatrix object or a counts object
//      countsMatrix        [[row,col,value], [row,col,value]]
//      counts              {row: [{col: x, value: x}, {col: x, value: x}], row: [{col: x, value: x}, {col: x, value: x}]}
// Optionally, it can include
//      ordering            [rowNamesOrder = [], colNamesOrder = []]
//      metadata            [rows: [{row: x, metadata: {title: x, age: x}}, {{row: x, metadata: {title: x, age: x}}}, cols: []]
// Furthermore, it can include specifications for the visualization, such as dimensions and theme

import {
  CountsMatrixValue,
  DataOrdering,
  Metadata,
  ScellopData,
} from "../scellop-schema";

export function loadDataWithCounts(
  counts: Record<string, Record<string, number>>,
  metadata?: Metadata,
  ordering?: DataOrdering,
) {
  const countsMatrix = getCountsMatrixFromCounts(counts);
  const data = {
    countsMatrix,
    countsMatrixOrder: ["row", "col", "value"],
  } as ScellopData;
  loadDataWrapper(data, ordering);
  if (metadata) {
    data.metadata = metadata;
  }
  return data;
}

export function loadDataWithCountsMatrix(
  countsMatrix: CountsMatrixValue[],
  metadata?: Metadata,
  ordering?: DataOrdering,
) {
  const data = { countsMatrix: countsMatrix } as ScellopData;
  loadDataWrapper(data, ordering);
  if (metadata) {
    data.metadata = metadata;
  }
  return data;
}

// TODO: add order option here
function getCountsMatrixFromCounts(
  counts: Record<string, Record<string, number>>,
) {
  const countsArray = [];
  for (const row of Object.keys(counts)) {
    for (const [col, value] of Object.entries(counts[row])) {
      countsArray.push([row, col, value]);
    }
  }
  return countsArray;
}

/**
 * Given a data object with a countsMatrix,
 * add, wrap and sort rowNames and colNames,
 * and extend matrix
 * @param {*} data
 */
function loadDataWrapper(data: ScellopData, ordering?: DataOrdering) {
  getRowNames(data);
  getColNames(data);
  extendCountsMatrix(data);
  if (ordering) {
    if (ordering.rowNamesOrder) {
      sortRowNames(data, ordering.rowNamesOrder);
    }
    if (ordering.colNamesOrder) {
      sortColNames(data, ordering.colNamesOrder);
    }
  }
}

function getRowNames(data: ScellopData) {
  data.rowNames = [...new Set(data.countsMatrix.map((r) => r[0]))];
}

function getColNames(data: ScellopData) {
  data.colNames = [...new Set(data.countsMatrix.map((r) => r[1]))];
}

function extendCountsMatrix(data: ScellopData) {
  const nTotal = data.rowNames.length * data.colNames.length;
  if (data.countsMatrix.length === nTotal) {
    return;
  }
  for (const row of data.rowNames) {
    const countsMatrixRow = data.countsMatrix.filter((r) => r[0] === row);
    for (const col of data.colNames) {
      const countsMatrixRowCol = countsMatrixRow.filter((r) => r[1] === col);
      if (countsMatrixRowCol.length === 0) {
        data.countsMatrix.push([row, col, 0]);
      }
    }
  }
}

function sortNames(arr: string[], sortingArr: string[]) {
  arr.sort(function (a, b) {
    if (sortingArr.indexOf(a) === -1) {
      return 1;
    }
    if (sortingArr.indexOf(b) === -1) {
      return -1;
    }
    return sortingArr.indexOf(a) - sortingArr.indexOf(b);
  });
  return arr;
}

function sortRowNames(data: ScellopData, rowNamesOrder: string[]) {
  data.rowNames = sortNames(data.rowNames, rowNamesOrder);
}

function sortColNames(data: ScellopData, colNamesOrder: string[]) {
  data.colNames = sortNames(data.colNames, colNamesOrder);
}
