import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Advanced, DataState, Field, Kpi, Levers, Seg, Slider, Strip, Tag } from '../components';
import { compute, DEFAULTS, POLICIES, RIDERS, type Curves, type Policy } from '../target/calc';
import { useJson } from '../useJson';
import { ModuleFrame } from './Module';

type Data = { curves: Curves; source: string; url: string };
const D = { ...DEFAULTS, profit: DEFAULTS.profit.toFixed(2) };
const n0 = (v: number) => Math.round(v).toLocaleString('en-US');
const usd = (v: number) => (isFinite(v) ? `$${v.toFixed(2)}` : 'n/a');
const pct = (a: number, b: number) => (b > 0 ? `${a >= b ? '+' : '−'}${Math.abs(Math.round((a / b - 1) * 100))}%` : '');

// Chart frame, same as design/ui/target.html.
const X0 = 60, X1 = 740, Y0 = 290, Y1 = 40;
const LX: Record<string, number> = { Random: 0.7, 'Likely riders': 0.7, 'Moved by offer': 0.45 };
const LINE: Record<string, string> = { Random: '2 5', 'Likely riders': '8 5', 'Moved by offer': '' };

/** reach: the share of riders the offer reaches after the budget cap, and the extra rides there. */
function Chart({ curves, i, ev, reach }: { curves: Curves; i: { policy: Policy; cutoff: number }; ev: number; reach: { s: number; e: number; capped: boolean } }) {
  const series = (['Random', 'Likely riders', 'Moved by offer'] as const).map(p => {
    const c = curves[p === 'Random' ? 'random' : p === 'Likely riders' ? 'propensity' : 'uplift'];
    return { p, pts: [{ s: 0, e: 0 }, ...c.map(q => ({ s: q.s, e: RIDERS * q.s * q.u }))] };
  });
  const top = Math.max(...series.flatMap(s => s.pts.map(q => q.e)), ev);
  const step = [100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000].find(k => Math.ceil(top / k) <= 5)!, ymax = Math.ceil(top / step) * step;
  const x = (s: number) => X0 + s * (X1 - X0), y = (e: number) => Y0 - (e / ymax) * (Y0 - Y1);
  const ticks = Array.from({ length: ymax / step + 1 }, (_, k) => k * step);
  const cx = x(reach.s);
  return (
    <svg className="chart" viewBox="0 0 760 340" role="img" aria-label={`Extra rides by share of riders reached. Everyone is one point at 100 percent with ${n0(ev)} extra rides. The table below has the same numbers.`}>
      <g className="grid">{ticks.slice(1).map(t => <line key={t} x1={X0} y1={y(t)} x2={X1} y2={y(t)} />)}</g>
      <line className="axis" x1={X0} y1={Y0} x2={X1} y2={Y0} /><line className="axis" x1={X0} y1="20" x2={X0} y2={Y0} />
      <g className="t" textAnchor="end">{ticks.map(t => <text key={t} x="52" y={y(t) + 4}>{n0(t)}</text>)}</g>
      <g className="t" textAnchor="middle">{[0, 0.25, 0.5, 0.75, 1].map(s => <text key={s} x={x(s)} y="312">{s * 100}%</text>)}</g>
      <text className="t" x="400" y="334" textAnchor="middle">Share of riders who get the offer</text>
      {i.policy !== 'Everyone' && <><line x1={cx} y1="24" x2={cx} y2={Y0} stroke="var(--action)" strokeWidth="1.5" />
        <text x={cx > 520 ? cx - 6 : cx + 6} y="34" textAnchor={cx > 520 ? 'end' : 'start'} fill="var(--action)" fontSize="12" fontWeight="600">{reach.capped ? 'Your budget stops at' : 'Your cutoff:'} top {Math.round(reach.s * 100)}% · {n0(reach.e)} extra rides</text>
        <circle cx={cx} cy={y(reach.e)} r="6" fill="var(--data)" stroke="var(--surface)" strokeWidth="2" /></>}
      {series.map(({ p, pts }) => {
        const sel = p === i.policy;
        return (
          <g key={p}>
            <path d={pts.map((q, k) => `${k ? 'L' : 'M'}${x(q.s)} ${y(q.e)}`).join(' ')} fill="none" strokeLinejoin="round"
              stroke={sel ? 'var(--data)' : 'var(--ink-2)'} strokeWidth={sel ? 3.5 : 2} strokeDasharray={LINE[p]} />
            {/* Labels sit apart: Random below its line, the others above theirs. */}
            <text className={sel ? 'tl' : 't'} x={x(LX[p])} y={y(pts.find(q => q.s >= LX[p])!.e) + (p === 'Random' ? 18 : -8)} fill={sel ? 'var(--data)' : undefined}>{p}</text>
          </g>
        );
      })}
      <rect x={X1 - 7} y={y(ev) - 7} width="14" height="14" fill={i.policy === 'Everyone' ? 'var(--data)' : 'var(--ink)'} />
      <text className="t" x={X1 - 15} y={y(ev) - 12} textAnchor="end">Everyone · {n0(ev)}</text>
    </svg>
  );
}

