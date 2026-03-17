/**
 * supabase.js — Supabase client + Auth API + DB
 * ─────────────────────────────────────────────
 * Connection to the real Supabase backend.
 * Local mock storage (mockDB) has been removed.
 */

// Prefer Vite env vars if present (works in `vite dev/build`).
// Fallbacks keep the app runnable when served as plain static files.
const VITE_ENV = (import.meta && import.meta.env) ? import.meta.env : {};
const SUPABASE_URL =
    VITE_ENV.VITE_SUPABASE_URL ||
    'https://gngpqrevevvjdicgblmz.supabase.co';
const SUPABASE_ANON_KEY =
    VITE_ENV.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZ3BxcmV2ZXZ2amRpY2dibG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE1NTksImV4cCI6MjA4OTI1NzU1OX0.YTCCwCh54lLQtiOIFB3caXPmdXnmc_yOYIO39InLqek';

// ── Supabase client ────────────────────────────────────────────
let _supabase = null;
if (typeof window.supabase !== 'undefined') {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    console.log('[MindWell] ✅ Supabase client initialized');
    // app.js expects this global for email-confirm + OAuth return flows.
    window._supabase = _supabase;
} else {
    console.error('[MindWell] ❌ Supabase JS not loaded — check CDN script in index.html');
}

// ── Persistent Session State ──────────────────────────────────
let _currentUser = null;

function _syncCurrentUserFromSupabaseUser(u) {
    if (!u) return null;
    _currentUser = {
        uid: u.id,
        id: u.id,
        name: u.user_metadata?.full_name || u.email.split('@')[0],
        email: u.email,
        provider: u.app_metadata?.provider || 'email',
        createdAt: u.created_at
    };
    return _currentUser;
}

async function _ensureProfileForSupabaseUser(u) {
    if (!_supabase || !u?.id) return;
    const fullName =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        (u.email ? u.email.split('@')[0] : 'User');
    const email = u.email || null;

    const { error } = await _supabase.from('profiles').upsert({
        id: u.id,
        full_name: fullName,
        email
    });
    if (error) console.warn('[MindWell] Profile upsert warning:', error.message);
}

// ── Session Restoration ─────────────────────────────────────────
async function _initSession() {
    if (!_supabase) return;
    try {
        const { data: { session }, error } = await _supabase.auth.getSession();
        if (error) { console.warn('[MindWell] Session error:', error.message); return; }
        if (session?.user) {
            _syncCurrentUserFromSupabaseUser(session.user);
            await _ensureProfileForSupabaseUser(session.user);
            console.log('[MindWell] ✅ Session restored for:', session.user.email);
        } else {
            console.log('[MindWell] No active session');
        }
    } catch (e) {
        console.error('[MindWell] Session restore failed:', e.message);
    }
}
// app.js can await this to avoid races on initial load (especially after OAuth redirects).
window.__mindwellAuthInit = _initSession();

// Keep local user state in sync with Supabase session (fixes "logged in then bounced to login").
if (_supabase) {
    _supabase.auth.onAuthStateChange(async (event, session) => {
        try {
            if (session?.user) {
                _syncCurrentUserFromSupabaseUser(session.user);
                await _ensureProfileForSupabaseUser(session.user);
                console.log('[MindWell] Auth event:', event, session.user.email);
            } else {
                _currentUser = null;
                console.log('[MindWell] Auth event:', event, '(signed out)');
            }
        } catch (e) {
            console.warn('[MindWell] Auth state sync warning:', e.message);
        }
    });
}

// ── Auth API ────────────────────────────────────────────────────
const Auth = {
    currentUser() {
        return _currentUser;
    },

    async signInWithGoogle() {
        const { data, error } = await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + window.location.pathname }
        });
        if (error) throw new Error(error.message);
        return data;
    },

    async signOut() {
        _currentUser = null;
        if (_supabase) {
            const { error } = await _supabase.auth.signOut();
            if (error) console.warn('[MindWell] Sign out warning:', error.message);
        }
    },

    // Legacy stubs (kept to avoid breaking older callers)
    async sendOTP() { throw new Error('Disabled: email/phone auth removed'); },
    async verifyOTP() { throw new Error('Disabled: email/phone auth removed'); }
};

// Internal helper for app.js confirm-email + OAuth return flows.
Auth._syncFromSupabaseUser = _syncCurrentUserFromSupabaseUser;
Auth._ensureProfileForSupabaseUser = _ensureProfileForSupabaseUser;

// ── DB Helpers ──────────────────────────────────────────────────
function _getUID() {
    if (!_currentUser) { console.error('[MindWell] No current user'); return null; }
    return _currentUser.id;
}

function _today() {
    return new Date().toISOString().split('T')[0];
}

