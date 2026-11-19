import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Tag, type Kind } from '../components';
import { useJson } from '../useJson';

const Page = ({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: ReactNode }) => (
  <main className="wrap">
    <div className="mod-head"><p className="eyebrow">{eyebrow}</p><h1 className="h2">{title}</h1><p className="lead" style={{ marginTop: 12, fontSize: 17 }}>{lead}</p></div>
    <div className="results" style={{ paddingBottom: 80 }}>{children}</div>
  </main>
);

const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="table-wrap"><table className="table">
    <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
  </table></div>
);

export function Assumptions() {
  const rows: [string, string, string, string][] = [
    ['Target', 'Total offer budget', '$10,000', 'Placeholder. Small enough that the budget, not the cutoff, limits how many riders get the offer.'],
    ['Target', 'Discount size', '20%', 'Placeholder for a typical mid-size offer.'],
    ['Target', 'How many riders get it', 'Top 30%', 'Placeholder. The budget usually stops the offer first.'],
    ['Target', 'Profit per ride', '$4.50', 'Placeholder. Real platform margins are not public, so this is an illustration.'],
    ['Target', 'Average fare', '$20', 'Placeholder used to turn the discount into dollars.'],
    ['Target', 'Riders who use the offer', '20%', 'Placeholder. Cost is a fixed amount for each rider reached. See the note below.'],
    ['Sponsor', 'Sponsor budget', '$8,000', 'Placeholder for a 4-week campaign.'],
    ['Sponsor', 'Fee per confirmed visit', '$6.00', 'Placeholder. In a real launch the fee must cover the rider credit plus platform costs.'],
    ['Sponsor', 'Rider credit', '$5.00', 'Open question. To be set with the platform. Placeholder for now.'],
    ['Sponsor', 'Check-in window', '15 minutes', 'Open question. To be set with the platform. Placeholder for now.'],
    ['Sponsor', 'How far riders can start from', '2.5 miles', 'Placeholder for a short trip in the city.'],
    ['Sponsor', 'Extra visits from the offer', '12%', 'An assumption. No public source gives a visit lift for a ride credit. The holdout test would measure it.'],
    ['Sponsor', 'Visits with no offer', '4% store, 8% mall', 'Placeholder. A mall counts a visit to any store, so it is higher.'],
    ['Sponsor', 'Check-in completion', '1 minus e to the power of minus window over 12 minutes', 'Placeholder shape. A longer window lets more riders check in.'],
    ['Sponsor', 'Effect by distance', '1 at the store, 0.5 at the edge', 'Placeholder. Riders who start closer are assumed to respond more.'],
    ['Prove', 'Real effect of the offer', '+5%', 'Set by the visitor. This is the answer both tests try to find.'],
    ['Prove', 'Cars per ride request', '2.0, 1.3 or 1.08', 'Placeholders for Many, Some and Few. No public data shows real driver supply.'],
    ['Prove', 'Ride requests', '400 per 15 minutes in the city', 'Placeholder. Demand is flat across the day.'],
    ['Prove', 'Spill over between areas', '1 in 5 idle cars', 'Placeholder for how far a free car can reach.'],
    ['Prove', 'Carry over after a switch', '25%', 'Placeholder. Demand in the first 15 minutes after a switch still partly follows the old setting.'],
  ];
  return (
    <Page eyebrow="Assumptions" title="Every default and why it is there" lead="Ridelta uses public data where it exists. Where no public data exists, a stated assumption stands in. Anything that depends on an assumption is labeled Simulated.">
      <section className="card"><Table head={['Module', 'Setting', 'Default', 'Reason and status']} rows={rows.map(r => [r[0], r[1], <span className="num sm" style={{ fontSize: 14 }}>{r[2]}</span>, r[3]])} /></section>
      <section className="card grid2">
        <div><h2 className="h3">Why Target uses a fixed cost per rider</h2><p className="small muted" style={{ marginTop: 8 }}>The first version charged the offer on every ride a reached rider takes. Under that rule, picking riders the offer moves gained about 0 percent over random at the same spend, because riders with high uplift also ride more. A fixed cost per rider reached is the usual rule in uplift marketing, so Ridelta uses it. The result depends on this choice, which is why Target is labeled Estimated.</p></div>
        <div><h2 className="h3">What to change first</h2><p className="small muted" style={{ marginTop: 8 }}>Rider credit and the check-in window are open questions. The visit lift is the largest assumption in Sponsor. The cars per request are the largest assumption in Prove. Move these levers on each page to see how much the answer depends on them.</p></div>
      </section>
    </Page>
  );
}

