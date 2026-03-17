/**
 * i18n.js – Lightweight translation service
 */

const translations = {
    en: {
        welcome: "Welcome back",
        how_feeling: "How are you feeling today?",
        dashboard: "Dashboard",
        mood_tracker: "Mood Tracker",
        breathing: "Breathing",
        resources: "Resources",
        crisis_help: "Crisis Help",
        settings: "Settings",
        health_check: "Health Check",
        sign_out: "Sign Out",
        new_log: "New Log",
        streak: "Streak",
        mindful_mins: "Mindful Mins",
        avg_mood: "Avg Mood",
        well_being: "Well-being",
        daily_mood_log: "Daily Mood Log",
        quick_relief: "Quick Relief",
        recommended: "Recommended for You",
        emergency_contact: "Emergency Contact",
        check_bp: "Check Blood Pressure",
        profile: "User Profile",
        language: "Language"
    },
    hi: {
        welcome: "नमस्ते वापस",
        how_feeling: "आज आप कैसा महसूस कर रहे हैं?",
        dashboard: "डैशबोर्ड",
        mood_tracker: "मूड ट्रैकर",
        breathing: "साँस लेना",
        resources: "संसाधन",
        crisis_help: "संकट सहायता",
        settings: "सेटिंग्स",
        health_check: "स्वास्थ्य जाँच",
        sign_out: "साइन आउट",
        new_log: "नया लॉग",
        streak: "लगातार दिन",
        mindful_mins: "सचेत मिनट",
        avg_mood: "औसत मूड",
        well_being: "कल्याण",
        daily_mood_log: "दैनिक मूड लॉग",
        quick_relief: "त्वरित राहत",
        recommended: "आपके लिए अनुशंसित",
        emergency_contact: "आपातकालीन संपर्क",
        check_bp: "रक्तचाप की जाँच करें",
        profile: "उपयोगकर्ता प्रोफ़ाइल",
        language: "भाषा"
    },
    te: {
        welcome: "తిరిగి స్వాగతం",
        how_feeling: "ఈరోజు మీరు ఎలా ఉన్నారు?",
        dashboard: "డ్యాష్‌బోర్డ్",
        mood_tracker: "మూడ్ ట్రాకర్",
        breathing: "శ్వాస",
        resources: "వనరులు",
        crisis_help: "సంక్షోభ సహాయం",
        settings: "సెట్టింగులు",
        health_check: "ఆరోగ్య పరీక్ష",
        sign_out: "సైన్ అవుట్",
        new_log: "కొత్త లాగ్",
        streak: "స్ట్రీక్",
        mindful_mins: "మైండ్‌ఫుల్ నిమిషాలు",
        avg_mood: "సగటు మూడ్",
        well_being: "శ్రేయస్సు",
        daily_mood_log: "రోజువారీ మూడ్ లాగ్",
        quick_relief: "త్వరిత ఉపశమనం",
        recommended: "మీ కోసం సిఫార్సు చేయబడింది",
        emergency_contact: "అత్యవసర పరిచయం",
        check_bp: "రక్తపోటును తనిఖీ చేయండి",
        profile: "వినియోగదారు ప్రొఫైల్",
        language: "భాష"
    }
};

let currentLang = localStorage.getItem('mw_lang') || 'en';
if (!translations[currentLang]) currentLang = 'en';

window.i18n = {
    t(key) {
        return (translations[currentLang] && translations[currentLang][key])
            || translations.en[key]
            || key;
    },
    setLang(lang) {
        if (translations[lang]) {
            currentLang = lang;
            localStorage.setItem('mw_lang', lang);
            // Re-render dashboard if active
            if (typeof renderDashboard === 'function' && document.querySelector('.dashboard-wrap')) {
                document.getElementById('app').innerHTML = renderDashboard();
            }
        }
    },
    cycleLang() {
        const langs = ['en', 'hi', 'te'];
        const idx = langs.indexOf(currentLang);
        const next = langs[(idx + 1) % langs.length];
        this.setLang(next);
    },
    getLang() {
        return currentLang;
    }
};
