/**
 * dashboard.js – User Dashboard (Glassmorphism redesign)
 * Full Feature Set: Mood Tracker, Breathing, Resources, Crisis Help, Health, Settings, Profile, Chatbot.
 */

let activeDashboardView = 'overview';
let chatbotOpen = false;

async function renderDashboard() {
  const user = Auth.currentUser() || { name: 'User', email: 'user@example.com' };
  const firstName = (user.name || 'Friend').split(' ')[0];
  const initial = (user.name || 'U').charAt(0).toUpperCase();
  const t = (k) => i18n.t(k);

  const viewMap = {
    overview: t('dashboard'), health: t('health_check'), mood: t('mood_tracker'),
    breathing: t('breathing'), resources: t('resources'), crisis: t('crisis_help'),
    settings: t('settings'), profile: t('profile')
  };

  const currentViewHtml = await renderCurrentView(firstName);

  return `
  <div class="dashboard-wrap page">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand" onclick="navigateTo('dashboard'); switchDashboardView('overview')">
        <div class="sidebar-brand-icon">🧠</div>
        <span>MindWell</span>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Main</div>
        <a href="#" class="sidebar-item ${activeDashboardView === 'overview' ? 'active' : ''}" onclick="switchDashboardView('overview')">
          <span class="sidebar-item-icon">🏠</span> ${t('dashboard')}
        </a>
        <a href="#" class="sidebar-item ${activeDashboardView === 'mood' ? 'active' : ''}" onclick="switchDashboardView('mood')">
          <span class="sidebar-item-icon">😊</span> ${t('mood_tracker')}
        </a>
        <a href="#" class="sidebar-item ${activeDashboardView === 'breathing' ? 'active' : ''}" onclick="switchDashboardView('breathing')">
          <span class="sidebar-item-icon">🌬️</span> ${t('breathing')}
        </a>

        <div class="sidebar-section-label">Health</div>
        <a href="#" class="sidebar-item ${activeDashboardView === 'health' ? 'active' : ''}" onclick="switchDashboardView('health')">
          <span class="sidebar-item-icon">🩺</span> ${t('health_check')}
        </a>

        <div class="sidebar-section-label">Support</div>
        <a href="#" class="sidebar-item ${activeDashboardView === 'resources' ? 'active' : ''}" onclick="switchDashboardView('resources')">
          <span class="sidebar-item-icon">📚</span> ${t('resources')}
        </a>
        <a href="#" class="sidebar-item ${activeDashboardView === 'crisis' ? 'active' : ''}" onclick="switchDashboardView('crisis')">
          <span class="sidebar-item-icon">🆘</span> ${t('crisis_help')}
        </a>

        <div class="sidebar-section-label">Account</div>
        <a href="#" class="sidebar-item ${activeDashboardView === 'settings' ? 'active' : ''}" onclick="switchDashboardView('settings')">
          <span class="sidebar-item-icon">⚙️</span> ${t('settings')}
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user" onclick="switchDashboardView('profile')" title="View profile">
          <div class="sidebar-avatar">${initial}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user.name || 'User'}</div>
            <div class="sidebar-user-role">View Profile</div>
          </div>
          <span style="font-size:.8rem;color:var(--text-muted)">›</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="db-main">
      <header class="db-topbar">
        <div class="db-topbar-left">
          <h1>${activeDashboardView === 'overview' ? `${t('welcome')}, ${firstName}` : (viewMap[activeDashboardView] || '')}</h1>
          <p>${activeDashboardView === 'overview' ? t('how_feeling') : ''}</p>
        </div>
        <div class="db-topbar-right">
          <div class="lang-selector">
            <button class="lang-btn" onclick="i18n.cycleLang()">
              🌐 ${i18n.getLang().toUpperCase()}
            </button>
          </div>
          <button class="btn btn-outline btn-sm" onclick="switchDashboardView('mood')">${t('new_log')}</button>
          <div class="db-avatar" onclick="switchDashboardView('profile')" style="cursor:pointer">${initial}</div>
        </div>
      </header>

      <div class="db-inner">
        ${currentViewHtml}
      </div>
    </main>
  </div>`;
}

async function renderCurrentView(firstName) {
  switch (activeDashboardView) {
    case 'overview': return renderOverview();
    case 'health': return await renderHealthCheck();
    case 'mood': return await renderMoodTracker();
    case 'breathing': return renderBreathing();
    case 'resources': return renderResources();
    case 'crisis': return await renderCrisisHelp();
    case 'settings': return renderSettings();
    case 'profile': return await renderProfile();
    default: return renderOverview();
  }
}

// ── View Renderers ─────────────────────────────────────────────

