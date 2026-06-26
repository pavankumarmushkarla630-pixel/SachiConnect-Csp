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

export default function VoiceAssistant({ language, user, onSubmissionComplete, onCancel, showToast, changeLanguage }) {
  const isTelugu = language === 'Telugu';

  // Multi-step form state
  const [formStep, setFormStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('sachivalayam_form_draft');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return { name: user?.name || '', phone: user?.phone || '', village: user?.village || '', category: '', description: '' };
  });

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

  const categories = [
    { en: 'Roads',             te: 'రోడ్లు',              icon: '🛣️' },
    { en: 'Streetlights',      te: 'వీధి దీపాలు',          icon: '💡' },
    { en: 'Water Supply',      te: 'నీటి సరఫరా',           icon: '🚰' },
    { en: 'Drainage',          te: 'మురుగు కాలువలు',       icon: '🗑️' },
    { en: 'Sanitation',        te: 'పారిశుధ్యం',           icon: '🧹' },
    { en: 'Public Facilities', te: 'ప్రజా సౌకర్యాలు',      icon: '🏫' },
    { en: 'Other',             te: 'ఇతర సమస్యలు',          icon: '❓' },
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

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      stopCamera();
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

  const handleNext = (currentStepNum) => {
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
            <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', color: 'var(--text-primary)' }}>
              📋 {isTelugu ? 'సమస్య వివరాలు' : 'Grievance Details'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Village Input with Geolocator button */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{t.villageLabel}</label>
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
                <input type="text" className="form-control" list="ap-villages-list" value={formData.village} onChange={e => updateField('village', e.target.value)} placeholder={t.villagePlaceholder} style={{ fontSize: '14.5px', padding: '14px' }} />
              </div>

              {/* Category selection */}
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t.categoryLabel}</label>
                <select className="form-control" value={formData.category} onChange={e => updateField('category', e.target.value)} style={{ fontSize: '14.5px', padding: '12px 14px', height: '52px', cursor: 'pointer' }}>
                  <option value="">{t.categorySelect}</option>
                  {categories.map(c => <option key={c.en} value={c.en}>{c.icon} {isTelugu ? c.te : c.en}</option>)}
                </select>
              </div>

              {/* Description input */}
              <div>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t.descriptionLabel}</label>
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
                onClick={() => setFormStep(1)}
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
                onClick={() => setFormStep(2)}
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
