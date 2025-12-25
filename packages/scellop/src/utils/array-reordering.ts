export const moveToStart = <T extends string | number>(
  array: T[],
  value: T,
): T[] => {
  const index = array.indexOf(value);
  if (index === -1) {
    return array;
  }
  const newArray = [...array];
  newArray.splice(index, 1);
  newArray.unshift(value);
  return newArray;
};

export const moveToEnd = <T extends string | number>(
  array: T[],
  value: T,
): T[] => {
  const index = array.indexOf(value);
  if (index === -1) {
    return array;
  }
  const newArray = [...array];
  newArray.splice(index, 1);
  newArray.push(value);
  return newArray;
};
