import { expect, test } from 'vitest';
import { compute, RIDERS, type Curves, type Pt } from './calc';

// Hand-worked case: every group has uplift 0.01 and a treated ride rate of 0.2.
// Cost per rider reached = 20% redemption x 20% discount x $20 = $0.80. A $20,000 budget reaches 25,000 riders (share 0.39 on a 1% grid).
const flat: Pt[] = Array.from({ length: 20 }, (_, k) => ({ s: (k + 1) / 20, u: 0.01, t: 0.2 }));
const curves: Curves = { uplift: flat, propensity: flat, random: flat };
const base = { budget: 20000, discount: 20, policy: 'Moved by offer' as const, cutoff: 100, profit: 4, fare: 20 };

test('budget caps the riders reached', () => {
  const r = compute(curves, base);
  expect(r.reached).toBe(24960); // largest 1% step with cost <= $20,000
  expect(r.extra).toBeCloseTo(249.6);
  expect(r.cost).toBeCloseTo(19968);
  expect(r.costPerExtra).toBeCloseTo(80);
  expect(r.returnPerDollar).toBeCloseTo(0.05); // 249.6 x $4 / $19,968
});

test('cutoff caps first when it is lower than the budget cap', () => {
  expect(compute(curves, { ...base, cutoff: 10 }).reached).toBe(6400);
});

test('everyone reaches all riders and is flagged over budget', () => {
  const r = compute(curves, { ...base, policy: 'Everyone' });
  expect(r.reached).toBe(RIDERS);
  expect(r.overBudget).toBe(true);
  expect(r.extra).toBeCloseTo(640);
});

test('a higher fare costs more per rider, so the budget reaches fewer riders', () => {
  const r = compute(curves, { ...base, fare: 40 });
  expect(r.reached).toBe(12160); // $1.60 per rider: 20% would cost $20,480, so 19%
  expect(r.cost).toBeLessThanOrEqual(20000);
});