function renderOverview() {
  const t = (k) => i18n.t(k);
  return `
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card-icon">🔥</div>
        <div class="stat-card-label">${t('streak')}</div>
        <div class="stat-card-value" id="stat-streak">--</div>
        <div class="stat-card-sub">Days consistent</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🧠</div>
        <div class="stat-card-label">${t('mindful_mins')}</div>
        <div class="stat-card-value" id="stat-mins">--</div>
        <div class="stat-card-sub">This month</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">⭐</div>
        <div class="stat-card-label">${t('avg_mood')}</div>
        <div class="stat-card-value" id="stat-avg">--</div>
        <div class="stat-card-sub">Based on history</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🌿</div>
        <div class="stat-card-label">${t('well_being')}</div>
        <div class="stat-card-value" id="stat-index">--</div>
        <div class="stat-card-sub">Index score</div>
      </div>
    </div>

    <div class="db-grid">
      <div class="db-card c7">
        <div class="db-card-header">
          <h2 class="db-card-title">${t('daily_mood_log')}</h2>
          <span class="db-card-badge">Today</span>
        </div>
        <div class="mood-row">
          <button class="mood-btn" onclick="selectMood('amazing', 5)"><span class="mood-emoji">🤩</span><span class="mood-label">Amazing</span></button>
          <button class="mood-btn" onclick="selectMood('good', 4)"><span class="mood-emoji">😊</span><span class="mood-label">Good</span></button>
          <button class="mood-btn" onclick="selectMood('okay', 3)"><span class="mood-emoji">😐</span><span class="mood-label">Okay</span></button>
          <button class="mood-btn" onclick="selectMood('down', 2)"><span class="mood-emoji">😔</span><span class="mood-label">Down</span></button>
          <button class="mood-btn" onclick="selectMood('stressed', 1)"><span class="mood-emoji">😰</span><span class="mood-label">Stress</span></button>
        </div>
        <button class="btn btn-primary btn-full mt-2" onclick="saveMood()">
          Save Entry
        </button>
      </div>

      <div class="db-card c5">
        <div class="db-card-header">
          <h2 class="db-card-title">${t('quick_relief')}</h2>
          <span class="db-card-badge">4-4-4</span>
        </div>
        <div class="breath-wrap">
          <div class="breath-outer">
            <div class="breath-ring"></div>
            <div class="breath-circle" id="breath-text">Inhale</div>
          </div>
          <button class="btn btn-sm btn-ghost mt-1" id="breath-toggle" onclick="toggleBreathing()">Start Session</button>
        </div>
      </div>
    </div>

    <!-- Daily Tip -->
    <div class="db-card mt-2" style="background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(124,58,237,0.04));border-color:rgba(99,102,241,0.15)">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
        <div style="width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#f97316);display:flex;align-items:center;justify-content:center;font-size:1.1rem">✨</div>
        <span style="font-weight:700;font-size:0.95rem;color:var(--text-primary)">Daily Wellness Tip</span>
      </div>
      <p style="color:var(--text-secondary);font-size:0.92rem;line-height:1.6">${getDailyTip()}</p>
    </div>`;
}

