import { Link } from 'react-router-dom';
import { Tag, type Kind } from '../components';
import { useJson } from '../useJson';

type H = { target: { gainVsRandom: number; extra: { random: number; likely: number; moved: number } }; sponsor: { perDollar: number };
  prove: { truth: number; ab: number; sb: number; abOff: number; sbOff: number } };
const n0 = (v: number) => Math.round(v).toLocaleString('en-US');

// Numbers come from public/data/headlines.json, built from each module's defaults (S2.2). Chart markup is trusted static SVG.
function cards(h: H | null): { eyebrow: string; title: string; one: string; num: string; what: string; kind: Kind; to: string; svg: string }[] {
  const e = h?.target.extra, w = (v: number) => (e ? Math.round((v / e.moved) * 198) : 0);
  const pv = h?.prove, vals = pv ? [pv.truth, pv.ab, pv.sb].map(v => v * 100) : [0, 0, 0];
  const lo = Math.floor(Math.min(...vals) - 1), hi = Math.max(Math.ceil(Math.max(...vals) + 1), lo + 4), x = (v: number) => 20 + ((v * 100 - lo) / (hi - lo)) * 260;
  return [
    {
      eyebrow: 'Target', title: 'Who should get an offer?', to: '/target', kind: 'est', num: h ? `+${Math.round(h.target.gainVsRandom * 100)}%` : '…',
      one: 'Rank riders by how much an offer changes what they do, not by how likely they are to ride.',
      what: 'extra rides compared with giving the offer to riders at random, at the same budget',
      svg: e ? `<svg class="chart mini" viewBox="0 0 300 92" role="img" aria-label="Extra rides by way of picking. Random ${n0(e.random)}. Likely riders ${n0(e.likely)}. Moved by offer ${n0(e.moved)}.">
      <text class="t" x="0" y="16">Random</text><rect x="100" y="6" width="${w(e.random)}" height="14" rx="3" fill="var(--base)"/>
      <text class="t" x="0" y="46">Likely riders</text><rect x="100" y="36" width="${w(e.likely)}" height="14" rx="3" fill="var(--base)"/>
      <text class="tl" x="0" y="76">Moved by offer</text><rect x="100" y="66" width="${w(e.moved)}" height="14" rx="3" fill="var(--data)"/></svg>` : '',
    },
    {
      eyebrow: 'Sponsor', title: 'Who else can share the cost?', to: '/sponsor', kind: 'sim', num: h ? h.sponsor.perDollar.toFixed(2) : '…',
      one: 'Stores and malls help pay for rides that bring new visitors. They pay a fixed fee for each confirmed visit.',
      what: 'extra store visits per sponsor dollar',
      svg: `<svg class="chart mini" viewBox="0 0 300 92" role="img" aria-label="Small map of starting areas, top areas near the store marked">
      <defs><pattern id="h1" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="var(--data-soft)"/><line y2="5" stroke="var(--data)" stroke-width="2"/></pattern></defs>
      <g stroke="var(--surface)" stroke-width="2">
        <rect x="40" y="4" width="50" height="40" fill="var(--sunk)"/><rect x="90" y="4" width="60" height="40" fill="url(#h1)"/><rect x="150" y="4" width="55" height="40" fill="var(--base)" opacity=".6"/><rect x="205" y="4" width="55" height="40" fill="var(--sunk)"/>
        <rect x="40" y="44" width="50" height="44" fill="var(--base)" opacity=".6"/><rect x="90" y="44" width="60" height="44" fill="url(#h1)"/><rect x="150" y="44" width="55" height="44" fill="url(#h1)"/><rect x="205" y="44" width="55" height="44" fill="var(--sunk)"/>
      </g><circle cx="150" cy="44" r="6" fill="var(--action)" stroke="var(--surface)" stroke-width="2"/></svg>`,
    },
    {
      eyebrow: 'Prove', title: 'Does the test tell the truth?', to: '/prove', kind: 'sim', num: pv ? `${(pv.abOff * 100).toFixed(1)} vs ${(pv.sbOff * 100).toFixed(1)}` : '…',
      one: 'When cars are scarce, a group split test can mislead. An hour-by-hour test gets closer to the real effect.',
      what: 'points off the real effect with few cars: group split test, then hour-by-hour test',
      svg: pv ? `<svg class="chart mini" viewBox="0 0 300 92" role="img" aria-label="Real effect ${(pv.truth * 100).toFixed(1)} percent. Hour-by-hour test ${(pv.sb * 100).toFixed(1)}. Group split test ${(pv.ab * 100).toFixed(1)}.">
      <line class="axis" x1="10" y1="50" x2="290" y2="50" stroke-width="2"/>
      <rect x="${x(pv.sb) - 6}" y="44" width="12" height="12" fill="var(--data)"/>
      <rect x="${x(pv.truth) - 6}" y="44" width="12" height="12" transform="rotate(45 ${x(pv.truth)} 50)" fill="var(--ink)"/>
      <circle cx="${x(pv.ab)}" cy="50" r="6" fill="var(--surface)" stroke="var(--ink-2)" stroke-width="2"/>
      <text class="t" x="${x(pv.truth)}" y="30" text-anchor="middle">◆ real</text><text class="t" x="${x(pv.ab)}" y="30" text-anchor="middle">○ group split</text>
      <text class="t" x="${x(pv.sb)}" y="80" text-anchor="middle">■ hour-by-hour</text></svg>` : '',
    },
  ];
}

