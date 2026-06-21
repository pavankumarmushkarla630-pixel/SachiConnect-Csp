import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

const FIREBASE_URL = process.env.FIREBASE_URL || 'https://sachiconnect-5645a-default-rtdb.firebaseio.com/.json';

// Ensure DB directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultData = {
  complaints: [
    {
      id: "SC-7821",
      resident_name: "Ramesh Kumar",
      village_area: "Kothacheruvu",
      complaint_category: "Streetlights",
      complaint_description_text: "Main bazaar streetlights have been flickering or off completely for the last 5 days. It is dangerous to walk after 7 PM.",
      complaint_audio_url: "/uploads/sample_audio_1.wav",
      photo_url: "/uploads/sample_streetlight.jpg",
      latitude: 14.2882,
      longitude: 77.7885,
      language: "Telugu",
      status: "In Progress",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status_history: [
        { status: "Submitted", updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), notes: "Complaint registered successfully via voice assistant." },
        { status: "Assigned", updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), notes: "Assigned to Ward Assistant (Electricity Department)." },
        { status: "In Progress", updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: "Technician dispatched to inspect lines and replace bulbs." }
      ]
    },
    {
      id: "SC-9214",
      resident_name: "Saraswathi Devi",
      village_area: "Bukkarayasamudram",
      complaint_category: "Water Supply",
      complaint_description_text: "Drinking water pipe leak near the panchayat office. Clean drinking water is getting wasted onto the road.",
      complaint_audio_url: "/uploads/sample_audio_2.wav",
      photo_url: "/uploads/sample_water_leak.jpg",
      latitude: 14.7103,
      longitude: 77.6432,
      language: "English",
      status: "Resolved",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status_history: [
        { status: "Submitted", updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), notes: "Complaint registered." },
        { status: "Assigned", updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), notes: "Assigned to Water Works engineering team." },
        { status: "In Progress", updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), notes: "Excavation and pipe replacement in progress." },
        { status: "Resolved", updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: "Leak repaired. Water supply restored and road patched." }
      ]
    },
    {
      id: "SC-1054",
      resident_name: "Mallesh G.",
      village_area: "Rapthadu",
      complaint_category: "Roads",
      complaint_description_text: "Huge pothole in the middle of the school road. Two motorcyclists slipped yesterday. Urgently needs filling.",
      complaint_audio_url: "",
      photo_url: "/uploads/sample_pothole.jpg",
      latitude: 14.6225,
      longitude: 77.6075,
      language: "Telugu",
      status: "Submitted",
      created_at: new Date().toISOString(),
      status_history: [
        { status: "Submitted", updated_at: new Date().toISOString(), notes: "Complaint registered with geo-tagged photo." }
      ]
    }
  ],
  users: [
    { phone: "9876543210", role: "Resident", name: "Ramesh Kumar", village: "Kothacheruvu", resident_id: "RES-1029", password: "123456" },
    { phone: "9988776655", role: "Authority", name: "V. Satyanarayana", village: "District Head Office", official_id: "OFF-9988", password: "admin123" }
  ]
};

// Initialize DB locally with default data if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
}

// Background sync helper: push local changes to Firebase
const syncToFirebase = async (data) => {
  try {
    const res = await fetch(FIREBASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      console.log("[FIREBASE] Sync successful.");
    } else {
      console.error("[FIREBASE] Sync failed with status:", res.status);
    }
  } catch (err) {
    console.error("[FIREBASE] Sync error:", err.message);
  }
};

// Async bootstrap on start: fetch from Firebase and populate local file
const bootstrapDB = async () => {
  try {
    console.log("[FIREBASE] Fetching remote database on startup...");
    const res = await fetch(FIREBASE_URL);
    if (!res.ok) {
      console.error("[FIREBASE] Fetch failed on startup. Using local database fallback.");
      return;
    }
    const data = await res.json();
    if (data && (data.users || data.complaints)) {
      // If Firebase has data, update local database
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      console.log("[FIREBASE] Local database synchronized from remote Firebase.");
    } else {
      // If Firebase is empty, upload local database to Firebase
      console.log("[FIREBASE] Remote Firebase database is empty. Seeding remote database...");
      const localData = readDB();
      await syncToFirebase(localData);
    }
  } catch (err) {
    console.error("[FIREBASE] Bootstrap connection failed:", err.message);
  }
};

// Run bootstrap asynchronously on server start
bootstrapDB();

export function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return defaultData;
  }
}

export function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    // Asynchronously update Firebase in the background
    syncToFirebase(data);
    return true;
  } catch (err) {
    console.error("Error writing database file:", err);
    return false;
  }
}