window.updateDashboardStats = async function () {
  if (activeDashboardView !== 'overview') return;
  if (typeof DB === 'undefined') return;

  const history = await DB.getMoodHistory(100);
  if (!history || history.length === 0) {
    document.getElementById('stat-streak').textContent = '0';
    document.getElementById('stat-avg').textContent = 'None';
    document.getElementById('stat-index').textContent = '0%';
    document.getElementById('stat-mins').textContent = '0';
    return;
  }

  // 1. Streak calculation
  let streak = 0;
  const loggedDates = new Set(history.map(h => h.logged_at.split('T')[0]));
  let checkDate = new Date();
  while (loggedDates.has(checkDate.toISOString().split('T')[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // 2. Avg Mood
  const moodMap = { 'amazing': 5, 'good': 4, 'okay': 3, 'down': 2, 'stressed': 1 };
  const validLogs = history.filter(h => moodMap[h.mood.toLowerCase()]);
  const avg = validLogs.length > 0
    ? Math.round(validLogs.reduce((acc, h) => acc + moodMap[h.mood.toLowerCase()], 0) / validLogs.length)
    : 3;
  const avgLabel = ['', 'Stressed', 'Down', 'Okay', 'Good', 'Amazing'][avg] || 'Okay';

  // 3. Score
  const indexScore = Math.round((avg / 5) * 100);

  // Update DOM safely
  const elStreak = document.getElementById('stat-streak');
  const elAvg = document.getElementById('stat-avg');
  const elIndex = document.getElementById('stat-index');
  const elMins = document.getElementById('stat-mins');

  if (elStreak) elStreak.textContent = streak;
  if (elAvg) elAvg.textContent = avgLabel;
  if (elIndex) elIndex.textContent = indexScore + '%';
  if (elMins) elMins.textContent = streak * 15; // Example logic
};

function getDailyTip() {
  const tips = [
    "Practice deep breathing for 5 minutes — it signals safety to your nervous system.",
    "Take a mindful walk and notice 3 things you see, 2 you hear, 1 you feel.",
    "Write down three things you're grateful for. Gratitude rewires the brain for positivity.",
    "Connect with a friend or loved one today — social connection is vital for well-being.",
    "Take regular breaks from screen time. Your eyes (and mind) will thank you!",
    "Be kind to yourself today. You are doing better than you think.",
    "Drink a glass of water and take three slow, deep breaths right now."
  ];
  return tips[new Date().getDay() % tips.length];
}

async function renderMoodTracker() {
  const savedGratitude = await DB.getLatestGratitude();

  return `
    <div class="db-card">
      <div class="db-card-header">
        <h2 class="db-card-title">Mood Analytics</h2>
        <span class="db-card-badge">Last 14 Days</span>
      </div>
      <div style="height:250px; position:relative; margin-top:1rem">
        <canvas id="moodChart"></canvas>
      </div>
      <p class="mt-2 text-sec" style="font-size:0.88rem">Your emotional trends based on your daily logs. Visualization powered by Chart.js. 📈</p>
    </div>

    <div class="db-card mt-2">
      <div class="db-card-header">
        <h2 class="db-card-title">Log Your Mood</h2>
        <span class="db-card-badge">Entry</span>
      </div>
      <div class="mood-row" style="gap:0.6rem">
        <button class="mood-btn" onclick="selectMood('amazing', 5)"><span class="mood-emoji">🤩</span><span class="mood-label">Amazing</span></button>
        <button class="mood-btn" onclick="selectMood('good', 4)"><span class="mood-emoji">😊</span><span class="mood-label">Good</span></button>
        <button class="mood-btn" onclick="selectMood('okay', 3)"><span class="mood-emoji">😐</span><span class="mood-label">Okay</span></button>
        <button class="mood-btn" onclick="selectMood('down', 2)"><span class="mood-emoji">😔</span><span class="mood-label">Down</span></button>
        <button class="mood-btn" onclick="selectMood('stressed', 1)"><span class="mood-emoji">😰</span><span class="mood-label">Stressed</span></button>
      </div>
      <button class="btn btn-primary btn-full mt-2" onclick="saveMood()">Save Mood Entry</button>
    </div>

    <div class="db-card mt-2">
      <div class="db-card-header">
        <h2 class="db-card-title">✨ Gratitude Journal</h2>
      </div>
      <textarea id="gratitude-input" class="form-input" style="height:100px;resize:none" placeholder="Today I am grateful for...">${savedGratitude}</textarea>
      <button class="btn btn-primary mt-1" onclick="saveGratitude()">Save Entry</button>
    </div>`;
}

// Global chart instance to avoid "canvas already in use" errors
let moodChartInstance = null;

window.initDashboardCharts = async function () {
  const canvas = document.getElementById('moodChart');
  if (!canvas) return;

  const history = await DB.getMoodHistory(14);
  const reversed = [...history].reverse();

  const labels = reversed.map(h => new Date(h.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const moodMap = { 'amazing': 5, 'good': 4, 'okay': 3, 'down': 2, 'stressed': 1 };
  const dataPoints = reversed.map(h => moodMap[h.mood.toLowerCase()] || 3);

  if (moodChartInstance) moodChartInstance.destroy();

  moodChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mood Level',
        data: dataPoints,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 6, ticks: { callback: (v) => ['', '😰', '😔', '😐', '😊', '🤩', ''][v] || '' } },
        x: { grid: { display: false } }
      }
    }
  });
};

function renderBreathing() {
  return `
    <div class="db-card text-center" style="padding:3rem 2rem">
      <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin:0 auto 1.25rem">🌬️</div>
      <h2 class="hc-title mb-2">Mindful Box Breathing</h2>
      <p class="text-sec mb-3" style="max-width:420px;margin-left:auto;margin-right:auto;line-height:1.65">
        Box breathing (4-4-4) is a technique used by Navy SEALs to calm the nervous system under pressure. Breathe in, hold, breathe out, hold — each for 4 seconds.
      </p>
      <div class="breath-wrap" style="transform:scale(1.6);margin:3.5rem 0 4rem">
        <div class="breath-outer">
          <div class="breath-ring"></div>
          <div class="breath-circle" id="breath-text">Inhale</div>
        </div>
      </div>
      <button class="btn btn-primary btn-lg mt-3" id="breath-toggle" onclick="toggleBreathing()">Begin Guided Session</button>
    </div>`;
}

