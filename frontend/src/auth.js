/**
 * auth.js  –  Authentication page (Glassmorphism redesign)
 */

function showToast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
window.showToast = showToast;

function showLoader(text = 'Loading…') {
  let el = document.getElementById('global-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-loader';
    el.className = 'loading-overlay';
    el.innerHTML = `<div class="spinner"></div><div class="loading-text">${text}</div>`;
    document.body.appendChild(el);
  } else {
    el.querySelector('.loading-text').textContent = text;
    el.classList.remove('hidden');
  }
}
function hideLoader() {
  const el = document.getElementById('global-loader');
  if (el) el.classList.add('hidden');
}
window.showLoader = showLoader;
window.hideLoader = hideLoader;

// ── Auth Page ─────────────────────────────────────────────────
function renderAuthPage(defaultMode = 'login') {
  const leftPanel = `
    <div class="auth-left">
      <div class="auth-left-content">
        <div class="auth-brand-icon">🧠</div>
        <div class="auth-brand-name">MindWell</div>
        <div class="auth-brand-tag">Your calm companion for mental well-being. Track moods, breathe better, feel great.</div>
        <div class="auth-blob">🧠</div>
        <div class="auth-features">
          <div class="auth-feat"><div class="auth-feat-dot"></div>Mood tracking &amp; history charts</div>
          <div class="auth-feat"><div class="auth-feat-dot"></div>Guided 4-4-4 breathing exercises</div>
          <div class="auth-feat"><div class="auth-feat-dot"></div>Well-being score &amp; insights</div>
          <div class="auth-feat"><div class="auth-feat-dot"></div>Curated mental health resources</div>
          <div class="auth-feat"><div class="auth-feat-dot"></div>Private &amp; 100% secure</div>
        </div>
      </div>
    </div>`;

  return `
  <div class="auth-page-wrap page">
    <!-- Left brand panel -->
    ${leftPanel}

    <!-- Right form panel -->
    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Continue with Google</h1>
          <p class="auth-subtitle">MindWell uses Supabase Google OAuth for sign in and sign up.</p>
        </div>

        <!-- Google -->
        <button class="btn btn-google btn-full" style="padding:.8rem;margin:.75rem 0" onclick="handleGoogleSignIn()">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.22l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style="text-align:center;margin-top:0.75rem">
          <span style="font-size:0.82rem;color:var(--text-muted);cursor:pointer" onclick="navigateTo('home')">← Back to Home</span>
        </div>
      </div>
    </div>
  </div>`;
}

window.togglePasswordVisibility = function (id) {
  const el = document.getElementById(id);
  if (el) { el.type = el.type === 'password' ? 'text' : 'password'; }
};

// ── Tab switchers ──────────────────────────────────────────────
window.switchAuthTab = function (mode) {
  document.getElementById('app').innerHTML = renderAuthPage(mode);
};

// ── OTP (legacy stubs) ─────────────────────────────────────────
window.switchInnerTab = function () { };
let confirmationResult = null, currentPhone = null;
window.otpRealInput = function () { };
window.otpKeyDown = function () { };

// ── Google Sign-in ──────────────────────────────────────────────
window.handleGoogleSignIn = async function () {
  showLoader('Signing in with Google…');
  try {
    await Auth.signInWithGoogle();
    // Redirect happens immediately; this runs only if Supabase throws.
  } catch (e) { hideLoader(); showToast(e.message || 'Google sign-in failed.', 'error'); }
};

// ── Phone OTP (legacy) ─────────────────────────────────────────
window.handleSendOTP = async function () {
  showToast('Phone auth is no longer available. Please use Google sign-in.', 'info');
};
window.handleVerifyOTP = async function () { };

window.renderAuthPage = renderAuthPage;
