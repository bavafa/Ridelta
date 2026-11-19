// Mockup behavior only: levers closed on mobile (D15), lever values shown as you drag.
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
