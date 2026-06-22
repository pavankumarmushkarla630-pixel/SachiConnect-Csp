import React, { useState, useEffect, useRef } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const textToDigits = (text) => {
  const wordsMap = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'సున్నా': '0', 'ఒకటి': '1', 'రెండు': '2', 'మూడు': '3', 'నాలుగు': '4',
    'ఐదు': '5', 'ఆరు': '6', 'ఏడు': '7', 'ఎనిమిది': '8', 'తొమ్మిది': '9',
  };
  let cleanText = text.toLowerCase().trim();
  for (const [word, digit] of Object.entries(wordsMap)) {
    cleanText = cleanText.replace(new RegExp(word, 'g'), digit);
  }
  return cleanText.replace(/\D/g, '');
};

const matchCategoryByVoice = (speechText) => {
  const text = speechText.toLowerCase().trim();
  const mappings = {
    'Roads': ['road', 'roads', 'path', 'pothole', 'potholes', 'street', 'highway', 'రహదారులు', 'రోడ్లు', 'రోడ్డు', 'గుంతలు'],
    'Streetlights': ['light', 'lights', 'streetlight', 'streetlights', 'lamp', 'lamps', 'electricity', 'power', 'dark', 'వీధి దీపాలు', 'లైట్లు', 'కరెంట్', 'దీపం', 'చీకటి'],
    'Water Supply': ['water', 'drinking water', 'leak', 'tap', 'supply', 'pipe', 'leakage', 'నీరు', 'నీటి సరఫరా', 'మంచినీరు', 'పైప్', 'లీకేజీ'],
    'Drainage': ['drain', 'drainage', 'sewer', 'gutter', 'clog', 'dirty water', 'మురుగు', 'కాలువ', 'డ్రైనేజీ'],
    'Sanitation': ['garbage', 'waste', 'trash', 'dustbin', 'cleaning', 'sanitation', 'sweep', 'చెత్త', 'పారిశుధ్యం', 'శుభ్రం'],
    'Public Facilities': ['public', 'school', 'park', 'community', 'library', 'building', 'ప్రజా సౌకర్యాలు', 'బడి', 'పాఠశాల', 'పార్క్'],
    'Other': ['other', 'general', 'complaint', 'government', 'service', 'ఇతర', 'సాధారణ', 'సమస్య'],
  };
  for (const [category, keywords] of Object.entries(mappings)) {
    if (keywords.some(kw => text.includes(kw))) return category;
  }
  return null;
};

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function VoiceAssistant({ language, user, onCompleteStep, onSubmissionComplete, onCancel, showToast, changeLanguage }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Speech recognition state
  const [isListening, setIsListening]   = useState(false);
  const [interimText, setInterimText]   = useState('');   // live interim transcript
  const [micStatus, setMicStatus]       = useState('checking');
  const [isOffline, setIsOffline]       = useState(!navigator.onLine);

  // Geolocation
  const [coords, setCoords] = useState({ latitude: 14.6819, longitude: 77.6006 });

  // Form data
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('sachivalayam_voice_draft');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return { name: user?.name || '', phone: user?.phone || '', village: user?.village || '', category: '', description: '' };
  });

  const [audioBlob, setAudioBlob]       = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [volume, setVolume]             = useState(0);
  const [logs, setLogs]                 = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const recognitionRef     = useRef(null);   // SpeechRecognition instance
  const isListeningRef     = useRef(false);
  const userStoppedRef     = useRef(false);
  const committedRef       = useRef('');     // accumulated final transcript for this step
  const currentStepRef     = useRef(1);
  const formDataRef        = useRef(formData);
  const languageRef        = useRef(language);
  const synthesisRef       = useRef(window.speechSynthesis);
  const currentUtterRef    = useRef(null);
  const timerRef           = useRef(null);
  const volumeAnimRef      = useRef(null);
  const mediaStreamRef     = useRef(null);
  const analyserRef        = useRef(null);

  // Keep refs in sync
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { formDataRef.current = formData; },     [formData]);
  useEffect(() => { languageRef.current = language; },     [language]);

  const isTelugu = language === 'Telugu';

  const QUESTIONS = {
    1: isTelugu ? 'మీ పేరు ఏమిటి?' : 'What is your name?',
    2: isTelugu ? 'మీ పది అంకెల మొబైల్ సంఖ్య ఏమిటి?' : 'What is your 10-digit mobile number?',
    3: isTelugu ? 'మీరు ఏ గ్రామం లేదా ప్రాంతం నుండి వచ్చారు?' : 'Which village or area are you from?',
    4: isTelugu ? 'సమస్య వర్గం ఏమిటి? రోడ్లు, వీధిదీపాలు, నీటి సరఫరా, మురుగు, పారిశుధ్యం, ప్రజా సౌకర్యాలు, లేదా ఇతర?' : 'What type of problem? Roads, streetlights, water supply, drainage, sanitation, public facilities, or other?',
    5: isTelugu ? 'మీ సమస్యను వివరంగా చెప్పండి.' : 'Please describe your complaint in detail.',
    6: isTelugu ? 'దయచేసి మీ ఫిర్యాదు వివరాలను నిర్ధారించండి.' : 'Please confirm your complaint details.',
    7: isTelugu ? 'ఫిర్యాదు సమర్పించబడుతోంది...' : 'Submitting your complaint...',
  };

  const LABELS = {
    1: isTelugu ? 'మీ పేరు:' : 'Your Name:',
    2: isTelugu ? 'మొబైల్ సంఖ్య:' : 'Phone Number:',
    3: isTelugu ? 'గ్రామం / ప్రాంతం:' : 'Village / Area:',
    4: isTelugu ? 'సమస్య వర్గం:' : 'Complaint Category:',
    5: isTelugu ? 'వివరణ:' : 'Description:',
    6: isTelugu ? 'నిర్ధారణ:' : 'Confirmation:',
  };

  const categories = [
    { en: 'Roads',             te: 'రోడ్లు',              icon: '🛣️' },
    { en: 'Streetlights',      te: 'వీధి దీపాలు',          icon: '💡' },
    { en: 'Water Supply',      te: 'నీటి సరఫరా',           icon: '🚰' },
    { en: 'Drainage',          te: 'మురుగు కాలువలు',       icon: '🗑️' },
    { en: 'Sanitation',        te: 'పారిశుధ్యం',           icon: '🧹' },
    { en: 'Public Facilities', te: 'ప్రజా సౌకర్యాలు',      icon: '🏫' },
    { en: 'Other',             te: 'ఇతర సమస్యలు',          icon: '❓' },
  ];

  const stepColors = ['#2563EB', '#10B981', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
  const stepIcons  = ['👤', '📞', '📍', '📋', '✍️', '🔍', '🚀'];

  // ─── Logging ─────────────────────────────────────────────────────────────
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
    fetch('/api/client-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, level: 'INFO' }),
    }).catch(() => {});
  };

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem('sachivalayam_voice_draft', JSON.stringify(formData));
  }, [formData]);

  // Online/offline handler
  useEffect(() => {
    const goOnline  = () => { setIsOffline(false); addLog('Device online.'); };
    const goOffline = () => { setIsOffline(true);  stopListening(); addLog('Device offline.'); };
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // Recording timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isListening]);

  // Geolocation
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      ()  => setCoords({ latitude: 14.6819, longitude: 77.6006 }),
      { enableHighAccuracy: true }
    );
  }, []);

  // ─── Startup diagnostic ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      addLog('Running startup diagnostics...');
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        setMicStatus('no-browser');
        addLog('Browser does not support SpeechRecognition API');
        return;
      }
      if (!navigator.onLine) { setMicStatus('ready'); setIsOffline(true); return; }
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach(t => t.stop());
        setMicStatus('ready');
        addLog('Microphone permission granted. SpeechRecognition ready.');
      } catch {
        setMicStatus('no-permission');
        addLog('Microphone permission denied.');
      }
    })();
  }, []);

  // ─── Volume visualiser via AnalyserNode ─────────────────────────────────
  const startVolumeMonitor = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(100, Math.round(avg * 2)));
        volumeAnimRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* silent */ }
  };

  const stopVolumeMonitor = () => {
    cancelAnimationFrame(volumeAnimRef.current);
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    setVolume(0);
  };

  // ─── Create & wire SpeechRecognition instance ────────────────────────────
  const buildRecognition = (lang) => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return null;

    const rec = new SpeechRec();
    rec.lang              = lang === 'Telugu' ? 'te-IN' : 'en-IN';
    rec.continuous        = true;
    rec.interimResults    = true;
    rec.maxAlternatives   = 1;

    rec.onstart = () => {
      addLog(`SpeechRecognition started [${rec.lang}]`);
      setIsListening(true);
      isListeningRef.current = true;
    };

    rec.onerror = (e) => {
      addLog(`SpeechRecognition error: ${e.error}`);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicStatus('no-permission');
        stopListening();
      } else if (e.error === 'network') {
        setMicStatus('no-internet');
      }
      // For 'no-speech', 'audio-capture' etc we just let onend restart
    };

    rec.onend = () => {
      addLog('SpeechRecognition ended.');
      setInterimText('');
      // Auto-restart unless user deliberately stopped
      if (!userStoppedRef.current && isListeningRef.current) {
        addLog('Auto-restarting recognition...');
        setTimeout(() => {
          try { recognitionRef.current?.start(); } catch { /* already started */ }
        }, 150);
      } else {
        setIsListening(false);
        isListeningRef.current = false;
        stopVolumeMonitor();
      }
    };

    rec.onresult = (event) => {
      let interim = '';
      let newFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (interim) setInterimText(interim);

      if (newFinal.trim()) {
        const fullText = (committedRef.current + ' ' + newFinal).trim();
        committedRef.current = fullText;
        setInterimText('');
        addLog(`Transcript: "${fullText}"`);
        applyTranscript(fullText);
      }
    };

    return rec;
  };

  // ─── Apply transcript to current step field ──────────────────────────────
  const applyTranscript = (text) => {
    const step = currentStepRef.current;
    const cleanText = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();

    // Navigation commands
    const isNext   = ['go next step', 'next step', 'go next', 'తరువాత దశ', 'తదుపరి'].includes(cleanText);
    const isBack   = ['go back', 'వెనుకకు వెళ్ళు'].includes(cleanText);
    const isCancel = ['cancel complaint', 'రద్దు చేయి'].includes(cleanText);
    const isSubmit = ['submit complaint', 'ముందుకు వెళ్ళు', 'yes', 'అవును'].includes(cleanText);

    if (isNext   && step < 6)  { addLog('Command: NEXT');   stopListening(); goNextRef.current?.(); return; }
    if (isBack   && step > 1)  { addLog('Command: BACK');   stopListening(); goPrevRef.current?.(); return; }
    if (isCancel)               { addLog('Command: CANCEL'); stopListening(); onCancel(); return; }
    if (isSubmit && step === 6) { addLog('Command: SUBMIT'); stopListening(); submitComplaintRef.current?.(); return; }

    // Populate field
    setFormData(prev => {
      const u = { ...prev };
      if (step === 1) u.name        = text.trim();
      if (step === 2) u.phone       = textToDigits(text);
      if (step === 3) u.village     = text.trim();
      if (step === 5) u.description = text.trim();
      return u;
    });

    // Category matching
    if (step === 4) {
      const matched = matchCategoryByVoice(text);
      if (matched) {
        addLog(`Category matched: ${matched}`);
        setFormData(prev => ({ ...prev, category: matched }));
      }
    }
  };

  // Stable ref wrappers so onresult can call goNext/goPrev/submit without stale closure
  const goNextRef         = useRef(null);
  const goPrevRef         = useRef(null);
  const submitComplaintRef = useRef(null);

  // ─── Start listening ─────────────────────────────────────────────────────
  const startListening = async () => {
    if (isOffline) return;
    userStoppedRef.current = false;
    committedRef.current   = '';
    setInterimText('');

    // Stop any existing instance first
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }

    const rec = buildRecognition(languageRef.current);
    if (!rec) { setMicStatus('no-browser'); return; }

    recognitionRef.current = rec;
    isListeningRef.current  = true;

    try {
      rec.start();
      await startVolumeMonitor();
    } catch (err) {
      addLog(`Failed to start SpeechRecognition: ${err.message}`);
      setMicStatus('no-permission');
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  // ─── Stop listening ──────────────────────────────────────────────────────
  const stopListening = () => {
    userStoppedRef.current  = true;
    isListeningRef.current  = false;
    setIsListening(false);
    setInterimText('');
    stopVolumeMonitor();
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      synthesisRef.current?.cancel();
    };
  }, []);

  // ─── Speak question then auto-start mic ──────────────────────────────────
  useEffect(() => {
    if (micStatus !== 'ready' || isOffline) return;

    stopListening();
    synthesisRef.current?.cancel();

    let text = QUESTIONS[currentStep];
    if (currentStep === 6) {
      text = isTelugu
        ? `దయచేసి మీ ఫిర్యాదు వివరాలను నిర్ధారించండి. పేరు: ${formData.name}. ఫోన్: ${formData.phone}. గ్రామం: ${formData.village}. వర్గం: ${formData.category}. వివరణ: ${formData.description}. సరైనదేనా?`
        : `Please confirm. Name: ${formData.name}. Phone: ${formData.phone}. Village: ${formData.village}. Category: ${formData.category}. Description: ${formData.description}. Say yes to submit or no to restart.`;
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = isTelugu ? 'te-IN' : 'en-US';
    currentUtterRef.current = utt;

    const afterSpeak = () => {
      currentUtterRef.current = null;
      setTimeout(() => startListening(), 400);
    };

    utt.onend   = afterSpeak;
    utt.onerror = afterSpeak;

    // Safety fallback if speech synthesis hangs
    const fallback = setTimeout(() => {
      synthesisRef.current?.cancel();
      afterSpeak();
    }, 9000);

    synthesisRef.current?.speak(utt);

    return () => {
      clearTimeout(fallback);
      synthesisRef.current?.cancel();
      stopListening();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, micStatus, isOffline]);

  // Reset committedRef on step change
  useEffect(() => {
    committedRef.current = '';
    setInterimText('');
  }, [currentStep]);

  // ─── Controls ───────────────────────────────────────────────────────────
  const handleStartResume = async () => {
    if (isOffline) return;
    if (micStatus === 'no-permission' || micStatus === 'checking') {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach(t => t.stop());
        setMicStatus('ready');
        synthesisRef.current?.cancel();
        setTimeout(() => startListening(), 100);
      } catch {
        setMicStatus('no-permission');
        showToast(isTelugu ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది.' : 'Microphone permission denied.');
      }
      return;
    }
    synthesisRef.current?.cancel();
    startListening();
  };

  const handlePause = () => {
    addLog('Pause clicked');
    stopListening();
  };

  const handleStop = () => {
    addLog('Stop clicked');
    stopListening();
  };

  const handleClear = () => {
    addLog('Clear clicked');
    committedRef.current = '';
    setInterimText('');
    setFormData(prev => {
      const u = { ...prev };
      if (currentStep === 1) u.name        = '';
      if (currentStep === 2) u.phone       = '';
      if (currentStep === 3) u.village     = '';
      if (currentStep === 4) u.category    = '';
      if (currentStep === 5) u.description = '';
      return u;
    });
  };

  const updateFieldManually = (fieldName, val) => {
    setFormData(prev => ({ ...prev, [fieldName]: val }));
  };

  const handleInputChange = (val) => {
    const field = currentStep === 1 ? 'name' : currentStep === 2 ? 'phone' : currentStep === 3 ? 'village' : currentStep === 5 ? 'description' : '';
    if (field) updateFieldManually(field, val);
  };

  // ─── Navigation ─────────────────────────────────────────────────────────
  const goNext = () => {
    if (currentStep === 1 && !formData.name.trim())                              { showToast(isTelugu ? 'దయచేసి మీ పేరు చెప్పండి' : 'Please say or type your name'); return; }
    if (currentStep === 2 && (!formData.phone.trim() || formData.phone.length < 10)) { showToast(isTelugu ? 'పది అంకెల మొబైల్ సంఖ్య అవసరం' : 'Please enter a valid 10-digit phone number'); return; }
    if (currentStep === 3 && !formData.village.trim())                           { showToast(isTelugu ? 'దయచేసి మీ గ్రామం చెప్పండి' : 'Please say or type your village'); return; }
    if (currentStep === 4 && !formData.category)                                 { showToast(isTelugu ? 'వర్గాన్ని ఎంచుకోండి' : 'Please select a category'); return; }
    if (currentStep === 5 && !formData.description.trim())                       { showToast(isTelugu ? 'సమస్య వివరణ అవసరం' : 'Please describe your complaint'); return; }
    stopListening();
    if (currentStep < 6) setCurrentStep(s => s + 1);
  };
  goNextRef.current = goNext;

  const goPrev = () => {
    stopListening();
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };
  goPrevRef.current = goPrev;

  // ─── Submit complaint ────────────────────────────────────────────────────
  const submitComplaint = async () => {
    setIsSubmitting(true);
    synthesisRef.current?.cancel();
    addLog('Submitting complaint...');

    try {
      let complaint_audio_url = '';
      if (audioBlob) {
        const uploadData = new FormData();
        uploadData.append('audio', audioBlob, 'complaint-recording.wav');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          complaint_audio_url = uploadResult.complaint_audio_url || '';
        }
      }

      const payload = {
        resident_name: formData.name,
        resident_phone: formData.phone,
        village_area: formData.village,
        complaint_category: formData.category,
        complaint_description_text: formData.description,
        photo_url: '',
        complaint_audio_url,
        latitude: coords.latitude,
        longitude: coords.longitude,
        language,
      };

      const res  = await fetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        addLog('Submission successful!');
        localStorage.removeItem('sachivalayam_voice_draft');
        if (onSubmissionComplete) onSubmissionComplete(data.complaint.id);
        else if (onCompleteStep)  onCompleteStep(formData, audioBlob);
      } else {
        showToast(isTelugu ? 'ఫిర్యాదు సమర్పణ విఫలమైంది.' : 'Submission failed. Try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast(isTelugu ? 'ఫిర్యాదు సమర్పణ విఫలమైంది.' : 'Submission failed. Try again.');
      addLog(`Submit error: ${err.message}`);
    }
  };
  submitComplaintRef.current = submitComplaint;

  // ─── Derived display values ──────────────────────────────────────────────
  const currentAnswer =
    currentStep === 1 ? formData.name :
    currentStep === 2 ? formData.phone :
    currentStep === 3 ? formData.village :
    currentStep === 4 ? (formData.category ? (isTelugu ? categories.find(c => c.en === formData.category)?.te : formData.category) : '') :
    currentStep === 5 ? formData.description : '';

  const getStatusText = () => {
    if (isOffline)                    return isTelugu ? 'ఆఫ్‌లైన్'        : 'Offline';
    if (isSubmitting)                 return isTelugu ? 'సమర్పిస్తోంది...' : 'Submitting...';
    if (isListening)                  return isTelugu ? '🔴 వింటోంది'      : '🔴 Listening';
    if (window.speechSynthesis.speaking) return isTelugu ? 'మాట్లాడుతోంది' : 'Speaking';
    return isTelugu ? 'సిద్ధంగా ఉంది' : 'Ready';
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Live transcript to show (interim or committed)
  const liveDisplay = interimText || committedRef.current || currentAnswer;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="va-root">

      {/* ── Top Header ── */}
      <div className="va-topbar">
        <div className="va-topbar-left">
          <div className="va-avatar">{user?.name?.[0]?.toUpperCase() || '🎙️'}</div>
          <div>
            <div className="va-topbar-title">{isTelugu ? 'వాయిస్ రిజిస్ట్రేషన్' : 'Voice Registration'}</div>
            <div className="va-topbar-sub">{isTelugu ? 'గ్రామ సహాయక వ్యవస్థ' : 'Village Assistant System'} • {isTelugu ? 'దశ' : 'Step'} {currentStep}/6</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`va-status-pill ${isOffline ? 'va-status-offline' : isListening ? 'va-status-listening' : window.speechSynthesis.speaking ? 'va-status-speaking' : 'va-status-ready'}`}>
            {getStatusText()}
          </span>
          <button
            className="btn btn-secondary"
            style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
            onClick={() => { stopListening(); synthesisRef.current?.cancel(); changeLanguage?.(isTelugu ? 'English' : 'Telugu'); }}
          >
            🌐 {isTelugu ? 'English' : 'తెలుగు'}
          </button>
          <button className="va-cancel-btn" onClick={onCancel}>✕</button>
        </div>
      </div>

      {/* ── Offline Banner ── */}
      {isOffline && (
        <div className="va-offline-banner">
          <span>📶</span>
          <div>
            <strong>{isTelugu ? 'ఇంటర్నెట్ కనెక్షన్ లేదు' : 'No Internet Connection'}</strong>
            <div style={{ fontSize: '11.5px', marginTop: '2px', opacity: 0.9 }}>
              {isTelugu ? 'వాయిస్ గుర్తింపు నిలిపివేయబడింది.' : 'Speech recognition requires internet. Please fill out the form manually.'}
            </div>
          </div>
        </div>
      )}

      {/* ── Step Rail ── */}
      <div className="va-step-rail">
        {[1,2,3,4,5,6].map(s => (
          <div key={s} className="va-step-node" style={{ '--sc': stepColors[s-1] }}>
            <div className={`va-step-circle ${currentStep === s ? 'active' : currentStep > s ? 'done' : ''}`}>
              {currentStep > s ? '✓' : stepIcons[s-1]}
            </div>
            {s < 6 && <div className={`va-step-line ${currentStep > s ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      {/* ── Question Card ── */}
      <div className="va-question-card" style={{ borderColor: stepColors[currentStep-1] }}>
        <div className="va-q-number" style={{ background: stepColors[currentStep-1] }}>
          {isTelugu ? 'దశ' : 'Step'}{currentStep}
        </div>
        <p className="va-question-text">{QUESTIONS[currentStep]}</p>
        <button
          className="va-replay-btn"
          disabled={isOffline}
          onClick={() => {
            addLog('Replay clicked');
            stopListening();
            synthesisRef.current?.cancel();
            const utt = new SpeechSynthesisUtterance(QUESTIONS[currentStep]);
            utt.lang  = isTelugu ? 'te-IN' : 'en-US';
            utt.onend   = () => setTimeout(() => startListening(), 400);
            utt.onerror = () => setTimeout(() => startListening(), 400);
            synthesisRef.current?.speak(utt);
          }}
        >
          🔊 {isTelugu ? 'మళ్ళీ వినండి' : 'Replay Question'}
        </button>
      </div>

      {/* ── Mic Controls & Waveform (Steps 1-5) ── */}
      {currentStep <= 5 && !isOffline && (
        <div className="va-mic-area" style={{ padding: '8px 0' }}>

          {isListening && (
            <div className="va-timer-badge">⏱️ {formatTime(recordingSeconds)}</div>
          )}

          {/* Waveform visualiser */}
          <div className="va-waveform-container">
            {[...Array(9)].map((_, i) => {
              const factor = [0.4, 0.6, 0.9, 1.2, 1.5, 1.2, 0.9, 0.6, 0.4][i];
              const height = isListening ? Math.max(8, Math.min(48, 8 + volume * factor * 0.4)) : 8;
              return (
                <div
                  key={i}
                  className={`va-waveform-bar ${isListening ? 'active' : ''}`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>

          {/* Live interim transcript bubble */}
          {isListening && interimText && (
            <div style={{
              margin: '10px auto',
              maxWidth: '90%',
              background: 'rgba(37,99,235,0.08)',
              border: '1px dashed #2563EB',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#1e40af',
              fontStyle: 'italic',
              textAlign: 'center',
            }}>
              🎙️ {interimText}
            </div>
          )}

          {/* Controls */}
          <div className="va-controls-strip">
            <button className="va-control-btn" disabled={isListening}  onClick={handleStartResume}>
              ⏺️ {isTelugu ? 'ప్రారంభించు' : 'Start'}
            </button>
            <button className="va-control-btn" disabled={!isListening} onClick={handlePause}>
              ⏸️ {isTelugu ? 'తాత్కాలికంగా ఆపు' : 'Pause'}
            </button>
            <button className="va-control-btn" disabled={!isListening} onClick={handleStop}>
              ⏹️ {isTelugu ? 'పూర్తిచేయి' : 'Stop'}
            </button>
          </div>
        </div>
      )}

      {/* ── Category Cards (Step 4) ── */}
      {currentStep === 4 && (
        <div className="va-cat-grid" style={{ marginBottom: '20px' }}>
          {categories.map(c => (
            <button
              key={c.en}
              className={`va-cat-btn ${formData.category === c.en ? 'selected' : ''}`}
              onClick={() => { addLog(`Category selected: ${c.en}`); setFormData(p => ({ ...p, category: c.en })); }}
            >
              <span className="va-cat-icon">{c.icon}</span>
              <span className="va-cat-label">{isTelugu ? c.te : c.en}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Answer Box (Steps 1-5) ── */}
      {currentStep <= 5 && (
        <div className={`va-answer-box ${currentAnswer ? 'has-answer' : ''} ${isListening ? 'listening' : ''}`}>
          <div className="va-answer-label">{LABELS[currentStep]}</div>
          {currentStep !== 4 ? (
            <input
              type="text"
              className="form-control"
              style={{ background: 'transparent', border: 'none', fontSize: '20px', fontWeight: '800', width: '100%', color: 'var(--text-primary)', outline: 'none', padding: '0' }}
              value={liveDisplay}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => { if (isListening) handlePause(); }}
              list={currentStep === 3 ? 'ap-villages-list' : undefined}
              placeholder={isListening
                ? (isTelugu ? '🎙️ మాట్లాడండి...' : '🎙️ Speak now...')
                : (isTelugu ? 'ఇక్కడ టైప్ చేయవచ్చు...' : 'Type here to edit...')}
            />
          ) : (
            <div className="va-answer-text">{currentAnswer || (isTelugu ? 'వర్గాన్ని ఎంచుకోండి...' : 'Select a category above...')}</div>
          )}
          {currentAnswer && !isListening && (
            <button className="va-redo-btn" onClick={handleClear}>
              🔄 {isTelugu ? 'క్లియర్ చేయి' : 'Clear Input'}
            </button>
          )}
        </div>
      )}

      {/* ── Summary & Confirm (Step 6) ── */}
      {currentStep === 6 && (
        <div>
          <div className="va-summary-box">
            <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '14px' }}>
              📋 {isTelugu ? 'సమర్పించబోయే ఫిర్యాదు వివరాలు:' : 'Submitted Complaint Details:'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
              <div className="va-summary-item"><div className="va-summary-title">{LABELS[1]}</div><div className="va-summary-value">{formData.name}</div></div>
              <div className="va-summary-item"><div className="va-summary-title">{LABELS[2]}</div><div className="va-summary-value">{formData.phone}</div></div>
              <div className="va-summary-item" style={{ gridColumn: 'span 2' }}><div className="va-summary-title">{LABELS[3]}</div><div className="va-summary-value">{formData.village}</div></div>
              <div className="va-summary-item" style={{ gridColumn: 'span 2' }}><div className="va-summary-title">{LABELS[4]}</div><div className="va-summary-value">{formData.category}</div></div>
              <div className="va-summary-item" style={{ gridColumn: 'span 2' }}><div className="va-summary-title">{LABELS[5]}</div><div className="va-summary-value" style={{ wordBreak: 'break-word', lineHeight: '1.4' }}>{formData.description}</div></div>
            </div>
          </div>
          {!isOffline && (
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px dashed #22C55E', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#16A34A', fontWeight: '700', marginBottom: '20px' }}>
              🗣️ {isTelugu ? 'సమర్పించడానికి "అవును" అని చెప్పండి లేదా సరిదిద్దడానికి "కాదు" అని చెప్పండి.' : 'Say "yes" to confirm and submit, or "no" to restart.'}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '12px' }} onClick={() => setCurrentStep(1)}>
              ✏️ {isTelugu ? 'సవరించు' : 'Edit Details'}
            </button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#10B981' }} disabled={isSubmitting} onClick={submitComplaint}>
              🚀 {isSubmitting ? (isTelugu ? 'సమర్పిస్తున్నాము...' : 'Submitting...') : (isTelugu ? 'సమర్పించండి' : 'Confirm & Submit')}
            </button>
          </div>
        </div>
      )}

      {/* ── Browser unsupported ── */}
      {micStatus === 'no-browser' && (
        <div className="va-alert va-alert-error" style={{ margin: '16px 0' }}>
          🚫 <strong>{isTelugu ? 'బ్రౌజర్ మద్దతు లేదు' : 'Unsupported Browser'}</strong>
          <p style={{ fontSize: '12.5px', marginTop: '4px' }}>
            {isTelugu ? 'వాయిస్ అసిస్టెంట్ కేవలం Chrome లేదా Edge లో పనిచేస్తుంది.' : 'Voice recognition requires Chrome or Edge. Please fill out the manual form below.'}
          </p>
        </div>
      )}

      {/* ── No mic permission ── */}
      {micStatus === 'no-permission' && (
        <div className="va-alert va-alert-warning" style={{ margin: '16px 0', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', padding: '16px', borderRadius: '12px', textAlign: 'left' }}>
          ⚠️ <strong>{isTelugu ? 'మైక్రోఫోన్ అనుమతి అవసరం' : 'Microphone Permission Required'}</strong>
          <p style={{ fontSize: '12.5px', marginTop: '6px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {isTelugu ? 'బ్రౌజర్ సెట్టింగ్స్‌లో మైక్రోఫోన్‌ని అనుమతించి దిగువ బటన్ నొక్కండి.' : 'Allow microphone in your browser settings, then click below.'}
          </p>
          <button className="va-btn btn btn-sm btn-primary" style={{ marginTop: '10px', padding: '6px 12px', fontSize: '12.5px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }} onClick={handleStartResume}>
            🔄 {isTelugu ? 'మళ్ళీ ప్రయత్నించండి' : 'Retry Access'}
          </button>
        </div>
      )}

      {/* ── Network error ── */}
      {micStatus === 'no-internet' && (
        <div className="va-alert va-alert-warning" style={{ margin: '16px 0', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', padding: '16px', borderRadius: '12px', textAlign: 'left' }}>
          ⚠️ <strong>{isTelugu ? 'వాయిస్ గుర్తింపు లోపం' : 'Speech Recognition Network Error'}</strong>
          <p style={{ fontSize: '12.5px', marginTop: '6px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {isTelugu ? 'Chrome క్లౌడ్ స్పీచ్ సేవతో అనుసంధానం కాలేదు. VPN ఆపి మళ్ళీ ప్రయత్నించండి.' : 'Chrome could not connect to speech servers. Disable VPN and retry.'}
          </p>
          <button className="va-btn btn btn-sm btn-primary" style={{ marginTop: '10px', padding: '6px 12px', fontSize: '12.5px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }} onClick={handleStartResume}>
            🔄 {isTelugu ? 'మళ్ళీ ప్రయత్నించండి' : 'Retry Connection'}
          </button>
        </div>
      )}

      {/* ── Navigation (Steps 1-5) ── */}
      {currentStep <= 5 && (
        <div className="va-nav">
          {currentStep > 1 && (
            <button className="va-btn va-btn-back" onClick={goPrev}>← {isTelugu ? 'వెనుకకు' : 'Back'}</button>
          )}
          <button className="va-btn va-btn-next" style={{ background: stepColors[currentStep-1] }} onClick={goNext}>
            {isTelugu ? 'తదుపరి →' : 'Next →'}
          </button>
        </div>
      )}

      {/* ── Manual Fallback Form ── */}
      <div className="va-manual-form" style={{ marginTop: '36px', borderTop: '2px dashed var(--border-color)', paddingTop: '28px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          ⌨️ {isTelugu ? 'లేదా సమాచారాన్ని ఇక్కడ టైప్ చేయండి' : 'Manual Form Fallback'}
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {isTelugu ? 'వాయిస్ అసిస్టెంట్ ఉపయోగించడం ఇష్టం లేకుంటే క్రింది వివరాలను పూరించండి:' : 'If you prefer not to use voice, complete the form manually:'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>👤 {isTelugu ? 'మీ పేరు' : 'Your Name'}</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => updateFieldManually('name', e.target.value)} onFocus={() => { if (isListening) handlePause(); }} placeholder={isTelugu ? 'మీ పేరు టైప్ చేయండి' : 'Enter your name'} style={{ fontSize: '14px', padding: '12px' }} />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>📞 {isTelugu ? 'మొబైల్ సంఖ్య' : 'Phone Number'}</label>
            <input type="text" className="form-control" value={formData.phone} onChange={e => updateFieldManually('phone', e.target.value)} onFocus={() => { if (isListening) handlePause(); }} placeholder={isTelugu ? 'పది అంకెల మొబైల్ సంఖ్య' : 'Enter 10-digit phone number'} style={{ fontSize: '14px', padding: '12px' }} />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>📍 {isTelugu ? 'గ్రామం / ప్రాంతం' : 'Village / Area'}</label>
            <input type="text" className="form-control" list="ap-villages-list" value={formData.village} onChange={e => updateFieldManually('village', e.target.value)} onFocus={() => { if (isListening) handlePause(); }} placeholder={isTelugu ? 'మీ గ్రామం టైప్ చేయండి' : 'Enter your village or area'} style={{ fontSize: '14px', padding: '12px' }} />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>📋 {isTelugu ? 'సమస్య వర్గం' : 'Complaint Category'}</label>
            <select className="form-control" value={formData.category} onChange={e => updateFieldManually('category', e.target.value)} style={{ fontSize: '14px', padding: '12px', height: '48px', cursor: 'pointer' }}>
              <option value="">{isTelugu ? '-- వర్గాన్ని ఎంచుకోండి --' : '-- Select Category --'}</option>
              {categories.map(c => <option key={c.en} value={c.en}>{isTelugu ? c.te : c.en}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>✍️ {isTelugu ? 'సమస్య వివరణ' : 'Complaint Description'}</label>
            <textarea className="form-control" rows="4" value={formData.description} onChange={e => updateFieldManually('description', e.target.value)} onFocus={() => { if (isListening) handlePause(); }} placeholder={isTelugu ? 'సమస్యను వివరంగా ఇక్కడ టైప్ చేయండి...' : 'Describe your problem in detail here...'} style={{ fontSize: '14px', padding: '12px', resize: 'vertical' }} />
          </div>

          <button
            className="btn btn-primary"
            style={{ padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '15px', marginTop: '10px', background: '#10B981' }}
            onClick={(e) => {
              e.preventDefault();
              if (!formData.name.trim())                              return showToast(isTelugu ? 'పేరు టైప్ చేయండి' : 'Please enter your name');
              if (!formData.phone.trim() || formData.phone.length < 10) return showToast(isTelugu ? 'మొబైల్ సంఖ్య టైప్ చేయండి' : 'Please enter 10-digit phone number');
              if (!formData.village.trim())                           return showToast(isTelugu ? 'గ్రామం టైప్ చేయండి' : 'Please enter your village');
              if (!formData.category)                                 return showToast(isTelugu ? 'వర్గాన్ని ఎంచుకోండి' : 'Please select a category');
              if (!formData.description.trim())                       return showToast(isTelugu ? 'వివరణ టైప్ చేయండి' : 'Please describe your complaint');
              submitComplaint();
            }}
          >
            🚀 {isTelugu ? 'వివరాలను సమర్పించండి' : 'Submit Details Manually'}
          </button>
        </div>
      </div>

      {/* AP Villages datalist */}
      <datalist id="ap-villages-list">
        {AP_VILLAGES.map(v => <option key={v.en} value={isTelugu ? v.te : v.en} />)}
      </datalist>

      {/* ── Debug Console ── */}
      <div className="va-debug-panel">
        <details>
          <summary>⚙️ Debug Console &amp; Diagnostics</summary>
          <div className="va-debug-content">
            <div className="va-debug-metric">
              <span>Mic Status: <strong>{micStatus}</strong></span>
              <span>Volume: <strong>{volume}%</strong></span>
              <span>Listening: <strong>{isListening ? 'YES' : 'NO'}</strong></span>
            </div>
            <div className="va-debug-logs">
              {logs.length === 0
                ? <div className="va-debug-log-empty">No logs yet. Speak or tap controls.</div>
                : logs.map((log, i) => <div key={i} className="va-debug-log-line">{log}</div>)}
            </div>
          </div>
        </details>
      </div>

    </div>
  );
}