// ── Database API ────────────────────────────────────────────────
const DB = {
    async saveMoodLog({ mood, note = '' }) {
        const uid = _getUID();
        if (!uid) throw new Error('Not signed in');
        const today = _today();
        const now = new Date().toISOString();

        // Check for today's entry
        const { data: existing, error: checkErr } = await _supabase
            .from('mood_logs')
            .select('id')
            .eq('user_id', uid)
            .gte('logged_at', today + 'T00:00:00+00:00')
            .lte('logged_at', today + 'T23:59:59+00:00')
            .limit(1);

        if (checkErr) throw new Error('Mood check failed: ' + checkErr.message);

        if (existing && existing.length > 0) {
            const { data, error } = await _supabase
                .from('mood_logs')
                .update({ mood, note, logged_at: now })
                .eq('id', existing[0].id)
                .select().single();
            if (error) throw new Error('Mood update failed: ' + error.message);
            return { ...data, updated: true };
        }

        const { data, error } = await _supabase
            .from('mood_logs')
            .insert({ user_id: uid, mood, note, logged_at: now })
            .select().single();
        if (error) throw new Error('Mood save failed: ' + error.message);
        return data;
    },

    async getMoodHistory(limit = 30) {
        const uid = _getUID();
        if (!uid) return [];
        const { data, error } = await _supabase
            .from('mood_logs').select('*')
            .eq('user_id', uid).order('logged_at', { ascending: false }).limit(limit);
        if (error) throw new Error(error.message);
        return data || [];
    },

    async getLatestGratitude() {
        const uid = _getUID();
        if (!uid) return '';
        const { data, error } = await _supabase
            .from('gratitude_entries').select('content')
            .eq('user_id', uid).order('created_at', { ascending: false }).limit(1).single();
        if (error && error.code !== 'PGRST116') console.warn('Gratitude fetch error:', error.message);
        return data?.content || '';
    },

    async saveGratitude(text) {
        const uid = _getUID();
        if (!uid) throw new Error('Not signed in');
        const { data, error } = await _supabase
            .from('gratitude_entries')
            .insert({ user_id: uid, content: text })
            .select().single();
        if (error) throw new Error('Gratitude save failed: ' + error.message);
        return data;
    },

    async saveProfile({ name, age, bloodGroup, weight, allergies, medicalHistory }) {
        const uid = _getUID();
        if (!uid) throw new Error('Not signed in');

        // Update local state name
        if (_currentUser) _currentUser.name = name;

        const { error } = await _supabase.from('profiles').upsert({
            id: uid,
            full_name: name,
            age: age ? parseInt(age) : null,
            blood_group: bloodGroup || null,
            weight_kg: weight ? parseFloat(weight) : null,
            allergies: allergies || null,
            medical_history: medicalHistory || null
        });
        if (error) throw new Error('Profile save failed: ' + error.message);
        return { name, age, bloodGroup, weight, allergies, medicalHistory };
    },

    async getProfile() {
        const uid = _getUID();
        if (!uid) return {};
        const { data, error } = await _supabase.from('profiles').select('*').eq('id', uid).single();
        if (error && error.code !== 'PGRST116') console.warn('Profile fetch error:', error.message);
        return data ? {
            name: data.full_name,
            age: data.age,
            bloodGroup: data.blood_group,
            weight: data.weight_kg,
            allergies: data.allergies,
            medicalHistory: data.medical_history
        } : {};
    },

    async saveEmergencyContacts(contacts) {
        const uid = _getUID();
        if (!uid) throw new Error('Not signed in');

        await _supabase.from('emergency_contacts').delete().eq('user_id', uid);
        if (contacts.length > 0) {
            const { error } = await _supabase
                .from('emergency_contacts')
                .insert(contacts.map(c => ({ user_id: uid, name: c.name, phone: c.phone })));
            if (error) throw new Error('Contact save failed: ' + error.message);
        }
        return contacts;
    },

    async getEmergencyContacts() {
        const uid = _getUID();
        if (!uid) return [];
        const { data, error } = await _supabase.from('emergency_contacts').select('*').eq('user_id', uid);
        if (error) console.warn('Contacts fetch error:', error.message);
        return data || [];
    },

    async saveBPReading({ systolic, diastolic, pulse, status }) {
        const uid = _getUID();
        if (!uid) throw new Error('Not signed in');
        const entry = { user_id: uid, systolic, diastolic, pulse, status, recorded_at: new Date().toISOString() };
        const { error } = await _supabase.from('bp_readings').insert(entry);
        if (error) throw new Error('BP save failed: ' + error.message);
        return entry;
    },

    async saveBreathingSession({ durationSeconds, technique = '4-4-4' }) {
        const uid = _getUID();
        if (!uid) return {};
        const { error } = await _supabase
            .from('breathing_sessions')
            .insert({ user_id: uid, duration_seconds: durationSeconds, technique });
        if (error) console.warn('[MindWell] Breathing session save warning:', error.message);
        return {};
    }
};

window.Auth = Auth;
window.DB = DB;