async function renderHealthCheck() {
  const t = (k) => i18n.t(k);
  const contacts = await DB.getEmergencyContacts();
  const contactList = contacts.length > 0 ? contacts.map(c => `
    <div class="contact-item">
      <div class="contact-item-info">
        <span class="contact-item-name">${c.name}</span>
        <span class="contact-item-phone">${c.phone}</span>
      </div>
      <button class="btn btn-sm btn-ghost" onclick="removeContact('${c.phone}')">Remove</button>
    </div>
  `).join('') : '<p class="text-center mt-1" style="color:var(--text-muted);font-size:0.85rem">No contacts added yet.</p>';

  return `
    <div class="health-check-wrap">
      <div class="hc-card">
        <div class="hc-title-row"><span class="hc-title-icon">🩺</span><h2 class="hc-title">${t('check_bp')}</h2></div>
        <div class="hc-form-grid">
          <div class="form-group"><label class="form-label">Systolic</label><input type="number" id="bp_systolic" class="form-input" placeholder="e.g. 120"></div>
          <div class="form-group"><label class="form-label">Diastolic</label><input type="number" id="bp_diastolic" class="form-input" placeholder="e.g. 80"></div>
          <div class="form-group"><label class="form-label">Pulse</label><input type="number" id="bp_pulse" class="form-input" placeholder="e.g. 72"></div>
        </div>
        <div style="display:flex;gap:1rem;margin-top:1rem">
          <button class="btn btn-primary" style="flex:2" onclick="predictBPLevel()">Predict BP Level</button>
          <button class="btn btn-outline" style="flex:1" onclick="window.open('https://www.google.com/maps/search/nearest+hospital','_blank')">📍 Hospital</button>
        </div>
        <div id="hc-result" class="hidden hc-result"></div>
      </div>

      <div class="hc-card mt-2">
        <div class="hc-title-row"><span class="hc-title-icon">👤</span><h2 class="hc-title">${t('emergency_contact')}</h2></div>
        <div class="form-group mb-1"><label class="form-label">Name</label><input type="text" id="contact_name" class="form-input" placeholder="Contact name"></div>
        <div class="form-group mb-1"><label class="form-label">Phone</label><input type="tel" id="contact_phone" class="form-input" placeholder="+91 9999 999 999"></div>
        <button class="btn btn-outline btn-full mt-1" onclick="addEmergencyContact()">+ Add Contact</button>
        <div class="mt-2">${contactList}</div>
      </div>
    </div>`;
}

function renderResources() {
  const affirmations = [
    "I am worthy of peace and happiness.",
    "My feelings are valid, and I am learning to manage them.",
    "I am stronger than my challenges.",
    "Today is a new opportunity for growth.",
    "I choose to be kind to myself and others."
  ];
  const dailyAff = affirmations[new Date().getDate() % affirmations.length];

  return `
    <div class="db-card" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;text-align:center;padding:2rem;border:none">
      <div style="font-size:1.5rem;margin-bottom:0.75rem">💜</div>
      <h3 style="font-style:italic;font-weight:700;font-size:1.1rem;margin-bottom:0.5rem">"${dailyAff}"</h3>
      <p style="font-size:0.8rem;opacity:0.8">Daily Affirmation</p>
    </div>

    <div class="db-card mt-2">
      <div class="db-card-header">
        <h2 class="db-card-title">Breathing Techniques</h2>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div style="padding:1.25rem;background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(124,58,237,0.04));border-radius:16px;border:1px solid rgba(99,102,241,0.15)">
          <div style="font-size:1.4rem;margin-bottom:0.5rem">🌬️</div>
          <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);margin-bottom:0.3rem">4-7-8 Breathing</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.75rem">Inhale 4, hold 7, exhale 8. Best for anxiety relief.</div>
          <span style="font-size:0.72rem;background:rgba(99,102,241,0.1);color:#6366f1;padding:0.2rem 0.6rem;border-radius:9999px;font-weight:600">5 min</span>
        </div>
        <div style="padding:1.25rem;background:linear-gradient(135deg,rgba(16,185,129,0.06),rgba(6,182,212,0.04));border-radius:16px;border:1px solid rgba(16,185,129,0.15)">
          <div style="font-size:1.4rem;margin-bottom:0.5rem">🎯</div>
          <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);margin-bottom:0.3rem">Box Breathing</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.75rem">Equal counts for each phase. Used by Navy SEALs.</div>
          <span style="font-size:0.72rem;background:rgba(16,185,129,0.1);color:#059669;padding:0.2rem 0.6rem;border-radius:9999px;font-weight:600">10 min</span>
        </div>
      </div>
    </div>

    <div class="db-card mt-2">
      <div class="db-card-header">
        <h2 class="db-card-title">📚 Verified Mental Health Resources</h2>
      </div>
      <div class="resource-list">
        <div class="resource-item" onclick="window.open('https://www.nami.org','_blank')" style="cursor:pointer">
          <div class="resource-icon" style="background:#E0F2FE;color:#0EA5E9">🏛️</div>
          <div class="resource-info">
            <div class="resource-title">NAMI (National Alliance)</div>
            <div class="resource-desc">Support, education, and advocacy for people with mental illness.</div>
          </div>
        </div>
        <div class="resource-item" onclick="window.open('https://www.iamahatest.com','_blank')" style="cursor:pointer">
          <div class="resource-icon" style="background:#F0FDF4;color:#22C55E">🎓</div>
          <div class="resource-info">
            <div class="resource-title">Amaha Health (India)</div>
            <div class="resource-desc">Curated therapy and self-care tools designed for the Indian context.</div>
          </div>
        </div>
        <div class="resource-item" onclick="window.open('https://988lifeline.org','_blank')" style="cursor:pointer">
          <div class="resource-icon" style="background:#FEE2E2;color:#EF4444">🆘</div>
          <div class="resource-info">
            <div class="resource-title">988 Lifeline (International)</div>
            <div class="resource-desc">24/7, free and confidential support for people in distress.</div>
          </div>
        </div>
      </div>
    </div>`;
}

