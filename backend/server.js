import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS — allow localhost (dev) + your Vercel frontend URL ────
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL, // Set this in Render environment variables
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
        if (!origin) return callback(null, true);
        const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
        if (isAllowed) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function getSystemPrompt(userName = 'there') {
    return `You are MindWell's compassionate AI mental health companion. Your name is MindWell AI.
The user you are talking to is named ${userName}. Address them politely.
Your role:
- You are a highly empathetic, warm, and supportive AI companion.
- You specialize in active listening. Validate the user's feelings first (e.g., "I hear how difficult that is for you").
- Offer gentle, science-based coping tips (4-4-4 breathing, grounding 5-4-3-2-1, journaling).
- Keep responses concise (2-4 sentences) but meaningful. Avoid sounding like a robot.
- Format for readability: use **bold** for emphasis and bullet points for steps.
- CRISIS PROTOCOL: If any mentions of self-harm occur, provide Tele-MANAS (14416) or 988 immediately.
- IMPORTANT: You have memory of the current conversation. Refer back to things the user said earlier to show you are listening.`;
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'MindWell Backend' });
});

app.post('/api/chat', async (req, res) => {
    const { messages, userName } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format' });
    }

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: getSystemPrompt(userName) },
                    ...messages
                ],
                max_tokens: 400,
                temperature: 0.75
            })
        });

        if (!response.ok) {
            const errTxt = await response.text();
            throw new Error(`Groq HTTP ${response.status}: ${errTxt}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ MindWell Backend running on http://localhost:${PORT}`);
});
