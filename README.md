# 🏛️ Sachivalayam Connect (సచివాలయం కనెక్ట్)
### Voice-First Rural Grievance Redressal & Citizen Portal

Sachivalayam Connect is an accessible, bilingual (Telugu & English) voice-first rural grievance registration and governance platform. It bridges grassroots citizens with local Grama/Ward Sachivalayam officials through spoken interactions, GPS geotagged photo evidence, urgency-based priority triage, and real-time tracking.

---

## 🚀 Key Features

- **🎙️ Bilingual Voice Assistant per Grievance Field**:
  - Citizens can speak naturally in **Telugu (తెలుగు)** or **English** to fill grievance category, title, description, and complexity/urgency.
  - Interactive micro-listening buttons beside each question with visual speech-wave animations and voice prompts.
  - Manual text typing and voice entry can be freely interchanged.

- **🚨 Intelligent Priority Triage & Emergency Dispatch**:
  - 4 Priority Tiers: **Normal**, **High**, **Urgent**, and **Critical (Emergency)**.
  - Filing a **Critical** grievance triggers an instant automated emergency email alert dispatch to administrative officials (`admin@sachivalayam.gov.in`) with grievance details, resident phone number, and coordinates.

- **📍 Geotagged Evidence & GPS Tracking**:
  - Captures high-accuracy device GPS coordinates (Latitude & Longitude) to verify physical incident locations.
  - Supports live camera photo capture or image upload for instant visual inspection by ward secretaries.

- **🔍 Instant Complaint Tracking & Search**:
  - Search complaints anytime using Complaint ID (e.g., `GRI-892401`), resident phone number, or keywords.
  - Live timeline view showing status transitions: `Submitted` ➔ `Under Review` ➔ `In Progress` ➔ `Resolved`.
  - Transparent status remarks explaining why a complaint is *In Progress* or *Pending*.

- **📊 Comprehensive Authority Dashboard**:
  - Real-time priority breakdown bar charts and status distribution metrics.
  - Urgency badges with visual pulsing alerts for critical complaints.
  - Emergency Alert Logs panel tracking all dispatched email notifications.
  - Direct status updates with official remarks and citizen feedback rating view.

- **☁️ Cloud Sync & Local Storage Resilience**:
  - Dual persistence: Express backend local database (`server/data/database.json`) synchronized in real time with **Firebase Realtime Database**.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS Design System with Glassmorphism & Responsive Layouts
- **Voice / Speech**: Web Speech Recognition API & Web SpeechSynthesis API (`te-IN`, `en-IN`, `en-US`)
- **Backend**: Node.js & Express (`/api/complaints`, `/api/upload`, `/api/emergency-alerts`, `/api/analytics`)
- **Database**: Express Persistent File DB + Firebase Realtime Database REST Sync
- **Deployment**: Render (Unified Fullstack Web Service) / Vercel (Frontend & SPA Rewrites)

---

## 🌐 1-Click Deployment Guide

### Option 1: Render (Recommended for Fullstack)
Render deploys both the Express backend and React frontend together under a single free URL:

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository: `pavankumarmushkarla630-pixel/SachiConnect-Csp`.
4. Render will automatically read `render.yaml` or you can configure:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Create Web Service**. Your app will be live on `https://sachiconnect-xxxx.onrender.com`.

### Option 2: Vercel (Frontend)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import the repository `pavankumarmushkarla630-pixel/SachiConnect-Csp`.
3. Framework Preset: **Vite**.
4. Root Directory: `./`.
5. Click **Deploy**. Vercel will automatically read `vercel.json` for client-side routing.

---

## 💻 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pavankumarmushkarla630-pixel/SachiConnect-Csp.git
   cd SachiConnect-Csp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   *(Backend dependencies in `server/` are installed automatically via `postinstall`).*

3. **Run the fullstack development environment**:
   ```bash
   npm run dev
   ```
   - Frontend Vite Client: `http://localhost:5173`
   - Backend Express API: `http://localhost:5000`

4. **Production Build & Test**:
   ```bash
   npm run build
   npm start
   ```
   - Serves the compiled production app and API unified on `http://localhost:5000`.

---

## 📜 License
Developed for Andhra Pradesh Grama & Ward Sachivalayam citizen governance and rural welfare delivery.