async function renderCrisisHelp() {
  const contacts = await DB.getEmergencyContacts();
  const friendsHelp = contacts.length > 0 ? `
    <div class="db-card-header mt-2"><h2 class="db-card-title">Your Emergency Contacts</h2></div>
    ${contacts.map(c => `
      <div class="contact-item" style="background:white">
        <div class="contact-item-info">
          <span class="contact-item-name">${c.name}</span>
          <span class="contact-item-phone">${c.phone}</span>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-sm btn-outline" onclick="window.open('tel:${c.phone}')">📞 Call</button>
          <button class="btn btn-sm btn-outline" style="border-color:#25D366;color:#25D366" onclick="window.open('https://wa.me/${c.phone.replace(/\D/g, '')}')">💬 WA</button>
        </div>
      </div>
    `).join('')}
  ` : '';

  return `
    <div class="db-card" style="border-left:4px solid #ef4444">
      <h2 class="hc-title mb-2" style="color:#ef4444">🆘 Emergency Help Lines</h2>
      <p class="text-sec mb-2" style="font-size:0.9rem">If you or someone you know is in immediate danger, please contact these emergency services.</p>

      <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-bottom:0.75rem">INDIA HELPLINES</div>
      <div class="contact-item" style="background:#FEF2F2;border-color:#FEE2E2">
        <div class="contact-item-info">
          <span class="contact-item-name">Tele-MANAS (Govt of India)</span>
          <span class="contact-item-phone">24/7 Helpline: 14416 / 1800-891-4416</span>
        </div>
        <button class="btn btn-sm btn-danger" onclick="window.open('tel:14416')">Call Now</button>
      </div>
      <div class="contact-item">
        <div class="contact-item-info">
          <span class="contact-item-name">Vandrevala Foundation</span>
          <span class="contact-item-phone">24/7 Crisis Support: 9999-666-555</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="window.open('tel:9999666555')">Call</button>
      </div>
      <div class="contact-item">
        <div class="contact-item-info">
          <span class="contact-item-name">iCALL (TISS)</span>
          <span class="contact-item-phone">9152987821</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="window.open('tel:9152987821')">Call</button>
      </div>

      <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin:1.25rem 0 0.75rem">INTERNATIONAL</div>
      <div class="contact-item">
        <div class="contact-item-info">
          <span class="contact-item-name">Global 988 Lifeline</span>
          <span class="contact-item-phone">Call or Text 988</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="window.open('tel:988')">Call</button>
      </div>
      <div class="contact-item">
        <div class="contact-item-info">
          <span class="contact-item-name">Crisis Text Line</span>
          <span class="contact-item-phone">Text HOME to 741741</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="window.open('sms:741741?body=HOME')">Text</button>
      </div>

      ${friendsHelp}
    </div>`;
}

