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
4.  **Environment Variables**:
    -   **Name**: `VITE_API_URL`
    -   **Value**: The **Backend URL** from Step 2 (e.g., `https://edupulse-backend.onrender.com`) - *Note: Do not include trailing slash*.
5.  **Deploy**: Click "Deploy".

## Troubleshooting
-   **CORS Errors**: If the frontend cannot talk to the backend, ensure the backend's `main.py` has allowed origins configured (currently set to `["*"]` which is open for development).
-   **Data Loss**: On Render's free tier, the filesystem is ephemeral. Any data saved to local files (like user profiles) will be lost when the service restarts.
