import React, { useState, useEffect } from 'react';
import Splash from './components/Splash';
import LanguageSelection from './components/LanguageSelection';
import Login from './components/Login';
import ResidentDashboard from './components/ResidentDashboard';
import VoiceAssistant from './components/VoiceAssistant';
import PhotoCapture from './components/PhotoCapture';
import ComplaintHistory from './components/ComplaintHistory';
import ComplaintTracking from './components/ComplaintTracking';
import AuthorityDashboard from './components/AuthorityDashboard';
import ComplaintDetails from './components/ComplaintDetails';
import AIChatbot from './components/AIChatbot';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('splash');
  const [language, setLanguage] = useState('English');
  const [user, setUser] = useState(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  
  // Stored state for multi-screen complaint flow
  const [voiceData, setVoiceData] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // Toast Notification state
  const [toast, setToast] = useState({ message: '', show: false });

  // SaaS UI settings
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock Notification Feed
  const [notifications, setNotifications] = useState([
    { id: 1, text: "SC-7821 Streetlight status updated to In Progress", unread: true, time: "2m ago" },
    { id: 2, text: "New grievance SC-1054 Roads registered in Rapthadu", unread: true, time: "1h ago" },
    { id: 3, text: "Welcome to Sachivalayam Connect Pro!", unread: false, time: "1d ago" }
  ]);

  const showToast = (message) => {
    setToast({ message, show: true });
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ message: '', show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Handle local storage session restoration
  useEffect(() => {
    const savedUser = localStorage.getItem('sachivalayam_user');
    const savedLang = localStorage.getItem('sachivalayam_lang');
    if (savedLang) {
      setLanguage(savedLang);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);


  const handleSplashComplete = () => {
    const savedUser = localStorage.getItem('sachivalayam_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role === 'Authority') {
        setActiveScreen('authority-dashboard');
      } else {
        setActiveScreen('resident-dashboard');
      }
    } else {
      setActiveScreen('language-select');
    }
  };

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('sachivalayam_lang', lang);
    setActiveScreen('login');
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('sachivalayam_user', JSON.stringify(loggedInUser));
    showToast(language === 'Telugu' ? "లాగిన్ విజయవంతమైంది" : "Logged in successfully");
    if (loggedInUser.role === 'Authority') {
      setActiveScreen('authority-dashboard');
    } else {
      setActiveScreen('resident-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sachivalayam_user');
    setActiveScreen('language-select');
    setShowProfileDropdown(false);
    showToast(language === 'Telugu' ? "లాగ్ అవుట్ విజయవంతమైంది" : "Logged out successfully");
  };

  const toggleLanguage = () => {
    const nextLang = language === 'English' ? 'Telugu' : 'English';
    setLanguage(nextLang);
    localStorage.setItem('sachivalayam_lang', nextLang);
  };

  const handleVoiceAssistantComplete = (formData, recordedAudio) => {
    setVoiceData(formData);
    setAudioBlob(recordedAudio);
    setActiveScreen('photo-capture');
  };

  const handleSubmissionComplete = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setVoiceData(null);
    setAudioBlob(null);
    setActiveScreen('tracking');
    
    // Add dynamic notification
    const newNotif = {
      id: Date.now(),
      text: `Grievance ${complaintId} submitted successfully`,
      unread: true,
      time: "Just now"
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(language === 'Telugu' ? "ఫిర్యాదు సమర్పించబడింది!" : "Grievance submitted successfully!");
  };

  const handleDemoRoleChange = (e) => {
    const role = e.target.value;
    if (role === 'Resident') {
      const demoRes = { phone: '9876543210', role: 'Resident', name: 'Ramesh Kumar', village: 'Kothacheruvu' };
      setUser(demoRes);
      localStorage.setItem('sachivalayam_user', JSON.stringify(demoRes));
      setActiveScreen('resident-dashboard');
    } else if (role === 'Authority') {
      const demoAuth = { phone: '9988776655', role: 'Authority', name: 'V. Satyanarayana', village: 'District Head Office' };
      setUser(demoAuth);
      localStorage.setItem('sachivalayam_user', JSON.stringify(demoAuth));
      setActiveScreen('authority-dashboard');
    } else {
      handleLogout();
    }
  };

  // Helper translations for layout headers
  const l = {
    English: {
      langBtn: "తెలుగు",
      navHome: "Home",
      navNew: "Report Grievance",
      navHistory: "My Grievances",
      navList: "Complaints Feed",
      navMap: "GIS Map",
      navAnalytics: "Analytics",
      notifications: "Notifications",
      profile: "Profile Details",
      logout: "Log Out"
    },
    Telugu: {
      langBtn: "English",
      navHome: "హోమ్",
      navNew: "నివేదించు",
      navHistory: "నా ఫిర్యాదులు",
      navList: "ఫిర్యాదుల ఫీడ్",
      navMap: "జీఐఎస్ మ్యాప్",
      navAnalytics: "విశ్లేషణలు",
      notifications: "నోటిఫికేషన్లు",
      profile: "ప్రొఫైల్ వివరాలు",
      logout: "లాగ్ అవుట్"
    }
  }[language] || {
    langBtn: "తెలుగు",
    navHome: "Home",
    navNew: "Report Grievance",
    navHistory: "My Grievances",
    navList: "Complaints Feed",
    navMap: "GIS Map",
    navAnalytics: "Analytics",
    notifications: "Notifications",
    profile: "Profile Details",
    logout: "Log Out"
  };

  // Mark all notifications read
  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'resident-dashboard': return l.navHome;
      case 'voice-assistant': return l.navNew;
      case 'photo-capture': return l.navNew;
      case 'history': return l.navHistory;
      case 'tracking': return l.navHistory;
      case 'authority-dashboard': return l.navList;
      case 'complaint-details': return l.navList;
      default: return "Sachivalayam Connect";
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="app-container">
      {/* Background Gradient Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      {/* Toast Notification Banner */}
      {toast.show && <div className="toast">{toast.message}</div>}

      {/* ── Premium Dev Role Switcher (floating bottom-left) ── */}
      {activeScreen !== 'splash' && (
        <div className="dev-role-hud">
          <div className="dev-role-label">🛠️ Demo</div>
          <div className="dev-role-btns">
            <button
              className={`dev-role-btn ${(!user || user.role === 'Guest') ? 'active-guest' : ''}`}
              onClick={() => handleDemoRoleChange({ target: { value: 'Guest' } })}
              title="Switch to Guest"
            >👤 Guest</button>
            <button
              className={`dev-role-btn ${user?.role === 'Resident' ? 'active-citizen' : ''}`}
              onClick={() => handleDemoRoleChange({ target: { value: 'Resident' } })}
              title="Switch to Citizen"
            >🌾 Citizen</button>
            <button
              className={`dev-role-btn ${user?.role === 'Authority' ? 'active-official' : ''}`}
              onClick={() => handleDemoRoleChange({ target: { value: 'Authority' } })}
              title="Switch to Official"
            >👮 Official</button>
          </div>
        </div>
      )}

      {/* CONDITIONAL RENDER: ONBOARDING PAGES (SPLASH, LANG SELECT, LOGIN) */}
      {(!user || activeScreen === 'splash' || activeScreen === 'language-select' || activeScreen === 'login') ? (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {activeScreen === 'splash' && (
            <Splash onComplete={handleSplashComplete} />
          )}

          {activeScreen === 'language-select' && (
            <LanguageSelection onSelectLanguage={handleSelectLanguage} />
          )}

          {activeScreen === 'login' && (
            <Login 
              language={language} 
              onLoginSuccess={handleLoginSuccess} 
              showToast={showToast} 
            />
          )}
        </main>
      ) : (
        /* SAAS PORTAL LAYOUT WITH SIDEBAR + STICKY TOPBAR */
        <div className="app-layout">
          
          {/* Collapsible Sidebar Navigation Panel */}
          <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-brand">
              <span className="brand-icon">🏛️</span>
              <span className="brand-name">Sachivalayam Connect</span>
            </div>

            <nav className="sidebar-menu">
              {user.role === 'Resident' ? (
                <>
                  <button 
                    className={`menu-item ${activeScreen === 'resident-dashboard' ? 'active' : ''}`}
                    onClick={() => { setActiveScreen('resident-dashboard'); setIsMobileSidebarOpen(false); }}
                  >
                    <span className="menu-item-icon">🏠</span>
                    <span>{l.navHome}</span>
                  </button>

                  <button 
                    className={`menu-item ${activeScreen === 'voice-assistant' || activeScreen === 'photo-capture' ? 'active' : ''}`}
                    onClick={() => { setActiveScreen('voice-assistant'); setIsMobileSidebarOpen(false); }}
                  >
                    <span className="menu-item-icon">🎙️</span>
                    <span>{l.navNew}</span>
                  </button>

                  <button 
                    className={`menu-item ${activeScreen === 'history' || activeScreen === 'tracking' ? 'active' : ''}`}
                    onClick={() => { setActiveScreen('history'); setIsMobileSidebarOpen(false); }}
                  >
                    <span className="menu-item-icon">📋</span>
                    <span>{l.navHistory}</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={`menu-item ${activeScreen === 'authority-dashboard' || activeScreen === 'complaint-details' ? 'active' : ''}`}
                    onClick={() => { setActiveScreen('authority-dashboard'); setIsMobileSidebarOpen(false); }}
                  >
                    <span className="menu-item-icon">📊</span>
                    <span>{l.navList}</span>
                  </button>
                </>
              )}
            </nav>

            <div className="sidebar-footer">
              <button className="menu-item" onClick={handleLogout} style={{ width: '100%' }}>
                <span className="menu-item-icon">🔓</span>
                <span>{l.logout}</span>
              </button>
            </div>
          </aside>

          {/* Sidebar overlay backdrop for mobile viewports */}
          {isMobileSidebarOpen && (
            <div 
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 140 }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Main Content Area Viewport */}
          <div className="app-viewport">
            
            {/* Sticky Topbar */}
            <header className="app-topbar">
              <div className="topbar-left">
                {/* Mobile sidebar hamburger */}
                <button 
                  className="sidebar-toggle"
                  onClick={() => {
                    setIsMobileSidebarOpen(!isMobileSidebarOpen);
                    setIsSidebarCollapsed(!isSidebarCollapsed);
                  }}
                  title="Toggle Navigation Menu"
                >
                  ☰
                </button>
                
                {/* Screen Header Breadcrumb */}
                <span className="breadcrumb-title">{getScreenTitle()}</span>
              </div>

              <div className="topbar-right">
                {/* Global Search Bar (Simulated UI) */}
                <div className="topbar-search-container" style={{ display: window.innerWidth > 600 ? 'flex' : 'none' }}>
                  <span>🔍</span>
                  <input type="text" className="topbar-search-input" placeholder="Search grievance system..." />
                </div>

                {/* Language Switch — premium pill with flag */}
                <button className="lang-pill" onClick={toggleLanguage} title="Switch Language">
                  <span className="lang-pill-flag">{language === 'English' ? '🇮🇳' : '🇬🇧'}</span>
                  <span className="lang-pill-text">{l.langBtn}</span>
                </button>

                {/* Notifications Bell — polished with animated badge */}
                <div style={{ position: 'relative' }}>
                  <button
                    className={`notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileDropdown(false);
                      if (!showNotifications) markNotificationsRead();
                    }}
                    title={l.notifications}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="notif-badge-dot">{unreadCount}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notifications-popover">
                      <div className="popover-header">🔔 {l.notifications}</div>
                      <div className="popover-content">
                        {notifications.map(notif => (
                          <div key={notif.id} className="notification-item" style={{ background: notif.unread ? 'rgba(37,99,235,0.04)' : 'transparent' }}>
                            <div style={{ fontWeight: notif.unread ? 'bold' : 'normal' }}>{notif.text}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>{notif.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill — premium with role badge */}
                <div style={{ position: 'relative' }}>
                  <div
                    className="profile-pill-premium"
                    onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); }}
                  >
                    <div className="profile-avatar-ring">
                      <div className="profile-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
                    </div>
                    <div className="profile-pill-info" style={{ display: window.innerWidth > 600 ? 'flex' : 'none' }}>
                      <span className="profile-pill-name">{user.name?.split(' ')[0]}</span>
                      <span className={`profile-role-chip ${user.role === 'Authority' ? 'chip-official' : 'chip-citizen'}`}>
                        {user.role === 'Authority' ? '👮 Official' : '🌾 Citizen'}
                      </span>
                    </div>
                    <svg className="profile-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {showProfileDropdown && (
                    <div className="profile-popover">
                      <div className="profile-popover-header">
                        <div className="profile-popover-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '14px' }}>{user.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {user.resident_id || user.official_id || user.phone}
                          </div>
                          <span className={`profile-role-chip ${user.role === 'Authority' ? 'chip-official' : 'chip-citizen'}`} style={{ marginTop: '6px', display: 'inline-block' }}>
                            {user.role === 'Authority' ? '👮 Official' : '🌾 Citizen'}
                          </span>
                        </div>
                      </div>
                      <button className="profile-popover-item" onClick={handleLogout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        {l.logout}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Main Content Component Container */}
            <main className="app-main-content">
              {activeScreen === 'resident-dashboard' && (
                <ResidentDashboard 
                  user={user} 
                  language={language}
                  setScreen={setActiveScreen}
                  setSelectedComplaintId={setSelectedComplaintId}
                  showToast={showToast}
                />
              )}

              {activeScreen === 'voice-assistant' && (
                <VoiceAssistant 
                  language={language}
                  user={user}
                  onCompleteStep={handleVoiceAssistantComplete}
                  onSubmissionComplete={handleSubmissionComplete}
                  onCancel={() => setActiveScreen('resident-dashboard')}
                  showToast={showToast}
                  changeLanguage={setLanguage}
                />
              )}

              {activeScreen === 'photo-capture' && (
                <PhotoCapture 
                  language={language}
                  user={user}
                  voiceData={voiceData}
                  audioBlob={audioBlob}
                  onSubmissionComplete={handleSubmissionComplete}
                  onCancel={() => setActiveScreen('voice-assistant')}
                  showToast={showToast}
                />
              )}

              {activeScreen === 'history' && (
                <ComplaintHistory 
                  user={user}
                  language={language}
                  onTrackComplaint={(id) => {
                    setSelectedComplaintId(id);
                    setActiveScreen('tracking');
                  }}
                  onBack={() => setActiveScreen('resident-dashboard')}
                  showToast={showToast}
                />
              )}

              {activeScreen === 'tracking' && (
                <ComplaintTracking 
                  complaintId={selectedComplaintId}
                  language={language}
                  onBack={() => {
                    if (user?.role === 'Authority') {
                      setActiveScreen('authority-dashboard');
                    } else {
                      setActiveScreen('history');
                    }
                  }}
                  showToast={showToast}
                />
              )}

              {activeScreen === 'authority-dashboard' && (
                <AuthorityDashboard 
                  user={user}
                  language={language}
                  onSelectComplaint={(id) => {
                    setSelectedComplaintId(id);
                    setActiveScreen('complaint-details');
                  }}
                  onLogout={handleLogout}
                  showToast={showToast}
                />
              )}

              {activeScreen === 'complaint-details' && (
                <ComplaintDetails 
                  complaintId={selectedComplaintId}
                  language={language}
                  onBack={() => setActiveScreen('authority-dashboard')}
                  showToast={showToast}
                />
              )}
            </main>
          </div>

          {/* Global Support Chatbot */}
          <AIChatbot language={language} />
        </div>
      )}
    </div>
  );
}