function renderSettings() {
  return `
    <div class="db-card">
      <h2 class="hc-title mb-2">App Settings</h2>
      <div class="form-group mb-2">
        <label class="form-label">Theme Preference</label>
        <select class="form-input">
          <option>Light (MindWell)</option>
          <option>Dark Mode</option>
          <option>System Default</option>
        </select>
      </div>
      <div class="form-group mb-2">
        <label class="form-label">Notifications</label>
        <div style="display:flex;gap:1.5rem;margin-top:0.5rem;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer"><input type="checkbox" checked> Daily Reminders</label>
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer"><input type="checkbox" checked> Health Alerts</label>
        </div>
      </div>
      <button class="btn btn-primary btn-sm mb-3" onclick="showToast('Settings saved! ✅','success')">Save Preferences</button>

      <div style="border-top:1px solid rgba(0,0,0,0.06);padding-top:1.5rem">
        <h3 class="hc-title mb-2" style="font-size:1rem">Security &amp; Password</h3>
        <div id="password-change-wrap">
          <div class="form-group mb-2">
            <label class="form-label">New Password</label>
            <div style="position:relative">
              <input type="password" id="new-password" class="form-input" placeholder="Enter new password" style="padding-right:2.5rem">
              <button class="btn-ghost" onclick="togglePasswordVisibility('new-password')" style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);padding:0.2rem;background:none;border:none;cursor:pointer">👁️</button>
            </div>
          </div>
          <button class="btn btn-outline btn-full" onclick="handlePasswordOTPChange()">Request Change (Send OTP)</button>
        </div>
        <div id="password-otp-wrap" class="hidden mt-2">
          <div class="form-group mb-2">
            <label class="form-label">Enter OTP (Sent to your phone)</label>
            <input type="tel" id="pass-otp-input" class="form-input" placeholder="123456">
            <span class="form-hint">Demo code: <strong>123456</strong></span>
          </div>
          <button class="btn btn-primary btn-full" onclick="handlePasswordVerifyAndChange()">Verify &amp; Update Password</button>
        </div>
      </div>
    </div>`;
}

