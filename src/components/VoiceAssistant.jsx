import React, { useState, useEffect, useRef } from 'react';

const textToDigits = (text) => {
  const wordsMap = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'సున్నా': '0', 'ఒకటి': '1', 'రెండు': '2', 'మూడు': '3', 'నాలుగు': '4',
    'ఐదు': '5', 'ఆరు': '6', 'ఏడు': '7', 'ఎనిమిది': '8', 'తొమ్మిది': '9',
    'ఒక': '1', 'రెండు': '2', 'మూడు': '3', 'నాలుగు': '4', 'ఐదు': '5', 'ఆరు': '6', 'ఏడు': '7', 'ఎనిమిది': '8', 'తొమ్మిది': '9'
  };

  let cleanText = text.toLowerCase().trim();
  for (const [word, digit] of Object.entries(wordsMap)) {
    const regex = new RegExp(word, 'g');
    cleanText = cleanText.replace(regex, digit);
  }
  return cleanText.replace(/\D/g, '');
};

const matchCategoryByVoice = (speechText) => {
  const text = speechText.toLowerCase().trim();
  const mappings = {
    'Roads': ['road', 'roads', 'path', 'pothole', 'potholes', 'street', 'highway', 'రహదారులు', 'రోడ్లు', 'రోడ్డు', 'గుంతలు'],
    'Streetlights': ['light', 'lights', 'streetlight', 'streetlights', 'lamp', 'lamps', 'electricity', 'power', 'dark', 'వీధి దీపాలు', 'లైట్లు', 'కరెంట్', 'దీపం', 'చీకటి'],
    'Water Supply': ['water', 'drinking water', 'leak', 'tap', 'supply', 'pipe', 'leakage', 'నీరు', 'నీటి సరఫరా', 'మంచినీరు', 'పైప్', 'లీకేజీ', 'ధారా'],
    'Drainage': ['drain', 'drainage', 'sewer', 'gutter', 'clog', 'dirty water', 'మురుగు', 'మురుగు కాలువలు', 'కాలువ', 'డ్రైనేజీ', 'డ్రైనేజ్', 'చెత్త నీరు'],
    'Sanitation': ['garbage', 'waste', 'trash', 'dustbin', 'cleaning', 'sanitation', 'cleanliness', 'sweep', 'rubbish', 'చెత్త', 'పారిశుధ్యం', 'శుభ్రం', 'కలెక్ట్', 'స్వచ్ఛత', 'డస్ట్ బిన్'],
    'Public Facilities': ['public', 'school', 'park', 'community', 'library', 'building', 'ground', 'infrastructure', 'ప్రజా సౌకర్యాలు', 'బడి', 'పాఠశాల', 'పార్క్', 'ప్రభుత్వ', 'భవనం'],
    'Other': ['other', 'general', 'complaint', 'government', 'service', 'ఇతర', 'ఇతర సమస్యలు', 'సాధారణ', 'సమస్య']
  };

  for (const [category, keywords] of Object.entries(mappings)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  return null;
};

export default function VoiceAssistant({ language, user, onCompleteStep, onSubmissionComplete, onCancel, showToast, changeLanguage }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [micStatus, setMicStatus] = useState('checking'); // 'checking'|'ready'|'no-browser'|'no-internet'|'no-permission'
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Geolocation Coordinates
  const [coords, setCoords] = useState({ latitude: 14.6819, longitude: 77.6006 }); // default Anantapur

  // All fields prefilled from logged-in user if available, otherwise empty
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('sachivalayam_voice_draft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      name: user?.name || '',
      phone: user?.phone || '',
      village: user?.village || '',
      category: '',
      description: ''
    };
  });

  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);

  // Smart Speech Recognition Accumulation across pauses/restarts
  const [committedText, setCommittedText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Live Audio Analyzer Diagnostics
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const [volume, setVolume] = useState(0);
  const [isAudioQuiet, setIsAudioQuiet] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resumeAudioContext = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(e => console.error("Failed to resume AudioContext:", e));
    }
  };

  // Refs — always-fresh values inside async callbacks
  const recognitionRef    = useRef(null);
  const synthesisRef      = useRef(window.speechSynthesis);
  const currentUtterRef   = useRef(null);
  const isListeningRef    = useRef(false);
  const userStoppedRef    = useRef(false);   // true when user tapped ⏹ to stop
  const currentStepRef    = useRef(1);
  const formDataRef       = useRef(formData);
  const committedTextRef  = useRef('');

  // Keep refs in sync
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { committedTextRef.current = committedText; }, [committedText]);

  const isTelugu = language === 'Telugu';

  const QUESTIONS = {
    1: isTelugu ? 'మీ పేరు ఏమిటి?' : 'What is your name?',
    2: isTelugu ? 'మీ పది అంకెల మొబైల్ సంఖ్య ఏమిటి?' : 'What is your 10-digit mobile number?',
    3: isTelugu ? 'మీరు ఏ గ్రామం లేదా ప్రాంతం నుండి వచ్చారు?' : 'Which village or area are you from?',
    4: isTelugu ? 'సమస్య వర్గం ఏమిటి? రోడ్లు, వీధిదీపాలు, నీటి సరఫరా, మురుగు, పారిశుధ్యం, ప్రజా సౌకర్యాలు, లేదా ఇతర?' : 'What type of problem? Roads, streetlights, water supply, drainage, sanitation, public facilities, or other?',
    5: isTelugu ? 'మీ సమస్యను వివరంగా చెప్పండి.' : 'Please describe your complaint in detail.',
    6: isTelugu ? 'దయచేసి మీ ఫిర్యాదు వివరాలను నిర్ధారించండి.' : 'Please confirm your complaint details.',
    7: isTelugu ? 'ఫిర్యాదు సమర్పించబడుతోంది...' : 'Submitting your complaint...'
  };

  const LABELS = {
    1: isTelugu ? 'మీ పేరు:' : 'Your Name:',
    2: isTelugu ? 'మొబైల్ సంఖ్య:' : 'Phone Number:',
    3: isTelugu ? 'గ్రామం / ప్రాంతం:' : 'Village / Area:',
    4: isTelugu ? 'సమస్య వర్గం:' : 'Complaint Category:',
    5: isTelugu ? 'వివరణ:' : 'Description:',
    6: isTelugu ? 'నిర్ధారణ:' : 'Confirmation:'
  };

  const categories = [
    { en: 'Roads',            te: 'రోడ్లు',                icon: '🛣️' },
    { en: 'Streetlights',     te: 'వీధి దీపాలు',           icon: '💡' },
    { en: 'Water Supply',     te: 'నీటి సరఫరా',            icon: '🚰' },
    { en: 'Drainage',         te: 'మురుగు కాలువలు',        icon: '🗑️' },
    { en: 'Sanitation',       te: 'పారిశుధ్యం',            icon: '🧹' },
    { en: 'Public Facilities',te: 'ప్రజా సౌకర్యాలు',       icon: '🏫' },
    { en: 'Other',            te: 'ఇతర సమస్యలు',           icon: '❓' },
  ];

  const stepColors = ['#2563EB', '#10B981', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
  const stepIcons  = ['👤', '📞', '📍', '📋', '✍️', '🔍', '🚀'];

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Auto-save form data draft to localStorage
  useEffect(() => {
    localStorage.setItem('sachivalayam_voice_draft', JSON.stringify(formData));
  }, [formData]);

  // Offline handler setup
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addLog("Device went online. Speech recognition enabled.");
    };
    const handleOffline = () => {
      setIsOffline(true);
      setIsListening(false);
      isListeningRef.current = false;
      addLog("Device went offline. Speech recognition disabled.");
      try { recognitionRef.current?.stop(); } catch { }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer interval for active listening
  useEffect(() => {
    let timer = null;
    if (isListening) {
      timer = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isListening]);

  // Fetch coordinates on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => {
          // fallback to Anantapur
          setCoords({ latitude: 14.6819, longitude: 77.6006 });
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // ─── Diagnostic: check browser, internet, mic permission on mount ────────────
  useEffect(() => {
    (async () => {
      addLog("Running startup diagnostics...");
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { 
        setMicStatus('no-browser'); 
        addLog("Diagnostic Failed: Browser does not support Web Speech API");
        return; 
      }
      if (!navigator.onLine) { 
        setMicStatus('ready'); // will allow starting once online
        setIsOffline(true);
        addLog("Offline detected on mount");
        return; 
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        s.getTracks().forEach(t => t.stop());
        setMicStatus('ready');
        addLog("Diagnostic Passed: Microphone permission granted");
      } catch (err) {
        setMicStatus('no-permission');
        addLog(`Diagnostic Failed: Microphone permission denied - ${err.message}`);
      }
    })();
  }, []);

  // ─── Mic stream setup (for recording & live audio volume analysis) ────────
  useEffect(() => {
    let audioCtx = null;
    let analyser = null;
    let animationFrameId = null;

    (async () => {
      try {
        addLog("Requesting mic stream for analyser & recording...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        audioStreamRef.current = stream;
        addLog("Mic stream established.");

        // Track Health Monitor & Disconnect Recovery
        stream.getTracks().forEach(track => {
          track.onended = () => {
            addLog("Microphone track ended unexpectedly. Attempting recovery...");
            handleStartResume();
          };
        });

        // Initialize MediaRecorder (for Step 5 - description)
        const rec = new MediaRecorder(stream);
        rec.ondataavailable = e => { 
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
            addLog(`Recorded audio chunk: ${e.data.size} bytes`);
          }
        };
        rec.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setAudioBlob(blob);
          addLog(`WAV Recording finalized: ${blob.size} bytes`);
          audioChunksRef.current = [];
        };
        setMediaRecorder(rec);

        // Web Audio Analyser setup
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);

          const bufferLength = analyser.fftSize;
          const dataArray = new Uint8Array(bufferLength);
          let lastSoundTime = Date.now();

          const checkVolume = () => {
            if (!isListeningRef.current) {
              setVolume(0);
              animationFrameId = requestAnimationFrame(checkVolume);
              return;
            }

            if (audioCtx.state === 'suspended') {
              audioCtx.resume().catch(() => {});
            }

            analyser.getByteTimeDomainData(dataArray);
            let maxDeviation = 0;
            for (let i = 0; i < bufferLength; i++) {
              const deviation = Math.abs(dataArray[i] - 128);
              if (deviation > maxDeviation) maxDeviation = deviation;
            }

            const currentVol = Math.round((maxDeviation / 128) * 100);
            setVolume(currentVol);

            const now = Date.now();
            if (currentVol > 3) {
              lastSoundTime = now;
              setIsAudioQuiet(false);
            } else if (now - lastSoundTime > 4000) {
              setIsAudioQuiet(true);
            }

            animationFrameId = requestAnimationFrame(checkVolume);
          };

          checkVolume();
        }
      } catch (err) {
        addLog(`Microphone Stream Error: ${err.name} - ${err.message}`);
        console.error("Mic Stream Setup Error:", err);
      }
    })();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioCtx) audioCtx.close();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // ─── Speech Recognition setup (re-runs when step, language, or micStatus changes) ───
  useEffect(() => {
    let isCurrent = true;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || micStatus !== 'ready' || isOffline) return;

    addLog(`Initializing SpeechRecognition [Lang: ${isTelugu ? 'te-IN' : 'en-US'}]`);
    const rec = new SR();
    
    rec.continuous      = true;   
    rec.interimResults  = true;   
    rec.maxAlternatives = 1;
    rec.lang = isTelugu ? 'te-IN' : 'en-US';

    rec.onstart = () => {
      if (!isCurrent) return;
      isListeningRef.current = true;
      setIsListening(true);
      addLog("SpeechRecognition started listening");
    };

    rec.onresult = (event) => {
      if (!isCurrent) return;
      let sessionText = '';
      for (let i = 0; i < event.results.length; i++) {
        sessionText += (i > 0 ? ' ' : '') + event.results[i][0].transcript;
      }
      
      const step = currentStepRef.current;
      const baseText = committedTextRef.current || '';
      const combined = (baseText + " " + sessionText).replace(/\s+/g, ' ').trim();
      
      if (!combined) return;

      addLog(`Heard (sessionText: "${sessionText.trim()}", combined: "${combined}")`);

      // ── Automatic Language Detection ──
      // Checks for Telugu Unicode characters in the transcript to toggle language dynamically
      const hasTelugu = /[\u0C00-\u0C7F]/.test(sessionText);
      if (hasTelugu && !isTelugu && changeLanguage) {
        addLog("Automatic Language Detection: Switched to Telugu");
        changeLanguage('Telugu');
        return;
      } else if (!hasTelugu && /[a-zA-Z]/.test(sessionText) && isTelugu && changeLanguage) {
        addLog("Automatic Language Detection: Switched to English");
        changeLanguage('English');
        return;
      }

      // ── Strict command matching on the current segment text ──
      const lastResultIndex = event.resultIndex;
      const currentSegment = event.results[lastResultIndex] ? event.results[lastResultIndex][0].transcript : '';
      const cleanSegment = currentSegment.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

      const isNextCmd    = ['go next step', 'next step', 'go next', 'తరువాత దశ', 'తదుపరి'].includes(cleanSegment);
      const isBackCmd    = ['go back', 'వెనుకకు వెళ్ళు'].includes(cleanSegment);
      const isCancelCmd  = ['cancel complaint', 'రద్దు చేయి'].includes(cleanSegment);
      const isProceedCmd = ['submit complaint', 'ముందుకు వెళ్ళు'].includes(cleanSegment);

      if (isNextCmd && step < 6) { addLog("Command recognized: NEXT"); rec.stop(); goNext(); return; }
      if (isBackCmd && step > 1) { addLog("Command recognized: BACK"); rec.stop(); goPrev(); return; }
      if (isCancelCmd) { addLog("Command recognized: CANCEL"); rec.stop(); onCancel(); return; }
      if (isProceedCmd && step === 6) { addLog("Command recognized: SUBMIT"); rec.stop(); submitComplaint(); return; }

      // Step 6 summary voice confirmations
      if (step === 6) {
        const isYes = ['yes', 'submit', 'correct', 'అవును', 'సమర్పించు'].includes(cleanSegment);
        const isNo = ['no', 'edit', 'change', 'కాదు', 'వద్దు'].includes(cleanSegment);
        if (isYes) {
          addLog("Voice confirmation: YES. Submitting complaint...");
          rec.stop();
          submitComplaint();
          return;
        }
        if (isNo) {
          addLog("Voice confirmation: NO. Returning to step 1...");
          rec.stop();
          setCurrentStep(1);
          return;
        }
      }

      // Content update — real-time display
      setFormData(prev => {
        const u = { ...prev };
        if (step === 1) u.name        = combined;
        if (step === 2) u.phone       = textToDigits(combined);
        if (step === 3) u.village     = combined;
        if (step === 5) u.description = combined;
        return u;
      });

      // Category matching (step 4)
      if (step === 4) {
        const matchedCat = matchCategoryByVoice(combined);
        if (matchedCat) {
          addLog(`Category matched by voice: ${matchedCat}`);
          setFormData(prev => ({ ...prev, category: matchedCat }));
        }
      }
    };

    rec.onerror = (e) => {
      if (!isCurrent) return;
      addLog(`SpeechRecognition error: "${e.error}"`);
      if (e.error !== 'no-speech') {
        isListeningRef.current = false;
        setIsListening(false);
        if (e.error === 'not-allowed') setMicStatus('no-permission');
        if (e.error === 'network')     setMicStatus('no-internet');
      }
    };

    rec.onend = () => {
      if (!isCurrent) return;
      addLog("SpeechRecognition session ended");

      // Auto-commit session text to committedText when the session ends
      const step = currentStepRef.current;
      setFormData(prev => {
        const val = step === 1 ? prev.name :
                    step === 2 ? prev.phone :
                    step === 3 ? prev.village :
                    step === 5 ? prev.description : '';
        setCommittedText(val);
        return prev;
      });

      // Auto-restart if user did not tap STOP
      if (!userStoppedRef.current && micStatus === 'ready' && !isOffline) {
        userStoppedRef.current = false;
        addLog("Attempting auto-restart of SpeechRecognition...");
        setTimeout(() => {
          try { 
            rec.start(); 
            isListeningRef.current = true; 
            setIsListening(true); 
          } catch (err) { 
            isListeningRef.current = false;
            setIsListening(false);
          }
        }, 300);
      } else {
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
    return () => {
      isCurrent = false;
      userStoppedRef.current = true; 
      try { rec.abort(); } catch { }
      addLog("Cleaned up SpeechRecognition instance");
    };
  }, [currentStep, language, micStatus, isOffline]);

  // ─── Speak question then auto-start mic ──────────────────────────────────────
  useEffect(() => {
    if (micStatus !== 'ready' || isOffline) return;
    addLog(`Transitioning to Step ${currentStep}. Speaking question...`);
    userStoppedRef.current = true; 
    setIsListening(false);
    isListeningRef.current = false;
    setCommittedText(''); 

    synthesisRef.current?.cancel();
    
    let text = QUESTIONS[currentStep];
    if (currentStep === 6) {
      // Build summary text to read back dynamically
      text = isTelugu 
        ? `దయచేసి మీ ఫిర్యాదు వివరాలను నిర్ధారించండి. పేరు: ${formData.name}. ఫోన్ నంబర్: ${formData.phone}. గ్రామం: ${formData.village}. వర్గం: ${formData.category === 'Roads' ? 'రోడ్లు' : formData.category === 'Streetlights' ? 'వీధి దీపాలు' : formData.category === 'Water Supply' ? 'నీటి సరఫరా' : formData.category === 'Drainage' ? 'మురుగు కాలువలు' : formData.category === 'Sanitation' ? 'పారిశుధ్యం' : formData.category === 'Public Facilities' ? 'ప్రజా సౌకర్యాలు' : 'ఇతర సమస్యలు'}. వివరణ: ${formData.description}. ఈ సమాచారం సరైనదేనా? అవును అని చెప్పండి లేదా సమర్పించడానికి ముందుకు నొక్కండి.`
        : `Please confirm your complaint details. Your Name: ${formData.name}. Phone number: ${formData.phone}. Village: ${formData.village}. Category: ${formData.category}. Description: ${formData.description}. Is this correct? Say yes or submit to finalize, or say no to restart.`;
    }

    const utt  = new SpeechSynthesisUtterance(text);
    currentUtterRef.current = utt;
    utt.lang = isTelugu ? 'te-IN' : 'en-US';

    const voices = synthesisRef.current?.getVoices() || [];
    const v = voices.find(v => v.lang.startsWith(isTelugu ? 'te' : 'en'));
    if (v) utt.voice = v;

    let isSpoken = false;

    const startMic = () => {
      if (isSpoken) return;
      isSpoken = true;
      currentUtterRef.current = null;
      userStoppedRef.current = false;
      addLog("Starting SpeechRecognition after speaking/timeout...");
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (err) { }
        if (currentStepRef.current === 5 && mediaRecorder?.state !== 'recording') {
          audioChunksRef.current = [];
          try { 
            mediaRecorder?.start(); 
            addLog("MediaRecorder started recording WAV");
          } catch (err) { }
        }
      }, 400);
    };

    utt.onend = () => {
      addLog("SpeechSynthesis finished speaking successfully.");
      startMic();
    };

    utt.onerror = (e) => {
      addLog(`SpeechSynthesis error: ${e.error || 'unknown'}`);
      startMic();
    };

    const timeoutId = setTimeout(() => {
      if (!isSpoken) {
        addLog("SpeechSynthesis safety timeout fired. Forcing mic start.");
        synthesisRef.current?.cancel();
        startMic();
      }
    }, 9000); // Larger window for summary readback

    try {
      synthesisRef.current?.speak(utt);
    } catch (err) {
      addLog(`Speak request failed: ${err.message}`);
      startMic();
    }

    return () => {
      clearTimeout(timeoutId);
      synthesisRef.current?.cancel();
    };
  }, [currentStep, micStatus, isOffline]);

  // ─── Control Strip Activations ────────────────────────
  const handleStartResume = async () => {
    if (isOffline) return;
    resumeAudioContext();

    // Recovery for denied mic permission
    if (micStatus === 'no-permission' || micStatus === 'checking') {
      try {
        addLog("Re-requesting microphone permission on user interaction...");
        const s = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        s.getTracks().forEach(t => t.stop());
        setMicStatus('ready');
        addLog("Microphone permission granted successfully on retry.");
      } catch (err) {
        setMicStatus('no-permission');
        addLog(`Microphone permission request failed on retry: ${err.message}`);
        showToast(isTelugu ? "మైక్రోఫోన్ అనుమతి నిరాకరించబడింది." : "Microphone permission denied.");
        return;
      }
    }

    userStoppedRef.current = false;
    synthesisRef.current?.cancel();
    addLog("Starting/Resuming mic manually...");
    try { recognitionRef.current?.start(); } catch { }
    if (currentStep === 5 && mediaRecorder?.state !== 'recording') {
      audioChunksRef.current = [];
      try { mediaRecorder?.start(); } catch { }
    }
  };

  const handlePause = () => {
    userStoppedRef.current = true;
    addLog("Pausing SpeechRecognition...");
    try { recognitionRef.current?.stop(); } catch { }
    if (currentStep === 5 && mediaRecorder?.state === 'recording') {
      try { mediaRecorder.stop(); } catch { }
    }
  };

  const handleStop = () => {
    userStoppedRef.current = true;
    addLog("Stopping and committing current segment...");
    try { recognitionRef.current?.stop(); } catch { }
    if (currentStep === 5 && mediaRecorder?.state === 'recording') {
      try { mediaRecorder.stop(); } catch { }
    }
  };

  const handleClear = () => {
    addLog("Clearing input text fields...");
    setFormData(prev => {
      const u = { ...prev };
      if (currentStep === 1) u.name = '';
      if (currentStep === 2) u.phone = '';
      if (currentStep === 3) u.village = '';
      if (currentStep === 4) u.category = '';
      if (currentStep === 5) u.description = '';
      return u;
    });
    setCommittedText('');
    committedTextRef.current = '';
    setIsAudioQuiet(false);
  };

  // ─── Manual Text Editing ───
  const handleInputChange = (val) => {
    setFormData(prev => {
      const u = { ...prev };
      if (currentStep === 1) u.name = val;
      if (currentStep === 2) u.phone = val;
      if (currentStep === 3) u.village = val;
      if (currentStep === 5) u.description = val;
      return u;
    });
    setCommittedText(val);
    committedTextRef.current = val;
  };

  // ─── Navigation ───
  const goNext = () => {
    resumeAudioContext();
    if (currentStep === 1 && !formData.name.trim()) {
      showToast(isTelugu ? 'దయచేసి మీ పేరు చెప్పండి లేదా టైప్ చేయండి' : 'Please say or type your name');
      return;
    }
    if (currentStep === 2 && (!formData.phone.trim() || formData.phone.length < 10)) {
      showToast(isTelugu ? 'దయచేసి పది అంకెల మొబైల్ సంఖ్యను చెప్పండి' : 'Please enter a valid 10-digit phone number');
      return;
    }
    if (currentStep === 3 && !formData.village.trim()) {
      showToast(isTelugu ? 'దయచేసి మీ గ్రామం చెప్పండి' : 'Please say or type your village name');
      return;
    }
    if (currentStep === 4 && !formData.category) {
      showToast(isTelugu ? 'దయచేసి ఒక సమస్య వర్గాన్ని ఎంచుకోండి' : 'Please select a category');
      return;
    }
    if (currentStep === 5 && !formData.description.trim()) {
      showToast(isTelugu ? 'దయచేసి సమస్య వివరణను చెప్పండి' : 'Please say or type a complaint description');
      return;
    }

    userStoppedRef.current = true;
    try { recognitionRef.current?.stop(); } catch { }
    if (currentStep === 5 && mediaRecorder?.state === 'recording') {
      try { mediaRecorder.stop(); } catch { }
    }

    if (currentStep < 6) {
      setCurrentStep(s => s + 1);
    }
  };

  const goPrev = () => {
    resumeAudioContext();
    userStoppedRef.current = true;
    try { recognitionRef.current?.stop(); } catch { }
    if (currentStep === 5 && mediaRecorder?.state === 'recording') {
      try { mediaRecorder.stop(); } catch { }
    }
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  // ─── Automated Complaint Submission ───
  const submitComplaint = async () => {
    setIsSubmitting(true);
    synthesisRef.current?.cancel();
    addLog("Automated API Submission started...");
    
    try {
      let complaint_audio_url = '';

      // Upload Audio file if recorded
      if (audioBlob) {
        const uploadData = new FormData();
        uploadData.append('audio', audioBlob, 'complaint-recording.wav');
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          complaint_audio_url = uploadResult.complaint_audio_url || '';
          addLog("WAV Audio uploaded successfully");
        }
      }

      // API Payload mapping
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
        language
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        addLog("Submission completed successfully!");
        localStorage.removeItem('sachivalayam_voice_draft'); // Clean draft
        if (onSubmissionComplete) {
          onSubmissionComplete(data.complaint.id);
        } else if (onCompleteStep) {
          onCompleteStep(formData, audioBlob);
        }
      } else {
        showToast(isTelugu ? "ఫిర్యాదు సమర్పణ విఫలమైంది." : "Grievance submission failed. Try again.");
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast(isTelugu ? "ఫిర్యాదు సమర్పణ విఫలమైంది." : "Grievance submission failed. Try again.");
      addLog(`Submission Error: ${err.message}`);
    }
  };

  // Current answer for display/edit
  const currentAnswer =
    currentStep === 1 ? formData.name :
    currentStep === 2 ? formData.phone :
    currentStep === 3 ? formData.village :
    currentStep === 4 ? (formData.category
      ? (isTelugu ? categories.find(c => c.en === formData.category)?.te : formData.category)
      : '') :
    currentStep === 5 ? formData.description : '';

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isOffline) return isTelugu ? 'ఆఫ్‌లైన్' : 'Offline';
    if (isSubmitting) return isTelugu ? 'సమర్పిస్తోంది...' : 'Submitting...';
    if (isListening) return isTelugu ? '🔴 రికార్డింగ్' : '🔴 Listening';
    if (window.speechSynthesis.speaking) return isTelugu ? 'మాట్లాడుతోంది' : 'Speaking';
    return isTelugu ? 'సిద్ధంగా ఉంది' : 'Ready';
  };

  return (
    <div className="va-root">

      {/* ── Top Header and Language Toggle Switch ── */}
      <div className="va-topbar">
        <div className="va-topbar-left">
          <div className="va-avatar">{user?.name?.[0]?.toUpperCase() || '🎙️'}</div>
          <div>
            <div className="va-topbar-title">{isTelugu ? 'వాయిస్ రిజిస్ట్రేషన్' : 'Voice Registration'}</div>
            <div className="va-topbar-sub">{isTelugu ? 'గ్రామ సహాయక వ్యవస్థ' : 'Village Assistant System'} • {isTelugu ? 'దశ' : 'Step'} {currentStep}/6</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status Indicator Pill */}
          <span className={`va-status-pill ${isOffline ? 'va-status-offline' : isListening ? 'va-status-listening' : window.speechSynthesis.speaking ? 'va-status-speaking' : 'va-status-ready'}`}>
            {getStatusText()}
          </span>
          <button 
            className="btn btn-secondary" 
            style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
            onClick={() => changeLanguage?.(isTelugu ? 'English' : 'Telugu')}
          >
            🌐 {isTelugu ? 'English' : 'తెలుగు'}
          </button>
          <button className="va-cancel-btn" onClick={onCancel}>✕</button>
        </div>
      </div>

      {/* ── Offline Network Banner ── */}
      {isOffline && (
        <div className="va-offline-banner">
          <span>📶</span>
          <div>
            <strong>{isTelugu ? 'ఇంటర్నెట్ కనెక్షన్ లేదు' : 'No Internet Connection'}</strong>
            <div style={{ fontSize: '11.5px', marginTop: '2px', opacity: 0.9 }}>
              {isTelugu ? 'వాయిస్ గుర్తింపు నిలిపివేయబడింది. దయచేసి క్రింది ఫారమ్‌లో టైప్ చేయండి.' : 'Speech recognition requires internet. Please fill out the form manually below.'}
            </div>
          </div>
        </div>
      )}

      {/* ── Step progress nodes ── */}
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

      {/* ── Question Panel ── */}
      <div className="va-question-card" style={{ borderColor: stepColors[currentStep-1] }}>
        <div className="va-q-number" style={{ background: stepColors[currentStep-1] }}>
          {isTelugu ? 'దశ' : 'Step'}{currentStep}
        </div>
        <p className="va-question-text">{QUESTIONS[currentStep]}</p>
        <button 
          className="va-replay-btn" 
          disabled={isOffline}
          onClick={() => {
            resumeAudioContext();
            addLog("Replay question clicked");
            synthesisRef.current?.cancel();
            const text = QUESTIONS[currentStep];
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = isTelugu ? 'te-IN' : 'en-US';
            synthesisRef.current?.speak(utt);
          }}
        >
          🔊 {isTelugu ? 'మళ్ళీ వినండి' : 'Replay Question'}
        </button>
      </div>

      {/* ── Waveform and Recording Controls (Only for Steps 1-5) ── */}
      {currentStep <= 5 && !isOffline && (
        <div className="va-mic-area" style={{ padding: '8px 0' }}>
          
          {/* Recording Timer Ticker */}
          {isListening && (
            <div className="va-timer-badge">
              ⏱️ {formatTime(recordingSeconds)}
            </div>
          )}

          {/* Voice Waveform Animation Visualizer */}
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

          {/* Start, Pause, Resume, Stop controls panel */}
          <div className="va-controls-strip">
            <button 
              className="va-control-btn"
              disabled={isListening}
              onClick={handleStartResume}
            >
              ⏺️ {isTelugu ? 'ప్రారంభించు' : 'Start'}
            </button>
            <button 
              className="va-control-btn"
              disabled={!isListening}
              onClick={handlePause}
            >
              ⏸️ {isTelugu ? 'తాత్కాలికంగా ఆపు' : 'Pause'}
            </button>
            <button 
              className="va-control-btn"
              disabled={!isListening}
              onClick={handleStop}
            >
              ⏹️ {isTelugu ? 'పూర్తిచేయి' : 'Stop'}
            </button>
          </div>
        </div>
      )}

      {/* ── Category Cards selection Grid (Step 4 only) ── */}
      {currentStep === 4 && (
        <div className="va-cat-grid" style={{ marginBottom: '20px' }}>
          {categories.map(c => (
            <button
              key={c.en}
              className={`va-cat-btn ${formData.category === c.en ? 'selected' : ''}`}
              onClick={() => {
                addLog(`Category manually clicked: ${c.en}`);
                setFormData(p => ({ ...p, category: c.en }));
              }}
            >
              <span className="va-cat-icon">{c.icon}</span>
              <span className="va-cat-label">{isTelugu ? c.te : c.en}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Real-Time Transcription Editable Panel (Steps 1-5) ── */}
      {currentStep <= 5 && (
        <div className={`va-answer-box ${currentAnswer ? 'has-answer' : ''} ${isListening ? 'listening' : ''}`}>
          <div className="va-answer-label">{LABELS[currentStep]}</div>
          {currentStep !== 4 ? (
            <input 
              type="text" 
              className="form-control" 
              style={{ background: 'transparent', border: 'none', fontSize: '20px', fontWeight: '800', width: '100%', color: 'var(--text-primary)', outline: 'none', padding: '0' }}
              value={currentAnswer}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (isListening) handlePause();
              }}
              placeholder={isListening ? (isTelugu ? '🎙️ మాట్లాడుతుండగా ఇక్కడ కనిపిస్తుంది...' : '🎙️ Transcribing speech in real-time...') : (isTelugu ? 'ఇక్కడ టైప్ చేయవచ్చు...' : 'Type here to edit or enter...')}
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

      {/* ── Summary & Confirmation View (Step 6) ── */}
      {currentStep === 6 && (
        <div>
          <div className="va-summary-box">
            <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '14px' }}>
              📋 {isTelugu ? 'సమర్పించబోయే ఫిర్యాదు వివరాలు:' : 'Submitted Complaint Details:'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
              <div className="va-summary-item">
                <div className="va-summary-title">{LABELS[1]}</div>
                <div className="va-summary-value">{formData.name}</div>
              </div>
              <div className="va-summary-item">
                <div className="va-summary-title">{LABELS[2]}</div>
                <div className="va-summary-value">{formData.phone}</div>
              </div>
              <div className="va-summary-item" style={{ gridColumn: 'span 2' }}>
                <div className="va-summary-title">{LABELS[3]}</div>
                <div className="va-summary-value">{formData.village}</div>
              </div>
              <div className="va-summary-item" style={{ gridColumn: 'span 2' }}>
                <div className="va-summary-title">{LABELS[4]}</div>
                <div className="va-summary-value">{formData.category}</div>
              </div>
              <div className="va-summary-item" style={{ gridColumn: 'span 2' }}>
                <div className="va-summary-title">{LABELS[5]}</div>
                <div className="va-summary-value" style={{ wordBreak: 'break-word', lineHeight: '1.4' }}>{formData.description}</div>
              </div>
            </div>
          </div>

          {/* Verbal Confirmation Instructions */}
          {!isOffline && (
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px dashed #22C55E', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#16A34A', fontWeight: '700', marginBottom: '20px' }}>
              🗣️ {isTelugu ? 'సమర్పించడానికి "అవును" లేదా సరిదిద్దడానికి "కాదు" అని చెప్పండి.' : 'Say "yes" to confirm and submit automatically, or "no" to restart.'}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
              onClick={() => setCurrentStep(1)}
            >
              ✏️ {isTelugu ? 'సవరించు' : 'Edit Details'}
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#10B981' }}
              disabled={isSubmitting}
              onClick={submitComplaint}
            >
              🚀 {isSubmitting ? (isTelugu ? 'సమర్పిస్తున్నాము...' : 'Submitting...') : (isTelugu ? 'సమర్పించండి' : 'Confirm & Submit')}
            </button>
          </div>
        </div>
      )}

      {/* ── Browser Fallback Message (If Web Speech is missing) ── */}
      {micStatus === 'no-browser' && (
        <div className="va-alert va-alert-error" style={{ margin: '16px 0' }}>
          🚫 <strong>{isTelugu ? 'బ్రౌజర్ మద్దతు లేదు' : 'Unsupported Browser'}</strong>
          <p style={{ fontSize: '12.5px', marginTop: '4px' }}>
            {isTelugu ? 'వాయిస్ అసిస్టెంట్ కేవలం క్రోమ్ లేదా ఎడ్జ్ బ్రౌజర్ లలో పనిచేస్తుంది. దయచేసి క్రింది ఫారమ్‌ను ఉపయోగించండి.' : 'Voice recognition works best on Chrome, Edge or Android Chrome. Please fill out the form manually below.'}
          </p>
        </div>
      )}

      {/* ── Navigation Actions (Steps 1-5) ── */}
      {currentStep <= 5 && (
        <div className="va-nav">
          {currentStep > 1 && (
            <button className="va-btn va-btn-back" onClick={goPrev}>
              ← {isTelugu ? 'వెనుకకు' : 'Back'}
            </button>
          )}
          <button
            className="va-btn va-btn-next"
            style={{ background: stepColors[currentStep-1] }}
            onClick={goNext}
          >
            {isTelugu ? 'తదుపరి →' : 'Next →'}
          </button>
        </div>
      )}

      {/* ── Fallback Typing Form (Visible for verification or fallback entries) ── */}
      <div className="va-manual-form" style={{ marginTop: '36px', borderTop: '2px dashed var(--border-color)', paddingTop: '28px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          ⌨️ {isTelugu ? 'లేదా సమాచారాన్ని ఇక్కడ టైప్ చేయండి' : 'Manual Form Fallback'}
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {isTelugu ? 'వాయిస్ అసిస్టెంట్ ఉపయోగించడం ఇష్టం లేకుంటే లేదా ఆఫ్‌లైన్ లో ఉంటే క్రింది వివరాలను పూరించండి:' : "If you prefer not to use voice, or if the microphone is unavailable, complete the form manually:"}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>
              👤 {isTelugu ? 'మీ పేరు' : 'Your Name'}
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              onFocus={() => {
                if (isListening) handlePause();
              }}
              placeholder={isTelugu ? 'మీ పేరు టైప్ చేయండి' : 'Enter your name'}
              style={{ fontSize: '14px', padding: '12px' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>
              📞 {isTelugu ? 'మొబైల్ సంఖ్య' : 'Phone Number'}
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              onFocus={() => {
                if (isListening) handlePause();
              }}
              placeholder={isTelugu ? 'పది అంకెల మొబైల్ సంఖ్య' : 'Enter 10-digit phone number'}
              style={{ fontSize: '14px', padding: '12px' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>
              📍 {isTelugu ? 'గ్రామం / ప్రాంతం' : 'Village / Area'}
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.village}
              onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
              onFocus={() => {
                if (isListening) handlePause();
              }}
              placeholder={isTelugu ? 'మీ గ్రామం టైప్ చేయండి' : 'Enter your village or area'}
              style={{ fontSize: '14px', padding: '12px' }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>
              📋 {isTelugu ? 'సమస్య వర్గం' : 'Complaint Category'}
            </label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              onFocus={() => {
                if (isListening) handlePause();
              }}
              style={{ fontSize: '14px', padding: '12px', height: '48px', cursor: 'pointer' }}
            >
              <option value="">{isTelugu ? '-- వర్గాన్ని ఎంచుకోండి --' : '-- Select Category --'}</option>
              {categories.map(c => (
                <option key={c.en} value={c.en}>{isTelugu ? c.te : c.en}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>
              ✍️ {isTelugu ? 'సమస్య వివరణ' : 'Complaint Description'}
            </label>
            <textarea
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              onFocus={() => {
                if (isListening) handlePause();
              }}
              placeholder={isTelugu ? 'సమస్యను వివరంగా ఇక్కడ టైప్ చేయండి...' : 'Describe your problem in detail here...'}
              style={{ fontSize: '14px', padding: '12px', resize: 'vertical' }}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '15px', marginTop: '10px', background: '#10B981' }}
            onClick={(e) => {
              e.preventDefault();
              if (!formData.name.trim()) return showToast(isTelugu ? 'దయచేసి మీ పేరు టైప్ చేయండి' : 'Please enter your name');
              if (!formData.phone.trim() || formData.phone.length < 10) return showToast(isTelugu ? 'దయచేసి మీ మొబైల్ సంఖ్య టైప్ చేయండి' : 'Please enter 10-digit phone number');
              if (!formData.village.trim()) return showToast(isTelugu ? 'దయచేసి మీ గ్రామం టైప్ చేయండి' : 'Please enter your village');
              if (!formData.category) return showToast(isTelugu ? 'దయచేసి ఒక వర్గాన్ని ఎంచుకోండి' : 'Please select a category');
              if (!formData.description.trim()) return showToast(isTelugu ? 'దయచేసి సమస్య వివరణ టైప్ చేయండి' : 'Please describe your complaint');
              
              submitComplaint();
            }}
          >
            🚀 {isTelugu ? 'వివరాలను సమర్పించండి' : 'Submit Details Manually'}
          </button>
        </div>
      </div>

      {/* ── Debug Console (Collapsible) ── */}
      <div className="va-debug-panel">
        <details>
          <summary>⚙️ Debug Console & Diagnostics</summary>
          <div className="va-debug-content">
            <div className="va-debug-metric">
              <span>Mic Status: <strong>{micStatus}</strong></span>
              <span>Audio Level: <strong>{volume}%</strong></span>
              <span>Silent: <strong>{isAudioQuiet ? 'YES' : 'NO'}</strong></span>
            </div>
            <div className="va-debug-logs">
              {logs.length === 0 ? (
                <div className="va-debug-log-empty">No logs yet. Speak or tap controls.</div>
              ) : (
                logs.map((log, i) => <div key={i} className="va-debug-log-line">{log}</div>)
              )}
            </div>
          </div>
        </details>
      </div>

    </div>
  );
}
