/**
 * app.js  –  Main router & landing page (Glassmorphism redesign)
 */

// ───────────── Landing Page ──────────────────────────────────
function renderLanding() {
  const t = (k) => i18n.t(k);
  const lang = i18n.getLang().toUpperCase();

  return `
  <div class="landing page">
    <!-- Floating Background Icons -->
    <div class="hero-float-icon" style="top:15%;left:5%;animation-delay:0s;opacity:0.25">☁️</div>
    <div class="hero-float-icon" style="top:35%;right:6%;animation-delay:1s;opacity:0.2;animation-duration:5s">🍃</div>
    <div class="hero-float-icon" style="bottom:35%;left:20%;animation-delay:0.5s;opacity:0.22;animation-duration:4.5s">☀️</div>
    <div class="hero-float-icon" style="top:28%;right:22%;animation-delay:1.5s;opacity:0.2;animation-duration:3.8s">💜</div>
    <div class="hero-float-icon" style="bottom:20%;right:8%;animation-delay:0.8s;opacity:0.18;animation-duration:4.2s">✨</div>

    <!-- Nav -->
    <nav class="land-nav">
      <div class="land-logo" onclick="navigateTo('home')">
        <div class="land-logo-icon">🧠</div>
        <span class="land-logo-text">MindWell</span>
      </div>
      <ul class="land-nav-list">
        <li><a href="#" class="land-nav-link" onclick="navigateTo('dashboard')">Dashboard</a></li>
        <li><a href="#" class="land-nav-link" onclick="navigateTo('dashboard')">Mood</a></li>
        <li><a href="#" class="land-nav-link" onclick="navigateTo('dashboard')">Resources</a></li>
      </ul>
      <div style="display:flex;gap:0.75rem;align-items:center">
        <button class="lang-btn" onclick="toggleLang()">🌐 ${lang}</button>
        <button class="btn btn-ghost btn-sm" onclick="navigateTo('auth','login')">Login</button>
        <button class="btn btn-primary btn-sm" onclick="navigateTo('auth','register')">Get Started</button>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-reimagined">✨ MENTAL HEALTH REIMAGINED</div>
      <h1 class="hero-title">
        Track your mind,<br>nurture your well-being
      </h1>
      <p class="hero-sub">
        A supportive space for mental health awareness, mood tracking, and personal growth.
        Start your journey to emotional wellness today.
      </p>
      <div class="hero-actions">
        <button class="hero-btn-primary" onclick="navigateTo('auth','register')">Get Started Free</button>
        <button class="hero-btn-secondary" onclick="navigateTo('auth','login')">Sign In</button>
      </div>

      <!-- Visual -->
     
    </section>

    <!-- Why MindWell? -->
    <section class="section-features">
      <h2 class="section-tag">Why MindWell?</h2>
      <p class="section-desc">Intuitive, beautiful tools to help you stay mindful and emotionally balanced every single day.</p>
      <div class="feat-grid">
        <div class="feat-card">
          <div class="feat-icon-box" style="background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(124,58,237,0.08))">📈</div>
          <h3 class="feat-h">Mood Tracking</h3>
          <p class="feat-p">Visualize your emotional journey with beautiful charts and daily logs that reveal meaningful patterns.</p>
        </div>
        <div class="feat-card">
          <div class="feat-icon-box" style="background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))">🧘</div>
          <h3 class="feat-h">Guided Breathing</h3>
          <p class="feat-p">Quick 4-4-4 box breathing sessions to calm your nervous system whenever stress strikes.</p>
        </div>
        <div class="feat-card">
          <div class="feat-icon-box" style="background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(249,115,22,0.08))">📚</div>
          <h3 class="feat-h">Expert Resources</h3>
          <p class="feat-p">Curated mental health articles, affirmations, and verified helplines from trusted professionals.</p>
        </div>
      </div>
    </section>

    <!-- Stats Strip -->
    <div class="stats-strip">
      <div class="stat-item">
        <div class="s-label">ACTIVE USERS</div>
        <div class="s-num">50k+</div>
      </div>
      <div class="stat-item">
        <div class="s-label">SESSIONS DONE</div>
        <div class="s-num">1.2M</div>
      </div>
      <div class="stat-item">
        <div class="s-label">HAPPY SOULS</div>
        <div class="s-num">4.9 ⭐</div>
      </div>
    </div>

    <footer class="land-footer">
      <p>Made with 💙 for mental health awareness &nbsp;|&nbsp; MindWell © ${new Date().getFullYear()} &nbsp;|&nbsp;
        <a href="https://icallhelpline.org/" target="_blank">iCall Helpline</a>
      </p>
    </footer>
  </div>`;
}

window.toggleLang = async function () {
  i18n.cycleLang();
  const app = document.getElementById('app');
  if (Auth.currentUser()) {
    app.innerHTML = await renderDashboard();
  } else {
    app.innerHTML = renderLanding();
  }
};

// ───────────── Router ─────────────────────────────────────────
async function navigateTo(page, param) {
  const app = document.getElementById('app');
  if (page === 'dashboard') {
    if (!Auth.currentUser()) { await navigateTo('auth', 'register'); return; }
    app.innerHTML = await renderDashboard();
    return;
  }
  if (page === 'auth') {
    app.innerHTML = renderAuthPage(param || 'login');
    return;
  }
  app.innerHTML = renderLanding();
}
window.navigateTo = navigateTo;

// ───────────── Boot ───────────────────────────────────────────
(async function init() {
  const params = new URLSearchParams(window.location.search);
  const tokenHash = params.get('token_hash');
  const type = params.get('type');

  // Handle email confirmation redirect (Supabase sends ?token_hash=...&type=signup)
  if (tokenHash && type) {
    try {
      showLoader('Verifying your account…');
      const { data, error } = await window._supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      hideLoader();
      if (error) {
        showToast('Verification failed: ' + error.message, 'error');
        await navigateTo('auth', 'login');
      } else if (data?.user) {
        // Sync session
        const u = data.user;
        window._currentUser = {
          uid: u.id, id: u.id,
          name: u.user_metadata?.full_name || u.email.split('@')[0],
          email: u.email, provider: 'email', createdAt: u.created_at
        };
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast('Email confirmed! Welcome to MindWell 🌿', 'success');
        await navigateTo('dashboard');
      }
    } catch (e) {
      hideLoader();
      showToast('Verification error. Try signing in.', 'error');
      await navigateTo('auth', 'login');
    }
    return;
  }

  // Handle Supabase OAuth redirect (Google etc) via hash fragment
  if (window.location.hash && window.location.hash.includes('access_token')) {
    if (window._supabase) {
      const { data } = await window._supabase.auth.getSession();
      if (data?.session?.user) {
        await navigateTo('dashboard');
        showToast('Welcome! Signed in with Google 🎉', 'success');
        return;
      }
    }
  }

  const user = Auth.currentUser();
  if (user) {
    await navigateTo('dashboard');
    setTimeout(() => window.updateDashboardStats?.(), 100);
    showToast(`Welcome back, ${(user.name || 'Friend').split(' ')[0]}! 😊`, 'success');
  } else {
    await navigateTo('home');
  }
})();
