import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDB, writeDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure Multer for static file storage (Images and Audio)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + (ext || (file.fieldname === 'audio' ? '.wav' : '.jpg')));
  }
});

const upload = multer({ storage });

// Store temporary OTPs in memory for the demo
const otpStorage = new Map();

// --- Auth Endpoints ---

// Request OTP
router.post('/auth/request-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: "Please provide a valid 10-digit mobile number." });
  }

  // Generate a random 6 digit OTP (or use 123456 for easier testing, but let's make it dynamic and log/return it)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage.set(phone, otp);

  // In production, this would trigger an SMS. For the MVP, we print it to server console and send it back for easy testing.
  console.log(`[AUTH] OTP for ${phone} is: ${otp}`);

  return res.json({ 
    success: true, 
    message: "OTP sent successfully to your mobile number.", 
    otp: otp // Return OTP directly to make demo testing seamless
  });
});

// Verify OTP
router.post('/auth/verify-otp', (req, res) => {
  const { phone, otp, resident_id } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone number and OTP are required." });
  }

  const storedOtp = otpStorage.get(phone);
  
  // For demo convenience, also accept 123456 as a master OTP
  if (otp === storedOtp || otp === '123456') {
    otpStorage.delete(phone); // Consume OTP

    const db = readDB();
    let user = db.users.find(u => u.phone === phone);

    // Verify resident_id if supplied
    if (resident_id && user && user.resident_id && user.resident_id.toLowerCase() !== resident_id.toLowerCase()) {
      return res.status(400).json({ success: false, message: "Resident ID does not match this phone number." });
    }

    // If user doesn't exist, auto-register them as a Resident for a smooth onboarding demo!
    if (!user) {
      const resIdNum = Math.floor(1000 + Math.random() * 9000);
      const residentId = `RES-${resIdNum}`;
      user = {
        phone,
        role: "Resident",
        name: "",          // Leave blank — user will provide real name via voice assistant
        village: "",       // Leave blank — user will provide real village via voice assistant
        resident_id: residentId
      };
      db.users.push(user);
      writeDB(db);
    }

    return res.json({
      success: true,
      message: "Authentication successful.",
      user
    });
  }

  return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
});

// Resident Registration / Sign Up
router.post('/auth/signup', (req, res) => {
  const { name, phone, village, latitude, longitude } = req.body;
  if (!name || !phone || !village) {
    return res.status(400).json({ success: false, message: "Name, phone number, and village are required." });
  }

  const db = readDB();
  let user = db.users.find(u => u.phone === phone);
  
  if (user) {
    return res.status(400).json({ success: false, message: "A profile with this phone number already exists." });
  }

  // Generate unique Resident ID: RES-XXXX
  const resIdNum = Math.floor(1000 + Math.random() * 9000);
  const residentId = `RES-${resIdNum}`;

  const newUser = {
    phone,
    role: "Resident",
    name,
    village,
    resident_id: residentId,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage.set(phone, otp);
  console.log(`[AUTH-SIGNUP] OTP for ${phone} is: ${otp}`);

  return res.json({
    success: true,
    message: "Registration OTP sent successfully.",
    resident_id: residentId,
    otp: otp
  });
});

// ── Citizen Register (No OTP) ─────────────────────────────────────────────
router.post('/auth/citizen-register', (req, res) => {
  const { name, phone, village, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Name, phone number, and password are required.' });
  }
  if (phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.phone === phone);
  if (existing) {
    return res.status(400).json({ success: false, message: 'A profile with this phone number already exists. Please login instead.' });
  }

  const resIdNum = Math.floor(1000 + Math.random() * 9000);
  const residentId = `RES-${resIdNum}`;

  const newUser = {
    phone,
    role: 'Resident',
    name: name.trim(),
    village: village ? village.trim() : 'Anantapur',
    resident_id: residentId,
    password: password,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  console.log(`[CITIZEN-REGISTER] New resident: ${name} | Phone: ${phone} | ID: ${residentId}`);

  return res.json({
    success: true,
    message: 'Registration successful.',
    resident_id: residentId,
    user: newUser
  });
});

// ── Citizen Login (No OTP — Phone & Password) ──────────────────────────
router.post('/auth/citizen-login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }

  const db = readDB();
  const user = db.users.find(u =>
    u.role === 'Resident' &&
    u.phone === phone
  );

  if (!user) {
    return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'No account found with this mobile number.' });
  }

  // If password is not provided, we are just verifying if the user exists
  if (password === undefined) {
    return res.json({ success: true, needsPassword: true });
  }

  if (user.password && user.password !== password) {
    return res.status(400).json({ success: false, message: 'Incorrect password. Please try again.' });
  }

  return res.json({ success: true, message: 'Authentication successful.', user });
});

