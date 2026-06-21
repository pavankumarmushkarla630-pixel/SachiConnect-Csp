import React, { useState, useEffect, useRef } from 'react';

export default function VoiceAssistant({ language, user, onCompleteStep, onCancel, showToast }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [micStatus, setMicStatus] = useState('checking'); // 'checking'|'ready'|'no-browser'|'no-internet'|'no-permission'

  // All fields always start EMPTY — user must speak every answer
  const [formData, setFormData] = useState({ name: '', village: '', category: '', description: '' });

  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);

  // Smart Speech Recognition Accumulation across pauses/restarts
  const [committedText, setCommittedText] = useState('');

  // Live Audio Analyzer Diagnostics
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const [volume, setVolume] = useState(0);
  const [isAudioQuiet, setIsAudioQuiet] = useState(false);
  const [logs, setLogs] = useState([]);

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
    2: isTelugu ? 'మీరు ఏ గ్రామం నుండి వచ్చారు?' : 'Which village or area are you from?',
    3: isTelugu ? 'ఏ రకమైన సమస్య? రోడ్లు, వీధిదీపాలు, నీటి సరఫరా, మురుగు, పారిశుధ్యం, ప్రజా సౌకర్యాలు, లేదా ఇతర?' : 'What type of problem? Roads, streetlights, water supply, drainage, sanitation, public facilities, or other?',
    4: isTelugu ? 'మీ సమస్యను వివరంగా చెప్పండి.' : 'Please describe your complaint in detail.',
  };

  const LABELS = {
    1: isTelugu ? 'మీరు చెప్పింది:' : 'You said:',
    2: isTelugu ? 'మీరు చెప్పింది:' : 'You said:',
    3: isTelugu ? 'ఎంచుకున్న వర్గం:' : 'Selected Category:',
    4: isTelugu ? 'మీరు చెప్పింది:' : 'You said:',
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

  const stepColors = ['#2563EB', '#14B8A6', '#F59E0B', '#8B5CF6'];
  const stepIcons  = ['👤', '📍', '📋', '✍️'];

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
  };

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
        setMicStatus('no-internet'); 
        addLog("Diagnostic Failed: No internet connection detected");
        return; 
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        addLog("Mic stream established.");

        // Initialize MediaRecorder (for step 4)
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
          analyser.fftSize = 2048; // Sufficient sample size to capture human speech wave cycles
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

            // Auto-resume if context is suspended (Chrome requirement)
            if (audioCtx.state === 'suspended') {
              audioCtx.resume().catch(() => {});
            }

            // Use Time Domain data for raw amplitude (extremely robust)
            analyser.getByteTimeDomainData(dataArray);
            let maxDeviation = 0;
            for (let i = 0; i < bufferLength; i++) {
              const deviation = Math.abs(dataArray[i] - 128);
              if (deviation > maxDeviation) maxDeviation = deviation;
            }

            // Map deviation (0-128) to 0-100 scale
            const currentVol = Math.round((maxDeviation / 128) * 100);
            setVolume(currentVol);

            const now = Date.now();
            if (currentVol > 3) { // 3% threshold is highly sensitive for softer voices
              lastSoundTime = now;
              setIsAudioQuiet(false);
            } else if (now - lastSoundTime > 4000) {
              // No sound above threshold for > 4 seconds
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
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || micStatus !== 'ready') return;

    addLog(`Initializing SpeechRecognition [Lang: ${isTelugu ? 'te-IN' : 'en-US'}]`);
    const rec = new SR();
    
    // Enable continuous listening to keep the mic active during normal pauses
    rec.continuous      = true;   
    rec.interimResults  = true;   // show words in real-time as they're spoken
    rec.maxAlternatives = 1;
    rec.lang = isTelugu ? 'te-IN' : 'en-US';

    rec.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      addLog("SpeechRecognition started listening");
    };

    rec.onresult = (event) => {
      let sessionText = '';
      for (let i = 0; i < event.results.length; i++) {
        // Add a space between segments to prevent words from sticking together
        sessionText += (i > 0 ? ' ' : '') + event.results[i][0].transcript;
      }
      
      const step = currentStepRef.current;
      const baseText = committedTextRef.current || '';
      
      // Combine committed text from previous sessions and the current active session
      const combined = (baseText + " " + sessionText).replace(/\s+/g, ' ').trim();
      
      if (!combined) return;

      addLog(`Heard (sessionText: "${sessionText.trim()}", combined: "${combined}")`);

      // ── Strict command matching on the current segment text ──
      // This prevents commands like 'back' or 'submit' from triggering when spoken as part of longer sentences/descriptions.
      // We look at the last result's transcript (what was just spoken) for the command.
      const lastResultIndex = event.resultIndex;
      const currentSegment = event.results[lastResultIndex] ? event.results[lastResultIndex][0].transcript : '';
      const cleanSegment = currentSegment.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

      const isNextCmd    = ['next', 'next step', 'go next', 'తరువాత', 'సరి'].includes(cleanSegment);
      const isBackCmd    = ['back', 'go back', 'వెనుకకు'].includes(cleanSegment);
      const isCancelCmd  = ['cancel', 'cancel please', 'రద్దు'].includes(cleanSegment);
      const isProceedCmd = ['proceed', 'submit', 'submit complaint', 'ముందుకు'].includes(cleanSegment);

      if (isNextCmd    && step < 4)  { addLog("Command recognized: NEXT"); rec.stop(); goNext();   return; }
      if (isBackCmd    && step > 1)  { addLog("Command recognized: BACK"); rec.stop(); goPrev();   return; }
      if (isCancelCmd)               { addLog("Command recognized: CANCEL"); rec.stop(); onCancel(); return; }
      if (isProceedCmd && step === 4){ addLog("Command recognized: SUBMIT"); rec.stop(); goNext();   return; }

      // Content update — real-time display
      setFormData(prev => {
        const u = { ...prev };
        if (step === 1) u.name        = combined;
        if (step === 2) u.village     = combined;
        if (step === 4) u.description = combined;
        return u;
      });

      // Category matching (step 3)
      if (step === 3) {
        const low = combined.toLowerCase().trim();
        const match = categories.find(c =>
          low.includes(c.en.toLowerCase()) || low.includes(c.te)
        );
        if (match) {
          addLog(`Category matched: ${match.en}`);
          setFormData(prev => ({ ...prev, category: match.en }));
        }
      }
    };

    rec.onerror = (e) => {
      addLog(`SpeechRecognition error: "${e.error}"`);
      isListeningRef.current = false;
      setIsListening(false);
      if (e.error === 'not-allowed') setMicStatus('no-permission');
      if (e.error === 'network')     setMicStatus('no-internet');
    };

    rec.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      addLog("SpeechRecognition session ended");

      // Auto-commit session text to committedText when the session ends
      const step = currentStepRef.current;
      setFormData(prev => {
        const val = step === 1 ? prev.name :
                    step === 2 ? prev.village :
                    step === 4 ? prev.description : '';
        setCommittedText(val);
        return prev;
      });

      // Auto-restart if user did not tap STOP
      if (!userStoppedRef.current && micStatus === 'ready') {
        userStoppedRef.current = false;
        addLog("Attempting auto-restart of SpeechRecognition...");
        setTimeout(() => {
          try { 
            rec.start(); 
            isListeningRef.current = true; 
            setIsListening(true); 
          } catch (err) { 
            /* already started */ 
          }
        }, 300);
      }
    };

    recognitionRef.current = rec;
    return () => {
      userStoppedRef.current = true; // prevent auto-restart on cleanup
      try { rec.abort(); } catch { }
      addLog("Cleaned up SpeechRecognition instance");
    };
  }, [currentStep, language, micStatus]);

  // ─── Speak question then auto-start mic ──────────────────────────────────────
  useEffect(() => {
    if (micStatus !== 'ready') return;
    addLog(`Transitioning to Step ${currentStep}. Speaking question...`);
    userStoppedRef.current = true; // stop any running recognition first
    try { recognitionRef.current?.abort(); } catch { }
    setIsListening(false);
    isListeningRef.current = false;
    setCommittedText(''); // Reset committed text for the new step

    synthesisRef.current?.cancel();
    const text = QUESTIONS[currentStep];
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
        } catch (err) {
          addLog(`Error starting recognition: ${err.message}`);
        }
        if (currentStepRef.current === 4 && mediaRecorder?.state !== 'recording') {
          audioChunksRef.current = [];
          try { 
            mediaRecorder?.start(); 
            addLog("MediaRecorder started recording wav");
          } catch (err) {
            addLog(`MediaRecorder error: ${err.message}`);
          }
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

    // Safety timeout: 6 seconds. If browser block or TTS hang occurs, start mic anyway
    const timeoutId = setTimeout(() => {
      if (!isSpoken) {
        addLog("SpeechSynthesis safety timeout fired. Forcing mic start.");
        synthesisRef.current?.cancel();
        startMic();
      }
    }, 6000);

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
  }, [currentStep, micStatus]);

  // ─── Mic button: toggle listen / stop ────────────────────────────────────────
  const handleMicClick = () => {
    addLog("Manual mic toggle clicked");
    
    // Explicitly resume AudioContext if suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        addLog("AudioContext resumed via user gesture");
      }).catch(err => {
        addLog(`AudioContext resume error: ${err.message}`);
      });
    }

    if (isListeningRef.current) {
      userStoppedRef.current = true;
      addLog("Stopping mic manually...");
      try { recognitionRef.current?.stop(); } catch { }
      if (currentStep === 4 && mediaRecorder?.state === 'recording') {
        try { mediaRecorder.stop(); } catch { }
      }
    } else {
      userStoppedRef.current = false;
      synthesisRef.current?.cancel();
      addLog("Starting mic manually...");
      try { recognitionRef.current?.abort(); } catch { }
      setTimeout(() => {
        try { recognitionRef.current?.start(); } catch { }
        if (currentStep === 4 && mediaRecorder?.state !== 'recording') {
          audioChunksRef.current = [];
          try { mediaRecorder?.start(); } catch { }
        }
      }, 150);
    }
  };

  const handleRedo = () => {
    addLog("Redo requested. Clearing answer and restarting mic...");
    
    // Explicitly resume AudioContext if suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }

    // Clear current step field
    setFormData(prev => {
      const u = { ...prev };
      if (currentStep === 1) u.name = '';
      if (currentStep === 2) u.village = '';
      if (currentStep === 4) u.description = '';
      return u;
    });
    setCommittedText('');
    committedTextRef.current = '';
    setIsAudioQuiet(false);

    // Cancel text speaking
    synthesisRef.current?.cancel();

    // Abort active recognition
    userStoppedRef.current = true;
    try { recognitionRef.current?.abort(); } catch { }

    // Start fresh recognition
    setTimeout(() => {
      userStoppedRef.current = false;
      try { 
        recognitionRef.current?.start(); 
      } catch (err) {
        addLog(`Redo recognition start failed: ${err.message}`);
      }
      if (currentStep === 4) {
        audioChunksRef.current = [];
        try {
          if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop();
          }
          setTimeout(() => {
            try { 
              mediaRecorder?.start(); 
              addLog("MediaRecorder restarted");
            } catch (err) { }
          }, 100);
        } catch (err) { }
      }
    }, 200);
  };

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const goNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      showToast(isTelugu ? 'దయచేసి మీ పేరు చెప్పండి' : 'Please say your name');
      return;
    }
    if (currentStep === 2 && !formData.village.trim()) {
      showToast(isTelugu ? 'దయచేసి మీ గ్రామం చెప్పండి' : 'Please say your village name');
      return;
    }
    if (currentStep === 3 && !formData.category) {
      showToast(isTelugu ? 'దయచేసి ఒక వర్గాన్ని ఎంచుకోండి' : 'Please select a category');
      return;
    }
    userStoppedRef.current = true;
    try { recognitionRef.current?.stop(); } catch { }
    if (currentStep === 4 && mediaRecorder?.state === 'recording') {
      try { mediaRecorder.stop(); } catch { }
    }
    if (currentStep < 4) {
      setCurrentStep(s => s + 1);
    } else {
      onCompleteStep(formData, audioBlob);
    }
  };

  const goPrev = () => {
    userStoppedRef.current = true;
    try { recognitionRef.current?.stop(); } catch { }
    if (currentStep === 4 && mediaRecorder?.state === 'recording') {
      try { mediaRecorder.stop(); } catch { }
    }
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  // Current answer for display
  const currentAnswer =
    currentStep === 1 ? formData.name :
    currentStep === 2 ? formData.village :
    currentStep === 3 ? (formData.category
      ? (isTelugu ? categories.find(c => c.en === formData.category)?.te : formData.category)
      : '') :
    formData.description;

  // Dynamic visualizer bar heights based on live volume
  const getBarHeight = (index) => {
    if (!isListening) return 6;
    const factors = [0.6, 0.9, 1.2, 0.9, 0.6];
    const computed = Math.round(6 + (volume * factors[index] * 0.3));
    return Math.min(36, computed);
  };

  return (
    <div className="va-root">

      {/* ── Top bar ─────────────────────────────── */}
      <div className="va-topbar">
        <div className="va-topbar-left">
          <div className="va-avatar">{user?.name?.[0]?.toUpperCase() || '🏛'}</div>
          <div>
            <div className="va-topbar-title">{isTelugu ? 'ఫిర్యాదు నమోదు' : 'File a Grievance'}</div>
            <div className="va-topbar-sub">{isTelugu ? 'వాయిస్ అసిస్టెంట్' : 'Voice Assistant'} • {isTelugu ? 'దశ' : 'Step'} {currentStep}/4</div>
          </div>
        </div>
        <button className="va-cancel-btn" onClick={onCancel}>✕</button>
      </div>

      {/* ── Step progress dots ───────────────────── */}
      <div className="va-step-rail">
        {[1,2,3,4].map(s => (
          <div key={s} className="va-step-node" style={{ '--sc': stepColors[s-1] }}>
            <div className={`va-step-circle ${currentStep === s ? 'active' : currentStep > s ? 'done' : ''}`}>
              {currentStep > s ? '✓' : stepIcons[s-1]}
            </div>
            {s < 4 && <div className={`va-step-line ${currentStep > s ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      {/* ── Question ─────────────────────────────── */}
      <div className="va-question-card" style={{ borderColor: stepColors[currentStep-1] }}>
        <div className="va-q-number" style={{ background: stepColors[currentStep-1] }}>
          {isTelugu ? 'ప్రశ్న' : 'Q'}{currentStep}
        </div>
        <p className="va-question-text">{QUESTIONS[currentStep]}</p>
        <button className="va-replay-btn" onClick={() => {
          addLog("Replay clicked");
          synthesisRef.current?.cancel();
          const utt = new SpeechSynthesisUtterance(QUESTIONS[currentStep]);
          utt.lang = isTelugu ? 'te-IN' : 'en-US';
          synthesisRef.current?.speak(utt);
        }}>
          🔊 {isTelugu ? 'మళ్ళీ వినండి' : 'Replay'}
        </button>
      </div>

      {/* ── Mic diagnostic banner ─────────────────── */}
      {micStatus === 'no-browser' && (
        <div className="va-alert va-alert-error">
          ⚠️ {isTelugu ? 'Chrome బ్రౌజర్ వాడండి' : 'Use Google Chrome for voice support'}
        </div>
      )}
      {micStatus === 'no-internet' && (
        <div className="va-alert va-alert-error">
          📶 {isTelugu ? 'వాయిస్ కోసం ఇంటర్నెట్ అవసరం' : 'Internet required — Chrome sends audio to Google to process speech'}
        </div>
      )}
      {micStatus === 'no-permission' && (
        <div className="va-alert va-alert-error">
          🔒 {isTelugu ? 'మైక్రోఫోన్ అనుమతి ఇవ్వండి' : 'Allow microphone: click the 🔒 in your browser address bar → Allow'}
        </div>
      )}

      {/* ── Mic quiet warning ───────────────────── */}
      {isListening && isAudioQuiet && (
        <div className="va-alert va-alert-warning" style={{ marginTop: '8px', textAlign: 'left' }}>
          <strong>🎤 {isTelugu ? 'శబ్దం వినబడడం లేదు!' : 'No sound detected!'}</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: '20px', fontSize: '12.5px', lineHeight: '1.5' }}>
            <li>{isTelugu ? 'మీ మైక్రోఫోన్ మ్యూట్ లో ఉందేమో చూడండి.' : 'Verify your microphone is not physically muted.'}</li>
            <li>{isTelugu ? 'బ్రౌజర్ అడ్రస్ బార్‌లోని 🔒 లేదా మైక్ ఐకాన్‌ను నొక్కి సరైన మైక్రోఫోన్‌ను ఎంచుకోండి.' : 'Click the 🔒 or camera icon in the browser address bar to check/change your microphone source.'}</li>
            <li>{isTelugu ? 'కొంచెం గట్టిగా లేదా మైక్ దగ్గరగా మాట్లాడండి.' : 'Try speaking louder or closer to the microphone.'}</li>
          </ul>
        </div>
      )}

      {/* ── Category cards (step 3 only) ─────────── */}
      {currentStep === 3 && (
        <div className="va-cat-grid">
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

      {/* ── Mic button ───────────────────────────── */}
      {currentStep !== 3 && (
        <div className="va-mic-area">
          <button
            className={`va-mic-btn ${isListening ? 'listening' : ''} ${micStatus !== 'ready' ? 'disabled' : ''}`}
            onClick={micStatus === 'ready' ? handleMicClick : undefined}
          >
            {micStatus === 'checking' ? '⏳' :
             micStatus !== 'ready'   ? '🚫' :
             isListening             ? '⏹️' : '🎙️'}
          </button>
          <div className="va-mic-label">
            {micStatus === 'checking' ? (isTelugu ? 'తనిఖీ చేస్తోంది...' : 'Checking mic...') :
             micStatus !== 'ready'   ? (isTelugu ? 'మైక్రోఫోన్ అందుబాటులో లేదు' : 'Microphone unavailable') :
             isListening             ? (isTelugu ? '🔴 వింటున్నాను... మాట్లాడండి' : '🔴 Listening... speak now') :
                                       (isTelugu ? 'నొక్కి మాట్లాడండి' : 'Tap to speak')}
          </div>
          {isListening && (
            <div className="va-sound-bars">
              {[0,1,2,3,4].map(i => (
                <div 
                  key={i} 
                  className="va-bar" 
                  style={{ 
                    height: `${getBarHeight(i)}px`,
                    animation: 'none',
                    transition: 'height 0.08s ease'
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Live answer display ───────────────────── */}
      <div className={`va-answer-box ${currentAnswer ? 'has-answer' : ''} ${isListening && currentStep !== 3 ? 'listening' : ''}`}>
        <div className="va-answer-label">{LABELS[currentStep]}</div>
        {currentAnswer ? (
          <div className="va-answer-text">{currentAnswer}</div>
        ) : (
          <div className="va-answer-placeholder">
            {isListening
              ? (isTelugu ? '🎙️ మీరు మాట్లాడుతున్నారు...' : '🎙️ Waiting for your voice...')
              : (isTelugu ? 'మైక్ నొక్కి మీ సమాధానం చెప్పండి' : 'Tap the mic and speak your answer')}
          </div>
        )}
        {/* Retry button */}
        {currentAnswer && !isListening && currentStep !== 3 && (
          <button className="va-redo-btn" onClick={handleRedo}>
            🔄 {isTelugu ? 'మళ్ళీ చెప్పండి' : 'Say again'}
          </button>
        )}
      </div>

      {/* ── Navigation ───────────────────────────── */}
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
          {currentStep === 4
            ? (isTelugu ? '📸 ముందుకు వెళ్ళు' : '📸 Proceed')
            : (isTelugu ? 'తదుపరి →' : 'Next →')}
        </button>
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
                <div className="va-debug-log-empty">No logs yet. Speak or tap mic.</div>
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
