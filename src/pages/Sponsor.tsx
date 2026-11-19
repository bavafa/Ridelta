import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Advanced, DataState, Kpi, Levers, Seg, Slider, Strip, Tag } from '../components';
import { compute, DEFAULTS, defaultStore, holdoutPlan, type Area, type Data, type Store } from '../sponsor/calc';
import { useJson } from '../useJson';
import { ModuleFrame } from './Module';

const D = DEFAULTS;
const n0 = (v: number) => Math.round(v).toLocaleString('en-US');
const usd = (v: number) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const usd2 = (v: number) => `$${v.toFixed(2)}`;

/** Map of zones around the store. Tier shades and the hatch give the same ranking as the table without color (D20). */
function ZoneMap({ data, store, areas, radius }: { data: Data; store: Store; areas: Area[]; radius: number }) {
  const W = 520, H = 400, k = Math.cos((store.lat * Math.PI) / 180);
  const half = (radius * 1.25) / 69, sy = H / (2 * half), sx = sy * k; // half = degrees of latitude from the store to the map edge
  const px = ([lon, lat]: number[]) => `${((lon - store.lon) * sx + W / 2).toFixed(1)} ${((store.lat - lat) * sy + H / 2).toFixed(1)}`;
  const rank = new Map(areas.map((a, i) => [a.zone.id, i]));
  const tier = (r?: number) => (r === undefined ? 'out' : r < Math.ceil(areas.length / 3) ? 'top' : r < Math.ceil((areas.length * 2) / 3) ? 'mid' : 'low');
  const fill = { top: 'url(#hatch)', mid: 'color-mix(in srgb, var(--base) 45%, transparent)', low: 'var(--sunk)', out: 'var(--paper)' };
  const near = data.zones.filter(z => Math.abs(z.lat - store.lat) < half * 1.6 && Math.abs(z.lon - store.lon) < (half * 1.6 * H) / (W * k));
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Map of starting areas around ${store.name}. The top areas are hatched and the top five are numbered. The same ranking is in the table.`}>
      <defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="var(--data-soft)" /><line y2="7" stroke="var(--data)" strokeWidth="2.5" /></pattern></defs>
      <rect width={W} height={H} fill="var(--paper)" />
      <g stroke="var(--line)" strokeWidth="1.5" strokeLinejoin="round">
        {near.map(z => <path key={z.id} d={z.rings.map(r => 'M' + r.map(px).join('L') + 'Z').join('')} fill={fill[tier(rank.get(z.id))]} />)}
      </g>
      <g fontFamily="var(--mono)" fontSize="12" textAnchor="middle">
        {areas.slice(0, 5).map((a, i) => { const [x, y] = px([a.zone.lon, a.zone.lat]).split(' '); return (
          <g key={a.zone.id}><circle cx={x} cy={y} r="13" fill="var(--ink)" /><text x={x} y={+y + 4} fill="var(--paper)">{i + 1}</text></g>); })}
      </g>
      {(() => { const [x, y] = px([store.lon, store.lat]).split(' '); return <g><circle cx={x} cy={y} r="9" fill="var(--action)" stroke="var(--surface)" strokeWidth="3" /><text x={+x + 14} y={+y - 6} fontSize="12" fontWeight="600" fill="var(--ink)" stroke="var(--paper)" strokeWidth="3" paintOrder="stroke">Store</text></g>; })()}
    </svg>
  );
}

export default function Sponsor() {
  const { data, err, retry } = useJson<Data>('data/sponsor.json');
  const [who, setWho] = useState(D.who), [budget, setBudget] = useState(D.budget), [fee, setFee] = useState(D.fee), [credit, setCredit] = useState(D.credit);
  const [window_, setWindow] = useState(D.window), [radius, setRadius] = useState(D.radius), [lift, setLift] = useState(D.lift);
  const [storeId, setStoreId] = useState<Record<string, string>>({}), [text, setText] = useState<string | null>(null), [all, setAll] = useState(false);

  const kind = who === 'Mall operator' ? 'mall' : 'store';
  const pool = useMemo(() => data?.stores.filter(s => s.kind === kind) ?? [], [data, kind]);
  const store = useMemo(() => (data ? pool.find(s => s.id === storeId[kind]) ?? defaultStore(data, kind) : null), [data, pool, storeId, kind]);
  const shown = text ?? store?.name ?? '';
  const onStore = (v: string) => {
    setText(v);
    const m = pool.find(s => s.name.toLowerCase() === v.trim().toLowerCase());
    if (m) { setStoreId(p => ({ ...p, [kind]: m.id })); setText(null); }
  };

  const inp = { budget, fee, credit, window: window_, radius, lift };
  const r = useMemo(() => (data && store ? compute(data, store, inp) : null), [data, store, budget, fee, credit, window_, radius, lift]);
  const plan = useMemo(() => (r ? holdoutPlan(r.areas) : null), [r]);
  const reset = () => { setWho(D.who); setBudget(D.budget); setFee(D.fee); setCredit(D.credit); setWindow(D.window); setRadius(D.radius); setLift(D.lift); setText(null); };
  const zoneName = (id: number) => data?.zones.find(z => z.id === id)?.name ?? '';

  const planText = r && plan && store ? `Test plan for ${store.name}\nAreas with the offer: ${plan.areasEach}\nAreas without it, for comparison: ${plan.areasEach} (matched on trip volume)\nHow long: ${plan.weeks} weeks\nSmallest change it can spot: ${Math.round(plan.mde * 100)}%\nWhat to compare: rides that end at the store from areas with the offer and from areas without it.` : '';

  return (
    <ModuleFrame i={1}
      answer={r && store ? <>For <b>{store.name}</b>, a budget of <b>{usd(budget)}</b> reaches <b>{r.funded}</b> starting areas and brings <b>{r.extraPerDollar.toFixed(2)}</b> extra store visits per sponsor dollar. <Tag kind="sim" /></> : 'Loading the results.'}
      source={data && <>Trips: public NYC for-hire trip records, all operators combined. Areas: NYC taxi zones. Stores: Overture Maps Places. <Tag kind="real" /> Extra visits are assumed. <Tag kind="sim" /></>}>
      {!data && <DataState err={err} retry={retry} />}
      <div className="mod-grid">
        <Levers>
          <div className="ctrl" style={{ borderTop: 0, paddingTop: 0 }}><button type="button" className="link" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={reset}>Reset to defaults</button></div>
          <Seg label="Who sponsors" options={['Single store', 'Mall operator']} value={who} onChange={v => { setWho(v); setText(null); }}
            help="Single store: the store pays for confirmed visits to its own door. Mall operator: a confirmed visit to any entrance or participating store counts." />
          <div className="ctrl"><div className="ctrl-top"><span>{kind === 'mall' ? 'Mall' : 'Store'}</span></div>
            <input className="field" type="search" list="stores" aria-label={kind === 'mall' ? 'Mall' : 'Store'} value={shown} onChange={e => onStore(e.target.value)} onBlur={() => setText(null)} />
            <datalist id="stores">{pool.map(s => <option key={s.id} value={s.name}>{zoneName(s.zone)}</option>)}</datalist>
            {store && <p className="help">In {zoneName(store.zone)}. Start typing to find another.</p>}</div>
          <Slider label="Sponsor budget" min={1000} max={50000} step={500} value={budget} onChange={setBudget} fmt={v => `$${n0(v)}`} help="For a 4-week campaign." />
          <Slider label="Fee per confirmed visit" min={1} max={20} step={0.5} value={fee} onChange={setFee} fmt={usd2} help="What the sponsor pays each time a rider checks in at the store." />
          <Slider label="Rider credit" min={1} max={15} step={0.5} value={credit} onChange={setCredit} fmt={usd2} help="The discount the rider receives after checking in." />
          <Slider label="Check-in window" min={5} max={60} step={5} value={window_} onChange={setWindow} fmt={v => `${v} min`} help="How long the rider has to check in after arriving." />
          <Slider label="How far riders can start from" min={0.5} max={10} step={0.5} value={radius} onChange={setRadius} fmt={v => `${v.toFixed(1)} mi`} />
          <Slider label="Extra visits from the offer" min={0} max={50} step={1} value={lift} onChange={setLift} fmt={v => `${v}%`} help="An assumption, not a measurement. The check below would measure it." />
          <p className="help" style={{ marginTop: 12 }}>Results update as you move a lever. <Link className="link" to="/assumptions">Why these defaults</Link></p>
        </Levers>

        <div className="results">
          {r && store && data && plan && <>
            <div className="kpis">
              <Kpi label="Extra store visits per sponsor dollar" value={r.extraPerDollar.toFixed(2)} gold note={`${n0(r.extra)} extra visits`} kind="sim" />
              <Kpi label="Platform cost after sponsor fees" value={usd(r.platformCost)} note={r.platformCost <= 0 ? 'fees exceed credit' : 'credit exceeds fees'} kind="sim" />
              <Kpi label="Sponsored rides" value={n0(r.rides)} note="from trip volumes" kind="est" />
            </div>

            <div className="check">
              <p className="small muted" style={{ maxWidth: 600 }}>A confirmed visit shows the rider came in. It does not show the offer caused the visit. The test below measures that.</p>
              <p className="ok"><b>Fee covers rider credit: {r.feeCoversCredit ? 'Yes' : 'No'}</b> <Tag kind="sim" /></p>
            </div>

            <section className="card">
              <div className="chart-head">
                <div><h2 className="h3">Best starting areas for rides to this store</h2><p className="small muted">Areas where a sponsored ride is most likely to bring a new visitor.</p></div>
                <div className="row"><Tag kind="real" /> <span className="small">map and trips</span><Tag kind="sim" /> <span className="small">ranking</span></div>
              </div>
              {r.areas.length === 0 ? <p className="muted">No starting areas fall inside this distance. Raise how far riders can start from.</p> : (
                <div className="map-grid">
                  <div className="seg view-switch" role="radiogroup" aria-label="Show as"><label><input type="radio" name="v" id="v-list" defaultChecked />List</label><label><input type="radio" name="v" id="v-map" />Map</label></div>
                  <div className="map-pane">
                    <ZoneMap data={data} store={store} areas={r.areas} radius={radius} />
                    <div className="row small muted" style={{ gap: 16, marginTop: 8 }}>
                      <span><svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" fill="url(#hatch)" /></svg> Top tier</span>
                      <span><svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" fill="var(--base)" fillOpacity=".45" /></svg> Middle</span>
                      <span><svg width="14" height="14" aria-hidden="true"><rect width="14" height="14" fill="var(--sunk)" stroke="var(--line)" /></svg> Low</span>
                    </div>
                  </div>
                  <div className="list-pane">
                    <div className="table-wrap"><table className="table">
                      <thead><tr><th>Rank</th><th>Area</th><th className="n">Weekly trips</th><th className="n">Extra visits per $</th></tr></thead>
                      <tbody>{(all ? r.areas : r.areas.slice(0, 5)).map((a, i) => (
                        <tr key={a.zone.id}><td><span className="rank">{i + 1}</span></td><td>{a.zone.name}{!a.funded && <span className="muted"> · not funded</span>}</td><td className="n">{n0(a.weeklyTrips)}</td><td className="n">{a.perDollar.toFixed(2)}</td></tr>))}</tbody>
                    </table></div>
                    <p className="small muted" style={{ marginTop: 10 }}>Trips <Tag kind="real" /> Visits <Tag kind="sim" /></p>
                    {r.areas.length > 5 && <button type="button" className="link" style={{ background: 'none', border: 0, padding: 0, marginTop: 8, cursor: 'pointer' }} onClick={() => setAll(!all)}>{all ? 'Show top 5' : `Show all ${r.areas.length} areas`}</button>}
                  </div>
                </div>)}
            </section>

            <section className="card stack">
              <div><h2 className="h3">What the rider sees</h2><p className="small muted" style={{ marginTop: 4 }}>Four moments in the ride app, from offer to credit.</p></div>
              <div className="phones">
                <div className="phone"><p className="cap">1 · Home screen</p><div className="mapbit" />
                  <div className="offer"><b>{store.name}</b><span className="muted">Get up to {usd2(credit)} back in ride credit when you check in.</span><span className="spons">Sponsored</span></div></div>
                <div className="phone"><p className="cap">1 · Or in search</p><div className="sbox">{store.name.slice(0, 9)}|</div>
                  <div className="offer"><b>{store.name}</b><span className="muted">Get up to {usd2(credit)} back in ride credit when you check in.</span><span className="spons">Sponsored</span></div>
                  <div className="srow"><b>Another place nearby</b><span className="muted">Regular result</span></div></div>
                <div className="phone"><p className="cap">2 · After drop-off</p><p className="mt">You have arrived at {store.name}</p>
                  <p className="ml">Tap "I am here" within {window_} minutes to get your credit.</p><span className="mbtn">I am here</span>
                  <p className="mf">We check your location only when you tap "I am here." We do not track you after your ride.</p></div>
                <div className="phone"><p className="cap">3 · Confirmed</p><span className="done-ico" aria-hidden="true">✓</span><p className="mt">Visit confirmed</p>
                  <p className="ml">{usd2(credit)} has been added to your ride credit.</p><span className="mbtn">Done</span></div>
              </div>
              <h3 className="h3" style={{ fontSize: 15 }}>If check-in does not work</h3>
              <div className="msgs">
                <div className="msg"><p className="mt">We could not confirm your location</p><p className="ml">Scan the code at the store entrance instead.</p><span className="mbtn ghost">Scan code</span></div>
                <div className="msg"><p className="mt">The check-in window has ended</p><p className="ml">Offers need a check-in within {window_} minutes of arrival.</p><span className="mbtn ghost">Close</span></div>
                <div className="msg"><p className="mt">Turn on location to check in</p><p className="ml">We use your location only at the moment you tap "I am here."</p><span className="mbtn ghost">Open settings</span></div>
              </div>
            </section>

            <section className="card stack">
              <h2 className="h3">How payment works</h2>
              <ol className="steps">
                <li>The rider sees the offer and books a ride to the store.</li>
                <li>At the store, the rider taps "I am here" within {window_} minutes of arriving.</li>
                <li>The app confirms the visit and adds the discount to the rider's ride credit.</li>
                <li>The sponsor pays a fixed fee for each confirmed visit, whether or not the rider buys.</li>
              </ol>
              <p className="small">Each ride counts once. Visits are checked against the ride, the time and the phone location.</p>
              <p className="small muted">A visit does not mean the rider bought something. It also does not mean the rider would have stayed home without the offer.</p>
            </section>

            <section className="card">
              <div className="chart-head"><div><h2 className="h3">How to check this for real</h2><p className="small muted">A simple test a store and the platform could run to measure whether the offer causes visits.</p></div><Tag kind="est" /></div>
              <div className="kpis four">
                <div><p className="small muted">Areas with the offer</p><p className="num sm">{plan.areasEach}</p></div>
                <div><p className="small muted">Areas without it, for comparison</p><p className="num sm">{plan.areasEach}</p><p className="small muted">similar trip volume</p></div>
                <div><p className="small muted">How long</p><p className="num sm">{plan.weeks} weeks</p></div>
                <div><p className="small muted">Smallest change it can spot</p><p className="num sm">{Math.round(plan.mde * 100)}%</p></div>
              </div>
              <p className="small" style={{ marginTop: 16 }}><b>What to compare:</b> rides that end at the store from areas with the offer and from areas without it. Rides to the store's zone stand in for rides to its door.</p>
              <div className="row" style={{ marginTop: 16 }}>
                <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(planText)}>Copy test plan</button>
                <Link className="btn" to="/prove">Check the design in Prove</Link>
              </div>
            </section>

            <Advanced title="Advanced: how visits are confirmed">
              <p>A visit counts when four things match: the ride, the time since arrival, the phone location at the store, and a single check-in per ride. Where location is not accurate enough, such as inside malls, the rider scans a code at the entrance instead. The code changes regularly, so a photo of it cannot be reused.</p>
            </Advanced>
            <Advanced title="Advanced: technical names">
              <p>Starting areas are origin zones. Extra visits are incremental visits. Platform cost after sponsor fees is net platform cost. Fee per confirmed visit is a cost-per-visit price. How to check this for real is a holdout test with matched control zones. Smallest change it can spot is the minimum detectable effect.</p>
              <p style={{ marginTop: 8 }}>Sources: {Object.values(data.sources).join('. ')}. The visit rate with no offer ({store.kind === 'mall' ? '8' : '4'} percent), the share who check in in time and the drop in effect with distance are placeholders until the Assumptions page.</p>
            </Advanced>
          </>}
        </div>
      </div>
      {r && <Strip a={['Visits per sponsor $', r.extraPerDollar.toFixed(2)]} b={['Platform cost', usd(r.platformCost)]} kind="sim" />}
    </ModuleFrame>
  );
}
