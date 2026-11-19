import { Link } from 'react-router-dom';
import { MODULES } from '../Layout';
import { Answer } from '../components';

// Titles and answers come from design/ui. The module bodies land with E3 to E5.
const COPY = [
  { title: 'Who should get a ride offer?', answer: 'Rank riders by how much an offer changes what they do, not by how likely they are to ride.' },
  { title: 'Which stores or malls should help pay for rides?', answer: 'A sponsor pays a fixed fee for each confirmed visit. The page ranks the starting areas most likely to bring new visitors.' },
  { title: 'Did the offer really work?', answer: 'A marketplace simulator runs a group split test and an hour-by-hour test, then compares both with the real effect.' },
];

export function ModulePage({ i }: { i: number }) {
  const { title, answer } = COPY[i], back = MODULES[i - 1], next = MODULES[i + 1];
  return (
    <main className="wrap">
      <div className="mod-head">
        <p className="eyebrow">Module {i + 1} of 3 · {MODULES[i].name}</p>
        <h1 className="h2">{title}</h1>
        <Answer>{answer}</Answer>
      </div>
      <section className="card" style={{ marginBottom: 24 }}><p className="muted">This module is not built yet.</p></section>
      <div className="row between" style={{ paddingBottom: 80 }}>
        {back ? <Link className="btn" to={back.path}>← Back: {back.name}</Link> : <Link className="btn" to="/">← Home</Link>}
        {next && <Link className="btn primary" to={next.path}>Next: {next.name} →</Link>}
      </div>
    </main>
  );
}
