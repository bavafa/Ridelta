import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kpi, Levers, Seg, Slider, Strip, Tag } from '../components';
import { recommend } from '../prove/recommend';
import { DEFAULTS, run, type AreaSize, type Cars, type Levers as L, type Result, type Which } from '../prove/sim';
import { ModuleFrame } from './Module';

const D: L = DEFAULTS;
const p1 = (x: number) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`;
const off = (x: number) => `off by ${Math.abs(x * 100).toFixed(1)} points`;

/** One row per test on a shared scale. Marker shapes carry the meaning, not color (D30). */
function Scale({ r }: { r: Result }) {
  const rows = [
    { name: 'Real effect', v: r.truth, shape: 'd' as const }, r.ab && { name: 'Group split', v: r.ab.estimate, shape: 'c' as const, bias: r.ab.bias },
    r.sb && { name: 'Hour-by-hour', v: r.sb.estimate, shape: 's' as const, bias: r.sb.bias },
  ].filter(Boolean) as { name: string; v: number; shape: 'd' | 'c' | 's'; bias?: number }[];
  const vals = rows.map(x => x.v * 100), lo = Math.floor(Math.min(...vals) - 1), hi = Math.max(Math.ceil(Math.max(...vals) + 1), lo + 4);
  const X0 = 250, X1 = 730, x = (v: number) => X0 + ((v * 100 - lo) / (hi - lo)) * (X1 - X0), H = 70 + rows.length * 56;
  const ticks = Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
  return (
    <svg className="chart" viewBox={`0 0 760 ${H}`} role="img" aria-label={`One scale from ${lo} to ${hi} percent. ${rows.map(w => `${w.name} ${p1(w.v)}${w.bias !== undefined ? `, ${off(w.bias)}` : ''}`).join('. ')}.`}>
      <line className="axis" x1={X0} y1={H - 30} x2={X1} y2={H - 30} strokeWidth="2" />
      <g className="t" textAnchor="middle">{ticks.map(t => <g key={t}><line className="axis" x1={x(t / 100)} y1={H - 36} x2={x(t / 100)} y2={H - 24} /><text x={x(t / 100)} y={H - 8}>{t}%</text></g>)}</g>
      <line x1={x(r.truth)} y1="20" x2={x(r.truth)} y2={H - 30} stroke="var(--ink)" strokeDasharray="3 4" />
      {rows.map((w, i) => {
        const y = 40 + i * 56, cx = x(w.v), tx = x(r.truth), sel = w.shape === 's';
        return (
          <g key={w.name}>
            <text className="tl" x="0" y={y + 5} fill={sel ? 'var(--data)' : undefined}>{w.shape === 'd' ? '◆' : w.shape === 'c' ? '○' : '■'} {w.name} {p1(w.v)}</text>
            {w.bias !== undefined && <><line x1={Math.min(cx, tx)} y1={y + 22} x2={Math.max(cx, tx)} y2={y + 22} stroke="var(--ink-2)" strokeDasharray="4 4" />
              <text className="t" x={(cx + tx) / 2} y={y + 38} textAnchor="middle">{off(w.bias)}</text></>}
            {w.shape === 'd' && <rect x={cx - 8} y={y - 8} width="16" height="16" transform={`rotate(45 ${cx} ${y})`} fill="var(--ink)" />}
            {w.shape === 'c' && <circle cx={cx} cy={y} r="9" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="2.5" />}
            {w.shape === 's' && <rect x={cx - 7} y={y - 7} width="14" height="14" fill="var(--data)" />}
          </g>
        );
      })}
    </svg>
  );
}

export default function Prove() {
  const [lv, setLv] = useState<L>(D), [ran, setRan] = useState<L>(D), [res, setRes] = useState<Result | null>(null), [busy, setBusy] = useState(false);
  const adv = useRef<HTMLDetailsElement>(null);
  const set = <K extends keyof L>(k: K) => (v: L[K]) => setLv(p => ({ ...p, [k]: v }));
  const changed = (k: keyof L) => lv[k] !== ran[k];
  const go = (l: L) => { setBusy(true); setTimeout(() => { setRes(run(l)); setRan(l); setBusy(false); }, 30); }; // yield once so "Running" paints
  useEffect(() => go(D), []);

  const pts = (e?: { bias: number }) => (e ? `${(Math.abs(e.bias) * 100).toFixed(1)} pts` : 'n/a');
  const table = res && (
    <div className="table-wrap"><table className="table">
      <thead><tr><th>Design</th><th className="n">Average estimate</th><th className="n">Bias</th><th className="n">95% range width</th><th className="n">Runs where the range covers the real effect</th></tr></thead>
      <tbody>{([['Rider-level A/B', res.ab, false], [`Switchback, ${ran.slot} min`, res.sb, true]] as const).map(([n, e, hl]) => e && (
        <tr key={n} className={hl ? 'hl' : undefined}><td>{n}</td><td className="n">{p1(e.estimate)}</td><td className="n">{e.bias >= 0 ? '+' : '−'}{(Math.abs(e.bias) * 100).toFixed(1)} pts</td>
          <td className="n">{(e.ciWidth * 100).toFixed(1)} pts</td><td className="n">{Math.round(e.coverage * 100)}%</td></tr>))}</tbody>
    </table></div>
  );

  return (
    <ModuleFrame i={2}
      answer={res ? <><strong>Recommendation:</strong> {recommend(res, ran)} <Tag kind="sim" /></> : 'Running the tests.'}
      source={<>In this simulator you know the real answer, because you set it. The same offer runs as two kinds of test. See which test gets closer. {res && `Each result is the average of ${res.reps} simulated runs.`}</>}>
      <div className="mod-grid">
        <Levers>
          <div className="ctrl" style={{ borderTop: 0, paddingTop: 0 }}><button type="button" className="link" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={() => setLv(D)}>Reset to defaults</button></div>
          <Slider label="Real effect of the offer" help="Set the real answer, then see which test finds it." changed={changed('effect')} min={0} max={15} step={0.5} value={lv.effect * 100} onChange={v => set('effect')(v / 100)} fmt={v => `+${v.toFixed(1)}%`} />
          <Seg label="How many cars are available" changed={changed('cars')} options={['Many', 'Some', 'Few']} value={lv.cars} onChange={v => set('cars')(v as Cars)} />
          <Seg label="Which test to run" changed={changed('which')} options={['Group split', 'Hour-by-hour', 'Both']} value={lv.which} onChange={v => set('which')(v as Which)} />
          <Slider label="Length of each time slot" help="For the hour-by-hour test. The offer turns on and off at this pace." changed={changed('slot')} min={15} max={240} step={15} value={lv.slot} onChange={set('slot')} fmt={v => `${v} min`} />
          <Seg label="Area size" changed={changed('area')} options={['City', 'Borough', 'Neighborhood']} value={lv.area} onChange={v => set('area')(v as AreaSize)} />
          <Slider label="How long the test runs" changed={changed('days')} min={7} max={56} step={7} value={lv.days} onChange={set('days')} fmt={v => `${v} days`} />
          <button className="btn primary block" type="button" style={{ marginTop: 12 }} disabled={busy} onClick={() => go(lv)}>{busy ? 'Running…' : 'Run the tests'}</button>
          <p className="help">Each run takes a few seconds. Results stay on screen until the next run. Changed levers are marked until you run again. <Link className="link" to="/assumptions">Why these defaults</Link></p>
        </Levers>

        <div className="results" aria-busy={busy}>
          {res && <>
            {res.capped && <p className="small muted">With these cars the offer cannot raise rides by {(ran.effect * 100).toFixed(1)}%. The real effect was lowered to {(res.truth * 100).toFixed(1)}%.</p>}
            <div className="kpis">
              <Kpi label="Real effect (you set it)" value={p1(res.truth)} note="◆ the answer" kind="sim" />
              {res.ab ? <Kpi label="Group split test found" value={p1(res.ab.estimate)} note={off(res.ab.bias)} kind="sim" /> : <Kpi label="Group split test" value="Not run" kind="sim" />}
              {res.sb ? <Kpi label="Hour-by-hour test found" value={p1(res.sb.estimate)} gold note={off(res.sb.bias)} kind="sim" /> : <Kpi label="Hour-by-hour test" value="Not run" kind="sim" />}
            </div>

            <section className="card">
              <div className="chart-head">
                <div><h2 className="h3">How close did each test get?</h2><p className="small muted">The closer a test sits to the real effect, the better.</p></div>
                <div className="row"><Tag kind="sim" /><button type="button" className="link" style={{ background: 'none', border: 0, cursor: 'pointer' }} onClick={() => { if (adv.current) { adv.current.open = true; adv.current.scrollIntoView({ behavior: 'smooth' }); } }}>View as table</button></div>
              </div>
              <Scale r={res} />
            </section>

            <section className="card grid2">
              <div><h2 className="h3">Why the tests disagree</h2><p className="small muted" style={{ marginTop: 8 }}>In a group split test, both groups share the same cars. Riders with the offer take cars from riders without it. That makes the offer look stronger than it is. An hour-by-hour test turns the offer on for a whole area for one time slot, then off. The two groups rarely compete for the same cars.</p></div>
              <div><h2 className="h3">The trade-off</h2><p className="small muted" style={{ marginTop: 8 }}>The hour-by-hour test lands closer on average but is less certain. Shorter time slots and smaller areas give more data, but the effect can spill over.</p></div>
            </section>

            <details className="adv" ref={adv}><summary>Advanced: ranges, bias and technical names</summary>
              <div className="stack">
                <p>Group split test is a rider-level A/B test. Hour-by-hour test is a switchback test. Off by is the bias. Each row averages {res.reps} runs with different random draws. The range is a 95 percent confidence interval, and the last column shows how often it covered the real effect.</p>
                {table}
                <p>Settings that are guesses, not data: 400 ride requests per 15 minutes in the city, cars at 2.0, 1.3 or 1.08 times requests, one fifth of idle cars able to serve a neighboring area, and a quarter of demand still following the old setting in the first 15 minutes after a switch. Area size sets how many areas share the cars: 1, 5 or 20. The group split test treats each 15 minute period as independent, so its range is likely too narrow.</p>
                <Tag kind="sim" />
              </div>
            </details>
          </>}
        </div>
      </div>
      {res && <Strip a={['Group split off by', pts(res.ab)]} b={['Hour-by-hour off by', pts(res.sb)]} kind="sim" />}
    </ModuleFrame>
  );
}
