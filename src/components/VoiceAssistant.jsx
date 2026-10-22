import React, { useState, useEffect, useRef } from 'react';

// AP Villages list for datalist autocomplete
const AP_VILLAGES = [
  { en: 'Kothacheruvu', te: 'కొత్తచెరువు' }, { en: 'Bukkarayasamudram', te: 'బుక్కరాయసముద్రం' },
  { en: 'Rapthadu', te: 'రాప్తాడు' }, { en: 'Pedapenki', te: 'పెదపెంకి' },
  { en: 'Duvvada', te: 'దువ్వాడ' }, { en: 'Malkapalli', te: 'మల్కాపల్లి' },
  { en: 'Puttaparthi', te: 'పుట్టపర్తి' }, { en: 'Dharmavaram', te: 'ధర్మవరం' },
  { en: 'Hindupur', te: 'హిందూపురం' }, { en: 'Gooty', te: 'గుత్తి' },
  { en: 'Tadipatri', te: 'తాడిపత్రి' }, { en: 'Kadiri', te: 'కదిరి' },
  { en: 'Madakasira', te: 'మడకశిర' }, { en: 'Penukonda', te: 'పెనుకొండ' },
  { en: 'Rayadurgam', te: 'రాయదుర్గం' }, { en: 'Kalyanadurgam', te: 'కళ్యాణదుర్గం' },
  { en: 'Uravakonda', te: 'ఉరవకొండ' }, { en: 'Vijayawada', te: 'విజయవాడ' },
  { en: 'Guntur', te: 'గుంటూరు' }, { en: 'Visakhapatnam', te: 'విశాఖపట్నం' },
  { en: 'Tirupati', te: 'తిరుపతి' }, { en: 'Nellore', te: 'నెల్లూరు' },
  { en: 'Kurnool', te: 'కర్నూలు' }, { en: 'Kadapa', te: 'కడప' },
  { en: 'Rajahmundry', te: 'రాజమండ్రి' }, { en: 'Kakinada', te: 'కాకినాడ' },
  { en: 'Eluru', te: 'ఏలూరు' }, { en: 'Vizianagaram', te: 'విజయనగరం' },
  { en: 'Srikakulam', te: 'శ్రీకాకుళం' }, { en: 'Ongole', te: 'ఒంగోలు' },
  { en: 'Machilipatnam', te: 'మచిలీపట్నం' }, { en: 'Tenali', te: 'తెనాలి' },
  { en: 'Proddatur', te: 'ప్రొద్దుటూరు' }, { en: 'Adoni', te: 'ఆదోని' },
  { en: 'Nandyal', te: 'నంద్యాల' }, { en: 'Bhimavaram', te: 'భీమవరం' },
  { en: 'Chittoor', te: 'చిత్తూరు' }, { en: 'Madanapalle', te: 'మదనపల్లె' },
  { en: 'Amalapuram', te: 'అమలాపురం' }, { en: 'Anakapalli', te: 'అనకాపల్లి' },
  { en: 'Gudivada', te: 'గుడివాడ' }, { en: 'Narasaraopet', te: 'నరసరావుపేట' },
  { en: 'Chilakaluripet', te: 'చిలకలూరిపేట' }, { en: 'Bapatla', te: 'బాపట్ల' },
  { en: 'Mangalagiri', te: 'మంగళగిరి' }, { en: 'Tadepalligudem', te: 'తాడేపల్లిగూడెం' },
  { en: 'Tanuku', te: 'తణుకు' }, { en: 'Palakollu', te: 'పాలకొల్లు' },
  { en: 'Narsipatnam', te: 'నర్సీపట్నం' }, { en: 'Srikalahasti', te: 'శ్రీకాళహస్తి' },
  { en: 'Kavali', te: 'కావలి' }, { en: 'Gudur', te: 'గూడూరు' },
];

const VILLAGE_COORDINATES = {
  'Kothacheruvu': { lat: 14.2016, lng: 77.7818, te: 'కొత్తచెరువు' },
  'Bukkarayasamudram': { lat: 14.7082, lng: 77.6417, te: 'బుక్కరాయసముద్రం' },
  'Rapthadu': { lat: 14.6200, lng: 77.6080, te: 'రాప్తాడు' },
  'Pedapenki': { lat: 18.5284, lng: 83.2982, te: 'పెదపెంకి' },
  'Duvvada': { lat: 17.6997, lng: 83.1575, te: 'దువ్వాడ' }
};

const findClosestVillageName = (latitude, longitude, isTelugu) => {
  let closest = 'Kothacheruvu';
  let closestTe = 'కొత్తచెరువు';
  let minDistance = Infinity;
  for (const [name, coords] of Object.entries(VILLAGE_COORDINATES)) {
    const dist = Math.hypot(coords.lat - latitude, coords.lng - longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = name;
      closestTe = coords.te;
    }
  }
  return isTelugu ? closestTe : closest;
};

// ── Voice Assistant Matching Maps & Dictionaries ──
const CATEGORY_VOICE_MAP = {
  'Roads': ['road', 'roads', 'pothole', 'potholes', 'street', 'highway', 'path', 'రోడ్లు', 'రోడ్డు', 'గుంతలు', 'రహదారి', 'రహదారులు', 'రోడ్'],
  'Streetlights': ['light', 'lights', 'streetlight', 'streetlights', 'lamp', 'lamps', 'electricity', 'power', 'dark', 'bulb', 'వీధి దీపాలు', 'లైట్లు', 'కరెంట్', 'దీపం', 'చీకటి', 'బల్బు', 'లైట్'],
  'Water Supply': ['water', 'drinking water', 'tap', 'supply', 'pipe', 'leakage', 'leak', 'నీరు', 'నీటి సరఫరా', 'మంచినీరు', 'పైప్', 'లీకేజీ', 'కుళాయి', 'తాగునీరు', 'నీళ్లు'],
  'Drainage': ['drain', 'drainage', 'sewer', 'gutter', 'clog', 'dirty water', 'overflow', 'మురుగు', 'కాలువ', 'డ్రైనేజీ', 'డ్రైన్', 'మురికి నీరు'],
  'Sanitation': ['garbage', 'waste', 'trash', 'dustbin', 'cleaning', 'sanitation', 'sweep', 'dump', 'చెత్త', 'పారిశుధ్యం', 'శుభ్రం', 'చెత్తబుట్ట', 'స్వీపింగ్'],
  'Public Facilities': ['public', 'school', 'park', 'community', 'library', 'building', 'hospital', 'ప్రజా సౌకర్యాలు', 'బడి', 'పాఠశాల', 'పార్క్', 'ఆసుపత్రి', 'భవనం'],
  'Other': ['other', 'general', 'complaint', 'government', 'issue', 'ఇతర', 'సాధారణ', 'సమస్య'],
};

