# Hybrid Deployment Instructions

This project uses a hybrid deployment strategy:
- **Backend (Python/FastAPI):** Deployed to **Render**.
- **Frontend (React/Vite):** Deployed to **Vercel**.

## 1. Push to GitHub
Ensure all your changes are committed and pushed to your GitHub repository.

```bash
git add .
git commit -m "Configure hybrid deployment"
git push origin main
```

## 2. Deploy Backend to Render
1.  Log in to [Render](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Render should automatically detect `render.yaml`. If not, choose "Build and deploy from a Git repository".
5.  **Important:** Ensure the **Root Directory** is set to `.` (root) or leave it empty if it defaults to root.
6.  The `render.yaml` file defines the service `instadownloader-backend`.
7.  Deploy the service.
8.  Once deployed, copy the **Service URL** (e.g., `https://instadownloader-backend.onrender.com`).

## 3. Deploy Frontend to Vercel
1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset:** Vite.
5.  **Root Directory:** Click "Edit" and select `frontend`.
6.  **Environment Variables:**
    -   Add a new variable:
        -   **Name:** `VITE_API_URL`
        -   **Value:** The Render Backend URL you copied earlier (e.g., `https://instadownloader-backend.onrender.com`). **Note:** Do not add a trailing slash `/` unless your code expects it (current code appends `/api`, so `https://...` is correct, but check if you need `https://.../api` if you changed logic. The code does `${API_URL}/download` where `API_URL` defaults to `.../api`. Wait, let's double check `api.js`).
        
        *Correction:* In `api.js`, we have:
        ```javascript
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const API_URL = `${BASE_URL}/api`;
        ```
        If you set `VITE_API_URL` to `https://your-backend.onrender.com`, then `API_URL` will be `https://your-backend.onrender.com/api`.
        
        **So, set `VITE_API_URL` to `https://your-backend.onrender.com` (no trailing slash, no `/api`).**

7.  Click **Deploy**.

## 4. Verify
-   Open your Vercel deployment URL.
-   Try to download a post.
-   If it works, you are all set!
