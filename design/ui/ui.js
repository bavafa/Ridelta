// Mockup behavior only: theme switch, levers closed on mobile (D15), lever values shown as you drag.
const root = document.documentElement;
try { const t = localStorage.getItem('ridelta-theme'); if (t) root.dataset.theme = t; } catch (e) {}
document.querySelectorAll('[data-theme-toggle]').forEach(b => b.onclick = () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('ridelta-theme', root.dataset.theme); } catch (e) {}
});
if (matchMedia('(max-width: 960px)').matches) document.querySelectorAll('details.levers').forEach(d => d.open = false);
document.querySelectorAll('input[type=range][data-fmt]').forEach(r => {
  const out = r.closest('.ctrl').querySelector('output');
  const show = () => out.textContent = r.dataset.fmt.replace('#', Number(r.value).toLocaleString('en-US', { minimumFractionDigits: +(r.dataset.dp || 0), maximumFractionDigits: +(r.dataset.dp || 0) }));
  r.addEventListener('input', () => { show(); if (r.form?.dataset.run) r.closest('.ctrl').classList.add('changed'); });
  show();
});
// Prove: segmented changes are marked too; Run clears the marks (D17).
document.querySelectorAll('form[data-run]').forEach(f => {
  f.addEventListener('change', e => { if (e.target.type === 'radio') e.target.closest('.ctrl').classList.add('changed'); });
  f.addEventListener('submit', e => { e.preventDefault(); f.querySelectorAll('.changed').forEach(c => c.classList.remove('changed')); });
});
