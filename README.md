# MindWell - Mental Health Platform

This project has been split into **Frontend** and **Backend** to support reliable deployment.

## 📁 Project Structure

*   **/frontend**: The user interface (Vite + Vanilla JS). Deploy this to **Vercel**.
*   **/backend**: The AI companion server (Node.js + Express). Deploy this to **Render**.

---

## 🚀 Deployment Guide

### 1. Deploy the Backend (to Render)
1.  Push your code to a GitHub repository.
2.  Go to [Render.com](https://render.com) and create a new **Web Service**.
3.  Connect your GitHub repo and set the **Root Directory** to `backend`.
4.  **Build Command**: `npm install`
5.  **Start Command**: `node server.js`
6.  **Environment Variables**: Add `GROQ_API_KEY` with your key from Groq Console.
7.  Copy the URL Render gives you (e.g., `https://mindwell-api.onrender.com`).

### 2. Connect the Frontend to the Backend
1.  In your code, open `frontend/src/services/chatbot.js`.
2.  Update the `BACKEND_URL` on Line 9 with your new Render URL.
    ```javascript
    const BACKEND_URL = 'https://your-backend-url.onrender.com';
    ```

### 3. Deploy the Frontend (to Vercel)
1.  Go to [Vercel.com](https://vercel.com) and create a new project.
2.  Connect your GitHub repo and set the **Root Directory** to `frontend`.
3.  Vercel will auto-detect the Vite settings. Click **Deploy**.

---

## 🛠️ Local Development

### Run Backend
```bash
cd backend
npm install
node server.js
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```
