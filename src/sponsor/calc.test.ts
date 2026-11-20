import { expect, test } from 'vitest';
import { BASE_VISIT, CAMPAIGN_WEEKS, completion, compute, holdoutPlan, miles, type Data } from './calc';

// One store and one starting area at the same point: 100 trips a week.
const zone = (id: number) => ({ id, name: `Z${id}`, borough: 'B', lon: -74, lat: 40.7, rings: [] });
const data: Data = { sources: {}, weeks: 4, zones: [zone(1), zone(2)], trips: { '2': { '1': 100 } },
  stores: [{ id: 's', name: 'S', cat: 'grocery_store', kind: 'store', lon: -74, lat: 40.7, zone: 2 }] };
const inp = { budget: 1e6, fee: 6, credit: 5, window: 15, radius: 2.5, lift: 10 };
const c = completion(15);

test('hand-worked visits, spend and platform cost', () => {
  const r = compute(data, data.stores[0], inp);
  const rides = 100 * CAMPAIGN_WEEKS, confirmed = rides * (BASE_VISIT.store + 0.1) * c, extra = rides * 0.1 * c;
  expect(r.rides).toBeCloseTo(rides);
  expect(r.confirmed).toBeCloseTo(confirmed);
  expect(r.extra).toBeCloseTo(extra);
  expect(r.spend).toBeCloseTo(confirmed * 6);
  expect(r.grossProfit).toBeCloseTo(confirmed * 6 - confirmed * 5); // fee 6 exceeds credit 5, so the platform gains $1 a visit
  expect(r.feeCoversCredit).toBe(true);
});

test('budget caps spend and fee below credit is flagged', () => {
  const r = compute(data, data.stores[0], { ...inp, budget: 100, fee: 4 });
  expect(r.spend).toBeCloseTo(100);
  expect(r.feeCoversCredit).toBe(false);
});

test('areas beyond the radius are dropped', () => {
  const far = { ...data, zones: [{ ...zone(1), lat: 40.9 }, zone(2)] };
  expect(compute(far, far.stores[0], inp).areas).toHaveLength(0);
  expect(miles(-74, 40.7, -74, 40.9)).toBeGreaterThan(13);
});

test('holdout plan lengthens when volume is low', () => {
  const area = (w: number) => ({ zone: zone(1), miles: 0, weeklyTrips: w, rides: 0, confirmed: 0, extra: 0, spend: 0, funded: true, share: 1, perDollar: 0 });
  const big = holdoutPlan(Array(12).fill(0).map(() => area(500)));
  const small = holdoutPlan(Array(12).fill(0).map(() => area(5)));
  expect(big.weeks).toBeLessThan(small.weeks);
  expect(big.areasEach).toBe(6);
});
