/* Simple single-file SPA for the QA tapping game */

(function () {
  const APP = document.getElementById('app');

  const ROUTE = {
    LANDING: 'landing',
    GAME: 'game',
    SUMMARY: 'summary',
  };

  const MAX_CORRECT = 10;
  const MAX_TAPS = 11;
  const MAX_SECONDS = 60;

  const state = {
    route: ROUTE.LANDING,
    tapsRemaining: MAX_TAPS,
    secondsRemaining: MAX_SECONDS,
    foundHotspotIds: new Set(),
    totalValid: 0,
    timer: null,
    debug: !!window.NEXUS_DEBUG,
  };

  function navigate(route, extra) {
    state.route = route;
    // Toggle illustration background for landing/summary/game backgrounds
    const isPurple = route === ROUTE.LANDING || route === ROUTE.SUMMARY || route === ROUTE.GAME;
    document.body.classList.toggle('theme-purple', isPurple);
    if (route === ROUTE.LANDING) renderLanding();
    if (route === ROUTE.GAME) renderGame();
    if (route === ROUTE.SUMMARY) renderSummary(extra);
  }

  function resetGameState() {
    state.tapsRemaining = MAX_TAPS;
    state.secondsRemaining = MAX_SECONDS;
    state.foundHotspotIds = new Set();
    state.totalValid = 0;
    clearInterval(state.timer);
    state.timer = null;
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.appendChild(c));
    return node;
  }

  function renderLanding() {
    clearInterval(state.timer);
    APP.innerHTML = '';
    const stack = el('div', { class: 'stack' });
    const logo = el('img', { class: 'brand', src: './fx-digital-logo.svg', alt: 'FX Digital' });
    const card = el('div', { class: 'card solid' });
    card.appendChild(el('h1', { class: 'title center', html: 'Spot the 10 mistakes' }));
    card.appendChild(
      el('p', {
        class: 'muted',
        html: 'A quick QA challenge on a mock TV app screen. Identify all UI/content issues before time or taps run out.',
      })
    );

    const rules = el('div', { class: 'rules' });
    rules.innerHTML = `
      <strong>Rules</strong>
      <ol>
        <li>Can you identify all <strong>10 mistakes</strong> correctly in the next screenshot?</li>
        <li>Tap on the screen to lock in your suggestion.</li>
        <li>You have <strong>30 seconds</strong> and only <strong>11 taps</strong> - there's only room for one mistake, so tap carefully and quickly.</li>
      </ol>`;
    card.appendChild(rules);

    const actions = el('div', { class: 'actions' });
    const startBtn = el('button', { class: 'btn btn-lg', html: 'Start Game', onClick: () => navigate(ROUTE.GAME) });
    actions.appendChild(startBtn);
    card.appendChild(actions);

    stack.appendChild(logo);
    stack.appendChild(card);
    APP.appendChild(stack);
  }

  function startTimer(onExpire) {
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      state.secondsRemaining -= 1;
      if (state.secondsRemaining <= 0) {
        clearInterval(state.timer);
        onExpire();
      }
      // Update UI tick
      const secEl = document.querySelector('[data-sec]');
      if (secEl) secEl.textContent = `${Math.max(state.secondsRemaining, 0)}s`;
    }, 1000);
  }

  function pointFromEvent(evt, rect) {
    const x = ((evt.clientX - rect.left) / rect.width) * 100;
    const y = ((evt.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  }

  function isInside(h, p) {
    return p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h;
  }

  function showFeedback(stage, p, ok) {
    const badge = el('div', { class: `feedback ${ok ? 'good' : 'bad'}` });
    badge.textContent = ok ? '+1' : '×';
    badge.style.left = p.x + '%';
    badge.style.top = p.y + '%';
    stage.appendChild(badge);
    setTimeout(() => badge.remove(), 800);
  }

  function endGame() {
    clearInterval(state.timer);
    navigate(ROUTE.SUMMARY, { score: state.totalValid });
  }

  function renderGame() {
    resetGameState();
    APP.innerHTML = '';
    const card = el('div', { class: 'card wide' });

    const bar = el('div', { class: 'bar' });
    const sec = el('span', { class: 'pill', html: `⏱ <span data-sec>${state.secondsRemaining}s</span>` });
    const taps = el('span', { class: 'pill', html: `🖱 Taps: <strong data-taps>${state.tapsRemaining}</strong>` });
    const found = el('span', { class: 'pill good', html: `✔ Found: <strong data-found>0</strong> / ${MAX_CORRECT}` });
    bar.append(sec, taps, found, el('span', { class: 'muted', html: state.debug ? '<span class="kbd">D</span>ebug on' : '' }));
    card.appendChild(bar);

    const stage = el('div', { class: 'stage' });
    const img = el('img', { src: './FigmaRef.png', alt: 'TV App Mock' });
    stage.appendChild(img);

    // Optional debug rectangles
    if (state.debug) {
      window.NEXUS_HOTSPOTS.forEach((h) => {
        const hs = el('div', { class: 'hotspot' });
        Object.assign(hs.style, {
          left: h.x + '%', top: h.y + '%', width: h.w + '%', height: h.h + '%',
        });
        stage.appendChild(hs);
      });
    }

    stage.addEventListener('click', (evt) => {
      if (state.tapsRemaining <= 0 || state.secondsRemaining <= 0) return;
      state.tapsRemaining -= 1;
      const tapsEl = document.querySelector('[data-taps]');
      if (tapsEl) tapsEl.textContent = String(state.tapsRemaining);

      const rect = stage.getBoundingClientRect();
      const p = pointFromEvent(evt, rect);

      // Did we hit any not-yet-found hotspot?
      const hit = window.NEXUS_HOTSPOTS.find((h) => !state.foundHotspotIds.has(h.id) && isInside(h, p));
      const ok = !!hit;
      if (ok) {
        state.foundHotspotIds.add(hit.id);
        state.totalValid += 1;
        const foundEl = document.querySelector('[data-found]');
        if (foundEl) foundEl.textContent = String(state.totalValid);
      }
      showFeedback(stage, p, ok);

      const isOutOfResources = state.tapsRemaining <= 0 || state.secondsRemaining <= 0;
      const isAllFound = state.totalValid >= MAX_CORRECT;
      if (isOutOfResources || isAllFound) endGame();
    });

    card.appendChild(stage);

    const actions = el('div', { class: 'actions' });
    card.appendChild(actions);

    APP.appendChild(card);

    startTimer(() => endGame());
  }

  function renderSummary(extra) {
    APP.innerHTML = '';
    const score = extra?.score ?? 0;
    const stack = el('div', { class: 'stack' });
    const logo = el('img', { class: 'brand', src: './fx-digital-logo.svg', alt: 'FX Digital' });
    const card = el('div', { class: 'card summary solid' });
    const titleText = score >= MAX_CORRECT ? 'Perfect! 10 / 10' : `You got ${score} / 10`;
    card.appendChild(el('h1', { class: 'title', html: titleText }));

    const msg = score >= MAX_CORRECT
      ? 'Congratulations! You correctly identified all issues on the page.'
      : (score <= 4
        ? `You correctly identified <strong>${score}</strong>/10 issues on the page. Better luck next time!`
        : `You correctly identified <strong>${score}</strong>/10 issues on the page. Well done!`);
    card.appendChild(el('p', { class: 'muted', html: msg }));

    const actions = el('div', { class: 'actions' });
    const home = el('button', { class: 'btn btn-lg', html: 'Back to Landing', onClick: () => navigate(ROUTE.LANDING) });
    actions.append(home);
    card.appendChild(actions);

    stack.appendChild(logo);
    stack.appendChild(card);
    APP.appendChild(stack);
  }

  // Boot
  navigate(ROUTE.LANDING);
})();


