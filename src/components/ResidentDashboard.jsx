import React, { useState, useEffect } from 'react';
import AIChatbot from './AIChatbot';

const PREDEFINED_VILLAGES = ['Kothacheruvu', 'Bukkarayasamudram', 'Rapthadu', 'Pedapenki', 'Duvvada'];

const AP_DISTRICTS = [
  "Alluri Sitharama Raju", "Anakapalli", "Anantapur", "Annamayya", "Bapatla", 
  "Chittoor", "East Godavari", "Eluru", "Guntur", "Kakinada", 
  "Konaseema", "Krishna", "Kurnool", "Nandyal", "NTR", 
  "Palnadu", "Parvathipuram Manyam", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", 
  "Sri Sathya Sai", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", 
  "YSR Kadapa"
];

const VILLAGE_COORDINATES = {
  'Kothacheruvu': { lat: 14.2016, lng: 77.7818, te: 'కొత్తచెరువు' },
  'Bukkarayasamudram': { lat: 14.7082, lng: 77.6417, te: 'బుక్కరాయసముద్రం' },
  'Rapthadu': { lat: 14.6200, lng: 77.6080, te: 'రాప్తాడు' },
  'Pedapenki': { lat: 18.5284, lng: 83.2982, te: 'పెదపెంకి' },
  'Duvvada': { lat: 17.6997, lng: 83.1575, te: 'దువ్వాడ' }
};

const findClosestVillage = (latitude, longitude) => {
  let closest = 'Kothacheruvu';
  let minDistance = Infinity;
  for (const [name, coords] of Object.entries(VILLAGE_COORDINATES)) {
    const dist = Math.hypot(coords.lat - latitude, coords.lng - longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = name;
    }
  }
  return { name: closest, distance: minDistance };
};

