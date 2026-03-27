---
name: chat-agent-debug
description: 'Debug and fix the Care Nest Chat Page AI agent when it does not respond, by verifying backend connectivity, proxy settings, and frontend API calls.'
argument-hint: 'Describe the symptoms (e.g., no response, network errors, wrong language)'
user-invocable: true
---

# Chat Agent Debug & Fix

## When to Use
- The chat UI accepts input but does not show an AI assistant reply.
- Responses are always the fallback echo or missing entirely.
- You see network errors in browser DevTools related to `/api/chat`.

## What this skill does
- Ensures the frontend calls the correct backend endpoint (`/api/chat`) so Vite proxy or production routing works.
- Verifies backend is running and accessible.
- Guides you through how to inspect and correct the most common causes of a non-responsive chat agent.

## Procedure

1. **Confirm backend is running**
   - Ensure the Flask backend is started (e.g., `python backend/app.py` or `python -m backend.app`).
   - By default, Flask runs on `http://127.0.0.1:5000`.

2. **Check frontend API target**
   - Open `frontend/src/pages/ChatPage.jsx`.
   - Confirm the request uses a relative endpoint (`/api/chat`) not a hardcoded host/port.
   - If updating, the request should look like:
     ```js
     const response = await fetch('/api/chat', { ... });
     ```

3. **Verify Vite proxy (dev mode)**
   - Open `frontend/vite.config.js`.
   - Confirm `/api` is proxied to the correct backend port (e.g., `http://127.0.0.1:5000`).

4. **Inspect the browser network tab**
   - Open DevTools → Network.
   - Send a message in the chat and look for the `/api/chat` request.
   - Check the response status (200 vs 401/404/500) and any error messages.

5. **Validate authentication flow**
   - The backend `POST /api/chat` requires a bearer token.
   - If not signed in, the frontend may need to trigger anonymous login using the existing `AuthContext`.
   - If you prefer to allow unauthenticated chat, update backend auth rules (cautiously).

## Notes
- This skill is intentionally focused on the chat agent path; it does not touch other UI flows.
- If you need a deeper fix (e.g., response formatting, AI prompt tuning), augment the backend `generate_ai_response` logic in `backend/app.py`.

## Related resources
- [ChatPage.jsx](../../frontend/src/pages/ChatPage.jsx)
- [Vite proxy config](../../frontend/vite.config.js)
- [Backend chat route](../../backend/app.py)