export default function Target() {
  const { data, err, retry } = useJson<Data>('data/target.json');
  const [budget, setBudget] = useState(D.budget), [discount, setDiscount] = useState(D.discount), [policy, setPolicy] = useState(D.policy);
  const [cutoff, setCutoff] = useState(D.cutoff), [profitText, setProfit] = useState(D.profit);
  const tableRef = useRef<HTMLElement>(null);

  const profit = parseFloat(profitText.replace(/[^0-9.]/g, '')) || 0;
  const calc = useMemo(() => {
    if (!data) return null;
    const inp = { budget, discount, cutoff, profit };
    const rows = POLICIES.map(p => ({ p, r: compute(data.curves, { ...inp, policy: p }) }));
    // Headline: budget alone limits reach, so both ways spend the same money.
    const full = (p: Policy) => compute(data.curves, { ...inp, cutoff: 100, policy: p });
    return { rows, sel: rows.find(r => r.p === policy)!.r, rand: rows[1].r, moved: full('Moved by offer'), random: full('Random') };
  }, [data, budget, discount, cutoff, profit, policy]);

  const reset = () => { setBudget(D.budget); setDiscount(D.discount); setPolicy(D.policy); setCutoff(D.cutoff); setProfit(D.profit); };

  return (
    <ModuleFrame i={0}
      answer={calc ? <>At the same budget, giving the offer to riders it moves brings <b>{pct(calc.moved.extra, calc.random.extra)}</b> more extra rides than giving it to riders at random. <Tag kind="est" /></> : 'Loading the results.'}
      source={<>Data: a public email test where people were picked at random (64,000 customers). An email stands in for a ride offer. A site visit stands in for a ride. <Tag kind="real" /> <Link className="link" to="/data">Why this stand-in works</Link></>}>
      {!data && <DataState err={err} retry={retry} />}
      <div className="mod-grid">
        <Levers>
          <div className="ctrl" style={{ borderTop: 0, paddingTop: 0 }}><button type="button" className="link" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={reset}>Reset to defaults</button></div>
          <Slider label="Total offer budget" min={5000} max={200000} step={5000} value={budget} onChange={setBudget} fmt={v => `$${n0(v)}`} />
          <Slider label="Discount size" help="Share of the fare the offer covers." min={5} max={50} step={5} value={discount} onChange={setDiscount} fmt={v => `${v}%`} />
          <Seg label="Who gets the offer" grid options={[...POLICIES]} value={policy} onChange={v => setPolicy(v as Policy)} />
          <Slider label="How many riders get it" help="Not used when everyone gets the offer." min={5} max={100} step={5} value={cutoff} onChange={setCutoff} fmt={v => `Top ${v}%`} />
          <Field label="Profit per ride" help="What the platform keeps from one ride, before the offer." value={`$${profitText.replace(/^\$/, '')}`} onChange={v => setProfit(v.replace(/^\$/, ''))} />
          <p className="help" style={{ marginTop: 12 }}>Results update as you move a lever. Offers are capped by the budget. <Link className="link" to="/assumptions">Why these defaults</Link></p>
        </Levers>

        <div className="results">
          {calc && data && <>
            <div className="kpis">
              <Kpi label="Extra rides" value={n0(calc.sel.extra)} gold note={`${pct(calc.sel.extra, calc.rand.extra)} vs random`} kind="est" />
              <Kpi label="Cost per extra ride" value={usd(calc.sel.costPerExtra)} note={`${pct(calc.sel.costPerExtra, calc.rand.costPerExtra)} vs random`} kind="est" />
              <Kpi label="Return per offer dollar" value={usd(calc.sel.returnPerDollar)} note={`${pct(calc.sel.returnPerDollar, calc.rand.returnPerDollar)} vs random`} kind="est" />
            </div>

            <section className="card">
              <div className="chart-head">
                <div><h2 className="h3">Extra rides as more riders get the offer</h2><p className="small muted">Each line is one way to pick riders. Higher and earlier is better.</p></div>
                <div className="row"><Tag kind="est" /><button type="button" className="link" style={{ background: 'none', border: 0, cursor: 'pointer' }} onClick={() => tableRef.current?.scrollIntoView({ behavior: 'smooth' })}>View as table</button></div>
              </div>
              <Chart curves={data.curves} i={{ policy, cutoff }} ev={calc.rows[0].r.extra} reach={{ s: calc.sel.reached / RIDERS, e: calc.sel.extra, capped: calc.sel.reached / RIDERS < cutoff / 100 - 1e-9 }} />
            </section>

            <section className="card" ref={tableRef}>
              <div className="chart-head"><h2 className="h3">Four ways to pick, same budget</h2><Tag kind="est" /></div>
              <div className="table-wrap"><table className="table">
                <thead><tr><th>Who gets it</th><th className="n">Riders reached</th><th className="n">Extra rides</th><th className="n">Cost per extra ride</th><th className="n">Return per offer $</th></tr></thead>
                <tbody>{calc.rows.map(({ p, r }) => (
                  <tr key={p} className={p === policy ? 'hl' : undefined}>
                    <td>{p}{p === policy && ' · selected'}{r.overBudget && ' · over budget'}</td><td className="n">{n0(r.reached)}</td><td className="n">{n0(r.extra)}</td>
                    <td className="n">{usd(r.costPerExtra)}</td><td className="n">{usd(r.returnPerDollar)}</td>
                  </tr>))}</tbody>
              </table></div>
              <p className="help" style={{ marginTop: 12 }}>Spend is capped at the budget for every way except Everyone, which reaches all riders and may cost more.</p>
            </section>

            <section className="card grid2">
              <div><h2 className="h3">How to read this</h2><p className="small muted" style={{ marginTop: 8 }}>"Likely riders" picks people who ride often. Many of them ride with or without an offer. "Moved by offer" picks riders whose choice the offer changes.</p></div>
              <div><h2 className="h3">What this does not show</h2><p className="small muted" style={{ marginTop: 8 }}>Long-term effects, repeat offers and driver supply. Prove covers supply. The $20 fare, the 20 percent of riders who use the offer and the cost rule are placeholders until the Assumptions page.</p></div>
            </section>

            <Advanced title="Advanced: technical names">
              <p>The chart is an uplift curve. "Moved by offer" is uplift targeting. "Likely riders" is propensity targeting. "Everyone" is a blanket offer. Extra rides are incremental rides. Return per offer dollar is incremental contribution per incentive dollar. How many riders get it is the targeting cutoff.</p>
              <p style={{ marginTop: 8 }}>Model: two gradient boosting models, one fit on treated riders and one on control riders, scored on a held-out half of the test. Source: <a className="link" href={data.url}>{data.source}</a>.</p>
            </Advanced>
          </>}
        </div>
      </div>
      {calc && <Strip a={['Extra rides', n0(calc.sel.extra)]} b={['Return per offer $', usd(calc.sel.returnPerDollar)]} kind="est" />}
    </ModuleFrame>
  );
}