// ── Official Registration (Name, Official ID & Password) ──────────────────
router.post('/auth/official-register', (req, res) => {
  const { name, official_id, password } = req.body;
  if (!name || !official_id || !password) {
    return res.status(400).json({ success: false, message: 'Name, Official ID, and password are required.' });
  }
  if (!official_id.toUpperCase().startsWith('OFF-')) {
    return res.status(400).json({ success: false, message: 'Official ID must start with OFF- (e.g. OFF-1234).' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.role === 'Authority' && u.official_id.toLowerCase() === official_id.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this Official ID already exists.' });
  }

  const newUser = {
    phone: '',
    role: 'Authority',
    name: name.trim(),
    village: 'District Head Office',
    official_id: official_id.toUpperCase().trim(),
    password: password,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  console.log(`[OFFICIAL-REGISTER] New official: ${name} | ID: ${newUser.official_id}`);

  return res.json({
    success: true,
    message: 'Official registration successful.',
    user: newUser
  });
});

// Official Login (Official ID & Password)
router.post('/auth/official-login', (req, res) => {
  const { official_id, password } = req.body;
  if (!official_id || !password) {
    return res.status(400).json({ success: false, message: "Official ID and password are required." });
  }

  const db = readDB();
  const user = db.users.find(u => 
    u.role === 'Authority' && 
    u.official_id && u.official_id.toLowerCase() === official_id.toLowerCase() && 
    u.password === password
  );

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid Official ID or password." });
  }

  return res.json({
    success: true,
    message: "Authentication successful.",
    user
  });
});

// --- Upload Endpoint ---
router.post('/upload', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), (req, res) => {
  const response = { success: true };

  if (req.files && req.files.photo) {
    const photoFile = req.files.photo[0];
    response.photo_url = `/uploads/${photoFile.filename}`;
  }

  if (req.files && req.files.audio) {
    const audioFile = req.files.audio[0];
    response.complaint_audio_url = `/uploads/${audioFile.filename}`;
  }

  return res.json(response);
});

// --- Complaints Endpoints ---

// Get all complaints with searching and filtering
router.get('/complaints', (req, res) => {
  const db = readDB();
  const { role, resident_phone, resident_name, category, status, search } = req.query;
  let complaints = db.complaints;

  // Filter by resident name or phone if role is Resident
  if (role === 'Resident') {
    complaints = complaints.filter(c => {
      const matchPhone = resident_phone && c.resident_phone === resident_phone;
      const matchName = resident_name && c.resident_name.toLowerCase() === resident_name.toLowerCase();
      return matchPhone || matchName;
    });
  }

  // Filter by Category
  if (category && category !== 'All') {
    complaints = complaints.filter(c => c.complaint_category === category);
  }

  // Filter by Status
  if (status && status !== 'All') {
    complaints = complaints.filter(c => c.status === status);
  }

  // Search filter
  if (search) {
    const query = search.toLowerCase();
    complaints = complaints.filter(c => 
      c.id.toLowerCase().includes(query) ||
      c.resident_name.toLowerCase().includes(query) ||
      c.village_area.toLowerCase().includes(query) ||
      c.complaint_description_text.toLowerCase().includes(query)
    );
  }

  // Sort complaints: newest first
  complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return res.json(complaints);
});

// Get a single complaint by ID
router.get('/complaints/:id', (req, res) => {
  const db = readDB();
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: "Complaint not found." });
  }
  return res.json(complaint);
});

