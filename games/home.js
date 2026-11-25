/* زر «🏠 الرئيسية» لكل الألعاب:
   - إذا اللعبة مفتوحة داخل نافذة الموقع: يطلب من الصفحة الرئيسية تسد النافذة.
   - إذا مفتوحة لوحدها: يرجع لصفحة الموقع الرئيسية.
   بالألعاب اللي بيها شريط علوي (header) ينحط بالشريط، وبألعاب سكراتش يطفو بالزاوية. */
(function () {
  if (document.querySelector('.pg-home')) return;

  function goHome() {
    if (window.parent !== window) window.parent.postMessage({ type: 'close-game' }, '*');
    else location.href = '../index.html';
  }

  const header = document.querySelector('header');
  const st = document.createElement('style');
  st.textContent = `
  .pg-home{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:980px;
    border:none;background:var(--text,#1d1d1f);color:var(--white,#fff);font-family:var(--font,-apple-system,BlinkMacSystemFont,"Tajawal",Arial,sans-serif);
    font-size:15px;font-weight:600;cursor:pointer;direction:rtl;transition:opacity .2s ease,transform .15s ease}
  .pg-home:hover{opacity:.85}
  .pg-home:active{transform:scale(.95)}
  .pg-home:focus-visible{outline:3px solid #0071e3;outline-offset:3px}
  .pg-home.float{position:fixed;top:10px;right:10px;z-index:2147483647;opacity:.9;box-shadow:0 4px 14px rgba(0,0,0,.25)}
  ${header ? `header{flex-wrap:nowrap}
  header h1{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  header .stats{flex-shrink:0}` : ''}
  @media (prefers-reduced-motion: reduce){.pg-home{transition:none}}`;
  document.head.appendChild(st);

  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'pg-home' + (header ? '' : ' float');
  b.innerHTML = '<span aria-hidden="true">🏠</span>الرئيسية';
  b.setAttribute('aria-label', 'خروج والرجوع للصفحة الرئيسية');
  b.addEventListener('click', goHome);
  if (header) header.insertBefore(b, header.firstChild);
  else document.body.appendChild(b);
})();
