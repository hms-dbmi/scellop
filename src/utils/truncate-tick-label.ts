export default function formatTickLabel(
  value: string | number | undefined,
  maxLength: number,
): string {
  const strValue = String(value);
  return strValue.length > maxLength
    ? `${strValue.substring(0, maxLength - 3)}...`
    : strValue;
}
