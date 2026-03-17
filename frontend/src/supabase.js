/**
 * supabase.js — Supabase client + Auth API + DB
 * ─────────────────────────────────────────────
 * Connection to the real Supabase backend.
 * Local mock storage (mockDB) has been removed.
 */

const SUPABASE_URL = 'https://gngpqrevevvjdicgblmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZ3BxcmV2ZXZ2amRpY2dibG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE1NTksImV4cCI6MjA4OTI1NzU1OX0.YTCCwCh54lLQtiOIFB3caXPmdXnmc_yOYIO39InLqek';

// ── Supabase client ────────────────────────────────────────────
let _supabase = null;
if (typeof window.supabase !== 'undefined') {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[MindWell] ✅ Supabase client initialized');
} else {
    console.error('[MindWell] ❌ Supabase JS not loaded — check CDN script in index.html');
}

// ── Persistent Session State ──────────────────────────────────
let _currentUser = null;

// ── Session Restoration ─────────────────────────────────────────
async function _initSession() {
    if (!_supabase) return;
    try {
        const { data: { session }, error } = await _supabase.auth.getSession();
        if (error) { console.warn('[MindWell] Session error:', error.message); return; }
        if (session?.user) {
            const u = session.user;
            _currentUser = {
                uid: u.id,
                id: u.id,
                name: u.user_metadata?.full_name || u.email.split('@')[0],
                email: u.email,
                provider: u.app_metadata?.provider || 'email',
                createdAt: u.created_at
            };
            console.log('[MindWell] ✅ Session restored for:', u.email);
        } else {
            console.log('[MindWell] No active session');
        }
    } catch (e) {
        console.error('[MindWell] Session restore failed:', e.message);
    }
}
_initSession();

// ── Auth API ────────────────────────────────────────────────────
const Auth = {
    currentUser() {
        return _currentUser;
    },

    async registerWithEmail({ name, email, password }) {
        const { data, error } = await _supabase.auth.signUp({
            email, password,
            options: { data: { full_name: name } }
        });

        if (error) throw new Error(error.message);

        if (data.user) {
            _currentUser = {
                uid: data.user.id, id: data.user.id,
                name, email: data.user.email, provider: 'email',
                createdAt: data.user.created_at
            };
            // Create profile entry
            const { error: upsertError } = await _supabase.from('profiles').upsert({ id: data.user.id, full_name: name, email });
            if (upsertError) console.warn('[MindWell] Profile upsert warning:', upsertError.message);
        }
        return data;
    },

    async verifyEmailOTP() {
        // Bypass for demo - assuming session is handled by signUp/signIn
        return { session: { access_token: 'demo' }, user: _currentUser };
    },

    async signInWithEmail({ email, password }) {
        const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        if (data.user) {
            const u = data.user;
            _currentUser = {
                uid: u.id, id: u.id,
                name: u.user_metadata?.full_name || email.split('@')[0],
                email: u.email, provider: 'email'
            };
        }
        return data;
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

    // Legacy stubs
    async sendOTP() { return {}; },
    async verifyOTP() { return {}; }
};

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