export function DataMethod() {
  const rows: [string, string, string, string, Kind][] = [
    ['Hillstrom email test', '64,000 customers, one email campaign, 2008. Randomized: men\'s email, women\'s email or no email.', 'No formal license. Published for a public challenge. Ridelta publishes only aggregate curve points, not rows.', 'Target', 'real'],
    ['NYC for-hire trip records', 'High-volume file, September 2025, all operators combined. Only pickup zone, drop-off zone and counts are used.', 'Public records from the NYC Taxi and Limousine Commission.', 'Sponsor', 'real'],
    ['NYC taxi zones', '263 zones with names and boundaries.', 'Public records from the NYC Taxi and Limousine Commission.', 'Sponsor', 'real'],
    ['Overture Maps Places', 'Release 2026-10-21.0. Ten store types and shopping centers in New York City, confidence 0.9 or higher. 175 places.', 'CDLA Permissive 2.0 and Apache 2.0. No share-alike duty.', 'Sponsor', 'real'],
    ['Visit lift and the Prove simulator', 'Set by stated assumptions. Not measured.', 'Not applicable.', 'Sponsor, Prove', 'sim'],
  ];
  return (
    <Page eyebrow="Data and method" title="Where the numbers come from" lead="Each source, its coverage and its license. Each Real label traces to a row here.">
      <section className="card"><Table head={['Source', 'What it holds', 'License and use', 'Used in', 'Label']} rows={rows.map(r => [<b>{r[0]}</b>, r[1], r[2], r[3], <Tag kind={r[4]} />])} /></section>
      <section className="card stack">
        <h2 className="h3">Target</h2>
        <p className="small muted">An email stands in for a ride offer and a site visit stands in for a ride. The test is randomized, so on a held-out half of the data the visit rate of treated riders minus the visit rate of control riders is a fair measure of uplift inside any group. Two gradient boosting models, one fit on treated riders and one on control riders, rank riders by predicted uplift. A third model ranks riders by visit likelihood. The script checks that the uplift ranking beats random at 30 percent. The page shows cumulative uplift in 5 percent steps and applies a cost rule from the Assumptions page.</p>
        <h2 className="h3">Sponsor</h2>
        <p className="small muted">Trips from each starting zone to the store's zone give the weekly volume. Each area gets a simulated extra visit rate from the assumed lift, the distance and the check-in window. Areas are ranked by extra visits per sponsor dollar and the budget is spent down the ranking. The sponsor pays the fee for every confirmed visit, caused by the offer or not. The test plan pairs the busiest areas by volume and finds the shortest test that can detect a 10 percent change, using two Poisson counts with 80 percent power. Rides to the store's zone stand in for rides to its door, which no public source gives.</p>
        <h2 className="h3">Prove</h2>
        <p className="small muted">Ride requests and cars are drawn at random every 15 minutes. Each area serves its own requests, then a share of idle cars serves other areas. The real effect is the effect on completed rides if the offer ran for everyone, so the model finds the demand lift that gives the effect you set. The group split test splits riders inside each area. The hour-by-hour test switches whole areas on and off. Each result averages 8 to 20 runs with a fixed seed.</p>
        <h2 className="h3">What this does not show</h2>
        <p className="small muted">No real ride offer experiment is public, so Target shows the method on marketing data. No public source gives confirmed visits caused by a ride, so Sponsor stays Simulated. No public data shows real driver supply, so Prove stays Simulated. A larger uplift dataset, Criteo, is not used because its license does not allow commercial use or sharing under other terms.</p>
      </section>
    </Page>
  );
}

type H = { target: { gainVsRandom: number }; sponsor: { store: string; perDollar: number; funded: number }; prove: { truth: number; ab: number; sb: number; abOff: number; sbOff: number } };

export function CaseStudy() {
  const { data: h } = useJson<H>('data/headlines.json');
  const pts = (v: number) => (v * 100).toFixed(1);
  return (
    <Page eyebrow="Case study" title="More rides from every incentive dollar" lead="A ride marketplace spends heavily on rider offers. Much of that money reaches riders who would have ridden anyway. Ridelta shows three ways to get more from the same spend.">
      <section className="card stack">
        <p className="eyebrow">1 · Target</p><h2 className="h3">Pick riders the offer moves</h2>
        <p className="muted">Ranking riders by how much an offer changes what they do, not by how likely they are to ride, brings {h ? `${Math.round(h.target.gainVsRandom * 100)} percent` : 'more'} more extra rides than random at the same spend. <Tag kind="est" /> The result depends on a cost rule that is an assumption, and under a different rule the gain shrinks. The Assumptions page shows both.</p>
        <Link className="btn" to="/target" style={{ alignSelf: 'flex-start' }}>Open Target</Link>
      </section>
      <section className="card stack">
        <p className="eyebrow">2 · Sponsor</p><h2 className="h3">Let stores pay for the visits they want</h2>
        <p className="muted">A sponsor pays a fixed fee for each confirmed visit. For {h ? h.sponsor.store : 'the default store'} the budget reaches {h ? h.sponsor.funded : 'a few'} starting areas and brings {h ? h.sponsor.perDollar.toFixed(2) : 'some'} extra visits per sponsor dollar. <Tag kind="sim" /> The visit lift is an assumption, so the page ends with a plan for measuring it.</p>
        <Link className="btn" to="/sponsor" style={{ alignSelf: 'flex-start' }}>Open Sponsor</Link>
      </section>
      <section className="card stack">
        <p className="eyebrow">3 · Prove</p><h2 className="h3">Measure it with a test that does not mislead</h2>
        <p className="muted">When cars are scarce, riders with the offer take cars from other riders. {h ? `With few cars, a group split test reads ${pts(h.prove.abOff)} points too high against a real effect of ${pts(h.prove.truth)} percent. An hour-by-hour test is off by ${pts(h.prove.sbOff)} points.` : 'A group split test reads too high.'} <Tag kind="sim" /> The hour-by-hour test is closer but not exact, because areas share cars.</p>
        <Link className="btn" to="/prove" style={{ alignSelf: 'flex-start' }}>Open Prove</Link>
      </section>
      <section className="card"><h2 className="h3">How honest is it?</h2><p className="muted" style={{ marginTop: 8 }}>Every number carries a label: Real, Estimated or Simulated. No company financial figures are used. <Link className="link" to="/assumptions">Assumptions</Link> lists every default and <Link className="link" to="/data">Data and method</Link> lists every source.</p></section>
    </Page>
  );
}
