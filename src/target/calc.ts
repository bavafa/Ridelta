export type Pt = { s: number; u: number; t: number };
export type Curves = { uplift: Pt[]; propensity: Pt[]; random: Pt[] };
export const POLICIES = ['Everyone', 'Random', 'Likely riders', 'Moved by offer'] as const;
export type Policy = (typeof POLICIES)[number];
const CURVE_OF: Record<Policy, keyof Curves> = { Everyone: 'random', Random: 'random', 'Likely riders': 'propensity', 'Moved by offer': 'uplift' };

export const RIDERS = 64000;
// Placeholder average fare. The Assumptions page will state it (E6).
export const FARE = 20;
// Placeholder share of reached riders who use the offer. Also stated on Assumptions (E6).
export const REDEMPTION = 0.2;

export type Inputs = { budget: number; discount: number; policy: Policy; cutoff: number; profit: number };
export type Result = { reached: number; extra: number; cost: number; costPerExtra: number; returnPerDollar: number; overBudget: boolean };

/** Linear interpolation of the cumulative curve at share s. Below the first point the first point is used. */
function at(c: Pt[], s: number): Pt {
  if (s <= c[0].s) return c[0];
  for (let i = 1; i < c.length; i++) {
    if (s <= c[i].s) {
      const a = c[i - 1], b = c[i], w = (s - a.s) / (b.s - a.s);
      return { s, u: a.u + w * (b.u - a.u), t: a.t + w * (b.t - a.t) };
    }
  }
  return c[c.length - 1];
}

/**
 * Extra rides = riders reached x uplift of the group reached.
 * Offer cost = riders reached x redemption x discount x fare. This is the usual uplift-marketing rule of a fixed
 * cost per rider reached. Charging the offer on every ride a reached rider takes removes the targeting gain
 * (riders with high uplift also ride more), so the rule is an assumption that the Data and method page must state.
 * The budget caps how far down the ranking the offer reaches. Everyone ignores the cutoff and the cap,
 * and is flagged when it needs more than the budget.
 */
export function compute(curves: Curves, i: Inputs): Result {
  const everyone = i.policy === 'Everyone';
  const c = curves[CURVE_OF[i.policy]];
  const cost = (s: number) => RIDERS * s * REDEMPTION * (i.discount / 100) * FARE;
  let s = 1;
  if (!everyone) {
    s = 0;
    for (let k = 1; k <= Math.round(i.cutoff); k++) if (cost(k / 100) <= i.budget + 1e-9) s = k / 100; else break;
  }
  const extra = RIDERS * s * at(c, s).u, spent = cost(s);
  return {
    reached: Math.round(RIDERS * s), extra, cost: spent,
    costPerExtra: extra > 0 ? spent / extra : Infinity,
    returnPerDollar: spent > 0 ? (extra * i.profit) / spent : 0,
    overBudget: spent > i.budget + 1e-9,
  };
}
