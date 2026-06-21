import React, { useState, useEffect } from 'react';

// ── Welfare Schemes Data ────────────────────────────────────────────────────
const WELFARE_SCHEMES = [
  {
    id: 1,
    icon: '👴',
    category: 'Senior',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg,#7C3AED22,#7C3AED08)',
    border: '#7C3AED',
    name: 'YSR Pension Kanuka',
    teluguName: 'వైఎస్ఆర్ పెన్షన్ కానుక',
    tagline: 'Monthly financial support for senior citizens',
    amount: '₹2,750/month',
    eligibility: 'Age ≥ 60 · Annual income ≤ ₹1,20,000',
    benefits: ['Direct bank transfer monthly', 'No middleman required', 'Covers medical emergencies', 'Automatic renewal'],
    documents: ['Aadhaar Card', 'Bank Passbook', 'Income Certificate'],
  },
  {
    id: 2,
    icon: '📚',
    category: 'Education',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg,#0EA5E922,#0EA5E908)',
    border: '#0EA5E9',
    name: 'Jagananna Amma Vodi',
    teluguName: 'జగనన్న అమ్మ ఒడి',
    tagline: 'Annual support for mothers of school-going children',
    amount: '₹15,000/year',
    eligibility: 'Children aged 5–18 · Annual income ≤ ₹1,20,000',
    benefits: ['Direct to mother\'s account', 'Valid for all classes 1–12', 'Covers school fees & uniforms', 'Applicable for Govt. & aided schools'],
    documents: ['Aadhaar Card', 'Child\'s School Enrollment', 'Income Certificate'],
  },
  {
    id: 3,
    icon: '🌾',
    category: 'Farmer',
    color: '#22C55E',
    gradient: 'linear-gradient(135deg,#22C55E22,#22C55E08)',
    border: '#22C55E',
    name: 'YSR Rythu Bharosa',
    teluguName: 'వైఎస్ఆర్ రైతు భరోసా',
    tagline: 'Annual investment support for farmers',
    amount: '₹13,500/year',
    eligibility: 'Must own agricultural land · Annual income ≤ ₹2,00,000',
    benefits: ['Paid in 3 instalments', 'Covers seeds & fertilisers', 'Zero-interest crop loans', 'Free crop insurance'],
    documents: ['Land Passbook (Pattadar)', 'Aadhaar Card', 'Bank Passbook'],
  },
  {
    id: 4,
    icon: '🏠',
    category: 'Housing',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg,#F59E0B22,#F59E0B08)',
    border: '#F59E0B',
    name: 'Jagananna Housing Scheme',
    teluguName: 'జగనన్న ఇళ్ల స్థలాలు',
    tagline: 'Free housing plots for the underprivileged',
    amount: 'Free plot + ₹1.80 Lakh',
    eligibility: 'Annual income ≤ ₹1,50,000 · Land holdings < 2.5 acres',
    benefits: ['Free residential plot', 'Construction support grant', 'Priority for SC/ST/women', 'Legal ownership documents'],
    documents: ['Income Certificate', 'Ration Card', 'Aadhaar Card', 'Caste Certificate (if applicable)'],
  },
  {
    id: 5,
    icon: '💊',
    category: 'Health',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg,#EF444422,#EF444408)',
    border: '#EF4444',
    name: 'YSR Aarogyasri',
    teluguName: 'వైఎస్ఆర్ ఆరోగ్యశ్రీ',
    tagline: 'Free health insurance for BPL families',
    amount: '₹5 Lakh coverage/year',
    eligibility: 'BPL families · White/Yellow ration card holders',
    benefits: ['Cashless treatment at 1,000+ hospitals', 'Covers 2,500+ procedures', 'Emergency ambulance included', 'No premium required'],
    documents: ['White/Yellow Ration Card', 'Aadhaar Card'],
  },
  {
    id: 6,
    icon: '👩',
    category: 'Women',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg,#EC489922,#EC489908)',
    border: '#EC4899',
    name: 'YSR Cheyutha',
    teluguName: 'వైఎస్ఆర్ చేయూత',
    tagline: 'Annual financial support for BC/SC/ST/minority women',
    amount: '₹18,750/year',
    eligibility: 'Women aged 45–60 · BC/SC/ST/Minority categories',
    benefits: ['Direct bank transfer', 'No middleman', 'Livelihood support', 'Skill development access'],
    documents: ['Aadhaar Card', 'Caste Certificate', 'Bank Passbook', 'Income Certificate'],
  },
];

