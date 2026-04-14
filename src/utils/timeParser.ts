export function parseYearToNumeric(yearStr: string): number {
  if (!yearStr) return 0;
  const cleanStr = yearStr.toLowerCase().replace(/c\.|circa|~|,|\s/g, '');
  const match = cleanStr.match(/(\d+)(bce|bc|ce|ad)?/);
  if (!match) return 0;
  let year = parseInt(match[1], 10);
  const era = match[2];
  if (era === 'bce' || era === 'bc') year = -year;
  return year;
}
export function parsePeriodToRange(periodStr: string): [number, number] {
  if (!periodStr || periodStr === 'Various') return [0, 0];
  const parts = periodStr.split(/–|-|to/i);
  if (parts.length === 1) {
    const val = parseYearToNumeric(parts[0]);
    return [val, val];
  }
  const start = parseYearToNumeric(parts[0]);
  const end = parseYearToNumeric(parts[1]);
  if (start > 0 && end < 0 && !parts[0].toLowerCase().includes('ce') && !parts[0].toLowerCase().includes('ad')) return [-start, end];
  return [start, end];
}
export function calculateYCoordinate(year: number, scaleFactor: number = 0.1): number {
  return -year * scaleFactor;
}
