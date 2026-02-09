# EduPulse Deployment Guide

This guide explains how to deploy the EduPulse platform.
- **Frontend**: Vercel
- **Backend**: Render

## 1. Prerequisites
- GitHub Account
- Vercel Account (for Frontend)
- Render Account (for Backend)
- **Important**: Ensure your local code is committed and pushed to a GitHub repository.

## 2. Backend Deployment (Render)
The backend is a FastAPI application.

1.  **Create a New Web Service** on [Render Dashboard](https://dashboard.render.com/).
2.  **Connect your GitHub repository**.
3.  **Configure the Service**:
    -   **Name**: `edupulse-backend` (or similar)
    -   **Root Directory**: `backend`
    -   **Runtime**: `Python 3`
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
4.  **Environment Variables**:
    -   Add `GEMINI_API_KEY` (Get this from your local `.env`)
    -   Add `PYTHON_VERSION` (Optional, e.g., `3.11.0`)
5.  **Deploy**: Click "Create Web Service".
6.  **Copy the URL**: Once deployed, copy the service URL (e.g., `https://edupulse-backend.onrender.com`). You will need this for the Frontend.

## 3. Frontend Deployment (Vercel)
The frontend is a React + Vite application.

1.  **Import Project** on [Vercel Dashboard](https://vercel.com/new).
2.  **Select your GitHub repository**.
3.  **Configure Project**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: `frontend`
    -   **Build Command**: `npm run build` (Default)
    -   **Output Directory**: `dist` (Default)
4.  **Environment Variables** (Go to Settings > Environment Variables):
    -   `VITE_API_URL`: Your Render Backend URL (e.g., `https://edupulse-backend.onrender.com`)
    -   `VITE_SUPABASE_URL`: Your Supabase Project URL (e.g., `https://xyz.supabase.co`)
    -   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5.  **Deploy**: Click "Deploy".

## 4. Supabase Configuration (Authentication)
To ensure users can log in on the deployed site, you must update Supabase settings.

1.  Go to your **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2.  **Site URL**: Enter your main Vercel URL.
    -   Example: `https://edupulse-brown.vercel.app`
3.  **Redirect URLs**: Add the following:
    -   `http://localhost:5173/**` (For local development)
    -   `https://edupulse-brown.vercel.app/**` (For production)
4.  Click **Save**.

## Troubleshooting
-   **White Screen**: Usually means missing environment variables. Check the Browser Console (F12) for errors like "supabaseUrl is required".
-   **CORS Errors**: If the frontend cannot talk to the backend, ensure the backend's `main.py` has allowed origins configured (currently set to `["*"]`).
-   **Login Redirect Loop**: Ensure your Redirect URLs in Supabase match exactly where the app is trying to go.
-   **Data Loss**: On Render's free tier, the filesystem is ephemeral. Any data saved to local files (like user profiles) will be lost when the service restarts.
