// Stadium Configuration
export const STADIUM_CONFIG = {
  name: "MetLife Stadium",
  city: "East Rutherford, NJ",
  capacity: 82500,
  country: "USA",
  matchDate: "2026-07-11",
  kickoffTime: "20:00",
  homeTeam: "Morocco",
  awayTeam: "Portugal",
  matchPhase: "PRE_MATCH",
  weather: { temp: 28, condition: "Clear", humidity: 62, wind: 14 },
};

export const GATES = [
  { id: "A", name: "Gate Alpha", sector: "North", color: "#00E5A8" },
  { id: "B", name: "Gate Bravo", sector: "East", color: "#56CCF2" },
  { id: "C", name: "Gate Charlie", sector: "South", color: "#FFC857" },
  { id: "D", name: "Gate Delta", sector: "West", color: "#FF4D6D" },
  { id: "E", name: "Gate Echo", sector: "VIP", color: "#bf80ff" },
];

export const INCIDENT_TYPES = {
  MEDICAL: { label: "Medical Emergency", color: "#FF4D6D", icon: "Heart" },
  SECURITY: { label: "Security Alert", color: "#FFC857", icon: "Shield" },
  CROWD: { label: "Crowd Surge", color: "#FF4D6D", icon: "Users" },
  LOST_CHILD: { label: "Lost Child", color: "#FFC857", icon: "Baby" },
  ACCESSIBILITY: { label: "Accessibility", color: "#56CCF2", icon: "Accessibility" },
  TRANSPORT: { label: "Transport Issue", color: "#FFC857", icon: "Bus" },
  FIRE: { label: "Fire Alert", color: "#FF4D6D", icon: "Flame" },
  POWER: { label: "Power Failure", color: "#FFC857", icon: "Zap" },
  VIP: { label: "VIP Arrival", color: "#00E5A8", icon: "Star" },
  SUSPICIOUS: { label: "Suspicious Activity", color: "#FF4D6D", icon: "AlertTriangle" },
};

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸", rtl: false },
  { code: "es", label: "Spanish", flag: "🇪🇸", rtl: false },
  { code: "fr", label: "French", flag: "🇫🇷", rtl: false },
  { code: "pt", label: "Portuguese", flag: "🇧🇷", rtl: false },
  { code: "ar", label: "Arabic", flag: "🇸🇦", rtl: true },
  { code: "ary", label: "Moroccan Arabic", flag: "🇲🇦", rtl: true },
  { code: "de", label: "German", flag: "🇩🇪", rtl: false },
  { code: "ja", label: "Japanese", flag: "🇯🇵", rtl: false },
];

export const VOLUNTEER_ROLES = [
  "Crowd Management",
  "Medical Support",
  "Accessibility Guide",
  "Translation",
  "Transportation",
  "Fan Services",
  "Security Support",
  "VIP Services",
  "IT Support",
  "Sustainability",
];

export const SIMULATION_SPEEDS = {
  SLOW: { label: "Slow", multiplier: 0.5, interval: 4000 },
  NORMAL: { label: "Normal", multiplier: 1, interval: 2000 },
  FAST: { label: "Fast", multiplier: 2, interval: 1000 },
  EXTREME: { label: "Extreme", multiplier: 5, interval: 400 },
};

export const MATCH_PHASES = [
  "PRE_MATCH",
  "GATES_OPENING",
  "CROWD_ARRIVING",
  "KICKOFF",
  "FIRST_HALF",
  "HALF_TIME",
  "SECOND_HALF",
  "FULL_TIME",
  "POST_MATCH",
];

export const TRANSPORT_MODES = [
  { id: "metro", label: "Metro Rail", icon: "Train" },
  { id: "shuttle", label: "Shuttle Bus", icon: "Bus" },
  { id: "rideshare", label: "Ride Share", icon: "Car" },
  { id: "taxi", label: "Taxi Zone", icon: "Car" },
  { id: "walking", label: "Walking Route", icon: "Footprints" },
  { id: "parking", label: "Parking", icon: "ParkingCircle" },
];

export const RISK_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 55,
  HIGH: 75,
  CRITICAL: 90,
};

export const CSV_REQUIRED_COLUMNS = [
  "gate_id", "occupancy", "capacity", "queue_length",
  "volunteers", "risk_score", "entry_velocity",
];

export const ACCESSIBILITY_FEATURES = [
  { id: "wheelchair", label: "Wheelchair Routes", icon: "Accessibility" },
  { id: "lift", label: "Elevator Status", icon: "ArrowUp" },
  { id: "seating", label: "Accessible Seating", icon: "Armchair" },
  { id: "restroom", label: "Accessible Restrooms", icon: "Toilet" },
  { id: "audio", label: "Audio Guidance", icon: "Volume2" },
  { id: "caption", label: "Live Captions", icon: "Captions" },
  { id: "sign", label: "Sign Language", icon: "HandMetal" },
  { id: "braille", label: "Braille Signage", icon: "CircleDot" },
];

export const GOOGLE_CLOUD_SERVICES = [
  {
    id: "maps",
    name: "Google Maps Platform",
    icon: "Map",
    color: "#34a853",
    description: "Real-time crowd routing, heatmaps, and gate navigation",
    category: "Location",
  },
  {
    id: "firebase",
    name: "Firebase Auth",
    icon: "Shield",
    color: "#FFA000",
    description: "Secure volunteer and staff authentication",
    category: "Auth",
  },
  {
    id: "firestore",
    name: "Cloud Firestore",
    icon: "Database",
    color: "#00BCD4",
    description: "Real-time operational data sync across all devices",
    category: "Database",
  },
  {
    id: "functions",
    name: "Cloud Functions",
    icon: "Zap",
    color: "#FF5722",
    description: "Serverless AI trigger processing and event handlers",
    category: "Compute",
  },
  {
    id: "cloudrun",
    name: "Cloud Run",
    icon: "Server",
    color: "#4285F4",
    description: "Containerized AI inference services at scale",
    category: "Compute",
  },
  {
    id: "vertex",
    name: "Vertex AI",
    icon: "Brain",
    color: "#7C4DFF",
    description: "ML models for crowd prediction and risk forecasting",
    category: "AI/ML",
  },
  {
    id: "gemini",
    name: "Gemini API",
    icon: "Sparkles",
    color: "#00E5A8",
    description: "Generative AI for reasoning, translations, and responses",
    category: "AI/ML",
  },
  {
    id: "speech",
    name: "Speech-to-Text",
    icon: "Mic",
    color: "#4CAF50",
    description: "Multilingual voice commands for volunteers",
    category: "AI/ML",
  },
  {
    id: "translation",
    name: "Translation API",
    icon: "Globe",
    color: "#2196F3",
    description: "Real-time 50+ language fan communication",
    category: "AI/ML",
  },
  {
    id: "bigquery",
    name: "BigQuery",
    icon: "BarChart3",
    color: "#FF6D00",
    description: "Historical analytics and pattern recognition",
    category: "Analytics",
  },
  {
    id: "monitoring",
    name: "Cloud Monitoring",
    icon: "Activity",
    color: "#E91E63",
    description: "System health, alerting, and SLA tracking",
    category: "Operations",
  },
  {
    id: "storage",
    name: "Cloud Storage",
    icon: "HardDrive",
    color: "#795548",
    description: "Media assets, datasets, and incident recordings",
    category: "Storage",
  },
];