const COMPLEXITY_VOICE_MAP = {
  'Critical': ['critical', 'emergency', 'hazard', 'immediate', 'danger', 'urgent emergency', 'ఎమర్జెన్సీ', 'అత్యవసరం', 'ప్రమాదకరం', 'ప్రమాదం', 'వెంటనే'],
  'High': ['high', 'urgent', 'repair', 'severe', 'త్వరగా', 'అధికం', 'అత్యవసర మరమ్మత్తు', 'తీవ్రం'],
  'Medium': ['medium', 'moderate', 'attention', 'needed', 'మధ్యస్థం', 'శ్రద్ధ అవసరం'],
  'Normal': ['normal', 'routine', 'low', 'standard', 'regular', 'సాధారణం', 'సాధారణ సమస్య', 'రోజువారీ']
};

const matchCategoryByVoice = (text) => {
  if (!text) return null;
  const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').toLowerCase().trim();
  for (const cat of Object.keys(CATEGORY_VOICE_MAP)) {
    if (clean === cat.toLowerCase()) return cat;
  }
  for (const [cat, kws] of Object.entries(CATEGORY_VOICE_MAP)) {
    if (kws.some(kw => clean.includes(kw.toLowerCase()))) {
      return cat;
    }
  }
  return null;
};

const matchComplexityByVoice = (text) => {
  if (!text) return null;
  const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').toLowerCase().trim();
  for (const lvl of Object.keys(COMPLEXITY_VOICE_MAP)) {
    if (clean === lvl.toLowerCase()) return lvl;
  }
  for (const [lvl, kws] of Object.entries(COMPLEXITY_VOICE_MAP)) {
    if (kws.some(kw => clean.includes(kw.toLowerCase()))) {
      return lvl;
    }
  }
  return null;
};

const matchVillageByVoice = (text, isTelugu) => {
  if (!text) return null;
  const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').toLowerCase().trim();
  for (const v of AP_VILLAGES) {
    if (clean.includes(v.en.toLowerCase()) || clean.includes(v.te)) {
      return isTelugu ? v.te : v.en;
    }
  }
  const cleaned = clean.replace(/my village is|village|area|place|గ్రామం|ప్రాంతం/gi, '').trim();
  return cleaned || text.trim();
};

