import React, { useState, useEffect, useRef } from 'react';

export default function PhotoCapture({ language, user, voiceData, audioBlob, onSubmissionComplete, onCancel, showToast }) {
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locating, setLocating] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const t = {
    English: {
      title: "Evidence & Location",
      subtitle: "Capture a photo of the problem and tag your GPS location",
      startCam: "Open Camera",
      takePhoto: "Take Photo",
      retake: "Retake Photo",
      uploadFallback: "Or select an image file:",
      gpsStatus: "Acquiring GPS coordinates...",
      gpsSuccess: "GPS Geo-Tagged Successfully",
      latitude: "Latitude",
      longitude: "Longitude",
      submit: "Submit Complaint",
      submitting: "Submitting Complaint...",
      cancel: "Cancel",
      gpsErr: "GPS Location Denied. Using village headquarters location.",
      submitErr: "Grievance submission failed. Please try again."
    },
    Telugu: {
      title: "సాక్ష్యం & స్థానం",
      subtitle: "సమస్య యొక్క ఫోటోను తీయండి మరియు మీ GPS స్థానాన్ని జత చేయండి",
      startCam: "కెమెరాను ఆన్ చేయి",
      takePhoto: "ఫోటో తీయి",
      retake: "మరో ఫోటో తీయి",
      uploadFallback: "లేదా ఒక ఫోటో ఫైల్‌ను ఎంచుకోండి:",
      gpsStatus: "GPS స్థానాన్ని గుర్తిస్తున్నాము...",
      gpsSuccess: "GPS విజయవంతంగా జత చేయబడింది",
      latitude: "అక్షాంశం (Latitude)",
      longitude: "రేఖాంశం (Longitude)",
      submit: "ఫిర్యాదును సమర్పించండి",
      submitting: "సమర్పిస్తున్నాము...",
      cancel: "రద్దు చేయి",
      gpsErr: "GPS అనుమతి నిరాకరించబడింది. గ్రామ ప్రధాన కార్యాలయ స్థానాన్ని ఉపయోగిస్తున్నాము.",
      submitErr: "ఫిర్యాదు సమర్పణ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి."
    }
  }[language];

  // Fetch GPS Coordinates automatically on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocating(false);
        },
        (error) => {
          console.warn("Geolocation access failed:", error);
          // Fallback to district office coordinates (Anantapur)
          setLocation({ latitude: 14.6819, longitude: 77.6006 });
          setLocating(false);
          showToast(t.gpsErr);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocation({ latitude: 14.6819, longitude: 77.6006 });
      setLocating(false);
      showToast(t.gpsErr);
    }
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Could not open camera:", err);
      showToast(language === 'Telugu' ? "కెమెరాను ఆన్ చేయడం కుదరలేదు" : "Could not open camera stream.");
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        setPhotoBlob(blob);
        setPhotoPreview(URL.createObjectURL(blob));
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

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      let photo_url = '';
      let complaint_audio_url = '';

      // Create FormData to upload files
      const uploadData = new FormData();
      if (photoBlob) {
        uploadData.append('photo', photoBlob, 'complaint-evidence.jpg');
      }
      if (audioBlob) {
        uploadData.append('audio', audioBlob, 'complaint-recording.wav');
      }

      // Execute upload if files exist
      if (photoBlob || audioBlob) {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          photo_url = uploadResult.photo_url || '';
          complaint_audio_url = uploadResult.complaint_audio_url || '';
        }
      }

      // Submit the main complaint
      const payload = {
        resident_name: voiceData.name,
        resident_phone: user?.phone || '',
        village_area: voiceData.village,
        complaint_category: voiceData.category,
        complaint_description_text: voiceData.description,
        photo_url,
        complaint_audio_url,
        latitude: location.latitude,
        longitude: location.longitude,
        language
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        onSubmissionComplete(data.complaint.id);
      } else {
        showToast(data.message || t.submitErr);
      }
    } catch (err) {
      setSubmitting(false);
      showToast(t.submitErr);
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '5px' }}>
      <div className="card">
        <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>{t.title}</h2>
        <p style={{ color: 'var(--slate-light)', fontSize: '13px', marginBottom: '20px' }}>{t.subtitle}</p>

        {/* GPS Badge Tag */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          {locating ? (
            <span className="gps-badge waiting">📡 {t.gpsStatus}</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span className="gps-badge">✅ {t.gpsSuccess}</span>
              <div style={{ fontSize: '11px', color: 'var(--slate-light)', fontWeight: '600' }}>
                {t.latitude}: {location.latitude?.toFixed(5)} | {t.longitude}: {location.longitude?.toFixed(5)}
              </div>
            </div>
          )}
        </div>

        {/* Camera stream or Photo Preview */}
        <div className="photo-capture-area">
          {photoPreview ? (
            /* Show Photo Preview */
            <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <img src={photoPreview} alt="Evidence" style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }} />
              <button 
                className="btn btn-secondary btn-block" 
                style={{ borderRadius: '0', border: 'none' }}
                onClick={() => { setPhotoPreview(''); setPhotoBlob(null); }}
              >
                🔄 {t.retake}
              </button>
            </div>
          ) : cameraActive ? (
            /* Show Live Video Stream */
            <div className="camera-preview-box">
              <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
              <button 
                className="btn btn-danger btn-icon-only" 
                style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', width: '56px', height: '56px' }}
                onClick={capturePhoto}
              >
                📸
              </button>
            </div>
          ) : (
            /* Idle Placeholder */
            <div 
              className="camera-preview-box" 
              style={{ background: '#F1F5F9', borderStyle: 'dashed', cursor: 'pointer' }}
              onClick={startCamera}
            >
              <div className="camera-placeholder">
                <span style={{ fontSize: '48px' }}>📷</span>
                <span style={{ fontWeight: '700', color: 'var(--slate-dark)' }}>{t.startCam}</span>
              </div>
            </div>
          )}

          {/* Canvas hidden helper */}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

          {/* Standard Input File fallback */}
          {!photoPreview && !cameraActive && (
            <div style={{ width: '100%', marginTop: '5px' }}>
              <label className="form-label" style={{ fontSize: '13px', color: 'var(--slate-light)' }}>
                {t.uploadFallback}
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="form-control"
                style={{ fontSize: '13px', padding: '10px' }}
              />
            </div>
          )}
        </div>

        {/* Buttons submission panel */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ flex: 1 }} 
            onClick={onCancel}
            disabled={submitting}
          >
            {t.cancel}
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 2 }} 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
