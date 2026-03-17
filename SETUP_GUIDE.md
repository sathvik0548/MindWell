# MindWell — Backend Setup Guide
## Supabase + Groq AI Integration

---

## 📦 Step 1: Create Supabase Project

1. Go to **[https://supabase.com](https://supabase.com)** and sign in (or create a free account)
2. Click **"New Project"**
3. Enter a project name (e.g. `mindwell`), set a database password, choose a region
4. Wait ~2 minutes for the project to be ready

---

## 🔑 Step 2: Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** — e.g. `https://xyzabc.supabase.co`
   - **anon / public key** — the long JWT token

3. Open **`src/supabase.js`** and replace:
```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';      // ← paste your Project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ← paste your anon key
```

---

## 🗄️ Step 3: Create the Database Tables

1. In Supabase dashboard, go to **SQL Editor** → **New Query**
2. Open the file `supabase_schema.sql` from this project
3. **Copy all the SQL** and paste it into the SQL Editor
4. Click **Run** (▶ button)
5. You should see "Success. No rows returned" — that means all tables and policies were created

**Tables created:**
| Table | Purpose |
|-------|---------|
| `profiles` | Extended user info (age, blood group, etc.) |
| `mood_logs` | Daily mood entries |
| `gratitude_entries` | Gratitude journal entries |
| `emergency_contacts` | Personal emergency contacts |
| `bp_readings` | Blood pressure history |
| `breathing_sessions` | Breathing session logs |

---

## 🔒 Step 4: Configure Authentication

### Email/Password Auth (already enabled by default)
1. Go to **Authentication** → **Providers**
2. Confirm **Email** is enabled ✅

### Google OAuth (optional)
1. Go to **Authentication** → **Providers** → **Google**
2. Enable it
3. Go to [Google Cloud Console](https://console.cloud.google.com)
4. Create a project → **APIs & Services** → **Credentials** → **Create OAuth 2.0 Client**
5. Add these to "Authorized redirect URIs":
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```
6. Copy **Client ID** and **Client Secret** back to Supabase → Google provider settings
7. Save

---

## 🤖 Step 5: Set Up Groq AI (Chatbot)

1. Go to **[https://console.groq.com](https://console.groq.com)** and sign in
2. Click **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_...`)
4. Open **`src/services/chatbot.js`** and replace:
```js
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY'; // ← paste your Groq API key
```

**Model used:** `llama-3.1-8b-instant` (free tier, fast responses)

> **Note:** Groq has a generous free tier — 30 requests/minute on the free plan.

---

## 🚀 Step 6: Run the App

Since this is a vanilla HTML/CSS/JS project, you can serve it with any static server:

```bash
# Option 1: Python (no install needed)
cd /path/to/mental-health-platform.nosync
python3 -m http.server 5173

# Option 2: npx serve
npx serve .

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then open **http://localhost:5173** in your browser.

---

## ✅ Step 7: Verify Everything Works

1. **Register** a new account → check Supabase **Authentication → Users** for the new user
2. **Log a mood** → check Supabase **Table Editor → mood_logs** for the entry
3. **Update profile** → check **Table Editor → profiles** for the changes
4. **Add emergency contact** → check **Table Editor → emergency_contacts**
5. **Open chatbot** → if Groq key is set, you'll see "Powered by Groq AI" in the header

---

## 🔐 Security Notes

- The **anon key** is safe to expose in the frontend — Row Level Security (RLS) policies ensure users can only see their own data
- Never expose the **service_role** key in your frontend code
- RLS policies are already created by the SQL schema — each user can only access their own rows

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| App works but data doesn't save | Check that SUPABASE_URL and SUPABASE_ANON_KEY are correctly set |
| "violates row-level security policy" error | Make sure you ran the full `supabase_schema.sql` including the RLS policies |
| Google sign-in fails | Verify the redirect URI exactly matches what's in Google Cloud Console |
| Chatbot uses generic responses | Make sure GROQ_API_KEY is set and the key starts with `gsk_` |
| Chatbot gets CORS error | This is expected in local file:// mode — use a local server (python3 -m http.server) |

---

## 💡 Suggested Future Features

- **Sleep Tracking** — Add sleep duration/quality to Health Check
- **AI Mood Insights** — Weekly AI analysis of mood patterns using Groq
- **Dark Mode** — System-aware dark theme toggle in Settings
- **Push Notifications** — Daily mood reminders via browser notifications API
- **Export Data** — Allow users to download their mood history as CSV
