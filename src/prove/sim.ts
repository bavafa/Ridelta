// Marketplace simulator for Prove (E5). Everything here is invented to make the point, not calibrated to real supply.
export type Cars = 'Many' | 'Some' | 'Few';
export type Which = 'Group split' | 'Hour-by-hour' | 'Both';
export type AreaSize = 'City' | 'Borough' | 'Neighborhood';
export type Levers = { effect: number; cars: Cars; which: Which; slot: number; area: AreaSize; days: number };
export const DEFAULTS: Levers = { effect: 0.05, cars: 'Few', which: 'Both', slot: 60, area: 'Neighborhood', days: 14 };
export type Est = { estimate: number; bias: number; ciWidth: number; coverage: number };
export type Result = { truth: number; capped: boolean; reps: number; ab?: Est; sb?: Est };

// Placeholders, stated in the Advanced section.
export const STEP_MIN = 15;
/** Fewer repeats for long tests on many areas, so a run stays near 1 to 2 seconds. */
export const repsFor = (l: Levers) => Math.min(20, Math.max(8, Math.floor(7e5 / (l.days * 96 * AREAS[l.area]))));
const DEMAND = 400; // ride requests per step, city-wide
const CAR_RATIO: Record<Cars, number> = { Many: 2, Some: 1.3, Few: 1.08 }; // cars per request
const AREAS: Record<AreaSize, number> = { City: 1, Borough: 5, Neighborhood: 20 };
const SPILL = 0.2; // share of idle cars that can serve another area in the same step
const CARRY = 0.25; // share of demand in the first step after a switch that still follows the old setting
const SEED = 20260101;

export function rng(seed: number) {
  let a = seed >>> 0;
  const u = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const normal = () => Math.sqrt(-2 * Math.log(u() || 1e-12)) * Math.cos(2 * Math.PI * u());
  const poisson = (m: number) => {
    if (m < 30) { const L = Math.exp(-m); let k = 0, p = 1; do { k++; p *= u(); } while (p > L); return k - 1; }
    return Math.max(0, Math.round(m + Math.sqrt(m) * normal()));
  };
  const binomial = (n: number, p: number) => { if (n < 40) { let k = 0; for (let i = 0; i < n; i++) if (u() < p) k++; return k; } return Math.min(n, Math.max(0, Math.round(n * p + Math.sqrt(n * p * (1 - p)) * normal()))); };
  return { u, poisson, binomial };
}

type R = ReturnType<typeof rng>;
/** Serves requests area by area, then lets idle cars in one area serve unmet requests in others. Writes rides into out. */
function match(req: Float64Array, cars: Float64Array, out: Float64Array) {
  let idle = 0, unmet = 0;
  for (let a = 0; a < req.length; a++) { const s = Math.min(req[a], cars[a]); out[a] = s; idle += cars[a] - s; unmet += req[a] - s; }
  if (unmet <= 0) return;
  const k = Math.min(idle * SPILL, unmet) / unmet;
  for (let a = 0; a < req.length; a++) out[a] += k * (req[a] - out[a]);
}

const mean = (x: number[]) => x.reduce((s, v) => s + v, 0) / x.length;
const sd = (x: number[]) => { const m = mean(x); return Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(x.length - 1, 1)); };

/** Whole city treated or not, same random draws. Returns rides. */
function globalRides(l: Levers, demandLift: number, steps: number) {
  const r = rng(SEED), A = AREAS[l.area], lam = DEMAND / A, c = lam * CAR_RATIO[l.cars];
  const req = new Float64Array(A), cars = new Float64Array(A), out = new Float64Array(A);
  let total = 0;
  for (let t = 0; t < steps; t++) {
    for (let a = 0; a < A; a++) { req[a] = r.poisson(lam * (1 + demandLift)); cars[a] = r.poisson(c); }
    match(req, cars, out);
    for (let a = 0; a < A; a++) total += out[a];
  }
  return total;
}