export default function Landing() {
  const { data: h } = useJson<H>('data/headlines.json');
  return (
    <main>
      <section className="hero"><div className="wrap">
        <p className="eyebrow">A portfolio project in marketplace analytics</p>
        <h1 className="h1">More rides from every incentive dollar.</h1>
        <p className="lead">A ride marketplace gives riders offers to book more rides. Some riders change their plans because of an offer. Others would ride anyway. Ridelta shows how to aim offers at the first group, share the cost with stores and prove the result.</p>
        <div className="row"><a className="btn primary" href="#results" onClick={e => { e.preventDefault(); document.getElementById('results')?.scrollIntoView(); }}>See the results</a><Link className="btn" to="/target">Try the model</Link></div>
        <div className="legend" aria-label="What the labels mean">
          <div><Tag kind="real" /> public data as published</div>
          <div><Tag kind="est" /> a model fit on real data</div>
          <div><Tag kind="sim" /> from stated assumptions</div>
        </div>
      </div></section>

      <section className="landing-results" id="results"><div className="wrap">
        <div className="row between"><div><p className="eyebrow">Headline results</p><h2 className="h2" style={{ marginTop: 8 }}>Three questions, three answers</h2></div><span className="sample-note">Sample values, not results</span></div>
        <div className="grid3">
          {cards(h).map(c => (
            <article className="card rcard" key={c.to}>
              <p className="eyebrow">{c.eyebrow}</p>
              <h3 className="h3">{c.title}</h3>
              <p className="muted one">{c.one}</p>
              <div><p className="num gold">{c.num}</p><p className="what">{c.what}</p></div>
              <div dangerouslySetInnerHTML={{ __html: c.svg }} />
              <Tag kind={c.kind} style={{ alignSelf: 'flex-start' }} />
              <Link className="btn" to={c.to}>Open {c.eyebrow}</Link>
            </article>
          ))}
        </div>
      </div></section>

      <section className="flow"><div className="wrap">
        <p className="eyebrow">How the modules connect</p>
        <ol>
          <li><p className="h3">Target</p><p className="muted small" style={{ marginTop: 4 }}>Decides who gets an offer.</p></li>
          <li><p className="h3">Sponsor</p><p className="muted small" style={{ marginTop: 4 }}>Decides who helps pay for it.</p></li>
          <li><p className="h3">Prove</p><p className="muted small" style={{ marginTop: 4 }}>Checks whether it worked.</p></li>
        </ol>
      </div></section>

      <section className="honest"><div className="wrap"><div className="card">
        <div style={{ maxWidth: 640 }}><h2 className="h2">What is real and what is not</h2><p className="muted" style={{ marginTop: 8 }}>Ridelta uses public data and stand-in data. It uses no company financial figures. Every default has a stated reason.</p></div>
        <div className="row"><Link className="btn" to="/assumptions">Assumptions</Link><Link className="btn" to="/data">Data and method</Link></div>
      </div></div></section>
    </main>
  );
}
