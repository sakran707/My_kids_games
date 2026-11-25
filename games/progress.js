/* ══════════════════════════════════════════════════════════
   إنجازاتي — تقدّم مشترك لكل الألعاب التعليمية
   يُحفظ بالمتصفح (localStorage) لكل لاعب: النجوم، الجولات،
   الأجوبة الصحيحة، الأيام المتتالية، والشارات.
   ══════════════════════════════════════════════════════════ */
(function () {
  const KEY = 'progress-v1';
  const PLAYER_KEY = 'progress-player';
  const PLAYERS = ['مريم', 'احمد'];
  const GAMES = {
    multiply: { title: 'جدول الضرب', emoji: '🔢' },
    english: { title: 'كلمات إنكليزية', emoji: '🔤' },
    arabic: { title: 'الإملاء العربي', emoji: '✍️' },
    clock: { title: 'قراءة الساعة', emoji: '🕐' },
  };

  /* الشارات: id، رمز، اسم، طريقة الحصول، شرط */
  const BADGES = [
    ['first', '🌱', 'البداية', 'العب أول جولة', s => s.rounds >= 1],
    ['stars10', '⭐', 'جامع النجوم', 'اجمع 10 نجوم', s => s.stars >= 10],
    ['stars50', '🌟', 'نجم لامع', 'اجمع 50 نجمة', s => s.stars >= 50],
    ['stars100', '💫', 'نجم المجرّة', 'اجمع 100 نجمة', s => s.stars >= 100],
    ['perfect', '🎯', 'بلا أخطاء', 'جاوب 10 من 10 بجولة وحدة', s => s.perfect >= 1],
    ['explorer', '🧭', 'المستكشف', 'العب كل الألعاب التعليمية', s => Object.keys(GAMES).every(g => (s.games[g] || {}).rounds)],
    ['mulHero', '🔢', 'بطل الضرب', '3 نجوم بجدول الضرب', s => (s.games.multiply || {}).best3],
    ['enStar', '🔤', 'English Star', '3 نجوم بالكلمات الإنكليزية', s => (s.games.english || {}).best3],
    ['arKing', '✍️', 'ملك الإملاء', '3 نجوم بالإملاء العربي', s => (s.games.arabic || {}).best3],
    ['timeMaster', '🕐', 'سيد الوقت', '3 نجوم بقراءة الساعة', s => (s.games.clock || {}).best3],
    ['correct100', '📚', 'المجتهد', '100 جواب صحيح', s => s.correct >= 100],
    ['streak3', '🔥', 'ثلاث أيام', 'العب 3 أيام متتالية', s => s.bestStreak >= 3],
    ['streak7', '🏆', 'أسبوع كامل', 'العب 7 أيام متتالية', s => s.bestStreak >= 7],
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { players: {} }; } catch { return { players: {} }; }
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
  }
  function player() {
    try { const p = localStorage.getItem(PLAYER_KEY); return PLAYERS.includes(p) ? p : PLAYERS[0]; } catch { return PLAYERS[0]; }
  }
  function setPlayer(p) {
    try { localStorage.setItem(PLAYER_KEY, p); } catch {}
  }
  function blank() {
    return { rounds: 0, stars: 0, correct: 0, perfect: 0, games: {}, days: [], bestStreak: 0, badges: [] };
  }
  function stats(p) {
    const d = load();
    return Object.assign(blank(), d.players[p || player()] || {});
  }
  const today = () => {
    const t = new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  };
  function streakOf(days) {
    /* عدد الأيام المتتالية المنتهية اليوم أو البارحة */
    const set = new Set(days);
    const d = new Date();
    const fmt = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
    if (!set.has(fmt(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (set.has(fmt(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* تُستدعى بنهاية كل جولة. ترجع الشارات الجديدة */
  function record(game, r) {
    const d = load();
    const p = player();
    const s = Object.assign(blank(), d.players[p] || {});
    s.rounds++;
    s.stars += r.stars || 0;
    s.correct += r.correct || 0;
    if (r.total && r.correct === r.total) s.perfect++;
    const g = s.games[game] || { rounds: 0, stars: 0, best3: false };
    g.rounds++;
    g.stars += r.stars || 0;
    if (r.stars >= 3) g.best3 = true;
    s.games[game] = g;
    if (!s.days.includes(today())) s.days = s.days.concat(today()).slice(-60);
    s.bestStreak = Math.max(s.bestStreak, streakOf(s.days));
    const earned = BADGES.filter(b => b[4](s)).map(b => b[0]);
    const fresh = earned.filter(id => !s.badges.includes(id));
    s.badges = earned;
    d.players[p] = s;
    save(d);
    return fresh.map(id => BADGES.find(b => b[0] === id));
  }

  /* أنماط مشتركة (تعتمد على نفس متغيرات الألوان بالموقع والألعاب) */
  const css = `
  .pg-players{display:flex;justify-content:center;gap:8px;margin:14px 0 4px;flex-wrap:wrap}
  .pg-chip{min-height:44px;padding:0 18px;border-radius:980px;border:1px solid var(--line);background:var(--white);color:var(--text);
    font-family:var(--font);font-size:16px;cursor:pointer;transition:background .2s ease,color .2s ease,border-color .2s ease,transform .15s ease}
  .pg-chip:hover{border-color:var(--text-2)}
  .pg-chip:active{transform:scale(.96)}
  .pg-chip[aria-pressed="true"]{background:var(--text);border-color:var(--text);color:var(--white)}
  .pg-new{margin-top:16px;background:var(--white);border:1px solid var(--line);border-radius:16px;padding:14px 16px}
  .pg-new h3{font-size:15px;font-weight:600;margin-bottom:10px}
  .pg-new ul{list-style:none;display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
  .pg-new li{display:flex;align-items:center;gap:8px;background:var(--gray-bg);border-radius:12px;padding:8px 12px;font-weight:600;animation:pgPop .5s ease backwards}
  .pg-new li span{font-size:24px}
  @keyframes pgPop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.08)}100%{opacity:1;transform:none}}
  @media (prefers-reduced-motion: reduce){.pg-new li{animation:none}.pg-chip{transition:none}}
  `;
  function injectCSS() {
    if (document.getElementById('pg-css')) return;
    const st = document.createElement('style');
    st.id = 'pg-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* أزرار اختيار اللاعب */
  function mountPlayerPicker(el, onChange) {
    injectCSS();
    el.classList.add('pg-players');
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'من يلعب؟');
    el.innerHTML = '';
    PLAYERS.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pg-chip';
      b.textContent = (p === 'مريم' ? '👧 ' : '👦 ') + p;
      b.setAttribute('aria-pressed', p === player() ? 'true' : 'false');
      b.addEventListener('click', () => {
        setPlayer(p);
        el.querySelectorAll('.pg-chip').forEach((c, i) => c.setAttribute('aria-pressed', PLAYERS[i] === p ? 'true' : 'false'));
        if (onChange) onChange(p);
      });
      el.appendChild(b);
    });
  }

  /* عرض الشارات الجديدة بشاشة النهاية */
  function celebrate(el, fresh) {
    injectCSS();
    el.innerHTML = '';
    el.hidden = !fresh.length;
    if (!fresh.length) return;
    el.className = 'pg-new';
    const h = document.createElement('h3');
    h.textContent = '🏅 شارة جديدة لـ' + player() + '!';
    const ul = document.createElement('ul');
    fresh.forEach((b, i) => {
      const li = document.createElement('li');
      li.style.animationDelay = (i * 0.15) + 's';
      const e = document.createElement('span');
      e.textContent = b[1];
      li.append(e, document.createTextNode(b[2]));
      ul.appendChild(li);
    });
    el.append(h, ul);
  }

  window.Progress = { PLAYERS, GAMES, BADGES, player, setPlayer, stats, record, streakOf, mountPlayerPicker, celebrate };
})();
