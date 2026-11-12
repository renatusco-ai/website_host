// Renatus mission: save businesses $100 million in recurring expenses.
// The live figure comes from renatusOS via /api/mission; this file holds the
// goal, the milestone scale and the fallback used when no live value exists.

export const MISSION_GOAL = 100_000_000;
export const MISSION_MILESTONES = [100_000, 1_000_000, 10_000_000, 100_000_000];

// 266,651 is the documented annual saving already published on this site.
export const MISSION_FALLBACK = {
  confirmedAnnualSaving: 266651,
  clientCount: 1,
  updatedAt: null,
};

/**
 * Where a saving sits on the milestone scale.
 *
 * The four milestones are spaced evenly along the track, with $0 at the start,
 * so each segment is a quarter: $0-$100k, $100k-$1M, $1M-$10M, $10M-$100M.
 * Inside a segment the fill is linear.
 *
 * Returns:
 *   fraction    0..1 position along the track
 *   reached     how many milestones have been reached (0..4)
 *   linearShare 0..1 true share of the goal (for honest text)
 */
export function missionProgress(value, milestones = MISSION_MILESTONES) {
  const total = milestones.length;
  const amount = Number.isFinite(value) ? Math.max(0, value) : 0;
  const goal = milestones[total - 1];
  const linearShare = Math.min(1, amount / goal);

  let reached = 0;
  for (const m of milestones) {
    if (amount >= m) reached += 1;
  }
  if (reached >= total) {
    return { fraction: 1, reached: total, linearShare: 1 };
  }

  const lower = reached === 0 ? 0 : milestones[reached - 1];
  const upper = milestones[reached];
  const within = (amount - lower) / (upper - lower);
  return { fraction: (reached + within) / total, reached, linearShare };
}

const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

/** "$266,651". The site shows dollar figures without a currency code. */
export function formatDollars(value) {
  return AUD.format(Math.round(value)).replace(/^A\$/, '$');
}

/** Share of the goal as text, e.g. 0.27, 12.5, 100. Never rounds a non-zero share to 0. */
export function formatShare(linearShare) {
  const pct = linearShare * 100;
  if (pct <= 0) return '0';
  if (pct < 0.01) return '<0.01';
  const digits = pct >= 10 ? 1 : 2;
  return String(Number(pct.toFixed(digits)));
}
