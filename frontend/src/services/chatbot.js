/**
 * chatbot.js — MindWell AI Companion (Frontend Client)
 * Communicates with the MindWell Backend for AI responses.
 */

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL)
  || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://mental-health-backend.onrender.com');

const FALLBACK_RESPONSES = {
  help: "I can guide you through our Mood Tracker, Health Check, or Crisis resources. What would you like to explore?",
  stress: "I'm sorry you're feeling stressed. Have you tried our Box Breathing exercise? Just 4 minutes of box breathing can significantly reduce cortisol levels. 🌬️",
  anxious: "Anxiety can feel overwhelming. Try the 4-7-8 technique: inhale for 4 counts, hold for 7, exhale for 8. This activates your parasympathetic nervous system. 💙",
  anxiety: "Anxiety can feel overwhelming. Try the 4-7-8 technique: inhale for 4 counts, hold for 7, exhale for 8. This activates your parasympathetic nervous system. 💙",
  sad: "I'm sorry you're feeling sad. It's okay to not be okay. Would you like to write in your gratitude journal? Even small positive moments can help shift your perspective.",
  depressed: "I hear you. Depression is real and valid. Please know you're not alone. Consider reaching out to iCALL at 9152987821, or check our Resources section for support.",
  sleep: "Sleep is foundational to mental health. Try avoiding screens 30 mins before bed, keep a consistent sleep schedule, and practice the breathing exercises before sleeping.",
  lonely: "Loneliness is more common than most people realize. You're brave for acknowledging it. Try sending a message to someone you haven't talked to in a while — even a small connection matters.",
  happy: "That's wonderful to hear! 🎉 Positive emotions are worth celebrating. Have you logged your mood today to track this feeling?",
  crisis: "If you're in immediate danger, please call Tele-MANAS at 14416 (India) or 988 (International). You can also text HOME to 741741. Your life matters. 💙",
  default: "I hear you. How does that make you feel? Sometimes just naming our emotions is the first step to processing them. I'm here for you."
};

function getKeywordResponse(msg) {
  const m = msg.toLowerCase();
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (key !== 'default' && m.includes(key)) return response;
  }
  return FALLBACK_RESPONSES.default;
}

// Format markdown-like bold (**text**) and newlines (\n) to HTML
function formatAIResponse(text) {
  if (!text) return "";
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

async function callChatAPI(userMessage, conversationHistory = []) {
  try {
    const user = (typeof Auth !== 'undefined' && Auth.currentUser()) || {};
    const userName = user.name ? user.name.split(' ')[0] : 'there';

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName,
        messages: [
          ...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) throw new Error('Backend unavailable');

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('[MindWell] Chat API Error:', err);
    throw err;
  }
}

const Chatbot = {
  conversationHistory: [],

  init() {
    if (document.getElementById('chatbot-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'chatbot-fab';
    fab.className = 'chatbot-fab';
    fab.innerHTML = '🤖';
    fab.onclick = () => window.toggleChatbot?.();
    document.body.appendChild(fab);

    const win = document.createElement('div');
    win.id = 'chatbot-window';
    win.className = 'chatbot-window hidden';
    win.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-header-icon">🧠</div>
        <div>
          <div class="chatbot-header-title">MindWell AI</div>
          <div class="chatbot-header-sub">Your wellness companion</div>
        </div>
        <button onclick="toggleChatbot()" style="margin-left:auto;background:none;border:none;color:white;cursor:pointer;font-size:1.1rem;opacity:0.8;padding:0 0.5rem">✕</button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chat-msg chat-msg-bot">
          Hi! I'm your MindWell companion. 👋 How are you feeling today?
        </div>
      </div>
      <div class="chatbot-input-row" style="position:relative">
        <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Type a message…" onkeypress="if(event.key==='Enter') sendChatMessage()">
        <button class="chatbot-send" onclick="sendChatMessage()">➤</button>
      </div>`;
    document.body.appendChild(win);
  },

  async sendMessage(userMsg, container) {
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-msg chat-msg-bot';
    typingEl.id = 'chat-typing';
    typingEl.innerHTML = '<span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span>';
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;

    try {
      const reply = await callChatAPI(userMsg, this.conversationHistory);
      this.conversationHistory.push({ role: 'user', content: userMsg });
      this.conversationHistory.push({ role: 'assistant', content: reply });

      const typing = document.getElementById('chat-typing');
      if (typing) typing.remove();

      container.innerHTML += `<div class="chat-msg chat-msg-bot">${formatAIResponse(reply)}</div>`;
      container.scrollTop = container.scrollHeight;
    } catch (e) {
      const typing = document.getElementById('chat-typing');
      if (typing) typing.remove();

      const fallback = getKeywordResponse(userMsg);
      container.innerHTML += `<div class="chat-msg chat-msg-bot">${fallback}</div>`;
      container.innerHTML += `<div style="font-size:0.7rem;color:#ef4444;text-align:center;margin-top:4px">AI offline. Showing standard response.</div>`;
      container.scrollTop = container.scrollHeight;
    }
  }
};

window.Chatbot = Chatbot;
window.toggleChatbot = function () {
  const win = document.getElementById('chatbot-window');
  if (win) win.classList.toggle('hidden');
};
window.sendChatMessage = function () {
  const input = document.getElementById('chatbot-input');
  const container = document.getElementById('chatbot-messages');
  const msg = input.value.trim();
  if (!msg) return;

  container.innerHTML += `<div class="chat-msg chat-msg-user">${msg}</div>`;
  input.value = '';
  Chatbot.sendMessage(msg, container);
};
