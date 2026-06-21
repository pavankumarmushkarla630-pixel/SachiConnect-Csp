import React, { useState, useEffect } from 'react';

export default function ComplaintTracking({ complaintId, language, onBack, showToast }) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Rating states
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const t = {
    English: {
      title: "Grievance Status",
      subtitle: "Track the real-time resolution timeline of your complaint",
      detailsCard: "Grievance Details",
      id: "Complaint ID",
      category: "Category",
      village: "Village Area",
      date: "Date Submitted",
      status: "Current Status",
      description: "Description",
      evidence: "Photo Evidence",
      timeline: "Resolution Progress",
      back: "Back",
      loading: "Loading complaint status...",
      feedbackTitle: "Resolution Satisfaction Feedback",
      feedbackPrompt: "Rate the speed and quality of our resolution:",
      feedbackCommentsLabel: "Your Review / Comments (Optional)",
      feedbackSubmit: "Submit Satisfaction Review",
      feedbackSubmitted: "You rated this resolution:",
      feedbackComments: "Your Comments:"
    },
    Telugu: {
      title: "ఫిర్యాదు పురోగతి",
      subtitle: "మీ ఫిర్యాదు యొక్క నిజ-సమయ పరిష్కార టైమ్‌లైన్‌ను ట్రాక్ చేయండి",
      detailsCard: "ఫిర్యాదు వివరాలు",
      id: "ఫిర్యాదు ఐడి (ID)",
      category: "వర్గం",
      village: "గ్రామం / ప్రాంతం",
      date: "సమర్పించిన తేదీ",
      status: "ప్రస్తుత స్థితి",
      description: "సమస్య వివరణ",
      evidence: "జత చేసిన ఫోటో సాక్ష్యం",
      timeline: "పరిష్కార పురోగతి దశలు",
      back: "వెనుకకు",
      loading: "ఫిర్యాదు స్థితిని లోడ్ చేస్తున్నాము...",
      feedbackTitle: "పరిష్కార సంతృప్తి ఫీడ్‌బ్యాక్",
      feedbackPrompt: "పరిష్కారం యొక్క వేగం మరియు నాణ్యతను రేట్ చేయండి:",
      feedbackCommentsLabel: "మీ సమీక్ష / గమనికలు (ఐచ్ఛికం)",
      feedbackSubmit: "సంతృప్తి సమీక్షను సమర్పించండి",
      feedbackSubmitted: "మీరు ఇచ్చిన రేటింగ్:",
      feedbackComments: "మీ వ్యాఖ్యలు:"
    }
  }[language] || {
    title: "Grievance Status",
    subtitle: "Track the real-time resolution timeline of your complaint",
    detailsCard: "Grievance Details",
    id: "Complaint ID",
    category: "Category",
    village: "Village Area",
    date: "Date Submitted",
    status: "Current Status",
    description: "Description",
    evidence: "Photo Evidence",
    timeline: "Resolution Progress",
    back: "Back",
    loading: "Loading complaint status...",
    feedbackTitle: "Resolution Satisfaction Feedback",
    feedbackPrompt: "Rate the speed and quality of our resolution:",
    feedbackCommentsLabel: "Your Review / Comments (Optional)",
    feedbackSubmit: "Submit Satisfaction Review",
    feedbackSubmitted: "You rated this resolution:",
    feedbackComments: "Your Comments:"
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await fetch(`/api/complaints/${complaintId}`);
        if (res.ok) {
          const data = await res.json();
          setComplaint(data);
        } else {
          showToast("Failed to fetch complaint details");
        }
      } catch (err) {
        showToast("Connection Error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (complaintId) {
      fetchComplaint();
    }
  }, [complaintId]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast(language === 'Telugu' ? "దయచేసి రేటింగ్ ఇవ్వండి" : "Please select a star rating");
      return;
    }
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comments })
      });
      const data = await res.json();
      setSubmittingFeedback(false);
      if (data.success) {
        setComplaint(data.complaint);
        showToast(language === 'Telugu' ? "మీ ఫీడ్‌బ్యాక్ సమర్పించబడింది!" : "Feedback submitted successfully!");
      } else {
        showToast(data.message);
      }
    } catch (err) {
      setSubmittingFeedback(false);
      showToast("Failed to submit feedback");
      console.error(err);
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
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '16px' }}>← Go Back</button>
      </div>
    );
  }

  const timelineStages = ["Submitted", "Assigned", "In Progress", "Resolved"];
  
  const getStageStatus = (stage) => {
    const currentStatus = complaint.status;
    const currentIdx = timelineStages.indexOf(currentStatus);
    const stageIdx = timelineStages.indexOf(stage);

    if (stageIdx < currentIdx) return 'completed';
    if (stageIdx === currentIdx) return 'active';
    return 'pending';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Submitted': return 'status-submitted';
      case 'Assigned': return 'status-assigned';
      case 'In Progress': return 'status-in-progress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  };

  return (
    <div style={{ padding: '4px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-icon-only" style={{ width: '40px', height: '40px' }} onClick={onBack}>
          ←
        </button>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '22px', color: 'var(--text-primary)' }}>{t.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Details Card */}
      <div className="card" style={{ padding: '20px', textAlign: 'left', background: 'var(--surface-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.id}</div>
            <div style={{ fontSize: '18px', fontWeight: '850', color: 'var(--text-primary)', marginTop: '2px' }}>{complaint.id}</div>
          </div>
          <span className={`status-pill ${getStatusClass(complaint.status)}`}>
            {complaint.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.category}</div>
            <div style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>{complaint.complaint_category}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.date}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{new Date(complaint.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.village}</div>
          <div style={{ fontSize: '14px', fontWeight: '750', color: 'var(--text-primary)', marginTop: '2px' }}>📍 {complaint.village_area}</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{t.description}</div>
          <p style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', fontSize: '13.5px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontStyle: 'italic', lineHeight: '1.5' }}>
            "{complaint.complaint_description_text}"
          </p>
        </div>

        {/* Evidence Photo */}
        {complaint.photo_url && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{t.evidence}</div>
            <img 
              src={complaint.photo_url} 
              alt="Evidence attachment" 
              style={{ width: '100%', borderRadius: '14px', border: '1px solid var(--border-color)', aspectRatio: '4/3', objectFit: 'cover' }} 
            />
          </div>
        )}
      </div>

      {/* Ratings card */}
      {complaint.status === 'Resolved' && (
        <div className="card" style={{ textAlign: 'left', padding: '24px', background: 'var(--surface-color)' }}>
          <h3 style={{ fontSize: '16.5px', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', fontWeight: '800' }}>
            ⭐ {t.feedbackTitle}
          </h3>
          
          {complaint.feedback ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{t.feedbackSubmitted}</span>
                <span style={{ fontSize: '18px', color: 'var(--warning)', letterSpacing: '2px' }}>
                  {'★'.repeat(complaint.feedback.rating)}{'☆'.repeat(5 - complaint.feedback.rating)}
                </span>
                <span style={{ fontWeight: '800', fontSize: '13.5px', color: 'var(--text-primary)' }}>({complaint.feedback.rating}/5)</span>
              </div>
              {complaint.feedback.comments && (
                <div style={{ background: 'var(--hover-bg)', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', border: '1px solid var(--border-color)', marginTop: '8px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                  <strong>{t.feedbackComments}</strong> "{complaint.feedback.comments}"
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback}>
              <p style={{ fontSize: '13.5px', marginBottom: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {t.feedbackPrompt}
              </p>
              
              <div style={{ display: 'flex', gap: '12px', fontSize: '32px', cursor: 'pointer', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star}
                    style={{ color: star <= rating ? 'var(--warning)' : '#CBD5E1', transform: 'scale(1.1)', display: 'inline-block', transition: 'all 0.15s ease' }}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">{t.feedbackCommentsLabel}</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder={language === 'Telugu' ? "ఉదాహరణ: సేవ బాగుంది, వేగంగా పరిష్కరించబడింది..." : "e.g., Fast service and excellent work..."}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  style={{ padding: '10px 14px', fontSize: '13.5px' }}
                />
              </div>

              <button 
                type="submit"
                className="btn btn-success btn-block"
                style={{ minHeight: '40px', padding: '10px', fontSize: '14px' }}
                disabled={submittingFeedback}
              >
                {t.feedbackSubmit}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Visual Timeline Section */}
      <div className="card" style={{ textAlign: 'left', padding: '24px', background: 'var(--surface-color)' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: '800' }}>⚙️ {t.timeline}</h3>
        
        <div className="timeline">
          {timelineStages.map((stage) => {
            const stageStatus = getStageStatus(stage);
            const log = complaint.status_history?.find(h => h.status === stage);
            
            const stageHeader = language === 'Telugu' ? {
              "Submitted": "సమర్పించబడింది",
              "Assigned": "అధికారికి కేటాయించబడింది",
              "In Progress": "ప్రక్రియలో ఉంది",
              "Resolved": "పరిష్కరించబడింది"
            }[stage] : stage;

            return (
              <div 
                key={stage} 
                className={`timeline-item ${stageStatus === 'completed' ? 'completed' : stageStatus === 'active' ? 'active' : ''}`}
              >
                <div className="timeline-badge" style={{ borderColor: 'var(--surface-color)' }}></div>
                <div className="timeline-content" style={{ opacity: stageStatus === 'pending' ? 0.5 : 1, background: 'var(--hover-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="timeline-title">
                    <span style={{ color: 'var(--text-primary)' }}>{stageHeader}</span>
                    {log && (
                      <span className="timeline-date">
                        {new Date(log.updated_at).toLocaleDateString()} {new Date(log.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {log ? (
                    <div className="timeline-desc" style={{ color: 'var(--text-secondary)' }}>{log.notes}</div>
                  ) : (
                    <div className="timeline-desc" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      {stage === 'Assigned' ? 'Pending assignment' : stage === 'In Progress' ? 'Pending work initiation' : 'Pending resolution'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn btn-secondary btn-block" onClick={onBack} style={{ marginBottom: '20px' }}>
        ← {t.back}
      </button>
    </div>
  );
}