export default function ResidentDashboard({ user, language, setScreen, setSelectedComplaintId, showToast }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grievances');
  const [dialingContact, setDialingContact] = useState(null);

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    showToast(language === 'Telugu' ? 'ఫోన్ నంబర్ కాపీ చేయబడింది!' : 'Phone number copied to clipboard!');
  };

  const isPredefined = user?.village && PREDEFINED_VILLAGES.includes(user.village);
  const [selectedVillage, setSelectedVillage] = useState(
    user?.village ? (isPredefined ? user.village : 'Other') : 'Kothacheruvu'
  );
  const [customVillage, setCustomVillage] = useState(
    user?.village ? (isPredefined ? '' : user.village) : ''
  );
  const [customDistrict, setCustomDistrict] = useState('Anantapur');
  const [customMandal, setCustomMandal] = useState('');

  const t = {
    English: {
      greeting: "Welcome,",
      villageInfo: "Village Panchayat: Kothacheruvu",
      newReport: "Report Grievance",
      newReportSub: "Fill out grievance form",
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
      newReportSub: "ఫిర్యాదు ఫారమ్‌ను పూరించండి",
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
    newReportSub: "Fill out grievance form",
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

  // Geolocation Auto-detection on mount
  useEffect(() => {
    if (!user?.village && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const closestResult = findClosestVillage(pos.coords.latitude, pos.coords.longitude);
          const closest = closestResult.name;
          setSelectedVillage(closest);
          showToast(
            language === 'Telugu'
              ? `స్థానం గుర్తించబడింది: ${closest === 'Kothacheruvu' ? 'కొత్తచెరువు' : closest === 'Bukkarayasamudram' ? 'బుక్కరాయసముద్రం' : closest === 'Rapthadu' ? 'రాప్తాడు' : closest === 'Pedapenki' ? 'పెదపెంకి' : 'దువ్వాడ'}`
              : `Automatically loaded directory for nearest village: ${closest}`
          );
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  }, [user, language, showToast]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast(language === 'Telugu' ? 'మీ బ్రౌజర్‌లో జీపీఎస్ లొకేషన్ సపోర్ట్ లేదు' : 'GPS location is not supported by your browser');
      return;
    }
    showToast(language === 'Telugu' ? 'మీ స్థానాన్ని గుర్తిస్తున్నాము...' : 'Detecting your location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const closestResult = findClosestVillage(latitude, longitude);
        const closest = closestResult.name;
        const distance = closestResult.distance;
        
        // If within 0.3 degrees (~30km) of a predefined village, directly use the predefined village
        if (distance < 0.3) {
          setSelectedVillage(closest);
          showToast(
            language === 'Telugu'
              ? `స్థానం గుర్తించబడింది: ${closest === 'Kothacheruvu' ? 'కొత్తచెరువు' : closest === 'Bukkarayasamudram' ? 'బుక్కరాయసముద్రం' : closest === 'Rapthadu' ? 'రాప్తాడు' : closest === 'Pedapenki' ? 'పెదపెంకి' : 'దువ్వాడ'}`
              : `Detected Location: ${closest}`
          );
          return;
        }

        try {
          // Attempt to reverse geocode using OpenStreetMap Nominatim API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
            headers: {
              'Accept-Language': language === 'Telugu' ? 'te,en' : 'en'
            }
          });
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            
            // Extract location parts
            const villageName = addr.village || addr.suburb || addr.town || addr.neighbourhood || addr.hamlet || addr.city || addr.road || '';
            const mandalName = addr.county || addr.subdistrict || addr.municipality || '';
            let districtName = addr.state_district || addr.district || '';
            
            if (districtName) {
              const cleanDist = districtName.replace(/\s+District$/i, '').trim();
              const matchedDist = AP_DISTRICTS.find(d => d.toLowerCase() === cleanDist.toLowerCase() || cleanDist.toLowerCase().includes(d.toLowerCase()));
              if (matchedDist) {
                districtName = matchedDist;
              }
            }
            
            if (villageName) {
              setSelectedVillage('Other');
              setCustomVillage(villageName);
              if (mandalName) setCustomMandal(mandalName);
              if (districtName) setCustomDistrict(districtName);
              
              showToast(
                language === 'Telugu'
                  ? `స్థానం గుర్తించబడింది: ${villageName}`
                  : `Location detected: ${villageName}`
              );
              return;
            }
          }
        } catch (err) {
          console.error("Reverse geocoding failed, falling back to closest predefined village:", err);
        }
        
        // Fallback to closest predefined village
        setSelectedVillage(closest);
        showToast(
          language === 'Telugu'
            ? `స్థానం గుర్తించబడింది: ${closest === 'Kothacheruvu' ? 'కొత్తచెరువు' : closest === 'Bukkarayasamudram' ? 'బుక్కరాయసముద్రం' : closest === 'Rapthadu' ? 'రాప్తాడు' : closest === 'Pedapenki' ? 'పెదపెంకి' : 'దువ్వాడ'}`
            : `Detected Location: ${closest}`
        );
      },
      (err) => {
        console.error("Location detection failed:", err);
        showToast(language === 'Telugu' ? 'లొకేషన్ గుర్తించడం వీలుపడలేదు' : 'Failed to retrieve GPS location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
    'Generic': [
      {
        name: language === 'Telugu' ? "బి. సురేష్ కుమార్" : "B. Suresh Kumar",
        title: language === 'Telugu' ? "మండల పరిషత్ అభివృద్ధి అధికారి (MPDO)" : "Mandal Parishad Development Officer (MPDO)",
        phone: "+91 99000 11223",
        status: "On Duty",
        avatar: "🏛️"
      },
      {
        name: language === 'Telugu' ? "టి. రామకృష్ణ" : "T. Ramakrishna",
        title: language === 'Telugu' ? "మండల రెవెన్యూ అధికారి (MRO / Tehsildar)" : "Mandal Revenue Officer (MRO / Tehsildar)",
        phone: "+91 99000 44556",
        status: "In Field",
        avatar: "👨‍💼"
      },
      {
        name: language === 'Telugu' ? "డా. వై. అనిత" : "Dr. Y. Anitha",
        title: language === 'Telugu' ? "మండల ఆరోగ్య అధికారి (MHO)" : "Mandal Health Officer (MHO)",
        phone: "+91 99000 77889",
        status: "On Duty",
        avatar: "👩‍⚕️"
      }
    ],
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

  const directory = selectedVillage === 'Other'
    ? directoryData['Generic']
    : (directoryData[selectedVillage] || directoryData['Kothacheruvu']);

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            
            {/* REPORT GRIEVANCE - BIG BUTTON */}
            <div 
              className="card card-interactive" 
              onClick={() => setScreen('voice-assistant')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '28px 24px', 
                cursor: 'pointer', 
                background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '20px',
                gap: '20px',
                marginBottom: '0',
                boxShadow: '0 12px 24px -6px rgba(79, 70, 229, 0.35)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 18px 30px -6px rgba(79, 70, 229, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(79, 70, 229, 0.35)';
              }}
            >
              {/* Subtle glass blob in background */}
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.12)', pointerEvents: 'none' }} />
              
              <div style={{ fontSize: '32px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', padding: '14px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>📝</div>
              <div style={{ textAlign: 'left', zIndex: 2 }}>
                <h3 style={{ fontSize: '18px', color: '#FFFFFF', fontWeight: '800' }}>{t.newReport}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', marginTop: '4px', fontWeight: '500' }}>{t.newReportSub}</p>
              </div>
            </div>

            {/* MY GRIEVANCES */}
            <div 
              className="card card-interactive" 
              onClick={() => setScreen('history')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '28px 24px', 
                cursor: 'pointer', 
                background: 'linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '20px',
                gap: '20px',
                marginBottom: '0',
                boxShadow: '0 12px 24px -6px rgba(14, 165, 233, 0.35)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 18px 30px -6px rgba(14, 165, 233, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(14, 165, 233, 0.35)';
              }}
            >
              {/* Subtle glass blob in background */}
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.12)', pointerEvents: 'none' }} />
              
              <div style={{ fontSize: '32px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', padding: '14px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>📋</div>
              <div style={{ textAlign: 'left', zIndex: 2 }}>
                <h3 style={{ fontSize: '18px', color: '#FFFFFF', fontWeight: '800' }}>{t.history}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', marginTop: '4px', fontWeight: '500' }}>{t.historySub}</p>
              </div>
            </div>
          </div>

          {/* Status Stats Summary widget */}
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left', fontWeight: '800' }}>
              📊 {t.summaryTitle}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              
              {/* SUBMITTED */}
              <div style={{ 
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', 
                padding: '20px 8px', 
                borderRadius: '16px', 
                textAlign: 'center', 
                boxShadow: '0 8px 20px -6px rgba(37, 99, 235, 0.4)',
                border: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)' }} />
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.8px', zIndex: 2, position: 'relative' }}>{t.submitted}</div>
                <div style={{ fontSize: '36px', fontWeight: '900', marginTop: '6px', color: '#FFFFFF', zIndex: 2, position: 'relative', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{counts.submitted}</div>
              </div>

              {/* IN PROGRESS */}
              <div style={{ 
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                padding: '20px 8px', 
                borderRadius: '16px', 
                textAlign: 'center', 
                boxShadow: '0 8px 20px -6px rgba(245, 158, 11, 0.4)',
                border: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)' }} />
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.8px', zIndex: 2, position: 'relative' }}>{t.inProgress}</div>
                <div style={{ fontSize: '36px', fontWeight: '900', marginTop: '6px', color: '#FFFFFF', zIndex: 2, position: 'relative', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{counts.inProgress}</div>
              </div>

              {/* RESOLVED */}
              <div style={{ 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                padding: '20px 8px', 
                borderRadius: '16px', 
                textAlign: 'center', 
                boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.4)',
                border: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)' }} />
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.8px', zIndex: 2, position: 'relative' }}>{t.resolved}</div>
                <div style={{ fontSize: '36px', fontWeight: '900', marginTop: '6px', color: '#FFFFFF', zIndex: 2, position: 'relative', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{counts.resolved}</div>
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
                {complaints.slice(0, 3).map((c) => {
                  const borderColors = {
                    'Submitted': '4px solid #3B82F6',
                    'Assigned': '4px solid #8B5CF6',
                    'In Progress': '4px solid #F59E0B',
                    'Resolved': '4px solid #10B981'
                  };
                  return (
                    <div 
                      key={c.id} 
                      className="card-interactive"
                      onClick={() => handleTrackClick(c.id)}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '16px 20px', 
                        borderLeft: borderColors[c.status] || '4px solid var(--border-color)', 
                        borderTop: '1px solid var(--border-color)',
                        borderRight: '1px solid var(--border-color)',
                        borderBottom: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: 'var(--surface-color)',
                        textAlign: 'left',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px var(--shadow-color)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px var(--shadow-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-color)';
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
                  );
                })}
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
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="form-control"
                  style={{ 
                    flex: 1,
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
                  <option value="Duvvada">Duvvada (దువ్వాడ)</option>
                  <option value="Other">{language === 'Telugu' ? 'ఇతర గ్రామం / ప్రాంతం' : 'Other / Select Any Location'}</option>
                </select>

                <button
                  onClick={handleDetectLocation}
                  className="btn btn-secondary"
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    fontWeight: '700', 
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    height: '46px',
                    borderColor: 'var(--border-color)',
                    background: 'var(--hover-bg)'
                  }}
                >
                  📍 {language === 'Telugu' ? 'లొకేషన్ గుర్తించు' : 'Detect Location'}
                </button>
              </div>
            </div>

            {selectedVillage === 'Other' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🏢 {language === 'Telugu' ? 'జిల్లా' : 'District'}
                  </label>
                  <select
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
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
                    {AP_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🏛️ {language === 'Telugu' ? 'మండలం' : 'Mandal'}
                  </label>
                  <input
                    type="text"
                    value={customMandal}
                    onChange={(e) => setCustomMandal(e.target.value)}
                    placeholder={language === 'Telugu' ? 'ఉదా. కొత్తచెరువు' : 'e.g. Kothacheruvu'}
                    className="form-control"
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border-color)',
                      background: 'var(--surface-color)',
                      color: 'var(--text-primary)',
                      fontWeight: '700',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ✍️ {language === 'Telugu' ? 'గ్రామం పేరు' : 'Village Name'}
                  </label>
                  <input
                    type="text"
                    value={customVillage}
                    onChange={(e) => setCustomVillage(e.target.value)}
                    placeholder={language === 'Telugu' ? 'ఉదా. ధర్మవరం' : 'e.g. Dharmavaram'}
                    className="form-control"
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border-color)',
                      background: 'var(--surface-color)',
                      color: 'var(--text-primary)',
                      fontWeight: '700',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {selectedVillage === 'Other' && (
            <div 
              style={{ 
                background: 'rgba(37, 99, 235, 0.06)', 
                border: '1px solid rgba(37, 99, 235, 0.2)', 
                borderRadius: '14px', 
                padding: '16px 20px', 
                marginBottom: '16px', 
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '20px', lineHeight: '1' }}>ℹ️</div>
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
                  {language === 'Telugu' ? 'మండల స్థాయి అధికారులు' : 'Mandal Level Contacts'}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0, fontWeight: '500', lineHeight: '1.4' }}>
                  {language === 'Telugu' 
                    ? `మీరు నమోదు చేసిన ప్రాంతం "${customVillage || 'గ్రామం'}, ${customMandal || 'మండలం'}, ${customDistrict} (జిల్లా)" కొరకు మండల స్థాయి అధికారుల వివరాలు చూపబడుతున్నాయి. ఈ ప్రాంతానికి సంబంధించిన సచివాలయ సిబ్బంది వివరాలు అందుబాటులో లేవు.`
                    : `Displaying Mandal-level administrative contacts for your entered location "${customVillage || 'Village'}, ${customMandal || 'Mandal'}, ${customDistrict} District". Local village panchayat-specific staff details are not pre-loaded.`
                  }
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
            {directory.map((contact, index) => (
              <div 
                key={index} 
                className="card directory-card" 
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
                   <button 
                     className="btn btn-secondary" 
                     style={{ minHeight: '36px', padding: '6px 16px', fontSize: '12.5px', cursor: 'pointer', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}
                     onClick={() => setDialingContact(contact)}
                   >
                     📞 {t.call}
                   </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Floating mic button for quick voice assistant activation */}
      <button 
        className="va-floating-btn" 
        onClick={() => setScreen('voice-assistant')}
        title={language === 'Telugu' ? 'వాయిస్ సహాయకుడు' : 'Start Voice Assistant'}
      >
        🎙️
      </button>

      {/* PHONE DIALOG MODAL */}
      {dialingContact && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'var(--surface-color)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '420px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Close button */}
            <button 
              onClick={() => setDialingContact(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--hover-bg)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            {/* Avatar */}
            <div style={{
              fontSize: '44px',
              background: 'var(--hover-bg)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '2px solid var(--border-color)'
            }}>
              {dialingContact.avatar}
            </div>

            {/* Name and Title */}
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {dialingContact.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '20px' }}>
              {dialingContact.title}
            </p>

            {/* Phone Display Box */}
            <div style={{
              background: 'var(--hover-bg)',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid var(--border-color)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                📞 {dialingContact.phone}
              </span>
              <button
                onClick={() => handleCopyPhone(dialingContact.phone)}
                style={{
                  background: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                📋 {language === 'Telugu' ? 'కాపీ' : 'Copy'}
              </button>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDialingContact(null)}
                style={{
                  flex: 1,
                  background: 'var(--hover-bg)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  height: '46px'
                }}
              >
                {language === 'Telugu' ? 'రద్దు చేయి' : 'Cancel'}
              </button>
              
              <a
                href={`tel:${dialingContact.phone.replace(/\s+/g, '')}`}
                onClick={() => {
                  setDialingContact(null);
                  showToast(language === 'Telugu' ? `${dialingContact.name} కి కాల్ ప్రారంభించబడింది` : `Calling ${dialingContact.name}...`);
                }}
                style={{
                  flex: 1,
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                }}
              >
                📞 {language === 'Telugu' ? 'కాల్ చేయి' : 'Call Now'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
