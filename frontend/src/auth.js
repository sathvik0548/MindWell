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
window.pendingAuth = null;

function renderAuthPage(defaultMode = 'login') {
  const isReg = defaultMode === 'register';

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

  // OTP Verification Screen
  if (window.pendingAuth) {
    return `
    <div class="auth-page-wrap page">
      ${leftPanel}
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Verify your email</h1>
            <p class="auth-subtitle">We sent a 6-digit code to <strong>${window.pendingAuth.email}</strong></p>
          </div>
          <div class="auth-form" style="margin-top:1.5rem">
            <div class="form-group">
              <label class="form-label">Verification Code (OTP)</label>
              <input class="form-input text-center" style="font-size:1.5rem; letter-spacing:4px" type="text" id="email-otp-input" placeholder="123456" maxlength="6" />
            </div>
            <button class="btn btn-primary btn-full btn-lg" onclick="handleEmailOTPVerify()" style="margin-top:0.5rem">
              Verify Account →
            </button>
            <div style="text-align:center;margin-top:1.5rem">
              <span style="font-size:0.85rem;color:var(--text-muted);cursor:pointer" onclick="window.pendingAuth=null; switchAuthTab('register')">← Go back</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  return `
  <div class="auth-page-wrap page">
    <!-- Left brand panel -->
    ${leftPanel}

    <!-- Right form panel -->
    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">${isReg ? 'Create your account' : 'Welcome back'}</h1>
          <p class="auth-subtitle">${isReg ? 'Join thousands caring for their mental health' : 'Sign in to continue your well-being journey'}</p>
        </div>

        <!-- Mode tabs -->
        <div class="tabs" style="margin-bottom:.5rem">
          <button id="tab-login" class="tab ${!isReg ? 'active' : ''}" onclick="switchAuthTab('login')">Sign In</button>
          <button id="tab-register" class="tab ${isReg ? 'active' : ''}" onclick="switchAuthTab('register')">Register</button>
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

        <div class="divider">or with your credentials</div>

        <!-- AUTH FORM -->
        <div class="auth-form">
          ${isReg ? `<div class="form-group"><label class="form-label">Full Name</label><input class="form-input" type="text" id="email-name" placeholder="John Doe" autocomplete="name"/></div>` : ''}
          <div class="form-group">
            <label class="form-label">Username or Email</label>
            <input class="form-input" type="text" id="email-input" placeholder="Enter your username or email" autocomplete="username"/>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div style="position:relative">
              <input class="form-input" type="password" id="email-password" placeholder="Minimum 6 characters" autocomplete="current-password" style="padding-right:2.8rem"/>
              <button type="button" class="btn-ghost" onclick="togglePasswordVisibility('email-password')" style="position:absolute;right:0.6rem;top:50%;transform:translateY(-50%);padding:0.2rem;font-size:1.1rem;background:none;border:none;cursor:pointer">👁️</button>
            </div>
          </div>
          <button class="btn btn-primary btn-full btn-lg" onclick="handleEmailAuth()" style="margin-top:0.25rem">
            ${isReg ? 'Create Account →' : 'Sign In →'}
          </button>
        </div>

        <p class="auth-toggle mt-1">
          ${isReg
      ? 'Already have an account? <span class="auth-toggle-link" onclick="switchAuthTab(\'login\')">Sign in</span>'
      : 'New to MindWell? <span class="auth-toggle-link" onclick="switchAuthTab(\'register\')">Create a free account</span>'}
        </p>

        <div style="text-align:center;margin-top:1.5rem;padding-top:1rem;border-top:1px dashed rgba(255,255,255,0.1)">
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem">Just want to explore?</p>
          <button class="btn btn-ghost btn-full" onclick="handleDemoLogin()" style="border:1px solid var(--primary);color:var(--primary)">
            ✨ Instant Demo Access
          </button>
        </div>

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

// ── Demo / Guest Login ─────────────────────────────────────────
window.handleDemoLogin = async function () {
  showLoader('Preparing your demo session…');
  const demoEmail = 'guest@mindwell.demo';
  const demoPass = 'MindWell123!';

  try {
    await Auth.signInWithEmail({ email: demoEmail, password: demoPass });
    hideLoader();
    showToast('Welcome! You are in Demo Mode 🌿', 'success');
    await window.navigateTo('dashboard');
  } catch (e) {
    hideLoader();
    showToast('Demo account not found. Please create a new account!', 'info');
  }
};

// ── Google Sign-in ──────────────────────────────────────────────
window.handleGoogleSignIn = async function () {
  showLoader('Signing in with Google…');
  try {
    await Auth.signInWithGoogle();
    showToast('Welcome! Signed in with Google 🎉', 'success');
    hideLoader();
    window.navigateTo('dashboard');
  } catch (e) { hideLoader(); showToast(e.message || 'Google sign-in failed.', 'error'); }
};

// ── Phone OTP (legacy) ─────────────────────────────────────────
window.handleSendOTP = async function () {
  showToast('Phone auth is no longer available. Please use email.', 'info');
};
window.handleVerifyOTP = async function () { };

// ── Email auth ─────────────────────────────────────────────────
window.handleEmailAuth = async function () {
  const isReg = document.getElementById('tab-register').classList.contains('active');
  const email = (document.getElementById('email-input') || {}).value || '';
  const password = (document.getElementById('email-password') || {}).value || '';
  const name = (document.getElementById('email-name') || {}).value || '';
  if (!email || !password) return showToast('Fill in all fields.', 'error');
  if (isReg && !name) return showToast('Enter your name.', 'error');
  if (password.length < 6) return showToast('Password must be at least 6 characters.', 'error');
  showLoader(isReg ? 'Creating your account…' : 'Signing you in…');
  try {
    if (isReg) {
      await Auth.registerWithEmail({ name, email, password });
      hideLoader();
      // Show email confirmation screen
      document.getElementById('app').innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-primary, #0f172a);">
          <div style="text-align:center;padding:3rem;max-width:440px;background:rgba(255,255,255,0.05);border-radius:24px;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(12px);">
            <div style="font-size:3rem;margin-bottom:1.25rem">📧</div>
            <h2 style="color:#fff;font-size:1.5rem;font-weight:700;margin-bottom:0.75rem">Check your email!</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:0.95rem;line-height:1.65;margin-bottom:0.5rem">
              We sent a confirmation link to <strong style="color:#a5b4fc">${email}</strong>
            </p>
            <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;line-height:1.65;margin-bottom:2rem">
              Click the link in the email to verify your account and log in automatically.
            </p>
            <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:1rem;margin-bottom:1.5rem;font-size:0.82rem;color:rgba(255,255,255,0.5)">
              💡 <strong style="color:rgba(255,255,255,0.7)">Tip:</strong> If you don't see it, check your spam/junk folder.
            </div>
            <button class="btn btn-primary btn-full" onclick="navigateTo('auth','login')">← Back to Sign In</button>
          </div>
        </div>`;
    } else {
      await Auth.signInWithEmail({ email, password });
      hideLoader();
      showToast('Welcome back! 😊', 'success');
      window.navigateTo('dashboard');
    }
  } catch (e) { hideLoader(); showToast(e.message || 'Auth failed.', 'error'); }
};

window.handleEmailOTPVerify = async function () {
  if (!window.pendingAuth) return;
  const otp = document.getElementById('email-otp-input').value.trim();
  if (otp.length !== 6) return showToast('Please enter the 6-digit code.', 'error');
  showLoader('Verifying code…');
  try {
    await Auth.verifyEmailOTP({ email: window.pendingAuth.email, token: otp, name: window.pendingAuth.name });
    window.pendingAuth = null;
    hideLoader();
    showToast('Email verified! Account created successfully. 🌿', 'success');
    window.navigateTo('dashboard');
  } catch (e) {
    hideLoader();
    showToast(e.message || 'Verification failed. Invalid code?', 'error');
  }
};

window.renderAuthPage = renderAuthPage;
