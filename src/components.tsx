import { type CSSProperties, type ReactNode, useState } from 'react';

const TAGS = { real: 'Real', est: 'Estimated', sim: 'Simulated' } as const;
export type Kind = keyof typeof TAGS;

/** Honesty label: shape plus word, never color alone (D8). */
export const Tag = ({ kind, style }: { kind: Kind; style?: CSSProperties }) => <span className={`tag ${kind}`} style={style}>{TAGS[kind]}</span>;

export const Kpi = ({ label, value, gold, note, kind }: { label: string; value: string; gold?: boolean; note?: string; kind: Kind }) => (
  <div className="kpi"><p className="label">{label}</p><p className={`num${gold ? ' gold' : ''}`}>{value}</p>
    <div className="meta"><span className="up">{note}</span><Tag kind={kind} /></div></div>
);

export const Answer = ({ children }: { children: ReactNode }) => <p className="answer">{children}</p>;

/** Closed by default (D31). */
export const Advanced = ({ title, children }: { title: string; children: ReactNode }) => (
  <details className="adv"><summary>{title}</summary><div>{children}</div></details>
);

/** Levers panel: open on desktop, closed on first visit on mobile (D15). */
export const Levers = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(() => !matchMedia('(max-width: 960px)').matches);
  return (
    <details className="levers" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
      <summary><span>Levers</span><span className="chev" aria-hidden="true">⌄</span></summary>
      <form className="body" onSubmit={e => e.preventDefault()}>{children}</form>
    </details>
  );
};

type CtrlProps = { label: string; help?: string; changed?: boolean };
const Ctrl = ({ label, help, changed, value, children }: CtrlProps & { value?: string; children: ReactNode }) => (
  <div className={`ctrl${changed ? ' changed' : ''}`}><div className="ctrl-top"><span>{label}</span>{value && <output>{value}</output>}</div>{children}{help && <p className="help">{help}</p>}</div>
);

/** fmt turns the value into display text, e.g. v => `$${v.toLocaleString()}`. */
export const Slider = ({ label, help, changed, min, max, step, value, onChange, fmt }: CtrlProps & {
  min: number; max: number; step: number; value: number; onChange: (v: number) => void; fmt: (v: number) => string;
}) => (
  <Ctrl label={label} help={help} changed={changed} value={fmt(value)}>
    <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} />
  </Ctrl>
);

export const Seg = ({ label, help, changed, options, value, onChange, grid }: CtrlProps & {
  options: string[]; value: string; onChange: (v: string) => void; grid?: boolean;
}) => (
  <Ctrl label={label} help={help} changed={changed}>
    <div className={`seg${grid ? ' four' : ''}`} role="radiogroup" aria-label={label}>
      {options.map(o => <label key={o}><input type="radio" name={label} checked={o === value} onChange={() => onChange(o)} />{o}</label>)}
    </div>
  </Ctrl>
);

export const Field = ({ label, help, changed, value, onChange }: CtrlProps & { value: string; onChange: (v: string) => void }) => (
  <Ctrl label={label} help={help} changed={changed}>
    <input className="field" type="text" inputMode="decimal" aria-label={label} value={value} onChange={e => onChange(e.target.value)} />
  </Ctrl>
);

/** Mobile result strip: two numbers and a label (D16). */
export const Strip = ({ a, b, kind }: { a: [string, string]; b: [string, string]; kind: Kind }) => (
  <div className="strip" aria-label="Key results">
    <div><p className="l">{a[0]}</p><p className="num gold">{a[1]}</p></div>
    <div><p className="l">{b[0]}</p><p className="num">{b[1]}</p></div>
    <Tag kind={kind} />
  </div>
);
