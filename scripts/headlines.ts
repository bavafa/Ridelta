// Headline numbers for the landing page and case study, computed from each module's defaults.
// Run by `npm run build`, so changing a default changes the landing page after the next build (S2.2).
import { readFileSync, writeFileSync } from 'node:fs';
import { compute as target, DEFAULTS as T } from '../src/target/calc';
import { compute as sponsor, DEFAULTS as S, defaultStore } from '../src/sponsor/calc';
import { run, DEFAULTS as P } from '../src/prove/sim';

const read = (f: string) => JSON.parse(readFileSync(`public/data/${f}.json`, 'utf8'));
const tc = read('target'), sd = read('sponsor');

const row = (policy: typeof T.policy, cutoff = 100) => target(tc.curves, { ...T, policy, cutoff });
const moved = row('Moved by offer'), random = row('Random');
const at = (p: typeof T.policy) => target(tc.curves, { ...T, policy: p }).extra; // at the default cutoff
const store = defaultStore(sd, 'store')!;
const sp = sponsor(sd, store, { budget: S.budget, fee: S.fee, credit: S.credit, window: S.window, radius: S.radius, lift: S.lift });
const pv = run(P);

const out = {
  target: { gainVsRandom: moved.extra / random.extra - 1, extra: { random: at('Random'), likely: at('Likely riders'), moved: at('Moved by offer') } },
  sponsor: { store: store.name, perDollar: sp.extraPerDollar, funded: sp.funded, extraVisits: sp.extra },
  prove: { truth: pv.truth, ab: pv.ab!.estimate, sb: pv.sb!.estimate, abOff: pv.ab!.bias, sbOff: pv.sb!.bias },
};
writeFileSync('public/data/headlines.json', JSON.stringify(out));
console.log('headlines', JSON.stringify(out));
