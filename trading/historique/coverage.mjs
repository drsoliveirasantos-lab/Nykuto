// Coverage comes from the verified manifest, never from a hard-coded date.
export function describeDay(dataset, day, manifest) {
  const values = dataset.daily?.[day];
  const from = Date.parse(`${day}T00:00:00Z`) / 1000;
  const to = from + 86400;
  const gaps = (manifest.coverage?.knownGaps ?? []).filter(gap =>
    gap.dataset === dataset.id && gap.from < to && gap.to > from);
  const missing = gaps.filter(gap => gap.classification === 'missing_data');
  return {
    values,
    missingMinutes: missing.reduce((sum, gap) => sum + Math.max(0, Math.min(to, gap.to) - Math.max(from, gap.from)) / 60, 0),
    notes: [...new Set(gaps.map(gap => gap.reason).filter(Boolean))],
    incompleteVolume: Boolean(values && values.volumeCount < values.count),
  };
}
