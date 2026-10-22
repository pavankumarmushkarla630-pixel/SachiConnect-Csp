import React, { useState, useEffect } from 'react';

export default function ComplaintDetails({ complaintId, language, onBack, showToast }) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const t = {
    English: {
      title: "Grievance Review",
      subtitle: "Review complaint, listen to voice recording, and update status",
      resident: "Resident Info",
      phone: "Mobile Number",
      village: "Village / Location",
      category: "Category",
      priority: "Problem Complexity / Priority",
      description: "Description",
      language: "Reporting Language",
      audio: "Voice Complaint Recording",
      evidence: "Photo Evidence",
      location: "GPS Coordinates",
      viewMap: "View on Google Maps",
      status: "Current Status",
      updateStatus: "Update Resolution Status & Priority",
      priorityLabel: "Assign Problem Priority",
      statusLabel: "Select Status",
      notesLabel: "Status Update Notes / Action Taken",
      notesPlaceholder: "Describe the action taken or assignment details...",
      save: "Save Status & Priority",
      resolve: "Mark as Resolved",
      back: "Back",
      loading: "Loading complaint details...",
      saveSuccess: "Status & Priority updated successfully.",
      saveErr: "Failed to update status."
    },
    Telugu: {
      title: "ఫిర్యాదు సమీక్ష",
      subtitle: "ఫిర్యాదును సమీక్షించండి, వాయిస్ రికార్డింగ్ వినండి మరియు స్థితిని నవీకరించండి",
      resident: "నివాసి సమాచారం",
      phone: "మొబైల్ సంఖ్య",
      village: "గ్రామం / ప్రాంతం",
      category: "ఫిర్యాదు వర్గం",
      priority: "సమస్య సంక్లిష్టత / ప్రాధాన్యత",
      description: "వివరణ",
      language: "భాష",
      audio: "వాయిస్ రికార్డింగ్",
      evidence: "ఫోటో సాక్ష్యం",
      location: "GPS స్థానం",
      viewMap: "గూగుల్ మ్యాప్స్‌లో చూడండి",
      status: "ప్రస్తుత స్థితి",
      updateStatus: "పరిష్కార స్థితి & ప్రాధాన్యతను నవీకరించండి",
      priorityLabel: "సమస్య ప్రాధాన్యతను కేటాయించండి",
      statusLabel: "స్థితిని ఎంచుకోండి",
      notesLabel: "నవీకరణ గమనికలు / తీసుకున్న చర్య",
      notesPlaceholder: "తీసుకున్న చర్య లేదా అసైన్మెంట్ వివరాలను వివరించండి...",
      save: "స్థితి & ప్రాధాన్యతను నవీకరించు",
      resolve: "పరిష్కరించబడినట్లు గుర్తించు",
      back: "వెనుకకు",
      loading: "ఫిర్యాదు వివరాలను లోడ్ చేస్తున్నాము...",
      saveSuccess: "స్థితి & ప్రాధాన్యత విజయవంతంగా నవీకరించబడింది.",
      saveErr: "స్థితి నవీకరణ విఫలమైంది."
    }
  }[language] || {
    title: "Grievance Review",
    subtitle: "Review complaint, listen to voice recording, and update status",
    resident: "Resident Info",
    phone: "Mobile Number",
    village: "Village / Location",
    category: "Category",
    priority: "Problem Complexity / Priority",
    description: "Description",
    language: "Reporting Language",
    audio: "Voice Complaint Recording",
    evidence: "Photo Evidence",
    location: "GPS Coordinates",
    viewMap: "View on Google Maps",
    status: "Current Status",
    updateStatus: "Update Resolution Status & Priority",
    priorityLabel: "Assign Problem Priority",
    statusLabel: "Select Status",
    notesLabel: "Status Update Notes / Action Taken",
    notesPlaceholder: "Describe the action taken or assignment details...",
    save: "Save Status & Priority",
    resolve: "Mark as Resolved",
    back: "Back",
    loading: "Loading complaint details...",
    saveSuccess: "Status & Priority updated successfully.",
    saveErr: "Failed to update status."
  };

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}`);
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
        setStatus(data.status);
        setPriority(data.complexity || data.priority || 'Medium');
      } else {
        showToast("Complaint not found.");
      }
    } catch (err) {
      showToast("Server Connection Error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          priority,
          complexity: priority,
          notes: notes || `Status updated to ${status} (Priority: ${priority})` 
        })
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        showToast(t.saveSuccess);
        setComplaint(data.complaint);
        setNotes('');
      } else {
        showToast(data.message || t.saveErr);
      }
    } catch (err) {
      setSubmitting(false);
      showToast(t.saveErr);
      console.error(err);
    }
  };

  const handleMarkResolved = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Resolved', 
          notes: notes || 'Grievance resolved and verified by Sachivalayam authority.' 
        })
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        showToast(t.saveSuccess);
        setComplaint(data.complaint);
        setStatus('Resolved');
        setNotes('');
      } else {
        showToast(data.message || t.saveErr);
      }
    } catch (err) {
      setSubmitting(false);
      showToast(t.saveErr);
      console.error(err);
    }
  };

  const handleResendEmergencyEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/emergency-email`, { method: 'POST' });
      if (res.ok) {
        showToast(language === 'Telugu' ? "అత్యవసర ఈమెయిల్ అలర్ట్ తిరిగి పంపబడింది!" : "Emergency alert email resent to admin successfully!");
        fetchComplaint();
      } else {
        showToast("Failed to send emergency email.");
      }
    } catch (err) {
      showToast("Failed to send emergency email.");
      console.error(err);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="skeleton skeleton-rect" style={{ height: '200px' }}></div>
        <div className="skeleton skeleton-text"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3 className="text-muted">Complaint not found</h3>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '16px' }}>← Back</button>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Submitted': return 'status-submitted';
      case 'Pending': return 'status-pending';
      case 'Assigned': return 'status-assigned';
      case 'In Progress': return 'status-in-progress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  };

  return (
    <div style={{ padding: '4px', textAlign: 'left' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-icon-only" style={{ width: '40px', height: '40px' }} onClick={onBack}>
          ←
        </button>
        <div>
          <h2 style={{ fontSize: '22px', color: 'var(--text-primary)' }}>{t.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>{t.subtitle}</p>
        </div>
      </div>

      {/* 🚨 CRITICAL EMERGENCY PROTOCOL BANNER */}
      {((complaint.complexity || complaint.priority) === 'Critical') && (
        <div className="emergency-siren-banner" style={{ marginBottom: '20px' }}>
          <div className="emergency-siren-icon">🚨</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="emergency-siren-badge">CRITICAL EMERGENCY PROTOCOL</span>
              <span style={{ fontSize: '15px', fontWeight: '900', color: '#DC2626' }}>
                {language === 'Telugu' ? 'తక్షణ ఫీల్డ్ అత్యవసర చర్య తప్పనిసరి' : 'Immediate On-Site Emergency Action Mandated'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {complaint.email_alert?.sent 
                ? `📧 Automated alert email delivered to Admin (${complaint.email_alert.sent_to}) at ${new Date(complaint.email_alert.timestamp).toLocaleTimeString()}`
                : `📧 Automated high-priority alert email sent to Admin & District Collectorate.`}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px', fontWeight: '750', whiteSpace: 'nowrap' }}
            onClick={handleResendEmergencyEmail}
            disabled={sendingEmail}
          >
            {sendingEmail ? 'Sending...' : '📧 Resend Alert Email'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Info & Evidence Card */}
        <div className="card" style={{ background: 'var(--surface-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
            <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)' }}>{complaint.id}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(() => {
                const rawP = complaint.complexity || complaint.priority || 'Medium';
                const pVal = rawP === 'Low' ? 'Normal' : rawP;
                return (
                  <span className={`priority-pill priority-${pVal.toLowerCase()}`}>
                    {pVal === 'Critical' ? '🚨 Critical (Emergency)' : pVal === 'High' ? '🟠 High' : pVal === 'Medium' ? '🟡 Medium' : '🟢 Normal'}
                  </span>
                );
              })()}
              <span className={`status-pill ${getStatusClass(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Resident details */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.resident}</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{complaint.resident_name}</div>
            </div>

            {/* Location Area */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.village}</div>
              <div style={{ fontSize: '15px', fontWeight: '750', color: 'var(--text-primary)', marginTop: '2px' }}>📍 {complaint.village_area}</div>
            </div>

            {/* Category & Priority details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.category}</div>
                <div style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>{complaint.complaint_category}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.priority}</div>
                <div style={{ marginTop: '4px' }}>
                  {(() => {
                    const rawP = complaint.complexity || complaint.priority || 'Medium';
                    const pVal = rawP === 'Low' ? 'Normal' : rawP;
                    return (
                      <span className={`priority-pill priority-${pVal.toLowerCase()}`}>
                        {pVal === 'Critical' ? '🚨 Critical (Emergency)' : pVal === 'High' ? '🟠 High' : pVal === 'Medium' ? '🟡 Medium' : '🟢 Normal'}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.language}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{complaint.language}</div>
              </div>
            </div>

            {/* Transcript */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{t.description}</div>
              <p style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', fontSize: '13.5px', border: '1px solid var(--border-color)', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                "{complaint.complaint_description_text}"
              </p>
            </div>

            {/* Audio Complaint Player */}
            {complaint.complaint_audio_url && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{t.audio}</div>
                <div className="audio-player-wrapper" style={{ background: 'var(--hover-bg)', borderColor: 'var(--border-color)' }}>
                  <span style={{ fontSize: '20px' }}>🔊</span>
                  <audio controls className="audio-player">
                    <source src={complaint.complaint_audio_url} type="audio/wav" />
                  </audio>
                </div>
              </div>
            )}

            {/* Coordinates */}
            {complaint.latitude !== 0 && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{t.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--hover-bg)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {complaint.latitude?.toFixed(5)}, {complaint.longitude?.toFixed(5)}
                  </span>
                  <a 
                    href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 12px', minHeight: '30px' }}
                  >
                    🗺️ {t.viewMap}
                  </a>
                </div>
              </div>
            )}

            {/* Photo Preview Card */}
            {complaint.photo_url && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{t.evidence}</div>
                <img 
                  src={complaint.photo_url} 
                  alt="Evidence attachment" 
                  style={{ width: '100%', borderRadius: '14px', border: '1px solid var(--border-color)', aspectRatio: '4/3', objectFit: 'cover' }} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Resolution Actions Card */}
        <div className="card" style={{ height: 'fit-content', background: 'var(--surface-color)' }}>
          <h3 style={{ fontSize: '17px', marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', fontWeight: '800' }}>
            ⚙️ {t.updateStatus}
          </h3>

          <form onSubmit={handleStatusUpdate}>
            {/* Priority Selector */}
            <div className="form-group">
              <label className="form-label">{t.priorityLabel}</label>
              <select 
                className="form-control" 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                style={{ fontWeight: '700' }}
              >
                <option value="Critical">🔴 {language === 'Telugu' ? 'అత్యవసరం (Critical - Emergency)' : 'Critical (Safety Emergency)'}</option>
                <option value="High">🟠 {language === 'Telugu' ? 'అధికం (High - Urgent Repair)' : 'High (Urgent Repair)'}</option>
                <option value="Medium">🟡 {language === 'Telugu' ? 'మధ్యస్థం (Medium - Attention Needed)' : 'Medium (Standard Attention)'}</option>
                <option value="Normal">🟢 {language === 'Telugu' ? 'సాధారణం (Normal - Routine Issue)' : 'Normal (Routine Issue)'}</option>
              </select>
            </div>

            {/* Status Selector */}
            <div className="form-group">
              <label className="form-label">{t.statusLabel}</label>
              <select 
                className="form-control" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Notes content */}
            <div className="form-group">
              <label className="form-label">{t.notesLabel}</label>
              <textarea 
                className="form-control" 
                style={{ minHeight: '130px' }}
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Actions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                💾 {t.save}
              </button>
              {complaint.status !== 'Resolved' && (
                <button 
                  type="button" 
                  className="btn btn-success btn-block"
                  onClick={handleMarkResolved}
                  disabled={submitting}
                >
                  ✅ {t.resolve}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