// Create new complaint
router.post('/complaints', (req, res) => {
  const { 
    resident_name, 
    resident_phone,
    village_area, 
    complaint_category, 
    complaint_description_text, 
    complaint_audio_url, 
    photo_url, 
    latitude, 
    longitude, 
    language 
  } = req.body;

  if (!resident_name || !village_area || !complaint_category) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const db = readDB();
  
  // Generate unique complaint ID: SC-XXXX (4-digit number)
  const idNum = Math.floor(1000 + Math.random() * 9000);
  const complaintId = `SC-${idNum}`;

  const newComplaint = {
    id: complaintId,
    resident_name,
    resident_phone: resident_phone || "",
    village_area,
    complaint_category,
    complaint_description_text: complaint_description_text || "Reported via voice assistant.",
    complaint_audio_url: complaint_audio_url || "",
    photo_url: photo_url || "",
    latitude: latitude ? parseFloat(latitude) : 0,
    longitude: longitude ? parseFloat(longitude) : 0,
    language: language || "English",
    status: "Submitted",
    created_at: new Date().toISOString(),
    status_history: [
      {
        status: "Submitted",
        updated_at: new Date().toISOString(),
        notes: "Grievance registered successfully by " + resident_name
      }
    ]
  };

  db.complaints.push(newComplaint);
  writeDB(db);

  return res.status(201).json({ success: true, complaint: newComplaint });
});

// Update complaint status
router.put('/complaints/:id/status', (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ["Submitted", "Assigned", "In Progress", "Resolved"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid or missing status value." });
  }

  const db = readDB();
  const index = db.complaints.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Complaint not found." });
  }

  const complaint = db.complaints[index];
  complaint.status = status;
  complaint.status_history.push({
    status,
    updated_at: new Date().toISOString(),
    notes: notes || `Status updated to ${status}`
  });

  db.complaints[index] = complaint;
  writeDB(db);

  return res.json({ success: true, complaint });
});

// Submit complaint feedback/rating
router.put('/complaints/:id/feedback', (req, res) => {
  const { rating, comments } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Valid rating (1-5) is required." });
  }

  const db = readDB();
  const index = db.complaints.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Complaint not found." });
  }

  const complaint = db.complaints[index];
  complaint.feedback = {
    rating: parseInt(rating),
    comments: comments || "",
    submitted_at: new Date().toISOString()
  };

  complaint.status_history.push({
    status: "Feedback Submitted",
    updated_at: new Date().toISOString(),
    notes: `Resident rated resolution ${rating}/5. Review: "${comments || "No comments"}"`
  });

  db.complaints[index] = complaint;
  writeDB(db);

  return res.json({ success: true, complaint });
});

// --- Analytics Endpoints ---
router.get('/analytics', (req, res) => {
  const db = readDB();
  const complaints = db.complaints;

  // Complaints by Category
  const byCategory = {};
  // Initialize standard categories
  const categories = ["Roads", "Streetlights", "Water Supply", "Drainage", "Sanitation", "Public Facilities", "Other"];
  categories.forEach(cat => byCategory[cat] = 0);
  
  complaints.forEach(c => {
    const cat = c.complaint_category || "Other";
    if (byCategory[cat] !== undefined) {
      byCategory[cat]++;
    } else {
      byCategory["Other"]++;
    }
  });

  // Complaints by Status
  const byStatus = {
    Submitted: 0,
    Assigned: 0,
    "In Progress": 0,
    Resolved: 0
  };
  complaints.forEach(c => {
    if (byStatus[c.status] !== undefined) {
      byStatus[c.status]++;
    }
  });

  // Monthly Complaint Count
  const monthlyCount = {};
  complaints.forEach(c => {
    const date = new Date(c.created_at);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
  });

  // Calculate Feedback Ratings
  let totalRating = 0;
  let feedbackCount = 0;
  const recentFeedbacks = [];

  complaints.forEach(c => {
    if (c.feedback && c.feedback.rating) {
      totalRating += c.feedback.rating;
      feedbackCount++;
      recentFeedbacks.push({
        id: c.id,
        category: c.complaint_category,
        resident_name: c.resident_name,
        rating: c.feedback.rating,
        comments: c.feedback.comments,
        submitted_at: c.feedback.submitted_at
      });
    }
  });

  // Sort feedbacks: newest first
  recentFeedbacks.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  const averageRating = feedbackCount > 0 ? (totalRating / feedbackCount).toFixed(1) : "0.0";

  return res.json({
    total: complaints.length,
    byCategory,
    byStatus,
    monthlyCount,
    averageRating: parseFloat(averageRating),
    feedbackCount,
    recentFeedbacks: recentFeedbacks.slice(0, 5)
  });
});

export default router;
