/**
 * firebase.js
 * ─────────────────────────────────────────────────────────
 * Firebase configuration and authentication helpers.
 * 
 * TO ENABLE REAL FIREBASE AUTH:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project, enable Authentication
 * 3. Enable "Google" and "Phone" sign-in providers
 * 4. Copy your firebaseConfig from Project Settings
 * 5. Replace the CONFIG object below with your real values
 * ─────────────────────────────────────────────────────────
 */

// Set MOCK_MODE = false and fill in CONFIG to use real Firebase
const MOCK_MODE = true;

const CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ── Firebase Initialisation ──────────────────────────────
if (!MOCK_MODE && typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(CONFIG);
    console.log('[MindWell] Firebase initialised');

    // Initialise reCAPTCHA verifier globally
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved - will allow phone auth to proceed
        console.log('[MindWell] reCAPTCHA solved');
      }
    });

  } catch (e) {
    console.error('[MindWell] Firebase init failed:', e);
  }
}

// ── Mock User Store ──────────────────────────────────────
const mockDB = {
  users: JSON.parse(localStorage.getItem('mw_users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('mw_current_user') || 'null'),

  save() {
    localStorage.setItem('mw_users', JSON.stringify(this.users));
    localStorage.setItem('mw_current_user', JSON.stringify(this.currentUser));
  },

  findByEmail(email) {
    return this.users.find(u => u.email === (email || '').toLowerCase());
  },
  findByUsername(username) {
    return this.users.find(u => u.username === (username || '').toLowerCase());
  },
  findByIdentifier(id) {
    return this.users.find(u =>
      u.email === (id || '').toLowerCase() ||
      u.username === (id || '').toLowerCase()
    );
  },

  createUser({ name, email, username, phone, provider }) {
    const uid = 'uid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const user = {
      uid, name,
      username: username || (email ? email.split('@')[0] : 'user_' + uid.slice(-4)),
      email: email ? email.toLowerCase() : null,
      phone: phone || null,
      provider,
      photoURL: null,
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    this.currentUser = user;
    this.save();
    return user;
  },

  login(user) {
    this.currentUser = user;
    this.save();
    return user;
  },

  logout() {
    this.currentUser = null;
    this.save();
  }
};

// ── Pending OTP store (mock) ─────────────────────────────
let pendingOTP = null;

// ── Auth API ─────────────────────────────────────────────
const Auth = {
  /** Returns current user object or null */
  currentUser() {
    if (MOCK_MODE) return mockDB.currentUser;
    if (typeof firebase !== 'undefined') return firebase.auth().currentUser;
    return null;
  },

  /** Sign in with Google */
  async signInWithGoogle() {
    if (MOCK_MODE) {
      const googleUser = mockDB.findByEmail('google_demo@gmail.com') ||
        mockDB.createUser({
          name: 'Demo User',
          email: 'google_demo@gmail.com',
          provider: 'google'
        });
      mockDB.login(googleUser);
      return { user: googleUser };
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return firebase.auth().signInWithPopup(provider);
  },

  /** Register with email/password */
  async registerWithEmail({ name, email, password }) {
    if (MOCK_MODE) {
      if (mockDB.findByEmail(email)) throw new Error('An account with this email already exists.');
      const user = mockDB.createUser({ name, email, provider: 'email' });
      return { user };
    }
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
    if (name) await cred.user.updateProfile({ displayName: name });
    return cred;
  },

  /** Sign in with email or username */
  async signInWithEmail({ email, password }) {
    if (MOCK_MODE) {
      const user = mockDB.findByIdentifier(email);
      if (!user) throw new Error('No account found with this username or email.');
      mockDB.login(user);
      return { user };
    }
    return firebase.auth().signInWithEmailAndPassword(email, password);
  },

  /** Send OTP to phone */
  async sendOTP(phoneNumber) {
    if (MOCK_MODE) {
      pendingOTP = { code: '123456', phone: phoneNumber, sentAt: Date.now() };
      console.log('[MindWell] Mock OTP sent to', phoneNumber, '— use code: 123456');
      return { verificationId: 'mock_verification_id' };
    }

    // Real Firebase Phone Auth
    const appVerifier = window.recaptchaVerifier;
    return firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
  },

  /** Verify OTP */
  async verifyOTP({ verificationId, code, phone, confirmationResult }) {
    if (MOCK_MODE) {
      if (!pendingOTP) throw new Error('No OTP was sent. Please try again.');
      const expired = (Date.now() - pendingOTP.sentAt) > 5 * 60 * 1000;
      if (expired) { pendingOTP = null; throw new Error('OTP expired. Please request a new one.'); }
      if (pendingOTP.code !== code.trim()) throw new Error('Invalid OTP. Please try again.');
      pendingOTP = null;
      let user = mockDB.findByPhone(phone);
      if (!user) user = mockDB.createUser({ name: 'Phone User', phone, provider: 'phone' });
      mockDB.login(user);
      return { user };
    }

    // verificationId here is actually the confirmationResult object from signInWithPhoneNumber
    if (confirmationResult && confirmationResult.confirm) {
      return confirmationResult.confirm(code);
    }

    throw new Error('Verification failed. Please try again.');
  },

  /** Sign out */
  async signOut() {
    if (MOCK_MODE) {
      mockDB.logout();
      return;
    }
    return firebase.auth().signOut();
  }
};

window.Auth = Auth;
window.mockDB = mockDB;


window.Auth = Auth;
window.mockDB = mockDB;
