// main.js - Vite Entry Point for Production Bundling
import './supabase.js';
import './services/i18n.js';
import './services/chatbot.js';
import './3d-scene.js';
import './auth.js';
import './dashboard.js';
import './app.js';

// Initialize chatbot after all scripts have loaded
window.addEventListener('load', () => {
    if (window.Chatbot) {
        window.Chatbot.init();
    }
});
