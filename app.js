/* Simple single-file SPA for the QA tapping game */

(function () {
  const APP = document.getElementById('app');

  const ROUTE = {
    LANDING: 'landing',
    COUNTDOWN: 'countdown',
    GAME: 'game',
    SUMMARY: 'summary',
    LEADERBOARD: 'leaderboard',
  };

  const MAX_CORRECT = 10;
  const MAX_TAPS = 13;
  const MAX_SECONDS = 90;

  const state = {
    route: ROUTE.LANDING,
    tapsRemaining: MAX_TAPS,
    secondsRemaining: MAX_SECONDS,
    foundHotspotIds: new Set(),
    totalValid: 0,
    timer: null,
    debug: !!window.NEXUS_DEBUG,
    currentUser: null,
    gameStartTime: null,
    leaderboard: JSON.parse(localStorage.getItem('leaderboard') || '[]'),
  };

  function navigate(route, extra) {
    state.route = route;
    // Toggle illustration background for landing/summary/game backgrounds
    const isPurple = route === ROUTE.LANDING || route === ROUTE.SUMMARY || route === ROUTE.GAME;
    document.body.classList.toggle('theme-purple', isPurple);
    // Toggle body scroll lock during gameplay
    document.body.classList.toggle('noscroll', route === ROUTE.GAME);
    if (route === ROUTE.LANDING) renderLanding();
    if (route === ROUTE.COUNTDOWN) renderCountdown();
    if (route === ROUTE.GAME) renderGame();
    if (route === ROUTE.SUMMARY) renderSummary(extra);
    if (route === ROUTE.LEADERBOARD) renderLeaderboard();
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
        <li>You have <strong>90 seconds</strong> and only <strong>13 taps</strong> - tap carefully and quickly.</li>
      </ol>`;
    card.appendChild(rules);

          // User registration form within main card
          const userForm = el('div', { class: 'user-form' });
          userForm.innerHTML = `
            <h3>Enter your details to compete on the leaderboard</h3>
            <div class="form-group">
              <label for="playerName">Name:</label>
              <input type="text" id="playerName" placeholder="Your name" required>
            </div>
            <div class="form-group">
              <label for="playerEmail">Email:</label>
              <input type="email" id="playerEmail" placeholder="your.email@example.com" required>
            </div>
          `;
          card.appendChild(userForm);

    const actions = el('div', { class: 'actions' });
    const startBtn = el('button', { 
      class: 'btn btn-lg', 
      html: 'Start Game', 
            onClick: () => {
              const name = document.getElementById('playerName').value.trim();
              const email = document.getElementById('playerEmail').value.trim();

              if (!name || !email) {
                alert('Please enter both your name and email address to continue.');
                return;
              }

              // Email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(email)) {
                alert('Please enter a valid email address (e.g., your.name@example.com).');
                return;
              }

              state.currentUser = { name, email };
              navigate(ROUTE.COUNTDOWN);
            }
    });
    const leaderboardBtn = el('button', { 
      class: 'btn btn-secondary', 
      html: 'View Leaderboard', 
      onClick: () => navigate(ROUTE.LEADERBOARD) 
    });
    actions.appendChild(startBtn);
    actions.appendChild(leaderboardBtn);
    card.appendChild(actions);

    stack.appendChild(logo);
    stack.appendChild(card);
    APP.appendChild(stack);
  }

  function renderCountdown() {
    clearInterval(state.timer);
    APP.innerHTML = '';
    APP.style.backgroundImage = 'url(./background.png)';
    APP.style.backgroundSize = 'cover';
    APP.style.backgroundPosition = 'center';
    APP.style.backgroundRepeat = 'no-repeat';
    
    const countdownContainer = el('div', { class: 'countdown-container' });
    const countdownCard = el('div', { class: 'countdown-card' });
    const readyText = el('div', { class: 'ready-text' });
    readyText.innerHTML = `Get Ready <span class="player-name">${state.currentUser?.name || 'Player'}</span>!`;
    
    const countdownNumber = el('div', { class: 'countdown-number' });
    countdownNumber.textContent = '3';
    
    countdownCard.appendChild(readyText);
    countdownCard.appendChild(countdownNumber);
    countdownContainer.appendChild(countdownCard);
    APP.appendChild(countdownContainer);
    
    // Start countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
        countdownNumber.classList.add('flash');
        setTimeout(() => countdownNumber.classList.remove('flash'), 200);
      } else {
        clearInterval(countdownInterval);
        countdownNumber.textContent = 'GO!';
        countdownNumber.classList.add('flash');
        setTimeout(() => {
          navigate(ROUTE.GAME);
        }, 500);
      }
    }, 1000);
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
    const completionTime = state.gameStartTime ? Date.now() - state.gameStartTime : 0;
    const timeRemaining = Math.max(0, state.secondsRemaining);
    // Only award time bonus if all 10 are found
    const timeBonus = state.totalValid >= MAX_CORRECT ? timeRemaining : 0;
    const totalScore = state.totalValid + timeBonus;
    
    navigate(ROUTE.SUMMARY, { 
      score: state.totalValid, 
      timeRemaining: timeRemaining,
      totalScore: totalScore,
      completionTime: completionTime
    });
  }

  function renderGame() {
    resetGameState();
    state.gameStartTime = Date.now();
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
    const timeRemaining = extra?.timeRemaining ?? 0;
    const totalScore = extra?.totalScore ?? 0;
    const completionTime = extra?.completionTime ?? 0;
    
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

    // Score details
    const scoreDetails = el('div', { class: 'score-details' });
    scoreDetails.innerHTML = `
      <div class="score-breakdown">
        <div class="score-item">
          <span class="label">Issues Found:</span>
          <span class="value">${score}/10</span>
        </div>
        <div class="score-item">
          <span class="label">Time Remaining:</span>
          <span class="value">${timeRemaining}s</span>
        </div>
        <div class="score-item total">
          <span class="label">Total Score:</span>
          <span class="value">${totalScore}</span>
        </div>
      </div>
    `;
    card.appendChild(scoreDetails);

    // Add to leaderboard if user exists
    if (state.currentUser && totalScore > 0) {
      const leaderboardEntry = {
        name: state.currentUser.name,
        email: state.currentUser.email,
        score: score,
        timeRemaining: timeRemaining,
        totalScore: totalScore,
        completionTime: completionTime,
        timestamp: new Date().toISOString()
      };
      
      state.leaderboard.push(leaderboardEntry);
      state.leaderboard.sort((a, b) => b.totalScore - a.totalScore);
      state.leaderboard = state.leaderboard.slice(0, 50); // Keep top 50
      localStorage.setItem('leaderboard', JSON.stringify(state.leaderboard));
      
      // Submit to Apps Script if configured, otherwise fallback to Google Forms (optional)
      submitScore(leaderboardEntry);
    }

    const actions = el('div', { class: 'actions' });
    const home = el('button', { class: 'btn btn-lg', html: 'Back to Landing', onClick: () => navigate(ROUTE.LANDING) });
    const leaderboard = el('button', { class: 'btn btn-secondary', html: 'View Leaderboard', onClick: () => navigate(ROUTE.LEADERBOARD) });
    actions.append(home, leaderboard);
    card.appendChild(actions);

    stack.appendChild(logo);
    stack.appendChild(card);
    APP.appendChild(stack);
  }

        function renderLeaderboard() {
          APP.innerHTML = '';
          APP.style.backgroundImage = 'url(./background.png)';
          APP.style.backgroundSize = 'cover';
          APP.style.backgroundPosition = 'center';
          APP.style.backgroundRepeat = 'no-repeat';
          const stack = el('div', { class: 'stack' });
          const logo = el('img', { class: 'brand', src: './fx-digital-logo.svg', alt: 'FX Digital' });
          const card = el('div', { class: 'card solid' });
    
    card.appendChild(el('h1', { class: 'title center', html: 'Leaderboard' }));
    card.appendChild(el('p', { class: 'muted center', html: 'Top performers in the QA challenge' }));

    if (state.leaderboard.length === 0) {
      card.appendChild(el('p', { class: 'muted center', html: 'No scores yet. Be the first to play!' }));
    } else {
      const leaderboardList = el('div', { class: 'leaderboard-list' });
      
      state.leaderboard.slice(0, 20).forEach((entry, index) => {
        const rank = index + 1;
        const entryEl = el('div', { class: `leaderboard-entry ${rank <= 3 ? 'top-three' : ''}` });
        entryEl.innerHTML = `
          <div class="rank">#${rank}</div>
          <div class="player-info">
            <div class="name">${entry.name}</div>
            <div class="details">${entry.score}/10 issues • ${entry.timeRemaining}s remaining</div>
          </div>
          <div class="score">${entry.totalScore}</div>
        `;
        leaderboardList.appendChild(entryEl);
      });
      
      card.appendChild(leaderboardList);
    }

    const actions = el('div', { class: 'actions' });
    const home = el('button', { class: 'btn btn-lg', html: 'Back to Landing', onClick: () => navigate(ROUTE.LANDING) });
    actions.appendChild(home);
    card.appendChild(actions);

    stack.appendChild(logo);
    stack.appendChild(card);
    APP.appendChild(stack);
  }

// Unified submission: send to Apps Script (if configured) AND Google Forms
function submitScore(entry) {
  submitToAppsScript(entry);
  submitToGoogleForms(entry);
}

function submitToGoogleForms(entry) {
  // Google Forms integration - using your actual form URL
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSc7v4zKoCxvcNsmkClRbylmhphwSdyAlec8lUbVCwEkK_Rbjw/formResponse';
  const formData = new FormData();

  // Map your form fields with the correct field IDs
  formData.append('entry.2005620554', entry.name); // Name field
  formData.append('entry.1045781291', entry.email); // Email field  
  formData.append('entry.1065046570', entry.score); // Issues Found field
  formData.append('entry.1166974658', entry.timeRemaining); // Time Remaining field
  formData.append('entry.839337160', entry.totalScore); // Total Score field

  // Submit to Google Forms (this will work in background)
  fetch(formUrl, {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
  }).catch(() => {
    // Silently fail - Google Forms submission is optional
    console.log('Google Forms submission failed (this is normal)');
  });
}

// Post to a Google Apps Script Web App (deploy as web app, anyone can access)
// Configure by setting window.LEADERBOARD_WEBAPP_URL = 'https://script.google.com/macros/s/XXX/exec' in index.html
function submitToAppsScript(entry) {
  try {
    const url = window.LEADERBOARD_WEBAPP_URL;
    if (!url) return false;
    
    // Use GET with query parameters to avoid CORS issues
    const params = new URLSearchParams({
      name: entry.name,
      email: entry.email,
      issuesFound: entry.score,
      timeRemaining: entry.timeRemaining,
      totalScore: entry.totalScore,
      completionTimeMs: entry.completionTime,
      timestamp: entry.timestamp,
      ua: navigator.userAgent,
    });
    
    fetch(`${url}?${params}`, {
      method: 'GET',
      mode: 'no-cors', // This prevents CORS errors
    }).catch(() => {});
    return true;
  } catch (_) {
    return false;
  }
}

  // Boot
  navigate(ROUTE.LANDING);
})();


