# EduPulse 🎓🚀

**Live Demo:** [https://edupulse-brown.vercel.app/](https://edupulse-brown.vercel.app/)

EduPulse is an **AI-powered Adaptive Learning Platform** designed to personalize education. It uses real-time behavioral analysis and Generative AI (Google Gemini) to adjust content difficulty, detect student emotions (boredom, frustration), and provide instant, context-aware tutoring.

---

## 🌟 Key Features

### 1. 🧠 Adaptive Learning Engine
*   **Dynamic Difficulty Adjustment**: The system analyzes your answers and time taken to increase or decrease question difficulty in real-time.
*   **Knowledge Tracing**: Tracks mastery across different concepts (e.g., Arrays, Linked Lists) and suggests what to learn next.

### 2. 🤖 AI Tutor (Powered by Gemini)
*   **Context-Aware Help**: The AI tutor knows exactly which question you are stuck on and provides hints without giving away the answer.
*   **Interactive Chat**: Ask follow-up questions or request examples in specific programming languages.

### 3. 📊 Behavioral Analytics
*   **Emotion Detection**: Infers student states (Flow, Anxious, Bored, Frustrated) based on interaction patterns (e.g., rage clicks, tab switching, rapid guessing).
*   **Teacher Dashboard**: Provides educators with aggregated insights into class performance and struggles.

### 4. 🛡️ Secure & Scalable
*   **Authentication**: Secure login/signup via Supabase Auth.
*   **Modern Stack**: Built with React (Vite) for a fast frontend and FastAPI for a high-performance backend.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [TailwindCSS](https://tailwindcss.com/) + Framer Motion (Animations)
*   **Icons**: Lucide React
*   **Charts**: Recharts

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **AI Model**: Google Gemini 1.5 Flash (via `google-generativeai`)
*   **Data Processing**: NumPy, Scikit-learn

### Infrastructure
*   **Database & Auth**: [Supabase](https://supabase.com/)
*   **Hosting**: Vercel (Frontend), Render (Backend)

---

## 🚀 How It Works

1.  **Student Login**: Users sign in and select a learning domain (e.g., Data Structures).
2.  **Diagnostic / Session Start**: The system initializes a session.
3.  **The Loop**:
    *   **Question**: Backend serves a question based on current mastery.
    *   **Interaction**: User answers; telemetry (clicks, time) is recorded.
    *   **Analysis**: Backend calculates new mastery score and detects emotion.
    *   **Adaptation**: The next question is selected to keep the student in the "Flow" zone.
4.  **Assistance**: At any point, the student can click "Ask AI" for personalized help.

---

## 💻 Local Setup & Installation

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   Supabase Account (for Auth)
*   Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/jaiyandhas/edupulse.git
cd edupulse
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
*   Create a `.env` file in `/backend` with:
    ```env
    GEMINI_API_KEY=your_gemini_api_key
    ```
*   Start the server:
    ```bash
    uvicorn main:app --reload
    ```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
*   Create a `.env` file in `/frontend` with:
    ```env
    VITE_API_URL=http://127.0.0.1:8000
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
*   Start the development server:
    ```bash
    npm run dev
    ```

---

## 🚢 Deployment

*   **Frontend**: Deployed on Vercel. Configured with `vercel.json` for SPA routing.
*   **Backend**: Deployed on Render as a Python Web Service.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

---

## 📝 License

This project is open-source and available under the MIT License.
