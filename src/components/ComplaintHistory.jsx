import React, { useState, useEffect } from 'react';

export default function ComplaintHistory({ user, language, onTrackComplaint, onBack, showToast }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Sorting & Pagination states
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const t = {
    English: {
      title: "My Grievances",
      subtitle: "View and track the status of all your submitted complaints",
      searchPlaceholder: "Search by ID or description...",
      all: "All Reports",
      submitted: "Submitted",
      inProgress: "In Progress",
      resolved: "Resolved",
      noComplaints: "You haven't filed any complaints yet.",
      noResults: "No matching complaints found.",
      id: "ID",
      date: "Filed on",
      back: "Back to Dashboard",
      sortNewest: "Newest First",
      sortOldest: "Oldest First",
      showing: "Showing",
      to: "to",
      of: "of",
      entries: "entries",
      prev: "Previous",
      next: "Next"
    },
    Telugu: {
      title: "నా ఫిర్యాదులు",
      subtitle: "మీరు సమర్పించిన అన్ని ఫిర్యాదుల స్థితిని వీక్షించండి మరియు ట్రాక్ చేయండి",
      searchPlaceholder: "ID లేదా వివరణ ద్వారా శోధించండి...",
      all: "అన్ని నివేదికలు",
      submitted: "సమర్పించబడింది",
      inProgress: "ప్రక్రియలో ఉంది",
      resolved: "పరిష్కరించబడింది",
      noComplaints: "మీరు ఇంకా ఎలాంటి ఫిర్యాదులు దాఖలు చేయలేదు.",
      noResults: "సరిపోలే ఫిర్యాదులు ఏవీ కనుగొనబడలేదు.",
      id: "ఐడి",
      date: "దాఖలు చేసిన తేదీ",
      back: "తిరిగి డాష్‌బోర్డ్‌కు",
      sortNewest: "తాజావి ముందు",
      sortOldest: "పాతవి ముందు",
      showing: "చూపిస్తున్నాము",
      to: "నుండి",
      of: "లో",
      entries: "ఫిర్యాదులు",
      prev: "వెనుకకు",
      next: "తరువాత"
    }
  }[language] || {
    title: "My Grievances",
    subtitle: "View and track the status of all your submitted complaints",
    searchPlaceholder: "Search by ID or description...",
    all: "All Reports",
    submitted: "Submitted",
    inProgress: "In Progress",
    resolved: "Resolved",
    noComplaints: "You haven't filed any complaints yet.",
    noResults: "No matching complaints found.",
    id: "ID",
    date: "Filed on",
    back: "Back to Dashboard",
    sortNewest: "Newest First",
    sortOldest: "Oldest First",
    showing: "Showing",
    to: "to",
    of: "of",
    entries: "entries",
    prev: "Previous",
    next: "Next"
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const phoneParam = user?.phone ? `&resident_phone=${encodeURIComponent(user.phone)}` : '';
        const nameParam = user?.name ? `&resident_name=${encodeURIComponent(user.name)}` : '';
        const res = await fetch(`/api/complaints?role=Resident${phoneParam}${nameParam}`);
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        }
      } catch (err) {
        showToast("Error loading complaints");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user.name, user.phone]);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.complaint_description_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.complaint_category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Submitted') return matchesSearch && (c.status === 'Submitted' || c.status === 'Assigned');
    if (activeFilter === 'In Progress') return matchesSearch && c.status === 'In Progress';
    if (activeFilter === 'Resolved') return matchesSearch && c.status === 'Resolved';
    return matchesSearch;
  });

  // Sort complaints
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else {
      return new Date(a.created_at) - new Date(b.created_at);
    }
  });

  // Pagination bounds
  const totalEntries = sortedComplaints.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedComplaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalEntries / itemsPerPage);

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
          <h2 style={{ fontSize: '22px' }}>{t.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Control panel (Filters, Search, Sort) */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search bar */}
          <div style={{ flex: '1 1 240px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ padding: '10px 14px', fontSize: '13.5px' }}
            />
          </div>

          {/* Sorter selection drop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>⇅</span>
            <select
              className="form-control"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ width: '130px', padding: '8px 10px', fontSize: '12.5px' }}
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
            </select>
          </div>
        </div>

        {/* Tab filters list */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          {['All', 'Submitted', 'In Progress', 'Resolved'].map(filter => (
            <button 
              key={filter} 
              className={`btn ${activeFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                padding: '6px 14px', 
                fontSize: '12.5px', 
                borderRadius: '20px', 
                minHeight: '32px'
              }}
              onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
            >
              {filter === 'All' ? t.all : filter === 'Submitted' ? t.submitted : filter === 'In Progress' ? t.inProgress : t.resolved}
            </button>
          ))}
        </div>
      </div>

      {/* Grievance Listing Table / Grid */}
      <div className="card" style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="skeleton skeleton-text" style={{ height: '52px', borderRadius: '12px' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '52px', borderRadius: '12px' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '52px', borderRadius: '12px' }}></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">{t.noComplaints}</div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">{t.noResults}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentItems.map(item => (
              <div 
                key={item.id} 
                className="card-interactive"
                onClick={() => onTrackComplaint(item.id)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '18px 20px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '14px',
                  cursor: 'pointer',
                  background: 'var(--surface-color)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '15.5px', color: 'var(--text-primary)' }}>{item.id}</span>
                    <span style={{ margin: '0 8px', color: 'var(--border-color)' }}>|</span>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>{item.complaint_category}</span>
                  </div>
                  <span className={`status-pill ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', marginBottom: '12px', fontWeight: '500', lineHeight: '1.5' }}>
                  {item.complaint_description_text}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  <span>📍 {item.village_area}</span>
                  <span>{t.date}: {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {/* Pagination Controls HUD */}
            {totalPages > 1 && (
              <div className="table-pagination">
                <span>
                  {t.showing} <strong>{indexOfFirstItem + 1}</strong> {t.to} <strong>{Math.min(indexOfLastItem, totalEntries)}</strong> {t.of} <strong>{totalEntries}</strong> {t.entries}
                </span>
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    {t.prev}
                  </button>
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button className="btn btn-secondary btn-block" onClick={onBack} style={{ marginTop: '16px' }}>
        ← {t.back}
      </button>
    </div>
  );
}
