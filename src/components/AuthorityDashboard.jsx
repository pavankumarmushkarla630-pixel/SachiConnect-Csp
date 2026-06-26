import React, { useState, useEffect } from 'react';

export default function AuthorityDashboard({ user, language, onSelectComplaint, showToast, onLogout }) {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState({ 
    total: 0, 
    byCategory: {}, 
    byStatus: {}, 
    monthlyCount: {},
    averageRating: 0.0,
    feedbackCount: 0,
    recentFeedbacks: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'map', or 'analytics'
  const [officialLocation, setOfficialLocation] = useState(() => {
    const saved = localStorage.getItem('sachivalayam_official_location');
    if (saved) return saved;
    if (user?.village && ['Kothacheruvu', 'Bukkarayasamudram', 'Rapthadu'].includes(user.village)) {
      return user.village;
    }
    return '';
  });

  useEffect(() => {
    if (officialLocation) {
      setSelectedVillageMap(officialLocation);
    } else {
      setSelectedVillageMap('All');
    }
  }, [officialLocation]);

  const [selectedVillageMap, setSelectedVillageMap] = useState('All'); // GIS Map selection filter
  const [hoveredVillage, setHoveredVillage] = useState(null); // Map hover tooltip state

  const categories = ["Roads", "Streetlights", "Water Supply", "Drainage", "Sanitation", "Public Facilities", "Other"];
  const statuses = ["Submitted", "Assigned", "In Progress", "Resolved"];

  const t = {
    English: {
      title: "Sachivalayam Portal",
      subtitle: "Grievance Management Dashboard",
      tabList: "Grievance List",
      tabMap: "GIS Hotspot Map",
      tabAnalytics: "Analytics & Reports",
      total: "Total Complaints",
      submitted: "Submitted",
      inProgress: "In Progress",
      resolved: "Resolved",
      searchPlaceholder: "Search by ID, resident name, or village...",
      filterStatus: "Status",
      filterCategory: "Category",
      noComplaints: "No complaints found.",
      id: "ID",
      resident: "Resident",
      village: "Village",
      date: "Date",
      actions: "Actions",
      viewDetails: "View Details",
      charts: {
        byCat: "Complaints by Category",
        byStatus: "Complaints by Status",
        monthly: "Monthly Grievance Inflow",
        ratingTitle: "Resident Satisfaction Rating",
        recentReviews: "Recent Resident Reviews",
        ratingStats: "Total Ratings Received",
        noReviews: "No feedback ratings received yet."
      },
      mapHUDTitle: "Village GIS View",
      mapHUDSub: "Click a region to filter complaints",
      mapReset: "Clear Map Filter",
      logout: "Log Out"
    },
    Telugu: {
      title: "సచివాలయం పోర్టల్",
      subtitle: "ఫిర్యాదుల నిర్వహణ డాష్‌బోర్డ్",
      tabList: "ఫిర్యాదుల జాబితా",
      tabMap: "జీఐఎస్ (GIS) హాట్‌స్పాట్ మ్యాప్",
      tabAnalytics: "విశ్లేషణలు & నివేదికలు",
      total: "మొత్తం ఫిర్యాదులు",
      submitted: "సమర్పించబడినవి",
      inProgress: "ప్రక్రియలో ఉన్నవి",
      resolved: "పరిష్కరించబడినవి",
      searchPlaceholder: "ID, నివాసి పేరు లేదా గ్రామం ద్వారా శోధించండి...",
      filterStatus: "స్థితి",
      filterCategory: "వర్గం",
      noComplaints: "ఫిర్యాదులు ఏవీ కనుగొనబడలేదు.",
      id: "ఐడి",
      resident: "నివాసి",
      village: "గ్రామం",
      date: "తేదీ",
      actions: "చర్యలు",
      viewDetails: "వివరాలు",
      charts: {
        byCat: "వర్గం వారీగా ఫిర్యాదులు",
        byStatus: "స్థితి వారీగా ఫిర్యాదులు",
        monthly: "నెలవారీ ఫిర్యాదుల ప్రవాహం",
        ratingTitle: "నివాసితుల సంతృప్తి రేటింగ్",
        recentReviews: "ఇటీవలి నివాసితుల సమీక్షలు",
        ratingStats: "మొత్తం రేటింగ్‌లు",
        noReviews: "ఇంకా ఎలాంటి రేటింగ్‌లు అందలేదు."
      },
      mapHUDTitle: "గ్రామ జీఐఎస్ మ్యాప్",
      mapHUDSub: "ఫిర్యాదులను ఫిల్టర్ చేయడానికి ప్రాంతంపై క్లిక్ చేయండి",
      mapReset: "మ్యాప్ ఫిల్టర్ తీసివేయి",
      logout: "లాగ్ అవుట్"
    }
  }[language] || {
    title: "Sachivalayam Portal",
    subtitle: "Grievance Management Dashboard",
    tabList: "Grievance List",
    tabMap: "GIS Hotspot Map",
    tabAnalytics: "Analytics & Reports",
    total: "Total Complaints",
    submitted: "Submitted",
    inProgress: "In Progress",
    resolved: "Resolved",
    searchPlaceholder: "Search by ID, resident name, or village...",
    filterStatus: "Status",
    filterCategory: "Category",
    noComplaints: "No complaints found.",
    id: "ID",
    resident: "Resident",
    village: "Village",
    date: "Date",
    actions: "Actions",
    viewDetails: "View Details",
    charts: {
      byCat: "Complaints by Category",
      byStatus: "Complaints by Status",
      monthly: "Monthly Grievance Inflow",
      ratingTitle: "Resident Satisfaction Rating",
      recentReviews: "Recent Resident Reviews",
      ratingStats: "Total Ratings Received",
      noReviews: "No feedback ratings received yet."
    },
    mapHUDTitle: "Village GIS View",
    mapHUDSub: "Click a region to filter complaints",
    mapReset: "Clear Map Filter",
    logout: "Log Out"
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsRes = await fetch('/api/complaints');
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        setComplaints(complaintsData);
      }

      const analyticsRes = await fetch('/api/analytics');
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      showToast("Error connecting to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter complaints list
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.resident_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.village_area.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.complaint_description_text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.complaint_category === categoryFilter;
    const matchesMapVillage = selectedVillageMap === 'All' || c.village_area.toLowerCase() === selectedVillageMap.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesMapVillage;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'Submitted': return 'status-submitted';
      case 'Assigned': return 'status-assigned';
      case 'In Progress': return 'status-in-progress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  };

  // Calculate local hotspot statistics for GIS map
  const getVillageStats = (villageName) => {
    const villageComplaints = complaints.filter(c => c.village_area.toLowerCase() === villageName.toLowerCase());
    const unresolved = villageComplaints.filter(c => c.status !== 'Resolved').length;
    const resolved = villageComplaints.filter(c => c.status === 'Resolved').length;
    return {
      total: villageComplaints.length,
      unresolved,
      resolved
    };
  };

  const kothacheruvuStats = getVillageStats('Kothacheruvu');
  const rapthaduStats = getVillageStats('Rapthadu');
  const bukkStats = getVillageStats('Bukkarayasamudram');

  // Pre-calculate max counts for CSS bar charts proportions
  const catValues = Object.values(analytics.byCategory);
  const maxCatVal = catValues.length > 0 ? Math.max(...catValues, 1) : 1;

  const statusValues = Object.values(analytics.byStatus);
  const maxStatusVal = statusValues.length > 0 ? Math.max(...statusValues, 1) : 1;

  const monthValues = Object.values(analytics.monthlyCount);
  const handleSetOfficialLocation = (e) => {
    e.preventDefault();
    const loc = e.target.elements.officialLocSelect.value;
    if (loc) {
      setOfficialLocation(loc);
      localStorage.setItem('sachivalayam_official_location', loc);
      showToast(language === 'Telugu' ? `కార్యాలయ స్థానం దీనికి సెట్ చేయబడింది: ${loc}` : `Jurisdiction set to ${loc}`);
    }
  };

  return (
    <div className="app-main-content">
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '26px', color: 'var(--text-primary)' }}>{t.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
            💼 {t.subtitle} | {user.name}
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <span className="stat-label">{t.total}</span>
          <span className="stat-value">{analytics.total || complaints.length}</span>
        </div>
        <div className="stat-card submitted">
          <span className="stat-label">{t.submitted}</span>
          <span className="stat-value">{(analytics.byStatus?.Submitted || 0) + (analytics.byStatus?.Assigned || 0)}</span>
        </div>
        <div className="stat-card in-progress">
          <span className="stat-label">{t.inProgress}</span>
          <span className="stat-value">{analytics.byStatus?.['In Progress'] || 0}</span>
        </div>
        <div className="stat-card resolved">
          <span className="stat-label">{t.resolved}</span>
          <span className="stat-value">{analytics.byStatus?.Resolved || 0}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '20px', gap: '20px' }}>
        <button 
          style={{ 
            padding: '12px 6px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'list' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('list')}
        >
          📋 {t.tabList}
        </button>
        <button 
          style={{ 
            padding: '12px 6px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'map' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'map' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('map')}
        >
          🗺️ {t.tabMap}
        </button>
        <button 
          style={{ 
            padding: '12px 6px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'analytics' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('analytics')}
        >
          📊 {t.tabAnalytics}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          <div className="skeleton skeleton-rect"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      ) : activeTab === 'list' ? (
        /* LIST VIEW */
        <div>
          {/* Filters Bar */}
          <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              
              {/* Search */}
              <div style={{ flex: '1 1 300px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={t.searchPlaceholder} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '10px 14px', fontSize: '14px' }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>{t.filterStatus}:</span>
                <select 
                  className="form-control" 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '13px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Category Filter */}
              <div style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>{t.filterCategory}:</span>
                <select 
                  className="form-control" 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '13px' }}
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* GIS Map Filter Banner */}
              {selectedVillageMap !== 'All' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '6px 12px', borderRadius: '30px', fontSize: '12.5px', color: 'var(--primary)', fontWeight: '700' }}>
                  📍 Map: {selectedVillageMap}
                  <button 
                    onClick={() => setSelectedVillageMap('All')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                    title={t.mapReset}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table list */}
          <div className="card" style={{ padding: '0', overflowX: 'auto', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{t.id}</th>
                  <th>{t.resident}</th>
                  <th>{t.village}</th>
                  <th>{t.filterCategory}</th>
                  <th>{t.filterStatus}</th>
                  <th>{t.date}</th>
                  <th style={{ textAlign: 'center' }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {t.noComplaints}
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '800', fontSize: '14px' }}>{c.id}</td>
                      <td style={{ fontWeight: '500' }}>{c.resident_name}</td>
                      <td>📍 {c.village_area}</td>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{c.complaint_category}</td>
                      <td>
                        <span className={`status-pill ${getStatusClass(c.status)}`} style={{ fontSize: '11px' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 14px', fontSize: '12px', minHeight: '32px' }}
                          onClick={() => onSelectComplaint(c.id)}
                        >
                          {t.viewDetails}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'map' ? (
        /* GIS MAP VIEW */
        !officialLocation ? (
          <div style={{ maxWidth: '480px', margin: '40px auto', animation: 'stepEnter 0.4s ease-out', width: '100%' }}>
            <div className="card" style={{ padding: '32px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {language === 'Telugu' ? 'కార్యాలయ స్థానాన్ని నమోదు చేయండి' : 'Enter Jurisdiction Location'}
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5', fontWeight: '500' }}>
                {language === 'Telugu' 
                  ? 'ఇంటరాక్టివ్ గ్రామ జీఐఎస్ మ్యాప్‌ను చూడటానికి, దయచేసి మీ కేటాయించిన గ్రామ సచివాలయాన్ని ఎంచుకోండి.' 
                  : 'To view the interactive Village GIS Hotspot Map, please select your assigned village secretariat.'}
              </p>
              <form onSubmit={handleSetOfficialLocation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <select 
                  name="officialLocSelect"
                  className="form-control"
                  style={{ 
                    padding: '12px 14px', 
                    borderRadius: '12px', 
                    border: '1.5px solid var(--border-color)', 
                    background: 'var(--surface-color)', 
                    color: 'var(--text-primary)', 
                    fontWeight: '700', 
                    fontSize: '14.5px', 
                    outline: 'none',
                    cursor: 'pointer',
                    height: '48px'
                  }}
                  required
                >
                  <option value="">{language === 'Telugu' ? '-- సచివాలయాన్ని ఎంచుకోండి --' : '-- Select Secretariat --'}</option>
                  <option value="Kothacheruvu">Kothacheruvu (కొత్తచెరువు)</option>
                  <option value="Bukkarayasamudram">Bukkarayasamudram (బుక్కరాయసముద్రం)</option>
                  <option value="Rapthadu">Rapthadu (రాప్తాడు)</option>
                </select>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '12px', borderRadius: '12px', fontWeight: '800', fontSize: '14.5px', height: '48px', background: '#2563EB', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  {language === 'Telugu' ? 'ధృవీకరించండి & మ్యాప్ చూడండి' : 'Confirm & View GIS Map'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Interactive SVG Map Card */}
            <div className="card" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '17px', marginBottom: '4px', color: 'var(--text-primary)' }}>🗺️ {t.mapHUDTitle}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.mapHUDSub}</p>
                </div>
                <button 
                  onClick={() => {
                    setOfficialLocation('');
                    localStorage.removeItem('sachivalayam_official_location');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)'
                  }}
                >
                  🔄 {language === 'Telugu' ? 'స్థానం మార్చు' : 'Change Location'}
                </button>
              </div>
              
              <div style={{ position: 'relative', width: '100%', background: 'var(--hover-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <svg viewBox="0 0 300 260" style={{ width: '100%', height: 'auto', maxHeight: '350px' }}>
                  {/* Background Connection Paths */}
                  <path d="M 40,20 Q 150,80 260,20" fill="none" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 150,80 Q 70,180 40,220" fill="none" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 150,80 Q 220,180 260,220" fill="none" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />

                  {/* Animated Glowing Flow Overlays */}
                  <path d="M 40,20 Q 150,80 260,20" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" className="gis-flow-path" style={{ opacity: 0.5 }} />
                  <path d="M 150,80 Q 70,180 40,220" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" className="gis-flow-path" style={{ opacity: 0.5 }} />
                  <path d="M 150,80 Q 220,180 260,220" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" className="gis-flow-path" style={{ opacity: 0.5 }} />

                  {/* Bukkarayasamudram */}
                  <g 
                    className="gis-village-region"
                    style={{ cursor: 'pointer' }} 
                    onClick={() => setSelectedVillageMap(selectedVillageMap === 'Bukkarayasamudram' ? 'All' : 'Bukkarayasamudram')}
                    onMouseEnter={() => setHoveredVillage('Bukkarayasamudram')}
                    onMouseLeave={() => setHoveredVillage(null)}
                  >
                    <rect x="180" y="30" width="100" height="50" rx="8" fill={selectedVillageMap === 'Bukkarayasamudram' ? 'rgba(37, 99, 235, 0.15)' : 'var(--surface-color)'} stroke={selectedVillageMap === 'Bukkarayasamudram' ? 'var(--primary)' : 'var(--border-color)'} strokeWidth="1.5" style={{ transition: 'var(--transition-smooth)' }} />
                    <text x="230" y="52" fontSize="9" fontWeight="800" textAnchor="middle" fill="var(--text-primary)">Bukkarayasamudram</text>
                    
                    <circle cx="230" cy="65" r="5" fill={bukkStats.unresolved > 0 ? 'var(--error)' : 'var(--success)'} />
                    {bukkStats.unresolved > 0 && <circle cx="230" cy="65" r="10" fill="none" stroke="var(--error)" strokeWidth="1.5" style={{ transformOrigin: '230px 65px', animation: 'pulseRing 1.5s infinite' }} />}
                  </g>

                  {/* Kothacheruvu */}
                  <g 
                    className="gis-village-region"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedVillageMap(selectedVillageMap === 'Kothacheruvu' ? 'All' : 'Kothacheruvu')}
                    onMouseEnter={() => setHoveredVillage('Kothacheruvu')}
                    onMouseLeave={() => setHoveredVillage(null)}
                  >
                    <rect x="100" y="105" width="100" height="50" rx="8" fill={selectedVillageMap === 'Kothacheruvu' ? 'rgba(37, 99, 235, 0.15)' : 'var(--surface-color)'} stroke={selectedVillageMap === 'Kothacheruvu' ? 'var(--primary)' : 'var(--border-color)'} strokeWidth="1.5" style={{ transition: 'var(--transition-smooth)' }} />
                    <text x="150" y="128" fontSize="9" fontWeight="800" textAnchor="middle" fill="var(--text-primary)">Kothacheruvu</text>
                    
                    <circle cx="150" cy="140" r="5" fill={kothacheruvuStats.unresolved > 0 ? 'var(--error)' : 'var(--success)'} />
                    {kothacheruvuStats.unresolved > 0 && <circle cx="150" cy="140" r="10" fill="none" stroke="var(--error)" strokeWidth="1.5" style={{ transformOrigin: '150px 140px', animation: 'pulseRing 1.5s infinite' }} />}
                  </g>

                  {/* Rapthadu */}
                  <g 
                    className="gis-village-region"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedVillageMap(selectedVillageMap === 'Rapthadu' ? 'All' : 'Rapthadu')}
                    onMouseEnter={() => setHoveredVillage('Rapthadu')}
                    onMouseLeave={() => setHoveredVillage(null)}
                  >
                    <rect x="20" y="180" width="100" height="50" rx="8" fill={selectedVillageMap === 'Rapthadu' ? 'rgba(37, 99, 235, 0.15)' : 'var(--surface-color)'} stroke={selectedVillageMap === 'Rapthadu' ? 'var(--primary)' : 'var(--border-color)'} strokeWidth="1.5" style={{ transition: 'var(--transition-smooth)' }} />
                    <text x="70" y="202" fontSize="9" fontWeight="800" textAnchor="middle" fill="var(--text-primary)">Rapthadu</text>
                    
                    <circle cx="70" cy="215" r="5" fill={rapthaduStats.unresolved > 0 ? 'var(--error)' : 'var(--success)'} />
                    {rapthaduStats.unresolved > 0 && <circle cx="70" cy="215" r="10" fill="none" stroke="var(--error)" strokeWidth="1.5" style={{ transformOrigin: '70px 215px', animation: 'pulseRing 1.5s infinite' }} />}
                  </g>
                </svg>

                {/* Dynamic Overlay HUD Tooltip */}
                {hoveredVillage && (
                  <div 
                    className="gis-tooltip"
                    style={{
                      position: 'absolute',
                      background: 'var(--surface-color)',
                      border: '1.5px solid var(--primary)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      boxShadow: 'var(--hover-shadow)',
                      pointerEvents: 'none',
                      zIndex: 10,
                      fontSize: '12.5px',
                      width: '180px',
                      textAlign: 'left',
                      ...(hoveredVillage === 'Bukkarayasamudram' && { right: '24px', top: '24px' }),
                      ...(hoveredVillage === 'Kothacheruvu' && { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }),
                      ...(hoveredVillage === 'Rapthadu' && { left: '24px', bottom: '24px' })
                    }}
                  >
                    <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '13px', marginBottom: '6px' }}>📍 {hoveredVillage}</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{getVillageStats(hoveredVillage).total}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Active:</span>
                        <strong style={{ color: 'var(--error)' }}>{getVillageStats(hoveredVillage).unresolved}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Resolved:</span>
                        <strong style={{ color: 'var(--success)' }}>{getVillageStats(hoveredVillage).resolved}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GIS Details HUD Card */}
            <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '17px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                📍 {selectedVillageMap === 'All' ? 'All Villages Combined' : selectedVillageMap}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--hover-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Complaints</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {selectedVillageMap === 'All' ? complaints.length : getVillageStats(selectedVillageMap).total}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(239, 68, 68, 0.08)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--error)' }}>Unresolved/Active</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--error)' }}>
                    {selectedVillageMap === 'All' ? complaints.filter(c => c.status !== 'Resolved').length : getVillageStats(selectedVillageMap).unresolved}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(34, 197, 94, 0.08)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--success)' }}>Resolved</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)' }}>
                    {selectedVillageMap === 'All' ? complaints.filter(c => c.status === 'Resolved').length : getVillageStats(selectedVillageMap).resolved}
                  </span>
                </div>

                {selectedVillageMap !== 'All' && (
                  <button className="btn btn-primary btn-block" style={{ fontSize: '13.5px', padding: '10px' }} onClick={() => setActiveTab('list')}>
                    🔍 View Grievances List
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        /* ANALYTICS CHARTS & RATINGS VIEW */
        <div>
          {/* Top Rating Score Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', marginBottom: '0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.06)', border: '4px solid var(--warning)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)' }}>{analytics.averageRating?.toFixed(1) || '0.0'}</span>
                <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)' }}>/ 5.0</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.charts.ratingTitle}</h4>
                <div style={{ display: 'flex', fontSize: '20px', color: 'var(--warning)', marginTop: '6px', gap: '2px' }}>
                  {'★'.repeat(Math.round(analytics.averageRating || 0))}{'☆'.repeat(5 - Math.round(analytics.averageRating || 0))}
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' }}>
                  Based on {analytics.feedbackCount} evaluations
                </p>
              </div>
            </div>
          </div>

          <div className="charts-container" style={{ marginTop: '0' }}>
            {/* Category Chart */}
            <div className="chart-box">
              <h3 className="chart-title">📊 {t.charts.byCat}</h3>
              <div className="bar-chart">
                {categories.map(cat => {
                  const count = analytics.byCategory[cat] || 0;
                  const widthPercent = (count / maxCatVal) * 100;
                  
                  return (
                    <div key={cat} className="bar-row">
                      <span className="bar-label" style={{ color: 'var(--text-primary)' }}>{cat}</span>
                      <div className="bar-wrapper">
                        <div className="bar-fill" style={{ width: `${widthPercent}%` }}></div>
                      </div>
                      <span className="bar-value">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Chart */}
            <div className="chart-box">
              <h3 className="chart-title">⚙️ {t.charts.byStatus}</h3>
              <div className="bar-chart">
                {statuses.map(status => {
                  const count = status === 'Submitted' 
                    ? (analytics.byStatus?.Submitted || 0) + (analytics.byStatus?.Assigned || 0)
                    : analytics.byStatus[status] || 0;
                  const widthPercent = (count / maxStatusVal) * 100;
                  
                  let fillBg = 'var(--primary)';
                  if (status === 'Assigned') fillBg = 'var(--warning)';
                  if (status === 'In Progress') fillBg = '#EA580C';
                  if (status === 'Resolved') fillBg = 'var(--success)';

                  return (
                    <div key={status} className="bar-row">
                      <span className="bar-label" style={{ color: 'var(--text-primary)' }}>{status}</span>
                      <div className="bar-wrapper">
                        <div className="bar-fill" style={{ width: `${widthPercent}%`, background: fillBg }}></div>
                      </div>
                      <span className="bar-value">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback Reviews feed */}
            <div className="chart-box" style={{ gridColumn: 'span 1' }}>
              <h3 className="chart-title">✍️ {t.charts.recentReviews}</h3>
              {!analytics.recentFeedbacks || analytics.recentFeedbacks.length === 0 ? (
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', padding: '20px 0' }}>
                  {t.charts.noReviews}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                  {analytics.recentFeedbacks.map((f, idx) => (
                    <div key={idx} style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '750', color: 'var(--text-primary)' }}>{f.resident_name} ({f.id})</span>
                        <span style={{ color: 'var(--warning)', letterSpacing: '1px' }}>
                          {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontStyle: f.comments ? 'italic' : 'normal' }}>
                        {f.comments ? `"${f.comments}"` : "No comment submitted"}
                      </p>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '6px', textAlign: 'right' }}>
                        {new Date(f.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inflow Timeline Chart */}
            <div className="chart-box">
              <h3 className="chart-title">📈 {t.charts.monthly}</h3>
              {Object.keys(analytics.monthlyCount).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No historical data.</div>
              ) : (
                <div>
                  <div className="col-chart">
                    {Object.entries(analytics.monthlyCount).map(([month, count]) => {
                      const heightPercent = (count / maxMonthVal) * 100;
                      return (
                        <div key={month} className="col-bar-container">
                          <div className="col-fill" style={{ height: `${heightPercent || 10}%`, background: 'linear-gradient(to top, var(--primary), var(--secondary))' }}>
                            <span className="col-value" style={{ color: 'var(--text-primary)' }}>{count}</span>
                          </div>
                          <span className="col-label" style={{ color: 'var(--text-secondary)' }}>{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