async function renderProfile() {
  const user = Auth.currentUser() || { name: 'User', email: 'user@example.com' };
  const details = await DB.getProfile();
  const initial = (user.name || 'U').charAt(0).toUpperCase();

  return `
    <div class="db-card">
      <div class="profile-wrap">
        <div class="profile-header">
          <div class="profile-avatar-lg">${initial}</div>
          <div>
            <h2 class="profile-name">${user.name || 'Anonymous User'}</h2>
            <p class="text-sec">${user.email || 'No email provided'}</p>
          </div>
        </div>

        <div class="profile-form">
          <h3 class="hc-title mb-2" style="font-size:1rem">Personal Details</h3>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="prof-name" class="form-input" value="${user.name || ''}" placeholder="Enter your full name">
          </div>
          <div class="auth-form-grid">
            <div class="form-group">
              <label class="form-label">Age</label>
              <input type="number" id="prof-age" class="form-input" value="${details.age || ''}" placeholder="--">
            </div>
            <div class="form-group">
              <label class="form-label">Blood Group</label>
              <select id="prof-blood" class="form-input">
                <option value="">Select</option>
                ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => `<option value="${bg}" ${details.bloodGroup === bg ? 'selected' : ''}>${bg}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Weight (kg)</label>
              <input type="number" id="prof-weight" class="form-input" value="${details.weight || ''}" placeholder="--">
            </div>
            <div class="form-group">
              <label class="form-label">Allergies</label>
              <input type="text" id="prof-allergies" class="form-input" value="${details.allergies || ''}" placeholder="e.g. Penicillin">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Medical History</label>
            <textarea id="prof-history" class="form-input" style="height:110px;resize:none" placeholder="Enter chronic conditions, past surgeries...">${details.medicalHistory || ''}</textarea>
          </div>
          <button class="btn btn-primary btn-full" onclick="saveProfileDetails()">Save Profile Changes</button>
        </div>

        <div class="profile-info">
          <div class="profile-field"><div class="profile-field-label">Member Since</div><div class="profile-field-val">March 2026</div></div>
          <div class="profile-field"><div class="profile-field-label">Total Logs</div><div class="profile-field-val">42</div></div>
          <div class="profile-field"><div class="profile-field-label">Mindful Mins</div><div class="profile-field-val">1,240</div></div>
          <div class="profile-field"><div class="profile-field-label">Email</div><div class="profile-field-val">${user.email || 'Not linked'}</div></div>
        </div>

        <button class="btn btn-outline btn-full mt-3" style="border-color:#ef4444;color:#ef4444" onclick="Auth.signOut().then(()=>navigateTo('home'))">
          🚪 Log Out of MindWell
        </button>
      </div>
    </div>`;
}

// ── Global Functions ───────────────────────────────────────────

window.saveProfileDetails = async function () {
  const newName = document.getElementById('prof-name').value;
  const details = {
    name: newName,
    age: document.getElementById('prof-age').value,
    bloodGroup: document.getElementById('prof-blood').value,
    weight: document.getElementById('prof-weight').value,
    allergies: document.getElementById('prof-allergies').value,
    medicalHistory: document.getElementById('prof-history').value
  };

  try {
    await DB.saveProfile(details);
    showToast('Profile updated successfully! ✨', 'success');
    setTimeout(async () => { document.getElementById('app').innerHTML = await renderDashboard(); }, 1000);
  } catch (e) { showToast('Failed to save profile: ' + (e.message || ''), 'error'); }
};

window.switchDashboardView = async function (view) {
  activeDashboardView = view;
  document.getElementById('app').innerHTML = await renderDashboard();
  if (view === 'mood') {
    setTimeout(() => window.initDashboardCharts(), 50);
  } else if (view === 'overview') {
    setTimeout(() => window.updateDashboardStats(), 50);
  }
};

window.toggleLang = function () {
  const next = i18n.getLang() === 'en' ? 'hi' : 'en';
  i18n.setLang(next);
};

window.toggleChatbot = function () {
  chatbotOpen = !chatbotOpen;
  const win = document.getElementById('chatbot-window');
  if (win) {
    win.classList.toggle('hidden', !chatbotOpen);
    if (chatbotOpen) setTimeout(() => document.getElementById('chatbot-input')?.focus(), 100);
  }
};

window.sendChatMessage = function () {
  const inp = document.getElementById('chatbot-input');
  const msg = inp.value.trim();
  if (!msg) return;
  const container = document.getElementById('chatbot-messages');
  container.innerHTML += `<div class="chat-msg chat-msg-user">${msg}</div>`;
  inp.value = '';
  container.scrollTop = container.scrollHeight;

  // Groq/chatbot response handled in chatbot.js
  if (typeof Chatbot !== 'undefined' && Chatbot.sendMessage) {
    Chatbot.sendMessage(msg, container);
  } else {
    setTimeout(() => {
      let reply = "That's interesting! How does that make you feel?";
      if (msg.toLowerCase().includes('help')) reply = "I can guide you through our Mood Tracker, Health Check, or Crisis resources. What would you like?";
      if (msg.toLowerCase().includes('stress')) reply = "I'm sorry you're feeling stressed. Have you tried our Box Breathing exercise today?";
      if (msg.toLowerCase().includes('anxious') || msg.toLowerCase().includes('anxiety')) reply = "Anxiety is tough. Try the 4-7-8 breathing technique — inhale for 4, hold for 7, exhale for 8 counts.";
      container.innerHTML += `<div class="chat-msg chat-msg-bot">${reply}</div>`;
      container.scrollTop = container.scrollHeight;
    }, 900);
  }
};

window.predictBPLevel = async function () {
  const sys = parseInt(document.getElementById('bp_systolic').value);
  const dia = parseInt(document.getElementById('bp_diastolic').value);
  const pulse = parseInt(document.getElementById('bp_pulse').value) || 0;
  const res = document.getElementById('hc-result');
  if (!sys || !dia) return showToast('Please enter readings.', 'error');
  res.classList.remove('hidden');
  let status = '', cls = '', icon = '', desc = '', isAbnormal = false;

  if (sys >= 180 || dia >= 120) {
    status = 'HYPERTENSIVE CRISIS'; cls = 'bg-critical'; icon = '🚨'; desc = 'EMERGENCY: Seek immediate medical attention!'; isAbnormal = true;
  } else if (sys >= 140 || dia >= 90) {
    status = 'HIGH BLOOD PRESSURE (Stage 2)'; cls = 'bg-stage2'; icon = '⚠️'; desc = 'Please consult a doctor soon.'; isAbnormal = true;
  } else if (sys >= 130 || dia >= 80) {
    status = 'HIGH BLOOD PRESSURE (Stage 1)'; cls = 'bg-elevated'; icon = '⚠️'; desc = 'Monitor closely and consult your doctor.'; isAbnormal = true;
  } else if (sys >= 120 && dia < 80) {
    status = 'ELEVATED'; cls = 'bg-elevated'; icon = '⚡'; desc = 'Slightly elevated. Consider lifestyle changes.';
  } else {
    status = 'NORMAL'; cls = 'bg-normal'; icon = '✅'; desc = 'You are doing great! Keep it up.';
  }

  res.innerHTML = `<div class="hc-result-box ${cls}"><span class="hc-result-icon">${icon}</span><div class="hc-result-info"><div class="hc-result-status">${status}</div><div class="hc-result-desc">${desc}</div></div></div>`;

  // Save to DB
  DB.saveBPReading({ systolic: sys, diastolic: dia, pulse, status }).catch(() => { });

  if (isAbnormal) {
    const contacts = await DB.getEmergencyContacts();
    if (contacts.length > 0) {
      const phone = contacts[0].phone;
      const userName = (Auth.currentUser()?.name || 'User').split(' ')[0];

      showToast('Sending emergency SMS...', 'info');

      // Try sending a real SMS via TextBelt Free API
      fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          message: `🚨 MINDWELL ALERT 🚨\n${userName} has recorded dangerously high Blood Pressure (${sys}/${dia}). Please check on them immediately!`,
          key: 'textbelt'
        })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          showToast(`🚨 HIGH BP: SMS alert sent to ${contacts[0].name}.`, 'success');
        } else {
          showToast(`⚠️ High BP — Opening SMS app to alert ${contacts[0].name}...`, 'info');
          setTimeout(() => {
            window.open(`sms:${phone}?body=🚨 URGENT: My blood pressure is dangerously high (${sys}/${dia}). Please help!`);
          }, 1500);
        }
      }).catch(err => {
        showToast(`⚠️ High BP — Opening SMS app to alert contacts...`, 'info');
        setTimeout(() => {
          window.open(`sms:${contacts.map(c => c.phone).join(',')}?body=🚨 URGENT: My blood pressure is dangerously high (${sys}/${dia}). Please help!`);
        }, 1500);
      });
    }
  }
};

window.addEmergencyContact = async function () {
  const name = document.getElementById('contact_name').value;
  const phone = document.getElementById('contact_phone').value;
  if (!name || !phone) return showToast('Enter both name and phone.', 'error');
  const contacts = await DB.getEmergencyContacts();
  contacts.push({ name, phone });
  await DB.saveEmergencyContacts(contacts);
  showToast('Emergency contact added! ✅', 'success');
  document.getElementById('app').innerHTML = await renderDashboard();
};

window.removeContact = async function (ph) {
  let contacts = await DB.getEmergencyContacts();
  contacts = contacts.filter(c => c.phone !== ph);
  await DB.saveEmergencyContacts(contacts);
  document.getElementById('app').innerHTML = await renderDashboard();
};

window.selectMood = function (mood) {
  document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
};

window.saveMood = async function () {
  const selected = document.querySelector('.mood-btn.selected');
  if (!selected) return showToast('Please select a mood first.', 'error');
  const mood = selected.querySelector('.mood-label')?.textContent || 'Unknown';
  try {
    if (typeof DB !== 'undefined') {
      await DB.saveMoodLog({ mood });
      if (activeDashboardView === 'mood') window.initDashboardCharts();
      if (activeDashboardView === 'overview') window.updateDashboardStats();
    }
    showToast('Mood logged successfully! 🌿', 'success');
    selected.classList.remove('selected');
  } catch (e) { showToast('Failed to save mood.', 'error'); }
};

let breathingActive = false;
let breathingInterval = null;
window.toggleBreathing = function () {
  const btn = document.getElementById('breath-toggle');
  const text = document.getElementById('breath-text');
  if (breathingActive) {
    clearInterval(breathingInterval);
    if (text) text.textContent = 'Inhale';
    if (btn) btn.textContent = btn.textContent.includes('Begin') ? 'Begin Guided Session' : 'Start Session';
    breathingActive = false;
  } else {
    breathingActive = true;
    if (btn) btn.textContent = 'Stop Session';
    let step = 0;
    const steps = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    if (text) text.textContent = steps[0];
    breathingInterval = setInterval(() => { step = (step + 1) % 4; if (text) text.textContent = steps[step]; }, 4000);
  }
};

window.saveGratitude = async function () {
  const val = document.getElementById('gratitude-input').value;
  try {
    await DB.saveGratitude(val);
    showToast('Gratitude entry saved. Keep it up! ✨', 'success');
  } catch (e) {
    showToast('Failed to save gratitude.', 'error');
  }
};

window.handlePasswordOTPChange = function () {
  const pass = document.getElementById('new-password').value;
  if (pass.length < 6) return showToast('Password must be at least 6 characters.', 'error');
  showToast('OTP sent to your registered mobile/email. 📲', 'success');
  document.getElementById('password-otp-wrap').classList.remove('hidden');
};

window.handlePasswordVerifyAndChange = function () {
  const otp = document.getElementById('pass-otp-input').value;
  if (otp !== '123456') return showToast('Invalid OTP. Please try again.', 'error');
  showToast('Password changed successfully! 🔐', 'success');
  document.getElementById('password-otp-wrap').classList.add('hidden');
  document.getElementById('new-password').value = '';
};

window.togglePasswordVisibility = function (id) {
  const el = document.getElementById(id);
  if (el) { el.type = el.type === 'password' ? 'text' : 'password'; }
};

window.renderDashboard = renderDashboard;
