import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MODULES } from '../Layout';
import { Answer } from '../components';

// Titles and answers come from design/ui.
const COPY = [
  { title: 'Who should get a ride offer?', answer: 'Rank riders by how much an offer changes what they do, not by how likely they are to ride.' },
  { title: 'Which stores or malls should help pay for rides?', answer: 'A sponsor pays a fixed fee for each confirmed visit. The page ranks the starting areas most likely to bring new visitors.' },
  { title: 'Does the test tell the truth?', answer: 'A marketplace simulator runs a group split test and an hour-by-hour test, then compares both with the real effect.' },
];

/** Shared module frame (D13): question, answer, source, then the page body, then Back and Next. */
export function ModuleFrame({ i, answer, source, children }: { i: number; answer?: ReactNode; source?: ReactNode; children: ReactNode }) {
  const { title } = COPY[i], back = MODULES[i - 1], next = MODULES[i + 1];
  return (
    <main className="wrap">
      <div className="mod-head">
        <p className="eyebrow">Module {i + 1} of 3 · {MODULES[i].name}</p>
        <h1 className="h2">{title}</h1>
        <Answer>{answer ?? COPY[i].answer}</Answer>
        {source && <p className="source">{source}</p>}
      </div>
      {children}
      <div className="row between" style={{ paddingBottom: 80 }}>
        {back ? <Link className="btn" to={back.path}>← Back: {back.name}</Link> : <Link className="btn" to="/">← Home</Link>}
        {next ? <Link className="btn primary" to={next.path}>Next: {next.name} →</Link> : <Link className="btn primary" to="/case-study">Read the case study →</Link>}
      </div>
    </main>
  );
}
