import { type ReactNode, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export const MODULES = [
  { path: '/target', name: 'Target' },
  { path: '/sponsor', name: 'Sponsor' },
  { path: '/prove', name: 'Prove' },
];
// shortcut: these pages are not built yet (E6), so they link home. Point them at real routes in E6.
const ABOUT = ['Assumptions', 'Data and method', 'Case study'];

const Logo = () => (
  <Link className="logo" to="/" aria-label="Ridelta home">
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 L28 20 H4 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /><circle cx="16" cy="22" r="4.2" fill="var(--paper)" stroke="var(--data)" strokeWidth="3" /></svg>
    <span className="word">Ridelta</span>
  </Link>
);

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isModule = MODULES.some(m => m.path === pathname);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <header className="top"><div className="wrap">
        <Logo />
        <nav className="nav" aria-label="Modules">{MODULES.map(m => <NavLink key={m.path} to={m.path}>{m.name}</NavLink>)}</nav>
        <nav className="nav-right" aria-label="About the data">{ABOUT.map(a => <Link key={a} to="/">{a}</Link>)}</nav>
        {/* key remounts the menu on navigation, which closes it */}
        <details className="menu" key={pathname}><summary>Menu</summary><nav aria-label="Site">
          <Link to="/">Home</Link>{MODULES.map(m => <Link key={m.path} to={m.path}>{m.name}</Link>)}{ABOUT.map(a => <Link key={a} to="/">{a}</Link>)}
        </nav></details>
      </div></header>
      {isModule && <nav className="tabs" aria-label="Modules">{MODULES.map(m => <NavLink key={m.path} to={m.path}>{m.name}</NavLink>)}</nav>}
      {children}
      <footer className="foot"><div className="wrap"><span>Ridelta · a portfolio project</span>
        <a href="https://github.com/bavafa/Ridelta">Source code</a></div></footer>
    </>
  );
}
