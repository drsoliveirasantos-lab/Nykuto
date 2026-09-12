// Nykuto Trading — opportunity lifecycle policy
// Research-only admission layer. It separates market-opportunity counting from
// the realistic rule that only one setup may carry fresh initial risk at once.
// No broker execution is authorized by this module.

export const TP1_RELEASE_POLICY = Object.freeze({
  researchOnly: true,
  executionAllowed: false,
  maxTradesPerDay: null,
  initialRiskSlots: 1,
  releaseOn: Object.freeze(['TP1', 'CLOSE']),
  tp1ReleaseRequiresBreakEven: true,
  sameSetupReentryAllowed: false,
  runnersMayOverlapAfterTp1: true
});

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function epochMs(value) {
  const number = finite(value);
  if (number === null) return null;
  return Math.abs(number) < 1e12 ? number * 1000 : number;
}

function entryTimeMs(opportunity) {
  return epochMs(opportunity?.censusTimeMs ?? opportunity?.entryTime ?? opportunity?.time ?? opportunity?.timestamp);
}

function setupIdentity(opportunity, index) {
  const explicit = String(opportunity?.setupId || '').trim();
  if (explicit) return explicit;
  const key = String(opportunity?.censusKey || '').trim();
  // No structural parent was supplied. Treat this event as its own setup rather
  // than guessing lineage from side/family and suppressing a valid opportunity.
  return key || `UNLINKED|${index}|${entryTimeMs(opportunity) ?? 'NA'}`;
}

function lifecycleRelease(opportunity, entryMs) {
  const exitMs = epochMs(opportunity?.exitTime);
  const tp1Ms = opportunity?.tp1Reached === true ? epochMs(opportunity?.tp1Time) : null;
  const validTp1 = tp1Ms !== null && tp1Ms >= entryMs && (exitMs === null || tp1Ms <= exitMs);
  if (validTp1) return { timeMs: tp1Ms, reason: 'TP1', exitMs };
  if (exitMs !== null && exitMs >= entryMs) return { timeMs: exitMs, reason: 'CLOSE', exitMs };
  return { timeMs: null, reason: 'UNRESOLVED', exitMs };
}

function tradeable(opportunity) {
  if (opportunity?.status === 'TRADEABLE') return true;
  if (opportunity?.riskTradeable === true) return true;
  return false;
}

/**
 * Apply the execution lifecycle Diego requested to an independent opportunity
 * stream:
 * - no daily trade-count cap;
 * - one fresh initial-risk setup at a time;
 * - TP1 frees that initial-risk slot only under the research assumption that the
 *   remaining runner is immediately protected at break-even;
 * - a full close also frees the slot;
 * - another emission from the same setupId is never a new trade;
 * - independent setups may start while older TP1-protected runners continue.
 *
 * This function decides admission only. It intentionally does not sum runner
 * PnL, because a proper multi-position fill simulation must model the BE stop
 * after TP1 before portfolio PnL can be claimed.
 */
export function applyTp1ReleasePolicy(censusOrOpportunities, { requireTradeable = true } = {}) {
  const source = Array.isArray(censusOrOpportunities)
    ? censusOrOpportunities
    : Array.isArray(censusOrOpportunities?.opportunities)
      ? censusOrOpportunities.opportunities
      : [];

  const ordered = source
    .map((opportunity, index) => ({ opportunity, index, entryMs: entryTimeMs(opportunity) }))
    .sort((a, b) => (a.entryMs ?? Infinity) - (b.entryMs ?? Infinity) || a.index - b.index);

  const admitted = [];
  const rejected = [];
  const seenSetupIds = new Set();
  const runners = [];
  let initialRiskReleaseMs = -Infinity;
  let releaseOwner = null;
  let maxConcurrentRunners = 0;
  let releasedViaTp1 = 0;
  let releasedViaClose = 0;

  for (const item of ordered) {
    const { opportunity, index, entryMs } = item;
    const setupId = setupIdentity(opportunity, index);

    if (entryMs === null) {
      rejected.push({ ...opportunity, setupId, lifecycleReason: 'INVALID_ENTRY_TIME' });
      continue;
    }

    // Only runners whose final exit is later than this candidate are still live.
    for (let runnerIndex = runners.length - 1; runnerIndex >= 0; runnerIndex -= 1) {
      if (runners[runnerIndex].exitMs !== null && runners[runnerIndex].exitMs <= entryMs) runners.splice(runnerIndex, 1);
    }

    if (seenSetupIds.has(setupId)) {
      rejected.push({ ...opportunity, setupId, lifecycleReason: 'SAME_SETUP' });
      continue;
    }

    if (requireTradeable && !tradeable(opportunity)) {
      rejected.push({ ...opportunity, setupId, lifecycleReason: 'NOT_TRADEABLE' });
      continue;
    }

    if (entryMs < initialRiskReleaseMs) {
      rejected.push({
        ...opportunity,
        setupId,
        lifecycleReason: 'WAIT_FOR_TP1_OR_CLOSE',
        blockedBySetupId: releaseOwner,
        initialRiskReleaseMs
      });
      continue;
    }

    const release = lifecycleRelease(opportunity, entryMs);
    if (release.timeMs === null) {
      rejected.push({ ...opportunity, setupId, lifecycleReason: 'UNRESOLVED_LIFECYCLE' });
      continue;
    }

    const tp1Release = release.reason === 'TP1';
    const record = {
      ...opportunity,
      setupId,
      lifecycleReason: 'ADMITTED',
      initialRiskReleaseMs: release.timeMs,
      initialRiskReleaseReason: release.reason,
      runnerRiskNeutralizedAtTp1: tp1Release,
      runnerStopAfterTp1: tp1Release ? opportunity.entry : null
    };
    admitted.push(record);
    seenSetupIds.add(setupId);
    initialRiskReleaseMs = release.timeMs;
    releaseOwner = setupId;

    if (tp1Release) {
      releasedViaTp1 += 1;
      if (release.exitMs !== null && release.exitMs > release.timeMs) {
        runners.push({ setupId, releaseMs: release.timeMs, exitMs: release.exitMs });
        maxConcurrentRunners = Math.max(maxConcurrentRunners, runners.length);
      }
    } else {
      releasedViaClose += 1;
    }
  }

  const byDay = new Map();
  for (const opportunity of admitted) {
    const ms = entryTimeMs(opportunity);
    const day = opportunity.day || (ms === null ? 'UNKNOWN' : new Date(ms).toISOString().slice(0, 10));
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }

  const rejectedReasons = {};
  for (const item of rejected) rejectedReasons[item.lifecycleReason] = (rejectedReasons[item.lifecycleReason] || 0) + 1;

  return {
    policy: TP1_RELEASE_POLICY,
    admitted,
    rejected,
    stats: {
      sourceOpportunities: source.length,
      admittedCount: admitted.length,
      rejectedCount: rejected.length,
      maxTradesInSingleDay: byDay.size ? Math.max(...byDay.values()) : 0,
      releasedViaTp1,
      releasedViaClose,
      maxConcurrentRunners,
      rejectedReasons,
      byDay: Object.fromEntries([...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)))
    }
  };
}