/** Finds the demand lift whose effect on completed rides, with the offer for everyone, equals the real effect. */
export function calibrate(l: Levers) {
  const steps = 1500, base = globalRides(l, 0, steps), gte = (e: number) => globalRides(l, e, steps) / base - 1;
  if (gte(3) < l.effect) return { lift: 3, truth: gte(3), capped: true };
  let lo = 0, hi = 3;
  for (let i = 0; i < 16; i++) { const mid = (lo + hi) / 2; if (gte(mid) < l.effect) lo = mid; else hi = mid; }
  return { lift: (lo + hi) / 2, truth: l.effect, capped: false };
}

function groupSplit(l: Levers, lift: number, r: R) {
  const A = AREAS[l.area], lam = DEMAND / A, c = lam * CAR_RATIO[l.cars], steps = l.days * 96;
  const rT = new Float64Array(A), rC = new Float64Array(A), req = new Float64Array(A), cars = new Float64Array(A), out = new Float64Array(A);
  const dT: number[] = [], dC: number[] = [];
  for (let t = 0; t < steps; t++) {
    for (let a = 0; a < A; a++) { rT[a] = r.poisson((lam / 2) * (1 + lift)); rC[a] = r.poisson(lam / 2); req[a] = rT[a] + rC[a]; cars[a] = r.poisson(c); }
    match(req, cars, out);
    let T = 0, C = 0;
    for (let a = 0; a < A; a++) { const s = Math.round(out[a]), tr = req[a] ? r.binomial(s, rT[a] / req[a]) : 0; T += tr; C += s - tr; }
    dT.push(T); dC.push(C);
  }
  const diff = dT.map((v, i) => v - dC[i]), b = mean(dC), se = sd(diff) / Math.sqrt(diff.length) / b;
  return { est: mean(diff) / b, se };
}

function switchback(l: Levers, lift: number, r: R) {
  const A = AREAS[l.area], lam = DEMAND / A, c = lam * CAR_RATIO[l.cars], steps = l.days * 96, per = Math.max(1, Math.round(l.slot / STEP_MIN));
  const slots = Math.ceil(steps / per), assign = Array.from({ length: slots }, () => Float64Array.from({ length: A }, () => (r.u() < 0.5 ? 1 : 0)));
  const unit = Array.from({ length: slots }, () => new Float64Array(A));
  const req = new Float64Array(A), cars = new Float64Array(A), out = new Float64Array(A);
  for (let t = 0; t < steps; t++) {
    const s = Math.floor(t / per), first = t % per === 0 && s > 0;
    // Carryover: in the first step of a slot, a quarter of the demand still follows the previous slot's setting.
    for (let a = 0; a < A; a++) {
      const x = first ? CARRY * assign[s - 1][a] + (1 - CARRY) * assign[s][a] : assign[s][a];
      req[a] = r.poisson(lam * (1 + lift * x)); cars[a] = r.poisson(c);
    }
    match(req, cars, out);
    for (let a = 0; a < A; a++) unit[s][a] += out[a];
  }
  const T: number[] = [], C: number[] = [];
  unit.forEach((row, s) => row.forEach((v, a) => (assign[s][a] ? T : C).push(v)));
  const mT = mean(T), mC = mean(C);
  return { est: (mT - mC) / mC, se: Math.sqrt(sd(T) ** 2 / T.length + sd(C) ** 2 / C.length) / mC };
}

const summarize = (runs: { est: number; se: number }[], truth: number): Est => ({
  estimate: mean(runs.map(x => x.est)), bias: mean(runs.map(x => x.est - truth)), ciWidth: mean(runs.map(x => 2 * 1.96 * x.se)),
  coverage: runs.filter(x => Math.abs(x.est - truth) <= 1.96 * x.se).length / runs.length,
});

/** Runs the chosen designs several times (see repsFor). Same levers give the same result (fixed seed). Effects are fractions, 0.05 = 5 percent. */
export function run(l: Levers): Result {
  const { lift, truth, capped } = calibrate(l), reps = repsFor(l), out: Result = { truth, capped, reps };
  if (l.which !== 'Hour-by-hour') out.ab = summarize(Array.from({ length: reps }, (_, i) => groupSplit(l, lift, rng(SEED + 1 + i))), truth);
  if (l.which !== 'Group split') out.sb = summarize(Array.from({ length: reps }, (_, i) => switchback(l, lift, rng(SEED + 1000 + i))), truth);
  return out;
}