// ── Interactive Voice Assistant Live Drawer ──
function VoiceLivePanel({ field, isListening, interimText, feedback, isTelugu, prompt, chips, onSelectChip, isDictation, onClose }) {
  return (
    <div className="voice-live-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="soundwave-bars">
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
            <span className="soundwave-bar"></span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563EB' }}>
            {isListening ? (isTelugu ? '🎙️ వింటున్నాము... మాట్లాడండి' : '🎙️ Listening... Speak now') : (isTelugu ? '🎙️ వాయిస్ అసిస్టెంట్' : '🎙️ Voice Assistant')}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '6px'
          }}
          title={isTelugu ? 'ముగించు / మూసివేయి' : 'Close / Done'}
        >
          {isDictation ? (isTelugu ? '⏹️ పూర్తయింది' : '⏹️ Done') : '✕'}
        </button>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>
        {prompt}
      </div>

      {interimText && (
        <div style={{ 
          background: 'rgba(255,255,255,0.7)', 
          padding: '6px 10px', 
          borderRadius: '8px', 
          border: '1px solid rgba(37,99,235,0.2)',
          fontSize: '12.5px',
          fontStyle: 'italic',
          color: '#1D4ED8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>💬</span>
          <span>"{interimText}"</span>
        </div>
      )}

      {feedback && (
        <div style={{
          fontSize: '11.5px',
          fontWeight: '700',
          padding: '4px 8px',
          borderRadius: '6px',
          background: feedback.type === 'success' ? 'rgba(22, 163, 74, 0.1)' : feedback.type === 'error' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(37, 99, 235, 0.1)',
          color: feedback.type === 'success' ? '#16A34A' : feedback.type === 'error' ? '#DC2626' : '#2563EB',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>{feedback.type === 'success' ? '✅' : feedback.type === 'error' ? '⚠️' : 'ℹ️'}</span>
          <span>{feedback.text}</span>
        </div>
      )}

      {chips && chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '2px' }}>
            {isTelugu ? 'తక్షణ ఎంపిక:' : 'Quick voice tap:'}
          </span>
          {chips.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => onSelectChip(chip)}
              style={{
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.color = '#2563EB';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              🗣️ {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VoiceAssistant({ language, user, onSubmissionComplete, onCancel, showToast, changeLanguage, selectedVillage }) {
  const isTelugu = language === 'Telugu';

  // Multi-step form state
  const [formStep, setFormStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('sachivalayam_form_draft');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return { name: user?.name || '', phone: user?.phone || '', village: selectedVillage || user?.village || '', category: '', complexity: 'Medium', description: '' };
  });

  // Sync selectedVillage from dashboard
  useEffect(() => {
    if (selectedVillage) {
      setFormData(prev => ({ ...prev, village: selectedVillage }));
    }
  }, [selectedVillage]);

  // Geolocation state
  const [coords, setCoords] = useState({ latitude: 14.6819, longitude: 77.6006 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, locating, success, error

  // Camera & Photo attachment state
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Voice Assistant states for per-question voice input
  const [activeVoiceField, setActiveVoiceField] = useState(null); // 'village' | 'category' | 'complexity' | 'description' | 'location' | 'photo'
  const [isListening, setIsListening] = useState(false);
  const [interimVoiceText, setInterimVoiceText] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState(null); // { type, text }

  const recognitionRef = useRef(null);
  const activeVoiceFieldRef = useRef(null);

  useEffect(() => {
    activeVoiceFieldRef.current = activeVoiceField;
  }, [activeVoiceField]);

  const categories = [
    { en: 'Roads',             te: 'రోడ్లు',              icon: '🛣️' },
    { en: 'Streetlights',      te: 'వీధి దీపాలు',          icon: '💡' },
    { en: 'Water Supply',      te: 'నీటి సరఫరా',           icon: '🚰' },
    { en: 'Drainage',          te: 'మురుగు కాలువలు',       icon: '🗑️' },
    { en: 'Sanitation',        te: 'పారిశుధ్యం',           icon: '🧹' },
    { en: 'Public Facilities', te: 'ప్రజా సౌకర్యాలు',      icon: '🏫' },
    { en: 'Other',             te: 'ఇతర సమస్యలు',          icon: '❓' },
  ];

  const complexityLevels = [
    {
      id: 'Normal',
      en: 'Normal',
      te: 'సాధారణం',
      tagEn: 'Routine Issue',
      tagTe: 'సాధారణ సమస్య',
      icon: '🟢',
      color: '#16A34A',
      activeClass: 'active-normal'
    },
    {
      id: 'Medium',
      en: 'Medium',
      te: 'మధ్యస్థం',
      tagEn: 'Attention Needed',
      tagTe: 'శ్రద్ధ అవసరం',
      icon: '🟡',
      color: '#2563EB',
      activeClass: 'active-medium'
    },
    {
      id: 'High',
      en: 'High',
      te: 'అధికం',
      tagEn: 'Urgent Repair',
      tagTe: 'అత్యవసర మరమ్మత్తు',
      icon: '🟠',
      color: '#EA580C',
      activeClass: 'active-high'
    },
    {
      id: 'Critical',
      en: 'Critical',
      te: 'అత్యవసరం',
      tagEn: 'Emergency / Hazard',
      tagTe: 'ప్రమాదకరం / అత్యవసరం',
      icon: '🔴',
      color: '#DC2626',
      activeClass: 'active-critical'
    }
  ];

  const t = {
    English: {
      title: "Grievance Registration",
      subtitle: "Submit details of your local secretariat complaint below",
      nameLabel: "👤 Resident Name",
      namePlaceholder: "Enter your full name",
      phoneLabel: "📞 Mobile Number",
      phonePlaceholder: "Enter 10-digit mobile number",
      villageLabel: "📍 Village / Area",
      villagePlaceholder: "Enter your village or area name",
      categoryLabel: "📋 Complaint Category",
      categorySelect: "-- Select Category --",
      complexityLabel: "⚡ Problem Complexity & Urgency",
      complexitySubtitle: "Select the urgency so officials can prioritize and dispatch support rapidly",
      complexityHelp: "High & Critical issues are highlighted with top priority on the official dashboard.",
      immediateAction: "Immediate Emergency Action (Email Dispatched)",
      highPriority: "High Priority Resolution",
      standardPriority: "Standard Priority Queue",
      routinePriority: "Normal Routine Maintenance",
      criticalEmergencyNotice: "Critical Emergency Priority: This issue is treated as an active emergency. An automated high-priority email alert will be dispatched to Admin & Nodal Officers (admin.sachivalayam@ap.gov.in) immediately upon submission.",
      emergencyEmailDispatchedToast: "🚨 Critical Emergency Grievance registered! Instant alert email sent to Admin.",
      descriptionLabel: "✍️ Complaint Description",
      descriptionPlaceholder: "Describe your problem in detail here...",
      gpsTitle: "🛰️ Geotagging Status",
      gpsSuccess: "GPS coordinates captured successfully",
      gpsLoading: "Acquiring current location details...",
      gpsErr: "GPS location access failed.",
      evidenceTitle: "📷 Evidence Photo",
      evidenceSubtitle: "Capture or select a photo of the problem",
      startCam: "Open Camera",
      takePhoto: "Capture Image",
      retake: "Retake Photo",
      uploadFallback: "Or select an image file from storage:",
      submit: "Submit Grievance Details",
      submitting: "Submitting Grievance...",
      cancel: "Cancel",
      detectLocBtn: "Get Current Location",
      detectingLocBtn: "Detecting Location...",
      requiredName: "Please enter your name",
      requiredPhone: "Please enter a valid 10-digit phone number",
      requiredVillage: "Please enter your village / area",
      requiredCategory: "Please select a category",
      requiredDescription: "Please describe your complaint",
      voiceGuideTitle: "🎙️ Voice Assistant or Manual Typing",
      voiceGuideDesc: "Click the 🎙️ Voice button beside each question to speak your details, or type manually as you wish.",
      voiceBtn: "Voice",
      voiceListening: "Listening...",
      voiceDone: "Done",
    },
    Telugu: {
      title: "ఫిర్యాదు నమోదు",
      subtitle: "మీ సమస్య వివరాలను సచివాలయానికి దిగువన సమర్పించండి",
      nameLabel: "👤 నివాసి పేరు",
      namePlaceholder: "మీ పూర్తి పేరు టైప్ చేయండి",
      phoneLabel: "📞 మొబైల్ సంఖ్య",
      phonePlaceholder: "పది అంకెల మొబైల్ సంఖ్య",
      villageLabel: "📍 గ్రామం / ప్రాంతం",
      villagePlaceholder: "మీ గ్రామం లేదా ప్రాంతం పేరు",
      categoryLabel: "📋 సమస్య వర్గం",
      categorySelect: "-- వర్గాన్ని ఎంచుకోండి --",
      complexityLabel: "⚡ సమస్య సంక్లిష్టత మరియు ప్రాధాన్యత",
      complexitySubtitle: "అధికారులు ప్రాధాన్యత ఇచ్చి త్వరగా పరిష్కరించేందుకు తీవ్రతను ఎంచుకోండి",
      complexityHelp: "అత్యవసర మరియు అధిక తీవ్రత గల సమస్యలు అధికారుల డాష్‌బోర్డులో ముందుగా చూపబడతాయి.",
      immediateAction: "అత్యవసర స్పందన (ఈమెయిల్ అలర్ట్ పంపబడుతుంది)",
      highPriority: "అధిక ప్రాధాన్యత పరిష్కారం",
      standardPriority: "ప్రామాణిక ప్రాధాన్యత",
      routinePriority: "సాధారణ ప్రాధాన్యత (Normal)",
      criticalEmergencyNotice: "అత్యవసర ప్రోటోకాల్: ఈ సమస్యను ఎమర్జెన్సీగా పరిగణిస్తున్నాము. మీరు సమర్పించగానే అడ్మిన్ మరియు మండల అధికారులకు ఆటోమేటిక్ అత్యవసర ఈమెయిల్ అలర్ట్ తక్షణమే చేరుతుంది.",
      emergencyEmailDispatchedToast: "🚨 అత్యవసర ఫిర్యాదు నమోదైంది! అధికారులకు ఈమెయిల్ అలర్ట్ పంపబడింది.",
      descriptionLabel: "✍️ సమస్య వివరణ",
      descriptionPlaceholder: "సమస్యను వివరంగా ఇక్కడ టైప్ చేయండి...",
      gpsTitle: "🛰️ జియో-ట్యాగింగ్ స్థితి",
      gpsSuccess: "GPS స్థానాన్ని విజయవంతంగా పొందాము",
      gpsLoading: "లొకేషన్‌ని గుర్తిస్తున్నాము...",
      gpsErr: "GPS లొకేషన్ నిరాకరించబడింది.",
      evidenceTitle: "📷 రుజువు ఫోటో",
      evidenceSubtitle: "సమస్య యొక్క ఫోటో తీయండి లేదా ఎంచుకోండి",
      startCam: "కెమెరాను ఆన్ చేయి",
      takePhoto: "ఫొటో తీయి",
      retake: "మరో ఫొటో తీయి",
      uploadFallback: "లేదా మీ డివైస్ నుండి ఫోటో ఫైల్‌ను ఎంచుకోండి:",
      submit: "వివరాలను సమర్పించండి",
      submitting: "సమర్పిస్తున్నాము...",
      cancel: "రద్దు చేయి",
      detectLocBtn: "స్థానాన్ని గుర్తించు",
      detectingLocBtn: "గుర్తిస్తోంది...",
      requiredName: "దయచేసి పేరు టైప్ చేయండి",
      requiredPhone: "దయచేసి సరైన పది అంకెల మొబైల్ సంఖ్యను టైప్ చేయండి",
      requiredVillage: "దయచేసి గ్రామం టైప్ చేయండి",
      requiredCategory: "దయచేసి వర్గాన్ని ఎంచుకోండి",
      requiredDescription: "దయచేసి వివరణ టైప్ చేయండి",
      voiceGuideTitle: "🎙️ వాయిస్ అసిస్టెంట్ లేదా టైపింగ్",
      voiceGuideDesc: "ప్రతి ప్రశ్న పక్కన ఉన్న 🎙️ వాయిస్ బటన్‌ని క్లిక్ చేసి మాట్లాడవచ్చు, లేదా మీ ఇష్టానుసారం టైప్ చేయవచ్చు.",
      voiceBtn: "వాయిస్",
      voiceListening: "వింటున్నాను...",
      voiceDone: "పూర్తయింది",
    }
  }[language] || t.English;

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem('sachivalayam_form_draft', JSON.stringify(formData));
  }, [formData]);

  // Geolocation on load
  useEffect(() => {
    setLocationStatus('locating');
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationStatus('success');
      },
      ()  => {
        setCoords({ latitude: 14.6819, longitude: 77.6006 });
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, []);

  // Cleanup camera stream and voice assistant on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopVoiceAssistant();
    };
  }, []);

  // Bind camera stream to video element when camera becomes active
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      // Explicitly trigger play to handle autoplay policy in browser sandbox
      video.play().catch(err => {
        console.warn("Autoplay was blocked or interrupted:", err);
      });
    }
  }, [cameraActive]);

  const detectLocation = () => {
    setIsDetectingLocation(true);
    setLocationStatus('locating');
    if (!navigator.geolocation) {
      showToast(isTelugu ? 'మీ బ్రౌజర్ జిపిఎస్ ను సమర్ధించదు' : 'Geolocation is not supported by your browser');
      setIsDetectingLocation(false);
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ latitude: lat, longitude: lon });
        setLocationStatus('success');

        // Check proximity to predefined villages
        const closestResultName = findClosestVillageName(lat, lon, false); // English name for matching distance
        const coordsPredefined = VILLAGE_COORDINATES[closestResultName];
        const distance = Math.hypot(coordsPredefined.lat - lat, coordsPredefined.lng - lon);
        
        // If close (~30km), use predefined name (translating to Telugu if needed)
        if (distance < 0.3) {
          const resolvedName = isTelugu ? coordsPredefined.te : closestResultName;
          setFormData(prev => ({ ...prev, village: resolvedName }));
          showToast(isTelugu ? `స్థానం గుర్తించబడింది: ${resolvedName}` : `Location resolved: ${resolvedName}`);
          setIsDetectingLocation(false);
          return;
        }

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': isTelugu ? 'te,en' : 'en' }
          });
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const placeName = addr.village || addr.suburb || addr.town || addr.neighbourhood || addr.hamlet || addr.city || addr.road || '';
            const county = addr.county || '';
            let resolvedName = placeName;
            
            if (county && placeName && !placeName.includes(county)) {
              resolvedName = `${placeName}, ${county}`;
            } else if (!resolvedName) {
              resolvedName = data.display_name ? data.display_name.split(',').slice(0, 2).join(',') : '';
            }

            if (resolvedName) {
              setFormData(prev => ({ ...prev, village: resolvedName }));
              showToast(isTelugu ? `స్థానం గుర్తించబడింది: ${resolvedName}` : `Location resolved: ${resolvedName}`);
            } else {
              const fallbackVillage = findClosestVillageName(lat, lon, isTelugu);
              setFormData(prev => ({ ...prev, village: fallbackVillage }));
              showToast(isTelugu ? `స్థానం గుర్తించబడింది: ${fallbackVillage}` : `Location resolved: ${fallbackVillage}`);
            }
          } else {
            const fallbackVillage = findClosestVillageName(lat, lon, isTelugu);
            setFormData(prev => ({ ...prev, village: fallbackVillage }));
            showToast(isTelugu ? `స్థానం గుర్తించబడింది: ${fallbackVillage}` : `Location resolved: ${fallbackVillage}`);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          const fallbackVillage = findClosestVillageName(lat, lon, isTelugu);
          setFormData(prev => ({ ...prev, village: fallbackVillage }));
          showToast(isTelugu ? `స్థానం గుర్తించబడింది: ${fallbackVillage}` : `Location resolved: ${fallbackVillage}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        setLocationStatus('error');
        let errorMsg = isTelugu ? 'స్థానాన్ని పొందడం విఫలమైంది.' : 'Failed to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = isTelugu ? 'స్థాన అనుమతి నిరాకరించబడింది.' : 'Location permission denied.';
        }
        showToast(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startCamera = async () => {
    try {
      // Use ideal constraint to prefer back camera but fallback to laptop/front webcam gracefully
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } } 
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.warn("Could not open camera:", err);
      showToast(isTelugu ? "కెమెరాను ఆన్ చేయడం కుదరలేదు" : "Could not open camera stream.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video is playing and has valid dimensions
      if (video.videoWidth <= 0 || video.videoHeight <= 0) {
        showToast(isTelugu ? "వీడియో స్ట్రీమ్ ఇంకా లోడ్ కాలేదు" : "Video stream not fully loaded yet.");
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setPhotoBlob(blob);
          setPhotoPreview(URL.createObjectURL(blob));
        } else {
          showToast(isTelugu ? "ఫొటోను క్యాప్చర్ చేయడం కుదరలేదు" : "Failed to capture photo.");
        }
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoBlob(file);
      setPhotoPreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const updateField = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const speakText = (msg) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(msg);
        utter.lang = isTelugu ? 'te-IN' : 'en-IN';
        utter.rate = 1.05;
        const voices = window.speechSynthesis.getVoices();
        if (isTelugu) {
          const v = voices.find(vo => vo.lang.startsWith('te'));
          if (v) utter.voice = v;
        } else {
          const v = voices.find(vo => vo.lang === 'en-IN' || vo.lang.startsWith('en'));
          if (v) utter.voice = v;
        }
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    }
  };

  const stopVoiceAssistant = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setActiveVoiceField(null);
    setInterimVoiceText('');
  };

  const toggleVoiceField = (fieldKey) => {
    if (activeVoiceField === fieldKey) {
      stopVoiceAssistant();
      return;
    }
    startVoiceForField(fieldKey);
  };

  const startVoiceForField = (fieldKey) => {
    stopVoiceAssistant();
    setActiveVoiceField(fieldKey);
    setInterimVoiceText('');
    setVoiceFeedback(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const prompts = {
      village: isTelugu ? 'దయచేసి మీ గ్రామం లేదా ప్రాంతం పేరు చెప్పండి.' : 'Please say your village or area name.',
      category: isTelugu ? 'సమస్య వర్గాన్ని చెప్పండి: రోడ్లు, వీధి దీపాలు, నీటి సరఫరా, మురుగు లేదా పారిశుధ్యం.' : 'Please say the complaint category: Roads, Streetlights, Water supply, Drainage, or Sanitation.',
      complexity: isTelugu ? 'సమస్య తీవ్రత చెప్పండి: సాధారణం, మధ్యస్థం, అధికం, లేదా అత్యవసరం.' : 'Please say the urgency: Normal, Medium, High, or Critical emergency.',
      description: isTelugu ? 'మీ సమస్యను వివరంగా మాట్లాడండి.' : 'Please describe your complaint in detail.',
      location: isTelugu ? 'లొకేషన్ తీసుకో లేదా గుర్తించు అని చెప్పండి.' : 'Say detect location or get GPS coordinates.',
      photo: isTelugu ? 'కెమెరా ఆన్ చేయి లేదా ఫోటో తీయి అని చెప్పండి.' : 'Say open camera or take photo.'
    };

    speakText(prompts[fieldKey] || '');

    if (!SpeechRecognition) {
      setVoiceFeedback({
        type: 'info',
        text: isTelugu ? 'మీ బ్రౌజర్‌లో మైక్ రికగ్నిషన్ లభ్యం కాలేదు. మీరు మాన్యువల్‌గా టైప్ చేయవచ్చు లేదా క్రింది ఆప్షన్లను ఎంచుకోవచ్చు.' : 'Microphone speech recognition is not supported in this browser. You can type manually or use the quick chips below.'
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = (fieldKey === 'description');
      recognition.interimResults = true;
      recognition.lang = isTelugu ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const heardText = (final || interim).trim();
        setInterimVoiceText(heardText);

        if (final) {
          handleVoiceCommit(fieldKey, final.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceFeedback({
            type: 'error',
            text: isTelugu ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. మీరు మాన్యువల్‌గా టైప్ చేయవచ్చు.' : 'Microphone access denied. You can fill details by manual typing.'
          });
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start failed:', err);
    }
  };

  const handleVoiceCommit = (fieldKey, speechText) => {
    if (!speechText) return;

    if (fieldKey === 'village') {
      const resolved = matchVillageByVoice(speechText, isTelugu);
      if (resolved) {
        updateField('village', resolved);
        setVoiceFeedback({
          type: 'success',
          text: `${isTelugu ? 'గ్రామం ఎంపిక చేయబడింది:' : 'Village selected:'} ${resolved}`
        });
        speakText(isTelugu ? `గ్రామం ${resolved} ఎంపిక చేయబడింది` : `Village set to ${resolved}`);
        setTimeout(() => {
          if (activeVoiceFieldRef.current === 'village') stopVoiceAssistant();
        }, 1800);
      }
    } else if (fieldKey === 'category') {
      const cat = matchCategoryByVoice(speechText);
      if (cat) {
        updateField('category', cat);
        const catObj = categories.find(c => c.en === cat);
        const catName = isTelugu ? (catObj?.te || cat) : cat;
        setVoiceFeedback({
          type: 'success',
          text: `${isTelugu ? 'వర్గం ఎంపిక చేయబడింది:' : 'Category selected:'} ${catName}`
        });
        speakText(isTelugu ? `సమస్య వర్గం ${catName} ఎంపిక చేయబడింది` : `Category selected: ${catName}`);
        setTimeout(() => {
          if (activeVoiceFieldRef.current === 'category') stopVoiceAssistant();
        }, 1800);
      } else {
        setVoiceFeedback({
          type: 'info',
          text: isTelugu ? `"${speechText}" గుర్తించలేదు. రోడ్లు, లైట్లు, నీరు మొదలైనవి చెప్పండి.` : `Could not match "${speechText}". Try saying Roads, Streetlights, or Water.`
        });
      }
    } else if (fieldKey === 'complexity') {
      const lvl = matchComplexityByVoice(speechText);
      if (lvl) {
        updateField('complexity', lvl);
        const lvlObj = complexityLevels.find(c => c.id === lvl);
        const lvlName = isTelugu ? (lvlObj?.te || lvl) : lvl;
        setVoiceFeedback({
          type: 'success',
          text: `${isTelugu ? 'తీవ్రత ఎంపిక చేయబడింది:' : 'Urgency selected:'} ${lvlName}`
        });
        if (lvl === 'Critical') {
          speakText(isTelugu ? 'అత్యవసర ప్రాధాన్యత ఎంపిక చేయబడింది. అధికారులకు తక్షణ ఈమెయిల్ అలర్ట్ పంపబడుతుంది.' : 'Critical emergency priority selected. Email alert will be sent to admin.');
        } else {
          speakText(isTelugu ? `సమస్య తీవ్రత ${lvlName} ఎంపిక చేయబడింది` : `Urgency set to ${lvlName}`);
        }
        setTimeout(() => {
          if (activeVoiceFieldRef.current === 'complexity') stopVoiceAssistant();
        }, 1800);
      } else {
        setVoiceFeedback({
          type: 'info',
          text: isTelugu ? `"${speechText}" అర్థం కాలేదు. సాధారణం, మధ్యస్థం, అధికం, లేదా అత్యవసరం అని చెప్పండి.` : `Could not match "${speechText}". Try saying Normal, Medium, High, or Critical.`
        });
      }
    } else if (fieldKey === 'description') {
      setFormData(prev => ({
        ...prev,
        description: prev.description ? (prev.description + ' ' + speechText) : speechText
      }));
      setVoiceFeedback({
        type: 'success',
        text: isTelugu ? 'వివరణ జోడించబడింది. మీరు ఇంకా మాట్లాడవచ్చు లేదా పూర్తయితే Done నొక్కండి.' : 'Dictation added. You can continue speaking or click Done.'
      });
    } else if (fieldKey === 'location') {
      const lower = speechText.toLowerCase();
      if (lower.includes('location') || lower.includes('detect') || lower.includes('gps') || lower.includes('తీసుకో') || lower.includes('గుర్తించు') || lower.includes('స్థానం')) {
        detectLocation();
        speakText(isTelugu ? 'స్థానాన్ని గుర్తిస్తున్నాము' : 'Detecting your location');
        setVoiceFeedback({
          type: 'success',
          text: isTelugu ? 'GPS స్థానాన్ని గుర్తించాము' : 'Location detection triggered'
        });
        setTimeout(() => {
          if (activeVoiceFieldRef.current === 'location') stopVoiceAssistant();
        }, 1800);
      }
    } else if (fieldKey === 'photo') {
      const lower = speechText.toLowerCase();
      if (lower.includes('open') || lower.includes('camera') || lower.includes('కెమెరా') || lower.includes('ఆన్')) {
        startCamera();
        speakText(isTelugu ? 'కెమెరా ఆన్ చేస్తున్నాము' : 'Opening camera');
        setVoiceFeedback({
          type: 'success',
          text: isTelugu ? 'కెమెరా ఆన్ చేయబడింది' : 'Camera opened'
        });
        setTimeout(() => {
          if (activeVoiceFieldRef.current === 'photo') stopVoiceAssistant();
        }, 1800);
      } else if (lower.includes('photo') || lower.includes('capture') || lower.includes('take') || lower.includes('తీయి') || lower.includes('ఫొటో')) {
        if (cameraActive) {
          capturePhoto();
          speakText(isTelugu ? 'ఫోటో తీయబడింది' : 'Photo captured');
          setVoiceFeedback({
            type: 'success',
            text: isTelugu ? 'ఫోటో తీయబడింది' : 'Photo captured'
          });
          setTimeout(() => {
            if (activeVoiceFieldRef.current === 'photo') stopVoiceAssistant();
          }, 1800);
        } else {
          startCamera();
        }
      }
    }
  };

  const handleNext = (currentStepNum) => {
    stopVoiceAssistant();
    if (currentStepNum === 1) {
      if (!formData.name.trim()) return showToast(t.requiredName);
      if (!formData.phone.trim() || formData.phone.length < 10) return showToast(t.requiredPhone);
      setFormStep(2);
    } else if (currentStepNum === 2) {
      if (!formData.village.trim()) return showToast(t.requiredVillage);
      if (!formData.category) return showToast(t.requiredCategory);
      if (!formData.description.trim()) return showToast(t.requiredDescription);
      setFormStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formStep !== 3) return;

    setIsSubmitting(true);

    try {
      let photo_url = '';
      
      if (photoBlob) {
        const uploadData = new FormData();
        uploadData.append('photo', photoBlob, 'complaint-evidence.jpg');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          photo_url = uploadResult.photo_url || '';
        }
      }

      const payload = {
        resident_name: formData.name,
        resident_phone: formData.phone,
        village_area: formData.village,
        complaint_category: formData.category,
        complexity: formData.complexity || 'Medium',
        priority: formData.complexity || 'Medium',
        complaint_description_text: formData.description,
        photo_url,
        complaint_audio_url: '',
        latitude: coords.latitude,
        longitude: coords.longitude,
        language,
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        localStorage.removeItem('sachivalayam_form_draft');
        if (formData.complexity === 'Critical') {
          showToast(t.emergencyEmailDispatchedToast || '🚨 Critical Emergency Grievance registered! Instant alert email sent to Admin.');
        }
        if (onSubmissionComplete) onSubmissionComplete(data.complaint.id);
      } else {
        showToast(isTelugu ? 'ఫిర్యాదు సమర్పణ విఫలమైంది.' : 'Submission failed. Try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast(isTelugu ? 'ఫిర్యాదు సమర్పణ విఫలమైంది.' : 'Submission failed. Try again.');
      console.error(err);
    }
  };

  return (
    <div className="va-root" style={{ textAlign: 'left', maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
      
      {/* ── Top Header ── */}
      <div className="va-topbar" style={{ marginBottom: '20px' }}>
        <div className="va-topbar-left">
          <div className="va-avatar">📝</div>
          <div>
            <div className="va-topbar-title">{t.title}</div>
            <div className="va-topbar-sub">{t.subtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
            onClick={() => changeLanguage?.(isTelugu ? 'English' : 'Telugu')}
          >
            🌐 {isTelugu ? 'English' : 'తెలుగు'}
          </button>
          <button type="button" className="va-cancel-btn" onClick={onCancel}>✕</button>
        </div>
      </div>

      {/* ── Step Progress Indicator ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 8px' }}>
        {[1, 2, 3].map(stepNum => (
          <div key={stepNum} style={{ display: 'flex', alignItems: 'center', flex: stepNum < 3 ? 1 : 'none' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: formStep === stepNum ? '#2563EB' : formStep > stepNum ? '#10B981' : 'var(--border-color)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '14px',
              boxShadow: formStep === stepNum ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none',
              transform: formStep === stepNum ? 'scale(1.08)' : 'scale(1)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {formStep > stepNum ? '✓' : stepNum}
            </div>
            {stepNum < 3 && (
              <div style={{
                height: '3px',
                flex: 1,
                background: formStep > stepNum ? '#10B981' : 'var(--border-color)',
                margin: '0 12px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* ── Step 1: Resident Details ── */}
        {formStep === 1 && (
          <div className="card animated-card" style={{ padding: '24px', borderRadius: '16px', animation: 'stepEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--text-primary)' }}>
              👤 {isTelugu ? 'నివాసి వివరాలు' : 'Resident Details'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t.nameLabel}</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder={t.namePlaceholder} style={{ fontSize: '14.5px', padding: '14px' }} />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t.phoneLabel}</label>
                <input type="text" className="form-control" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder={t.phonePlaceholder} style={{ fontSize: '14.5px', padding: '14px' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Grievance Details ── */}
        {formStep === 2 && (
          <div className="card animated-card" style={{ padding: '24px', borderRadius: '16px', animation: 'stepEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                📋 {isTelugu ? 'సమస్య వివరాలు' : 'Grievance Details'}
              </h3>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', background: 'rgba(37,99,235,0.08)', padding: '3px 10px', borderRadius: '14px', border: '1px solid rgba(37,99,235,0.2)' }}>
                🎙️ {isTelugu ? 'వాయిస్ లేదా టైపింగ్' : 'Voice or Manual Typing'}
              </span>
            </div>

            {/* Hint card explaining both voice and typing options */}
            <div className="voice-step-hint-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', lineHeight: '1.4' }}>
                  {t.voiceGuideDesc}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Question 1: Village Input with Voice Assistant & Geolocator button */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      {t.villageLabel}
                    </label>
                    <button
                      type="button"
                      className={`field-voice-btn ${activeVoiceField === 'village' ? 'is-listening' : ''}`}
                      onClick={() => toggleVoiceField('village')}
                      title={isTelugu ? 'వాయిస్ అసిస్టెంట్ ద్వారా గ్రామం చెప్పండి' : 'Speak village name with Voice Assistant'}
                    >
                      <span>{activeVoiceField === 'village' ? '🔴' : '🎙️'}</span>
                      <span>{activeVoiceField === 'village' ? t.voiceListening : t.voiceBtn}</span>
                    </button>
                  </div>
                  <button 
                    type="button" 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#2563EB', 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                    onClick={detectLocation}
                    disabled={isDetectingLocation}
                  >
                    🛰️ {isDetectingLocation ? t.detectingLocBtn : t.detectLocBtn}
                  </button>
                </div>

                {activeVoiceField === 'village' && (
                  <VoiceLivePanel
                    field="village"
                    isListening={isListening}
                    interimText={interimVoiceText}
                    feedback={voiceFeedback}
                    isTelugu={isTelugu}
                    prompt={isTelugu ? 'మీ గ్రామం లేదా ప్రాంతం పేరు స్పష్టంగా మాట్లాడండి' : 'Speak your village or area name clearly'}
                    chips={['Kothacheruvu', 'Bukkarayasamudram', 'Rapthadu', 'Duvvada', 'Puttaparthi', 'Dharmavaram']}
                    onSelectChip={(v) => handleVoiceCommit('village', v)}
                    onClose={stopVoiceAssistant}
                  />
                )}

                <input type="text" className="form-control" list="ap-villages-list" value={formData.village} onChange={e => updateField('village', e.target.value)} placeholder={t.villagePlaceholder} style={{ fontSize: '14.5px', padding: '14px' }} />
              </div>

              {/* Question 2: Category selection with Voice Assistant */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    {t.categoryLabel}
                  </label>
                  <button
                    type="button"
                    className={`field-voice-btn ${activeVoiceField === 'category' ? 'is-listening' : ''}`}
                    onClick={() => toggleVoiceField('category')}
                    title={isTelugu ? 'వాయిస్ అసిస్టెంట్ ద్వారా వర్గాన్ని ఎంచుకోండి' : 'Select category with Voice Assistant'}
                  >
                    <span>{activeVoiceField === 'category' ? '🔴' : '🎙️'}</span>
                    <span>{activeVoiceField === 'category' ? t.voiceListening : t.voiceBtn}</span>
                  </button>
                </div>

                {activeVoiceField === 'category' && (
                  <VoiceLivePanel
                    field="category"
                    isListening={isListening}
                    interimText={interimVoiceText}
                    feedback={voiceFeedback}
                    isTelugu={isTelugu}
                    prompt={isTelugu ? 'సమస్య వర్గాన్ని చెప్పండి (ఉదా: రోడ్లు, వీధి దీపాలు, నీటి సరఫరా, మురుగు, పారిశుధ్యం)' : 'Speak category (e.g. Roads, Streetlights, Water supply, Drainage, Sanitation)'}
                    chips={categories.map(c => isTelugu ? c.te : c.en)}
                    onSelectChip={(cat) => handleVoiceCommit('category', cat)}
                    onClose={stopVoiceAssistant}
                  />
                )}

                <select className="form-control" value={formData.category} onChange={e => updateField('category', e.target.value)} style={{ fontSize: '14.5px', padding: '12px 14px', height: '52px', cursor: 'pointer' }}>
                  <option value="">{t.categorySelect}</option>
                  {categories.map(c => <option key={c.en} value={c.en}>{c.icon} {isTelugu ? c.te : c.en}</option>)}
                </select>
              </div>

              {/* Question 3: Problem Complexity & Priority with Voice Assistant */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      {t.complexityLabel}
                    </label>
                    <button
                      type="button"
                      className={`field-voice-btn ${activeVoiceField === 'complexity' ? 'is-listening' : ''}`}
                      onClick={() => toggleVoiceField('complexity')}
                      title={isTelugu ? 'వాయిస్ అసిస్టెంట్ ద్వారా సమస్య తీవ్రత చెప్పండి' : 'Select urgency with Voice Assistant'}
                    >
                      <span>{activeVoiceField === 'complexity' ? '🔴' : '🎙️'}</span>
                      <span>{activeVoiceField === 'complexity' ? t.voiceListening : t.voiceBtn}</span>
                    </button>
                  </div>
                  <span style={{ 
                    fontSize: '11.5px', 
                    fontWeight: '800', 
                    color: formData.complexity === 'Critical' ? '#DC2626' : 
                           formData.complexity === 'High' ? '#EA580C' : 
                           (formData.complexity === 'Normal' || formData.complexity === 'Low') ? '#16A34A' : '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {formData.complexity === 'Critical' ? `🔴 ${t.immediateAction}` :
                     formData.complexity === 'High' ? `🟠 ${t.highPriority}` :
                     (formData.complexity === 'Normal' || formData.complexity === 'Low') ? `🟢 ${t.routinePriority}` :
                     `🟡 ${t.standardPriority}`}
                  </span>
                </div>

                {activeVoiceField === 'complexity' && (
                  <VoiceLivePanel
                    field="complexity"
                    isListening={isListening}
                    interimText={interimVoiceText}
                    feedback={voiceFeedback}
                    isTelugu={isTelugu}
                    prompt={isTelugu ? 'సమస్య తీవ్రత చెప్పండి: సాధారణం, మధ్యస్థం, అధికం, లేదా అత్యవసరం (Critical)' : 'Speak urgency: Normal, Medium, High, or Critical Emergency'}
                    chips={['🟢 Normal', '🟡 Medium', '🟠 High', '🔴 Critical']}
                    onSelectChip={(lvl) => {
                      const cleanLvl = lvl.replace(/[🟢🟡🟠🔴\s]/g, '');
                      handleVoiceCommit('complexity', cleanLvl);
                    }}
                    onClose={stopVoiceAssistant}
                  />
                )}

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {t.complexitySubtitle}
                </div>

                <div className="complexity-grid">
                  {complexityLevels.map(lvl => {
                    const isSelected = (formData.complexity || 'Medium') === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => updateField('complexity', lvl.id)}
                        className={`complexity-card ${isSelected ? lvl.activeClass : ''}`}
                      >
                        <span style={{ fontSize: '20px', marginBottom: '4px' }}>
                          {lvl.icon}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? lvl.color : 'var(--text-primary)', marginBottom: '2px' }}>
                          {isTelugu ? lvl.te : lvl.en}
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: isSelected ? '700' : '500', lineHeight: '1.2' }}>
                          {isTelugu ? lvl.tagTe : lvl.tagEn}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Emergency Alert Protocol Banner when Critical is selected */}
                {formData.complexity === 'Critical' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1.5px solid rgba(239, 68, 68, 0.35)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    animation: 'slideInUp 0.3s ease'
                  }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>🚨</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#DC2626', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {isTelugu ? 'అత్యవసర ప్రోటోకాల్ యాక్టివ్ • ఈమెయిల్ అలర్ట్ పంపబడుతుంది' : 'EMERGENCY PROTOCOL ACTIVE • OFFICIAL EMAIL ALERT'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5', fontWeight: '500' }}>
                        {t.criticalEmergencyNotice}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  <span>⚡</span>
                  <span>{t.complexityHelp}</span>
                </div>
              </div>

              {/* Question 4: Description input with Voice Assistant */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      {t.descriptionLabel}
                    </label>
                    <button
                      type="button"
                      className={`field-voice-btn ${activeVoiceField === 'description' ? 'is-listening' : ''}`}
                      onClick={() => toggleVoiceField('description')}
                      title={isTelugu ? 'వాయిస్ డిక్టేషన్ ద్వారా సమస్య వివరణ చెప్పండి' : 'Dictate description with Voice Assistant'}
                    >
                      <span>{activeVoiceField === 'description' ? '🔴' : '🎙️'}</span>
                      <span>{activeVoiceField === 'description' ? t.voiceListening : (isTelugu ? 'వాయిస్ డిక్టేషన్' : 'Voice Dictate')}</span>
                    </button>
                  </div>
                  {formData.description && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      {formData.description.length} {isTelugu ? 'అక్షరాలు' : 'chars'}
                    </span>
                  )}
                </div>

                {activeVoiceField === 'description' && (
                  <VoiceLivePanel
                    field="description"
                    isListening={isListening}
                    interimText={interimVoiceText}
                    feedback={voiceFeedback}
                    isTelugu={isTelugu}
                    prompt={isTelugu ? 'మీ సమస్యను వివరంగా చెప్పండి. మాట్లాడిన పదాలు కింద టైప్ అవుతాయి.' : 'Speak your complaint in detail. Words are transcribed in real time.'}
                    isDictation={true}
                    onClose={stopVoiceAssistant}
                  />
                )}

                <textarea className="form-control" rows="4" value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder={t.descriptionPlaceholder} style={{ fontSize: '14.5px', padding: '14px', resize: 'vertical' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Geotagging & Evidence ── */}
        {formStep === 3 && (
          <div className="card animated-card" style={{ padding: '24px', borderRadius: '16px', animation: 'stepEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--text-primary)' }}>
              📷 {isTelugu ? 'సాక్ష్యం & జియోట్యాగ్' : 'Evidence & Geotagging'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* GPS coordinates badge tag */}
              <div style={{ textAlign: 'center', background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}>
                {locationStatus === 'locating' ? (
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>📡 {t.gpsLoading}</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13.5px', color: locationStatus === 'success' ? '#16A34A' : '#DC2626', fontWeight: '800' }}>
                        {locationStatus === 'success' ? `✅ ${t.gpsSuccess}` : `⚠️ ${t.gpsErr}`}
                      </span>
                      <button 
                        type="button" 
                        onClick={detectLocation} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title={isTelugu ? 'స్థానాన్ని నవీకరించండి' : 'Refresh location'}
                      >
                        🔄
                      </button>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.2px' }}>
                      Lat: {coords.latitude?.toFixed(5)} | Lon: {coords.longitude?.toFixed(5)}
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Capture stream or File picker */}
              <div className="photo-capture-area" style={{ width: '100%' }}>
                {photoPreview ? (
                  <div style={{ width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid var(--border-color)', boxShadow: 'var(--soft-shadow)' }}>
                    <img src={photoPreview} alt="Evidence" style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }} />
                    <button 
                      type="button"
                      className="btn btn-secondary btn-block" 
                      style={{ borderRadius: '0', border: 'none', padding: '14px', fontSize: '13.5px', fontWeight: '700' }}
                      onClick={() => { setPhotoPreview(''); setPhotoBlob(null); }}
                    >
                      🔄 {t.retake}
                    </button>
                  </div>
                ) : cameraActive ? (
                  <div className="camera-preview-box" style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '14px', overflow: 'hidden', background: '#000', boxShadow: 'var(--soft-shadow)' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                    <button 
                      type="button"
                      className="btn btn-danger" 
                      style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '58px', height: '58px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 6px 16px rgba(0,0,0,0.4)', border: '2px solid #fff' }}
                      onClick={capturePhoto}
                    >
                      📸
                    </button>
                  </div>
                ) : (
                  <div 
                    className="camera-preview-box card-interactive" 
                    style={{ 
                      width: '100%', 
                      aspectRatio: '4/3', 
                      borderRadius: '14px', 
                      border: '2.5px dashed var(--border-color)', 
                      background: 'var(--hover-bg)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      gap: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={startCamera}
                  >
                    <span style={{ fontSize: '54px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' }}>📷</span>
                    <span style={{ fontWeight: '800', fontSize: '14.5px', color: 'var(--text-secondary)' }}>{t.startCam}</span>
                  </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

                {!photoPreview && !cameraActive && (
                  <div style={{ width: '100%', marginTop: '16px' }}>
                    <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '8px' }}>
                      {t.uploadFallback}
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="form-control"
                      style={{ fontSize: '13px', padding: '12px' }}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── Step Navigation Button Strip ── */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', marginBottom: '40px' }}>
          {formStep === 1 && (
            <>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '15px' }} 
                onClick={onCancel}
              >
                {t.cancel}
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 2, padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '15px', background: '#2563EB' }} 
                onClick={() => handleNext(1)}
              >
                {isTelugu ? 'తదుపరి →' : 'Next →'}
              </button>
            </>
          )}

          {formStep === 2 && (
            <>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '15px' }} 
                onClick={() => { stopVoiceAssistant(); setFormStep(1); }}
              >
                {isTelugu ? '← వెనుకకు' : '← Back'}
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 2, padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '15px', background: '#2563EB' }} 
                onClick={() => handleNext(2)}
              >
                {isTelugu ? 'తదుపరి →' : 'Next →'}
              </button>
            </>
          )}

          {formStep === 3 && (
            <>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '15px' }} 
                onClick={() => { stopVoiceAssistant(); setFormStep(2); }}
                disabled={isSubmitting}
              >
                {isTelugu ? '← వెనుకకు' : '← Back'}
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 2, padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '15px', background: '#10B981' }}
                disabled={isSubmitting}
              >
                🚀 {isSubmitting ? t.submitting : t.submit}
              </button>
            </>
          )}
        </div>

      </form>

      {/* AP Villages datalist helper */}
      <datalist id="ap-villages-list">
        {AP_VILLAGES.map(v => <option key={v.en} value={isTelugu ? v.te : v.en} />)}
      </datalist>

      {/* Inline styles for step entry animations */}
      <style>{`
        .animated-card {
          animation: stepEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes stepEnter {
          0% { transform: translateY(15px) scale(0.98); opacity: 0; filter: blur(2px); }
          100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
        }
      `}</style>

    </div>
  );
}
