import React, { useState, useEffect } from 'react';
import AIChatbot from './AIChatbot';

export default function ResidentDashboard({ user, language, setScreen, setSelectedComplaintId, showToast }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grievances');
  const [selectedVillage, setSelectedVillage] = useState(user.village || 'Kothacheruvu');

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
      tabChatbot: "AI Assistant",
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
      tabChatbot: "సహాయక చాట్‌బాట్",
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
    tabChatbot: "AI Assistant",
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

  // Mock village directory contacts grouped by Panchayat
  const directoryData = {
    'Kothacheruvu': [
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
    ],
    'Bukkarayasamudram': [
      {
        name: language === 'Telugu' ? "జి. నారాయణ" : "G. Narayana",
        title: language === 'Telugu' ? "పంచాయతీ కార్యదర్శి (Secretary)" : "Panchayat Secretary",
        phone: "+91 99887 11223",
        status: "On Duty",
        avatar: "👮‍♂️"
      },
      {
        name: language === 'Telugu' ? "బి. రాము" : "B. Ramu",
        title: language === 'Telugu' ? "విద్యుత్ లైన్మెన్ (Electricity)" : "Electricity Lineman",
        phone: "+91 98765 22334",
        status: "In Field",
        avatar: "👷‍♂️"
      },
      {
        name: language === 'Telugu' ? "డా. కె. లక్ష్మి" : "Dr. K. Lakshmi",
        title: language === 'Telugu' ? "గ్రామ ఆరోగ్య కార్యదర్శి (ANM)" : "ANM Health Worker",
        phone: "+91 97654 33445",
        status: "On Duty",
        avatar: "👩‍⚕️"
      },
      {
        name: language === 'Telugu' ? "ఎస్. కృష్ణ" : "S. Krishna",
        title: language === 'Telugu' ? "నీటి సరఫరా టెక్నీషియన్" : "Water Supply Technician",
        phone: "+91 96543 44556",
        status: "In Field",
        avatar: "👨‍🔧"
      }
    ],
    'Rapthadu': [
      {
        name: language === 'Telugu' ? "టి. స్వామి" : "T. Swamy",
        title: language === 'Telugu' ? "పంచాయతీ కార్యదర్శి (Secretary)" : "Panchayat Secretary",
        phone: "+91 99887 55667",
        status: "On Duty",
        avatar: "👮‍♂️"
      },
      {
        name: language === 'Telugu' ? "ఎమ్. శేఖర్" : "M. Sekhar",
        title: language === 'Telugu' ? "విద్యుత్ లైన్మెన్ (Electricity)" : "Electricity Lineman",
        phone: "+91 98765 66778",
        status: "In Field",
        avatar: "👷‍♂️"
      },
      {
        name: language === 'Telugu' ? "డా. పి. రాధ" : "Dr. P. Radha",
        title: language === 'Telugu' ? "గ్రామ ఆరోగ్య కార్యదర్శి (ANM)" : "ANM Health Worker",
        phone: "+91 97654 77889",
        status: "On Duty",
        avatar: "👩‍⚕️"
      },
      {
        name: language === 'Telugu' ? "కె. శివ" : "K. Shiva",
        title: language === 'Telugu' ? "నీటి సరఫరా టెక్నీషియన్" : "Water Supply Technician",
        phone: "+91 96543 88990",
        status: "In Field",
        avatar: "👨‍🔧"
      }
    ],
    'Pedapenki': [
      {
        name: language === 'Telugu' ? "కె. రాంబాబు" : "K. Rambabu",
        title: language === 'Telugu' ? "పంచాయతీ కార్యదర్శి (Secretary)" : "Panchayat Secretary",
        phone: "+91 99887 88990",
        status: "On Duty",
        avatar: "👮‍♂️"
      },
      {
        name: language === 'Telugu' ? "పి. ప్రసాద్" : "P. Prasad",
        title: language === 'Telugu' ? "విద్యుత్ లైన్మెన్ (Electricity)" : "Electricity Lineman",
        phone: "+91 98765 99001",
        status: "In Field",
        avatar: "👷‍♂️"
      },
      {
        name: language === 'Telugu' ? "డా. ఎమ్. గౌరి" : "Dr. M. Gouri",
        title: language === 'Telugu' ? "గ్రామ ఆరోగ్య కార్యదర్శి (ANM)" : "ANM Health Worker",
        phone: "+91 97654 00112",
        status: "On Duty",
        avatar: "👩‍⚕️"
      },
      {
        name: language === 'Telugu' ? "టి. ఆనంద్" : "T. Anand",
        title: language === 'Telugu' ? "నీటి సరఫరా టెక్నీషియన్" : "Water Supply Technician",
        phone: "+91 96543 11223",
        status: "In Field",
        avatar: "👨‍🔧"
      }
    ]
  };

  const directory = directoryData[selectedVillage] || directoryData['Kothacheruvu'];

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
          style={{ flex: 1, border: 'none', background: activeTab === 'chatbot' ? 'var(--surface-color)' : 'transparent', color: activeTab === 'chatbot' ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '13.5px', fontWeight: '700', padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'chatbot' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          onClick={() => setActiveTab('chatbot')}
        >
          🤖 {t.tabChatbot}
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
              <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                <div style={{ fontWeight: '750', fontSize: '14px' }}>{t.noGrievances}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {complaints.slice(0, 3).map((c) => (
                  <div 
                    key={c.id} 
                    className="card-interactive"
                    onClick={() => handleTrackClick(c.id)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '16px 20px', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: 'var(--surface-color)',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '14.5px', color: 'var(--text-primary)' }}>{c.id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '600' }}>📍 {c.village_area} • {c.complaint_category}</div>
                    </div>
                    <span className={`status-pill ${getStatusClass(c.status)}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      ) : activeTab === 'chatbot' ? (
        /* TAB 2: INTEGRATED CHATBOT */
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '18px', overflow: 'hidden' }}>
          <AIChatbot language={language} inline={true} />
        </div>
      ) : (
        /* TAB 3: HELPLINE DIRECTORY */
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '17px', marginBottom: '6px', textAlign: 'left', fontWeight: '800' }}>📞 {t.directoryTitle}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', fontWeight: '500' }}>{t.directorySub}</p>
            
            {/* Location selector dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📍 {language === 'Telugu' ? 'గ్రామ పంచాయతీని ఎంచుకోండి' : 'Select Village Panchayat'}
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="form-control"
                style={{ 
                  padding: '12px 14px', 
                  borderRadius: '12px', 
                  border: '1.5px solid var(--border-color)', 
                  background: 'var(--surface-color)', 
                  color: 'var(--text-primary)', 
                  fontWeight: '700', 
                  fontSize: '14px', 
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Kothacheruvu">Kothacheruvu (కొత్తచెరువు)</option>
                <option value="Bukkarayasamudram">Bukkarayasamudram (బుక్కరాయసముద్రం)</option>
                <option value="Rapthadu">Rapthadu (రాప్తాడు)</option>
                <option value="Pedapenki">Pedapenki (పెదపెంకి)</option>
              </select>
            </div>
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