const CATEGORIES = ['All', 'Senior', 'Education', 'Farmer', 'Housing', 'Health', 'Women'];



export default function ResidentDashboard({ user, language, setScreen, setSelectedComplaintId, showToast }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grievances');

  // Welfare schemes browser state
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [schemeSearch, setSchemeSearch] = useState('');

  const t = {
    English: {
      greeting: "Welcome,",
      villageInfo: "Village Panchayat: Kothacheruvu",
      newReport: "Report Grievance",
      newReportSub: "Use voice assistant",
      track: "Track Grievance",
      trackSub: "View progress timeline",
      history: "My Grievances",
      historySub: "Full list of reports",
      recentTitle: "Recent Submissions",
      noGrievances: "No grievances registered yet.",
      summaryTitle: "Overview",
      submitted: "Submitted",
      inProgress: "In Progress",
      resolved: "Resolved",
      status: "Status",
      tabGrievances: "Grievances",
      tabWelfare: "Welfare Schemes",
      tabDirectory: "Village Directory",
      calcTitle: "Scheme Eligibility Checker",
      calcSub: "Enter parameters to verify qualification status",
      ageLabel: "Resident Age (years)",
      incomeLabel: "Annual Family Income (₹)",
      landLabel: "Agricultural Land Owned (acres)",
      calculateBtn: "Check Eligibility",
      eligible: "ELIGIBLE",
      ineligible: "NOT ELIGIBLE",
      prefillBtn: "Prefill Scheme Form",
      directoryTitle: "Village Sachivalayam Helpline",
      directorySub: "Direct contacts of local administrative assistants on active duty",
      call: "Call",
      quickReport: "Direct Grievance",
      statusOnDuty: "On Duty",
      statusInField: "In Field",
      loading: "Fetching submissions history..."
    },
    Telugu: {
      greeting: "స్వాగతం,",
      villageInfo: "గ్రామ పంచాయతీ: కొత్తచెరువు",
      newReport: "సమస్యను నివేదించండి",
      newReportSub: "వాయిస్ సహాయకుడిని ఉపయోగించండి",
      track: "ఫిర్యాదును ట్రాక్ చేయండి",
      trackSub: "పురోగతి టైమ్‌లైన్ చూడండి",
      history: "నా ఫిర్యాదులు",
      historySub: "మొత్తం నివేదికల జాబితా",
      recentTitle: "ఇటీవలి సమర్పణలు",
      noGrievances: "ఇంకా ఎలాంటి ఫిర్యాదులు నమోదు చేయలేదు.",
      summaryTitle: "స్థితి అవలోకనం",
      submitted: "సమర్పించబడింది",
      inProgress: "ప్రక్రియలో ఉంది",
      resolved: "పరిష్కరించబడింది",
      status: "స్థితి",
      tabGrievances: "ఫిర్యాదులు",
      tabWelfare: "ప్రభుత్వ పథకాలు",
      tabDirectory: "గ్రామ డైరెక్టరీ",
      calcTitle: "పథకాల అర్హత క్యాలిక్యులేటర్",
      calcSub: "మీ అర్హతను ధృవీకరించడానికి వివరాలను నమోదు చేయండి",
      ageLabel: "నివాసి వయస్సు (సంవత్సరాలు)",
      incomeLabel: "కుటుంబ వార్షిక ఆదాయం (₹)",
      landLabel: "వ్యవసాయ భూమి (ఎకరాలలో)",
      calculateBtn: "అర్హతను తనిఖీ చేయి",
      eligible: "అర్హులు",
      ineligible: "అనర్హులు",
      prefillBtn: "పథక దరఖాస్తు పూరించు",
      directoryTitle: "గ్రామ సచివాలయం హెల్ప్‌లైన్",
      directorySub: "విధులు నిర్వహిస్తున్న స్థానిక సచివాలయ సిబ్బంది సంప్రదింపు నంబర్లు",
      call: "కాల్ చేయండి",
      quickReport: "నేరుగా ఫిర్యాదు",
      statusOnDuty: "విధులు నిర్వహిస్తున్నారు",
      statusInField: "ఫీల్డ్ పర్యటనలో ఉన్నారు",
      loading: "ఫిర్యాదుల వివరాలను లోడ్ చేస్తున్నాము..."
    }
  }[language] || {
    greeting: "Welcome,",
    villageInfo: "Village Panchayat: Kothacheruvu",
    newReport: "Report Grievance",
    newReportSub: "Use voice assistant",
    track: "Track Grievance",
    trackSub: "View progress timeline",
    history: "My Grievances",
    historySub: "Full list of reports",
    recentTitle: "Recent Submissions",
    noGrievances: "No grievances registered yet.",
    summaryTitle: "Overview",
    submitted: "Submitted",
    inProgress: "In Progress",
    resolved: "Resolved",
    status: "Status",
    tabGrievances: "Grievances",
    tabWelfare: "Welfare Schemes",
    tabDirectory: "Village Directory",
    directoryTitle: "Village Sachivalayam Helpline",
    directorySub: "Direct contacts of local administrative assistants on active duty",
    call: "Call",
    quickReport: "Direct Grievance",
    statusOnDuty: "On Duty",
    statusInField: "In Field",
    loading: "Fetching submissions history..."
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
        console.error("Failed to load resident grievances:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user.name, user.phone]);

  // Status counters for user summary
  const counts = {
    submitted: complaints.filter(c => c.status === 'Submitted' || c.status === 'Assigned').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
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

  const handleTrackClick = (id) => {
    setSelectedComplaintId(id);
    setScreen('tracking');
  };

  // Mock village directory contacts
  const directory = [
    {
      name: language === 'Telugu' ? "వి. సత్యనారాయణ" : "V. Satyanarayana",
      title: language === 'Telugu' ? "పంచాయతీ కార్యదర్శి (Secretary)" : "Panchayat Secretary",
      phone: "+91 99887 76655",
      status: "On Duty",
      avatar: "👮‍♂️"
    },
    {
      name: language === 'Telugu' ? "కె. వెంకట్ రావు" : "K. Venkat Rao",
      title: language === 'Telugu' ? "విద్యుత్ లైన్మెన్ (Electricity)" : "Electricity Lineman",
      phone: "+91 98765 01234",
      status: "In Field",
      avatar: "👷‍♂️"
    },
    {
      name: language === 'Telugu' ? "డా. ఎ. సునీత" : "Dr. A. Sunitha",
      title: language === 'Telugu' ? "గ్రామ ఆరోగ్య కార్యదర్శి (ANM)" : "ANM Health Worker",
      phone: "+91 97654 32109",
      status: "On Duty",
      avatar: "👩‍⚕️"
    },
    {
      name: language === 'Telugu' ? "ఎమ్. రాజేష్" : "M. Rajesh",
      title: language === 'Telugu' ? "నీటి సరఫరా టెక్నీషియన్" : "Water Supply Technician",
      phone: "+91 96543 21098",
      status: "In Field",
      avatar: "👨‍🔧"
    }
  ];

  return (
    <div style={{ padding: '4px' }}>
      
      {/* Segmented Subnavigation tab bar */}
      <div style={{ display: 'flex', background: 'var(--hover-bg)', padding: '4px', borderRadius: '12px', gap: '4px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
        <button 
          style={{ flex: 1, border: 'none', background: activeTab === 'grievances' ? 'var(--surface-color)' : 'transparent', color: activeTab === 'grievances' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '13.5px', fontWeight: '700', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'grievances' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          onClick={() => setActiveTab('grievances')}
        >
          🎙️ {t.tabGrievances}
        </button>
        <button 
          style={{ flex: 1, border: 'none', background: activeTab === 'welfare' ? 'var(--surface-color)' : 'transparent', color: activeTab === 'welfare' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '13.5px', fontWeight: '700', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'welfare' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          onClick={() => setActiveTab('welfare')}
        >
          🌾 {t.tabWelfare}
        </button>
        <button 
          style={{ flex: 1, border: 'none', background: activeTab === 'directory' ? 'var(--surface-color)' : 'transparent', color: activeTab === 'directory' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '13.5px', fontWeight: '700', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'directory' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          onClick={() => setActiveTab('directory')}
        >
          📞 {t.tabDirectory}
        </button>
      </div>

      {/* DYNAMIC SCREEN TAB RENDER */}
      {activeTab === 'grievances' ? (
        /* TAB 1: GRIEVANCES & DASHBOARD */
        <div>
          {/* Main Core Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            {/* REPORT GRIEVANCE - BIG BUTTON */}
            <div 
              className="card card-interactive" 
              onClick={() => setScreen('voice-assistant')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '24px', 
                cursor: 'pointer', 
                borderLeft: '5px solid var(--success)',
                gap: '20px',
                marginBottom: '0'
              }}
            >
              <div style={{ fontSize: '32px', background: 'rgba(34, 197, 94, 0.08)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎙️</div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '17px', color: 'var(--text-primary)' }}>{t.newReport}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '500' }}>{t.newReportSub}</p>
              </div>
            </div>

            {/* MY GRIEVANCES */}
            <div 
              className="card card-interactive" 
              onClick={() => setScreen('history')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '24px', 
                cursor: 'pointer', 
                borderLeft: '5px solid var(--primary)',
                gap: '20px',
                marginBottom: '0'
              }}
            >
              <div style={{ fontSize: '32px', background: 'rgba(37, 99, 235, 0.08)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📋</div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '17px', color: 'var(--text-primary)' }}>{t.history}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '500' }}>{t.historySub}</p>
              </div>
            </div>
          </div>

          {/* Status Stats Summary widget */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left', fontWeight: '800' }}>
              📊 {t.summaryTitle}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '16px 8px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.submitted}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '6px', color: 'var(--text-primary)' }}>{counts.submitted}</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '16px 8px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.inProgress}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '6px', color: 'var(--text-primary)' }}>{counts.inProgress}</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '16px 8px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.resolved}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '6px', color: 'var(--text-primary)' }}>{counts.resolved}</div>
              </div>
            </div>
          </div>

          {/* Recent Submissions Section */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '18px', color: 'var(--text-primary)', textAlign: 'left', fontWeight: '800' }}>
              🕒 {t.recentTitle}
            </h3>

            {loading ? (
              /* Loading Skeletons for Dashboards UI/UX */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton skeleton-text" style={{ height: '48px', borderRadius: '12px' }}></div>
                <div className="skeleton skeleton-text" style={{ height: '48px', borderRadius: '12px' }}></div>
              </div>
            ) : complaints.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', padding: '10px 0', fontStyle: 'italic' }}>
                {t.noGrievances}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {complaints.slice(0, 3).map((item) => (
                  <div 
                    key={item.id} 
                    className="card-interactive"
                    onClick={() => handleTrackClick(item.id)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '16px 20px', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '14px',
                      cursor: 'pointer',
                      background: 'var(--surface-color)'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: '800', fontSize: '14.5px', color: 'var(--text-primary)' }}>{item.id} - {item.complaint_category}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className={`status-pill ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'welfare' ? (
        /* TAB 2: PREMIUM WELFARE SCHEMES BROWSER */
        <div>
          {/* Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg,#1565C0,#0EA5E9)',
            borderRadius: '20px',
            padding: '28px 28px 20px',
            marginBottom: '20px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '120px', opacity: '0.08', userSelect: 'none' }}>🌾</div>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', opacity: '0.75', marginBottom: '6px' }}>Government of Andhra Pradesh</div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '6px', color: 'white' }}>Welfare Schemes</h2>
            <p style={{ fontSize: '13px', opacity: '0.85', marginBottom: '18px', fontWeight: '500' }}>Browse {WELFARE_SCHEMES.length} active government benefit programmes for your family</p>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 16px', gap: '10px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                type="text"
                value={schemeSearch}
                onChange={e => setSchemeSearch(e.target.value)}
                placeholder={language === 'Telugu' ? 'పథకాలు వెతకండి...' : 'Search schemes...'}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '13px', width: '100%', fontFamily: 'var(--font-sans)' }}
              />
              {schemeSearch && <button onClick={() => setSchemeSearch('')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: 'white', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '100px',
                  border: activeCategory === cat ? '1.5px solid var(--primary)' : '1.5px solid var(--border-color)',
                  background: activeCategory === cat ? 'var(--primary)' : 'var(--surface-color)',
                  color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  fontFamily: 'var(--font-sans)',
                }}
              >{cat === 'All' ? `🌐 All` : cat === 'Senior' ? `👴 ${cat}` : cat === 'Education' ? `📚 ${cat}` : cat === 'Farmer' ? `🌾 ${cat}` : cat === 'Housing' ? `🏠 ${cat}` : cat === 'Health' ? `💊 ${cat}` : `👩 ${cat}`}</button>
            ))}
          </div>

          {/* Saved badge */}
          {savedSchemes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '12px', padding: '10px 16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px' }}>🔖</span>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0D9488' }}>{savedSchemes.length} scheme{savedSchemes.length > 1 ? 's' : ''} bookmarked for application</span>
              <button onClick={() => setSavedSchemes([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#0D9488', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Clear</button>
            </div>
          )}

          {/* Scheme Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {WELFARE_SCHEMES
              .filter(s => activeCategory === 'All' || s.category === activeCategory)
              .filter(s => !schemeSearch || s.name.toLowerCase().includes(schemeSearch.toLowerCase()) || s.teluguName.includes(schemeSearch))
              .map((scheme, idx) => {
                const isExpanded = expandedScheme === scheme.id;
                const isSaved = savedSchemes.includes(scheme.id);
                return (
                  <div
                    key={scheme.id}
                    style={{
                      background: isExpanded ? scheme.gradient.replace('08)', '15)') : 'var(--surface-color)',
                      border: isExpanded ? `1.5px solid ${scheme.color}55` : '1.5px solid var(--border-color)',
                      borderRadius: '18px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                      boxShadow: isExpanded ? `0 8px 32px ${scheme.color}22` : '0 2px 8px rgba(0,0,0,0.04)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onClick={() => setExpandedScheme(isExpanded ? null : scheme.id)}
                    onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${scheme.color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; if (!isExpanded) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                  >
                    {/* Top accent bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: scheme.color, borderRadius: '18px 18px 0 0', opacity: isExpanded ? 1 : 0.35, transition: 'opacity 0.25s' }} />

                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', background: scheme.gradient, border: `1.5px solid ${scheme.color}33`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, transition: 'transform 0.25s' }}>
                          {scheme.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1.2', fontFamily: 'var(--font-heading)' }}>{language === 'Telugu' ? scheme.teluguName : scheme.name}</div>
                          <div style={{ fontSize: '10.5px', fontWeight: '700', color: scheme.color, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{scheme.category}</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSave(scheme.id); showToast(isSaved ? 'Removed from bookmarks' : `${scheme.name} bookmarked!`); }}
                        style={{ background: isSaved ? `${scheme.color}18` : 'var(--hover-bg)', border: `1px solid ${isSaved ? scheme.color+'44' : 'var(--border-color)'}`, borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, transition: 'all 0.2s', transform: isSaved ? 'scale(1.15)' : 'scale(1)' }}
                        title={isSaved ? 'Remove bookmark' : 'Bookmark scheme'}
                      >{isSaved ? '🔖' : '🏷️'}</button>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500', lineHeight: '1.5' }}>{scheme.tagline}</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: scheme.color, fontFamily: 'var(--font-heading)' }}>{scheme.amount}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', transition: 'transform 0.25s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>

                    {/* Expandable detail panel */}
                    <div style={{ maxHeight: isExpanded ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s', opacity: isExpanded ? 1 : 0 }}>
                      <div style={{ borderTop: `1px dashed ${scheme.color}44`, marginTop: '16px', paddingTop: '16px' }}>
                        <div style={{ background: `${scheme.color}10`, borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', border: `1px solid ${scheme.color}22` }}>
                          <div style={{ fontSize: '10px', fontWeight: '900', color: scheme.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Eligibility</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: '600' }}>{scheme.eligibility}</div>
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>✨ Benefits</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {scheme.benefits.map((b, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: scheme.color, flexShrink: 0 }} />{b}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>📄 Documents Required</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {scheme.documents.map((doc, i) => (
                              <span key={i} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600' }}>{doc}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); showToast(`Opening application for ${scheme.name}...`); }}
                            style={{ flex: 1, background: scheme.color, color: 'white', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s', boxShadow: `0 4px 16px ${scheme.color}44` }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.filter = 'brightness(1.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
                          >Apply Now →</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setScreen('voice-assistant'); }}
                            style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                          >🎙️ Voice</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>

          {WELFARE_SCHEMES.filter(s => activeCategory === 'All' || s.category === activeCategory).filter(s => !schemeSearch || s.name.toLowerCase().includes(schemeSearch.toLowerCase())).length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>No schemes found.</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>Try a different search or category.</div>
            </div>
          )}
        </div>

      ) : (
        /* TAB 3: HELPLINE DIRECTORY */
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '17px', marginBottom: '6px', textAlign: 'left', fontWeight: '800' }}>📞 {t.directoryTitle}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0', textAlign: 'left', fontWeight: '500' }}>{t.directorySub}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
            {directory.map((contact, index) => (
              <div 
                key={index} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '20px', 
                  textAlign: 'left',
                  gap: '20px',
                  marginBottom: '0'
                }}
              >
                <div style={{ fontSize: '32px', background: 'var(--hover-bg)', padding: '12px', borderRadius: '50%', border: '1px solid var(--border-color)' }}>
                  {contact.avatar}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '850', fontSize: '15.5px', color: 'var(--text-primary)' }}>{contact.name}</span>
                    
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', background: contact.status === 'On Duty' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: contact.status === 'On Duty' ? '#16A34A' : '#D97706' }}>
                      <span 
                        style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: contact.status === 'On Duty' ? '#22C55E' : '#F59E0B',
                          animation: 'pulseRing 1.5s infinite'
                        }}
                      />
                      {language === 'Telugu' ? (contact.status === 'On Duty' ? t.statusOnDuty : t.statusInField) : contact.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>{contact.title}</div>
                  <div style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--primary)', marginTop: '6px' }}>{contact.phone}</div>
                </div>

                <div>
                  <a 
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`} 
                    className="btn btn-secondary" 
                    style={{ minHeight: '36px', padding: '6px 16px', fontSize: '12.5px' }}
                    onClick={(e) => { e.preventDefault(); showToast(`Simulating call to ${contact.name}`); }}
                  >
                    📞 {t.call}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
