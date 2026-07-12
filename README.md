# PULSEGRID AI™
### The Intelligent FIFA World Cup 2026 Stadium Operations & Volunteer Co-Pilot

> **"One AI. Every Fan. Every Volunteer. Every Decision."**

[![Built for PromptWars](https://img.shields.io/badge/PromptWars-Challenge%204-00E5A8?style=for-the-badge)](https://promptwars.dev)
[![Powered by Google Cloud](https://img.shields.io/badge/Google%20Cloud-AI%20Powered-4285F4?style=for-the-badge&logo=googlecloud)](https://cloud.google.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite 5](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

---

## 🏟️ Problem Statement

The FIFA World Cup 2026 will host **3.2 million fans** across 16 cities and 48 matches in the USA, Canada, and Mexico. Managing crowds of 80,000+ per stadium presents real-time challenges that traditional operations cannot handle:

- **Multi-lingual communication barriers** — fans speak 50+ languages
- **Crowd surge prediction** — incidents can cascade in minutes
- **Volunteer deployment gaps** — manual assignment is too slow
- **Data silos** — transport, medical, and access data is disconnected
- **Zero-latency requirements** — emergencies need sub-second AI responses

---

## ✨ Solution

**PULSEGRID AI™** is an AI-powered Smart Stadium Operations Platform that unifies all stadium operations into a single command center. It combines:

- **Real-time Crowd Intelligence** with explainable AI risk scores
- **Multilingual AI Translator** for fan interactions in 10+ languages
- **Volunteer Co-Pilot** — conversational AI assistant for field staff
- **Predictive Incident Engine** with auto-generated AI reasoning
- **Sustainability Dashboard** with live IoT sensor integration
- **Jury Evaluation Portal** for data upload and AI verification

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PULSEGRID AI™                         │
├──────────────┬─────────────────┬────────────────────────┤
│  Command     │  Volunteer      │  Jury Evaluation       │
│  Center      │  Co-Pilot       │  Portal                │
│  (Desktop)   │  (Mobile)       │  (Admin/Testing)       │
└──────┬───────┴────────┬────────┴──────────┬─────────────┘
       │                │                   │
┌──────▼───────────────▼───────────────────▼─────────────┐
│              React 19 + Zustand (State Management)       │
│         Framer Motion (Animations) · Recharts (Charts)  │
└─────────────────────────────┬──────────────────────────-┘
                              │
┌─────────────────────────────▼───────────────────────────┐
│                    Service Layer                          │
│  crowdService · volunteerService · translationService   │
│  reasoningEngine · scenarioGenerator · notificationSvc  │
└─────────────────────────────┬───────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────┐
│                 Google Cloud Platform                     │
│  Gemini API · Vertex AI · Cloud Firestore               │
│  Google Maps Platform · Translation API · BigQuery      │
│  Cloud Functions · Cloud Run · Speech-to-Text           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Features

### 🎛️ Command Center (Desktop)
- **Live Stadium Map** — Animated SVG with gate risk scores, pulsing incidents, crowd density heatmap
- **AI Risk Score** — Real-time explainable risk analysis with Reasoning → Prediction → Actions → Impact
- **Incident Management** — Auto-generated scenarios with AI triage, severity badges, one-click resolve
- **Gate Intelligence** — 5-gate monitoring with occupancy, queue, wait time, entry velocity
- **Weather Integration** — Live conditions affecting crowd behavior models
- **Simulation Engine** — Configurable speed (Slow/Normal/Fast/Extreme), match phase control
- **Scenario Triggers** — Pre-built mass scenarios (crowd surge, medical emergency, transport failure)

### 📱 Volunteer Co-Pilot (Mobile)
- **Conversational AI** — Natural language interface with typing indicators and bubble UI
- **Multi-language Support** — 6 language flags, RTL support for Arabic
- **Quick Actions** — One-tap Medical SOS, Lost Child, Accessibility, Emergency
- **Voice Input** — Simulated multilingual voice capture
- **Smart Shift Tracker** — Live elapsed timer, fatigue bar, nearby team view
- **Alert Center** — Prioritized notifications with unread badge

### ⚖️ Jury Evaluation Portal (Admin)
- **5-Stage Processing Pipeline** — Received → Validation → AI Analysis → Risk Detection → Report
- **AI Error Guard** — Column validation, duplicate detection, value range checking
- **Drag & Drop Upload** — CSV + JSON support with live progress
- **Sample Downloads** — Ready-made test datasets
- **Data Inspector** — Live sortable table of current simulation state
- **Scenario Triggers** — Force any emergency scenario from the admin panel

### 📊 Analytics Dashboard
- Historical fan arrival area charts by gate
- Risk score trend lines with gate comparison
- Volunteer utilization by role (stacked bar)
- Live gate performance table (occupancy, wait, velocity, status)

### 🌿 Sustainability Console
- Live energy, water, carbon, food waste metrics
- Circular recycling rate gauge
- Weekly energy trend vs. baseline
- Green energy mix (solar / renewable / conventional)
- AI sustainability recommendations with impact forecasts

### ♿ Accessibility Console
- Live lift/elevator status cards
- Active accessibility request management
- Volunteer auto-assignment to requests
- Adaptive services status grid (captions, sign language, wheelchair paths, etc.)

### 🏥 Medical Dashboard
- Active case tracking with severity badges and patient notes
- AED station capacity visualizations
- AI triage recommendations with heat risk analysis

### 🚌 Transport Intelligence
- Metro line status with delay detection
- Shuttle zone capacity and dispatch
- Rideshare surge pricing indicators
- Parking lot availability

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 5.4 |
| **State Management** | Zustand 5 |
| **Animation** | Framer Motion 12 |
| **Charts** | Recharts 3 |
| **Styling** | Tailwind CSS 3 + Custom Glassmorphism |
| **Icons** | Lucide React |
| **Routing** | React Router 7 |
| **Notifications** | React Hot Toast |
| **File Upload** | React Dropzone |
| **CSV Parsing** | PapaParse |
| **AI Services** | Gemini API (simulated) |
| **Cloud Platform** | Google Cloud Platform |

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/pulsegrid-ai
cd pulsegrid-ai/pulsegrid

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
open http://localhost:5173
```

> **Node.js requirement:** v20.18+ (project uses Vite 5 for compatibility)

---

## 📁 Project Structure

```
pulsegrid/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.jsx          # Reusable: StatCard, Badge, SectionHeader, ProgressBar...
│   │   ├── ArchitectureModal.jsx  # GCP architecture overlay
│   │   ├── GateCard.jsx           # Live gate status card
│   │   ├── IncidentCard.jsx       # Incident with AI reasoning
│   │   ├── NotificationDrawer.jsx # Side notification panel
│   │   ├── ReasoningPanel.jsx     # AI decision panel
│   │   ├── SimulationControls.jsx # Speed, phase, scenario controls
│   │   └── VolunteerCard.jsx      # Volunteer status card
│   ├── constants/
│   │   └── index.js               # Stadium config, gates, phases
│   ├── context/
│   │   └── store.js               # Zustand global store + live simulation
│   ├── data/
│   │   └── mockData.js            # Initial state for all entities
│   ├── layouts/
│   │   └── CommandLayout.jsx      # Sidebar + topbar layout
│   ├── pages/
│   │   ├── AccessibilityPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   ├── JuryPortal.jsx
│   │   ├── LandingPage.jsx
│   │   ├── MedicalPage.jsx
│   │   ├── OverviewPage.jsx
│   │   ├── SustainabilityPage.jsx
│   │   ├── TranslationPage.jsx
│   │   ├── TransportPage.jsx
│   │   ├── VolunteerCopilot.jsx
│   │   └── VolunteersPage.jsx
│   ├── services/
│   │   ├── crowdService.js
│   │   ├── notificationService.js
│   │   ├── reasoningEngine.js
│   │   ├── scenarioGenerator.js
│   │   ├── translationService.js
│   │   └── volunteerService.js
│   ├── App.jsx                    # Root routing
│   ├── index.css                  # Design system + animations
│   └── main.jsx
├── package.json
└── README.md
```

---

## 🤖 AI Workflow

```
Fan / Volunteer Event
        │
        ▼
┌───────────────────┐
│  Event Detection  │  Gate data, translation input, incident report
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Reasoning Engine │  analyzeCrowdRisk() → risk score, prediction
└────────┬──────────┘  generateRiskForecast() → 30-min outlook
         │
         ▼
┌───────────────────┐
│   AI Reasoning    │  Reasoning + Prediction + Actions + Impact
│      Panel        │  Confidence score, estimated resolution
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Action Dispatch  │  Approve → Volunteer assigned
└────────┬──────────┘  Broadcast → PA / Display / App
         │             Escalate → Emergency Manager
         ▼
┌───────────────────┐
│  Notification Hub │  Real-time alerts to all connected roles
└───────────────────┘
```

---

## 📸 Screenshots

| Screen | Description |
|---|---|
| Landing Page | Animated particle network, radar, live stats |
| Command Center | Stadium map, gate cards, AI reasoning, incident panel |
| Volunteer Copilot | Conversational AI, shift tracker, quick actions |
| Jury Portal | Upload pipeline, AI validation, scenario triggers |
| Analytics | Historical charts, risk trends, gate performance |

---

## 🔮 Future Scope

1. **Real-time Firebase Integration** — Live Firestore sync replacing mock simulation
2. **Gemini API Connection** — Real AI reasoning replacing template-based responses
3. **Google Maps Heatmap** — True geo-location crowd mapping
4. **Speech-to-Text** — Real-time voice transcription for volunteers
5. **Offline Mode** — Service worker for areas with limited connectivity
6. **Multi-Stadium** — Scale to all 16 World Cup host venues simultaneously
7. **Fan App** — Consumer-facing wayfinding and queue notifications
8. **AR Navigation** — In-stadium augmented reality directions

---

## 📄 License

MIT License — Built for PromptWars Challenge 4 | FIFA World Cup 2026

---

*Built with ❤️ using React 19, Google Cloud AI, and Vite*
