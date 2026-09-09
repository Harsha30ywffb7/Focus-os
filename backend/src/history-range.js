// Bound historical reads and reject impossible or ambiguous calendar dates.
export function validHistoryRange(start, end) {
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(start) || !validDate(end)) return false;
  const span = Date.parse(end) - Date.parse(start);
  return span >= 0 && span <= 365 * 86400000;
}
