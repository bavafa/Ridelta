import { expect, test } from 'vitest';
import { recommend } from './recommend';
import { run, type Est, type Levers, type Result } from './sim';

const L: Levers = { effect: 0.05, cars: 'Few', which: 'Both', slot: 60, area: 'Borough', days: 14 };

test('many cars: both tests land close to the real effect', () => {
  const r = run({ ...L, cars: 'Many' });
  expect(Math.abs(r.ab!.bias)).toBeLessThan(0.01);
  expect(Math.abs(r.sb!.bias)).toBeLessThan(0.01);
});

test('few cars: the group split test reads high and the hour-by-hour test is closer', () => {
  const r = run(L);
  expect(r.ab!.bias).toBeGreaterThan(0.02);
  expect(Math.abs(r.sb!.bias)).toBeLessThan(Math.abs(r.ab!.bias));
});

test('same levers give the same result, and no effect reads near zero', () => {
  expect(run(L)).toEqual(run(L));
  const none = run({ ...L, effect: 0, cars: 'Many' });
  expect(Math.abs(none.ab!.estimate)).toBeLessThan(0.01);
});

const est = (bias: number): Est => ({ estimate: 0.05 + bias, bias, ciWidth: 0.01, coverage: 1 });
const res = (ab: number, sb: number): Result => ({ truth: 0.05, capped: false, reps: 20, ab: est(ab), sb: est(sb) });

test('recommendation rules', () => {
  expect(recommend(res(0.002, -0.003), L)).toMatch(/Either test works/);
  expect(recommend(res(0.012, 0.001), L)).toMatch(/Use the hour-by-hour test, with 60-minute time slots in each borough. The group split test reads 24% too high/);
  expect(recommend(res(0.012, 0.008), L)).toMatch(/still off by 0.8 points/);
  expect(recommend(res(0.001, 0.02), { ...L, slot: 15 })).toMatch(/Use the group split test.*time slots are short/);
  expect(recommend(res(0.001, 0.02), { ...L, area: 'Neighborhood' })).toMatch(/neighborhoods share cars/);
  expect(recommend(res(0.001, 0.02), { ...L, area: 'City' })).toMatch(/fewer independent periods/);
  expect(recommend({ truth: 0.05, capped: false, reps: 20, ab: est(0.012) }, { ...L, which: 'Group split' })).toMatch(/Run both tests.*group split test found \+6.2%.*off by 1.2 points/);
  expect(recommend(res(-0.012, -0.001), L)).toMatch(/too low/);
});
