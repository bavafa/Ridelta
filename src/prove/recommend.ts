import type { Levers, Result } from './sim';

const pts = (x: number) => (Math.abs(x) * 100).toFixed(1);
const pct = (x: number) => `${(x * 100 >= 0 ? '+' : '−')}${pts(x)}%`;

/** Fixed rules (D24). The text is built from the numbers on screen, so it always matches them. */
export function recommend(r: Result, l: Levers): string {
  if (!r.ab || !r.sb) {
    const [name, e] = r.ab ? ['group split test', r.ab] : ['hour-by-hour test', r.sb!];
    return `Run both tests to compare them. The ${name} found ${pct(e.estimate)} against a real effect of ${pct(r.truth)}, off by ${pts(e.bias)} points.`;
  }
  const a = Math.abs(r.ab.bias), s = Math.abs(r.sb.bias), area = l.area.toLowerCase();
  if (a <= 0.005 && s <= 0.005) return 'Either test works here. Cars are plentiful, so riders with the offer do not take cars from other riders. The group split test is simpler.';
  const dir = r.ab.bias > 0 ? 'high' : 'low', rel = r.truth > 0 ? `${Math.round((a / r.truth) * 100)}%` : `${pts(a)} points`;
  if (s < a) {
    const left = s > 0.005 ? ` The hour-by-hour test is still off by ${pts(s)} points. Longer time slots or a larger area could cut this.` : '';
    return `Use the hour-by-hour test, with ${l.slot}-minute time slots in each ${area}. The group split test reads ${rel} too ${dir}. Riders with the offer take cars that other riders would have used.${left}`;
  }
  const why = l.slot <= 30 ? 'its time slots are short, so the effect of one slot spills into the next' : l.area === 'Neighborhood' ? 'neighborhoods share cars, so the effect spills across areas' : 'it has fewer independent periods to learn from';
  return `Use the group split test here. The hour-by-hour test is off by ${pts(s)} points because ${why}. Try longer time slots or a larger area.`;
}
