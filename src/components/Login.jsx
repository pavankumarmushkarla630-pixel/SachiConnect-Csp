import React, { useState } from 'react';

export default function Login({ language, onLoginSuccess, showToast }) {
  // ─── View State ────────────────────────────────────────────────
  // 'select'  → Role selection split screen
  // 'citizen' → Citizen register form
  // 'admin'   → Admin login form
  const [view, setView] = useState('select');

  // ─── Citizen Flow State ────────────────────────────────
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenVillage, setCitizenVillage] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [citizenSubView, setCitizenSubView] = useState('login'); // 'login' | 'register'
  const [citizenLoading, setCitizenLoading] = useState(false);
  const [showCitizenPassword, setShowCitizenPassword] = useState(false);

  // ─── Admin/Official State ─────────────────────────────────────────
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminSubView, setAdminSubView] = useState('login'); // 'login' | 'register'
  const [adminLoading, setAdminLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Citizen Login Submit (With Password Verification) ─────────
  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    const cleanPhone = loginPhone.trim().replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      showToast(language === 'Telugu' ? 'దయచేసి మీ 10 అంకెల మొబైల్ సంఖ్యను నమోదు చేయండి' : 'Please enter your registered 10-digit mobile number');
      return;
    }
    if (!loginPassword) {
      showToast(language === 'Telugu' ? 'దయచేసి పాస్‌వర్డ్‌ను నమోదు చేయండి' : 'Please enter your password');
      return;
    }

    setCitizenLoading(true);
    try {
      const res = await fetch('/api/auth/citizen-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password: loginPassword })
      });
      const data = await res.json();
      setCitizenLoading(false);

      if (res.status === 200 && data.success) {
        onLoginSuccess(data.user);
      } else {
        showToast(data.message || 'Incorrect password.');
      }
    } catch (err) {
      setCitizenLoading(false);
      showToast('Server connection failed. Make sure the app server is running.');
    }
  };

  // ─── Citizen Registration Submit (auto-login on success) ──────
  const handleCitizenRegister = async (e) => {
    e.preventDefault();
    const cleanPhone = citizenPhone.trim().replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      showToast(language === 'Telugu' ? 'దయచేసి మీ 10 అంకెల మొబైల్ సంఖ్యను నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (!citizenName.trim()) {
      showToast(language === 'Telugu' ? 'దయచేసి మీ పూర్తి పేరు నమోదు చేయండి' : 'Please enter your full name');
      return;
    }
    if (!citizenPassword || citizenPassword.length < 4) {
      showToast(language === 'Telugu' ? 'పాస్‌వర్డ్ కనీసం 4 అక్షరాలు ఉండాలి' : 'Password must be at least 4 characters');
      return;
    }

    setCitizenLoading(true);
    try {
      const res = await fetch('/api/auth/citizen-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: citizenName.trim(),
          phone: cleanPhone,
          village: citizenVillage.trim() || 'Anantapur',
          password: citizenPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        setCitizenLoading(false);
        showToast(language === 'Telugu' ? 'నమోదు విజయవంతమైంది! 🎉' : 'Registration successful! 🎉');
        onLoginSuccess(data.user);
      } else {
        setCitizenLoading(false);
        showToast(data.message || 'Registration failed');
      }
    } catch (err) {
      setCitizenLoading(false);
      showToast('Server connection failed. Please try again.');
    }
  };

  // ─── Admin Login Submit ────────────────────────────────────────
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminId || !adminPassword) {
      showToast('Please enter both Official ID and password');
      return;
    }
    setAdminLoading(true);
    try {
      const res = await fetch('/api/auth/official-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ official_id: adminId, password: adminPassword })
      });
      const data = await res.json();
      setAdminLoading(false);

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        showToast(data.message || 'Login failed');
      }
    } catch (err) {
      setAdminLoading(false);
      showToast('Server connection failed. Please try again.');
    }
  };

  // ─── Admin Registration Submit (auto-login on success) ─────────
  const handleAdminRegister = async (e) => {
    e.preventDefault();
    if (!adminName.trim()) {
      showToast('Please enter your full name');
      return;
    }
    if (!adminId || !adminId.toUpperCase().startsWith('OFF-')) {
      showToast('Official ID must start with OFF- (e.g. OFF-1234)');
      return;
    }
    if (!adminPassword || adminPassword.length < 4) {
      showToast('Password must be at least 4 characters');
      return;
    }

    setAdminLoading(true);
    try {
      const res = await fetch('/api/auth/official-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName.trim(),
          official_id: adminId.toUpperCase().trim(),
          password: adminPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        setAdminLoading(false);
        showToast('Official Registered! 🎉');
        onLoginSuccess(data.user);
      } else {
        setAdminLoading(false);
        showToast(data.message || 'Registration failed');
      }
    } catch (err) {
      setAdminLoading(false);
      showToast('Server connection failed. Please try again.');
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Role Selection Screen
  // ═══════════════════════════════════════════════════════════════
  if (view === 'select') {
    return (
      <div className="role-select-page">
        {/* Header */}
        <div className="role-select-header">
          <div className="role-select-logo">🏛️</div>
          <h1 className="role-select-title">Sachivalayam Connect</h1>
          <p className="role-select-subtitle">AP Grama Sachivalayam — Government of Andhra Pradesh</p>
          <p className="role-select-tagline">Speak. Report. Resolve.</p>
        </div>

        {/* Divider */}
        <div className="role-select-divider-text">Select your role to continue</div>

        {/* Split Role Cards */}
        <div className="role-cards-split">

          {/* Admin Card */}
          <div className="role-card role-card-admin" onClick={() => setView('admin')} tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setView('admin')} role="button" aria-label="Select Admin role">
            <div className="role-card-glow role-card-glow-admin" />
            <div className="role-card-icon-wrap role-card-icon-admin">
              <span className="role-card-icon">👮‍♂️</span>
            </div>
            <h2 className="role-card-title">Admin / Official</h2>
            <p className="role-card-desc">Sachivalayam staff, Panchayat officials & municipal authorities managing grievances</p>
            <ul className="role-card-features">
              <li>✦ Manage complaints &amp; statuses</li>
              <li>✦ Access GIS &amp; analytics</li>
              <li>✦ Generate reports</li>
            </ul>
            <div className="role-card-action role-card-action-admin">
              Sign In as Official →
            </div>
          </div>

          {/* Divider middle */}
          <div className="role-cards-or">
            <div className="role-cards-or-line" />
            <span className="role-cards-or-label">OR</span>
            <div className="role-cards-or-line" />
          </div>

          {/* Citizen Card */}
          <div className="role-card role-card-citizen" onClick={() => setView('citizen')} tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setView('citizen')} role="button" aria-label="Select Citizen role">
            <div className="role-card-glow role-card-glow-citizen" />
            <div className="role-card-icon-wrap role-card-icon-citizen">
              <span className="role-card-icon">🌾</span>
            </div>
            <h2 className="role-card-title">Citizen / Resident</h2>
            <p className="role-card-desc">Village residents reporting local infrastructure issues via voice in Telugu &amp; English</p>
            <ul className="role-card-features">
              <li>✦ Register new account instantly</li>
              <li>✦ Report grievances by voice</li>
              <li>✦ Track complaint status</li>
            </ul>
            <div className="role-card-action role-card-action-citizen">
              Register / Sign In →
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="role-select-footer">
          © 2026 Sachivalayam Connect Pro · Dept. of Panchayati Raj &amp; Rural Development
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Citizen Screen (Register or Login)
  // ═══════════════════════════════════════════════════════════════
  if (view === 'citizen') {
    return (
      <div className="auth-form-page">
        {/* Back button */}
        <button className="auth-back-btn" onClick={() => { setView('select'); setCitizenSubView('login'); setCitizenName(''); setCitizenPhone(''); setCitizenVillage(''); setCitizenPassword(''); setLoginPhone(''); setLoginPassword(''); }}>
          ← Back to Role Selection
        </button>

        <div className="auth-form-wrapper">
          {/* Left branding panel */}
          <div className="auth-branding-panel auth-branding-citizen">
            <div className="auth-branding-badge">🌾 Citizens Portal</div>
            <h2 className="auth-branding-headline">
              Your Voice,<br />Your Rights
            </h2>
            <p className="auth-branding-para">
              Register in seconds and start reporting local infrastructure issues. No complex paperwork — just your name and phone number.
            </p>
            <div className="auth-branding-stats">
              <div className="auth-bstat">
                <span className="auth-bstat-num">15,000+</span>
                <span className="auth-bstat-lbl">Grievances Resolved</span>
              </div>
              <div className="auth-bstat">
                <span className="auth-bstat-num">98%</span>
                <span className="auth-bstat-lbl">Satisfaction Rate</span>
              </div>
            </div>
            <div className="auth-branding-features">
              <div className="auth-bf-item">🎙️ Voice-first reporting in Telugu &amp; English</div>
              <div className="auth-bf-item">📍 Geo-tagged issue tracking</div>
              <div className="auth-bf-item">📸 Photo evidence upload</div>
              <div className="auth-bf-item">⏱️ Real-time status updates</div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="auth-form-panel">
            <div className="auth-form-body">
              {/* Citizen tabs */}
              <div className="auth-subtabs">
                <button
                  className={`auth-subtab ${citizenSubView === 'login' ? 'active' : ''}`}
                  onClick={() => { setCitizenSubView('login'); setCitizenPassword(''); }}
                >
                  {language === 'Telugu' ? 'సిటిజన్ లాగిన్ (Sign In)' : 'Citizen Sign In'}
                </button>
                <button
                  className={`auth-subtab ${citizenSubView === 'register' ? 'active' : ''}`}
                  onClick={() => { setCitizenSubView('register'); setCitizenPassword(''); }}
                >
                  {language === 'Telugu' ? 'కొత్త రిజిస్ట్రేషన్ (Register)' : 'New Registration'}
                </button>
              </div>

              {/* ── CITIZEN LOGIN VIEW ── */}
              {citizenSubView === 'login' && (
                <>
                  <div className="admin-form-icon" style={{ fontSize: '50px', textAlign: 'center', marginBottom: '16px' }}>🔐</div>
                  <h2 className="auth-form-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
                    {language === 'Telugu' ? 'సిటిజన్ లాగిన్' : 'Citizen Sign In'}
                  </h2>
                  <p className="auth-form-sub" style={{ textAlign: 'center', marginBottom: '28px' }}>
                    {language === 'Telugu' 
                      ? 'మీ మొబైల్ సంఖ్య మరియు పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి' 
                      : 'Sign in with your registered mobile number and password'}
                  </p>

                  <form onSubmit={handleCitizenLogin} className="auth-form">
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        <span className="form-label-icon">📱</span> 
                        {language === 'Telugu' ? 'మొబైల్ సంఖ్య' : 'Mobile Number'}
                      </label>
                      <div className="phone-input-wrap">
                        <span className="phone-prefix">+91</span>
                        <input
                          type="tel"
                          className={`form-control phone-input ${loginPhone.length > 0 ? (loginPhone.length === 10 ? 'valid' : 'invalid') : ''}`}
                          placeholder={language === 'Telugu' ? 'ఉదా: 9876543210' : 'e.g. 9876543210'}
                          maxLength="10"
                          value={loginPhone}
                          onChange={e => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                          required
                          autoFocus
                        />
                      </div>
                      {loginPhone.length > 0 && loginPhone.length < 10 && (
                        <span className="form-hint-error">
                          {language === 'Telugu' 
                            ? `ఇంకా ${10 - loginPhone.length} అంకెలు అవసరం` 
                            : `${10 - loginPhone.length} more digits needed`}
                        </span>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label className="form-label">
                        <span className="form-label-icon">🔑</span> 
                        {language === 'Telugu' ? 'పాస్‌వర్డ్' : 'Password'}
                      </label>
                      <div className="password-input-wrap">
                        <input
                          type={showCitizenPassword ? 'text' : 'password'}
                          className="form-control password-input"
                          placeholder={language === 'Telugu' ? 'మీ పాస్‌వర్డ్‌ను నమోదు చేయండి' : 'Enter your password'}
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowCitizenPassword(!showCitizenPassword)}
                          tabIndex={-1}
                        >
                          {showCitizenPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {/* Demo quick-fill hint */}
                    <div className="demo-hint-box" style={{ marginBottom: '24px' }}>
                      <span>💡</span>
                      <span>
                        <strong>{language === 'Telugu' ? 'డెమో ఖాతా:' : 'Demo Account:'}</strong> 
                        <code>9876543210</code> / <code>123456</code>
                      </span>
                    </div>

                    <button type="submit" className="btn-auth btn-auth-citizen" disabled={citizenLoading} style={{ padding: '16px', fontSize: '16px' }}>
                      {citizenLoading ? (
                        <span className="btn-loading"><span className="spinner" /> {language === 'Telugu' ? 'లాగిన్ అవుతోంది...' : 'Signing in...'}</span>
                      ) : (
                        language === 'Telugu' ? 'లాగిన్ అవ్వండి (Sign In)' : 'Sign In'
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* ── NEW USER REGISTRATION VIEW ── */}
              {citizenSubView === 'register' && (
                <>
                  <div className="admin-form-icon" style={{ fontSize: '50px', textAlign: 'center', marginBottom: '16px' }}>🌾</div>
                  <h2 className="auth-form-title" style={{ textAlign: 'center', marginBottom: '8px' }}>
                    {language === 'Telugu' ? 'ఖాతాను సృష్టించండి' : 'Create Account'}
                  </h2>
                  <p className="auth-form-sub" style={{ textAlign: 'center', marginBottom: '28px' }}>
                    {language === 'Telugu' 
                      ? 'నమోదు చేసుకోవడానికి మీ వివరాలను పూరించండి' 
                      : 'Fill in your details to register as a citizen'}
                  </p>

                  <form onSubmit={handleCitizenRegister} className="auth-form">
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        <span className="form-label-icon">👤</span> 
                        {language === 'Telugu' ? 'మీ పూర్తి పేరు' : 'Your Full Name'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Ramesh Kumar"
                        value={citizenName}
                        onChange={e => setCitizenName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        <span className="form-label-icon">📱</span> 
                        {language === 'Telugu' ? 'మొబైల్ సంఖ్య' : 'Mobile Number'}
                      </label>
                      <div className="phone-input-wrap">
                        <span className="phone-prefix">+91</span>
                        <input
                          type="tel"
                          className={`form-control phone-input ${citizenPhone.length > 0 ? (citizenPhone.length === 10 ? 'valid' : 'invalid') : ''}`}
                          placeholder={language === 'Telugu' ? 'ఉదా: 9876543210' : 'e.g. 9876543210'}
                          maxLength="10"
                          value={citizenPhone}
                          onChange={e => setCitizenPhone(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>
                      {citizenPhone.length > 0 && citizenPhone.length < 10 && (
                        <span className="form-hint-error">
                          {language === 'Telugu' 
                            ? `ఇంకా ${10 - citizenPhone.length} అంకెలు అవసరం` 
                            : `${10 - citizenPhone.length} more digits needed`}
                        </span>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        <span className="form-label-icon">🔑</span> 
                        {language === 'Telugu' ? 'పాస్‌వర్డ్ సృష్టించండి' : 'Create Password'}
                      </label>
                      <div className="password-input-wrap">
                        <input
                          type={showCitizenPassword ? 'text' : 'password'}
                          className="form-control password-input"
                          placeholder={language === 'Telugu' ? 'కనీసం 4 అక్షరాలు' : 'Min 4 characters'}
                          value={citizenPassword}
                          onChange={e => setCitizenPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowCitizenPassword(!showCitizenPassword)}
                          tabIndex={-1}
                        >
                          {showCitizenPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label className="form-label">
                        <span className="form-label-icon">🏘️</span> 
                        {language === 'Telugu' ? 'గ్రామ పంచాయతీ (ఐచ్ఛికం)' : 'Village / Gram Panchayat (Optional)'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Kothacheruvu"
                        value={citizenVillage}
                        onChange={e => setCitizenVillage(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn-auth btn-auth-citizen" disabled={citizenLoading} style={{ padding: '16px', fontSize: '16px' }}>
                      {citizenLoading ? (
                        <span className="btn-loading"><span className="spinner" /> {language === 'Telugu' ? 'నమోదు అవుతోంది...' : 'Registering...'}</span>
                      ) : (
                        language === 'Telugu' ? 'నమోదు చేసుకోండి & లాగిన్ అవ్వండి' : 'Register & Sign In'
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Admin Screen
  // ═══════════════════════════════════════════════════════════════
  if (view === 'admin') {
    return (
      <div className="auth-form-page">
        <button className="auth-back-btn" onClick={() => { setView('select'); setAdminId(''); setAdminPassword(''); setAdminName(''); setAdminSubView('login'); }}>
          ← Back to Role Selection
        </button>

        <div className="auth-form-wrapper">
          {/* Left branding panel */}
          <div className="auth-branding-panel auth-branding-admin">
            <div className="auth-branding-badge">👮‍♂️ Officials Portal</div>
            <h2 className="auth-branding-headline">
              Empowering<br />Administration
            </h2>
            <p className="auth-branding-para">
              Secure access for Sachivalayam staff, Panchayat officials and municipal authorities to manage and resolve citizen grievances efficiently.
            </p>
            <div className="auth-branding-features">
              <div className="auth-bf-item">📊 Real-time analytics dashboard</div>
              <div className="auth-bf-item">🗺️ GIS complaint mapping</div>
              <div className="auth-bf-item">⚡ Priority queue management</div>
              <div className="auth-bf-item">📋 Audit trail &amp; reports</div>
            </div>
            <div className="auth-branding-secure-badge">
              <span>🔒</span> Secured by Government Grade Encryption
            </div>
          </div>

          {/* Right form panel */}
          <div className="auth-form-panel">
            <div className="auth-form-body">
              {/* Admin tabs */}
              <div className="auth-subtabs">
                <button
                  className={`auth-subtab ${adminSubView === 'login' ? 'active' : ''}`}
                  onClick={() => { setAdminSubView('login'); }}
                >
                  Official Sign In
                </button>
                <button
                  className={`auth-subtab ${adminSubView === 'register' ? 'active' : ''}`}
                  onClick={() => { setAdminSubView('register'); }}
                >
                  Official Sign Up
                </button>
              </div>

              {/* ── OFFICIAL SIGN IN ── */}
              {adminSubView === 'login' && (
                <>
                  <div className="admin-form-icon">🏛️</div>
                  <h2 className="auth-form-title">Official Sign In</h2>
                  <p className="auth-form-sub">Enter your credentials issued by the department</p>

                  <form onSubmit={handleAdminLogin} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="form-label-icon">🪪</span> Official ID
                      </label>
                      <input
                        type="text"
                        className={`form-control ${adminId.length > 0 ? (adminId.toUpperCase().startsWith('OFF-') ? 'valid' : 'invalid') : ''}`}
                        placeholder="e.g. OFF-9988"
                        value={adminId}
                        onChange={e => setAdminId(e.target.value.toUpperCase())}
                        required
                        autoFocus
                      />
                      {adminId.length > 0 && !adminId.startsWith('OFF-') && (
                        <span className="form-hint-error">Format: OFF-XXXX</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="form-label-icon">🔑</span> Password
                      </label>
                      <div className="password-input-wrap">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control password-input"
                          placeholder="Enter your password"
                          value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {/* Demo hint */}
                    <div className="demo-hint-box demo-hint-admin">
                      <span>💡</span>
                      <span><strong>Demo:</strong> ID: <code>OFF-9988</code> · Password: <code>admin123</code></span>
                    </div>

                    <button type="submit" className="btn-auth btn-auth-admin" disabled={adminLoading}>
                      {adminLoading ? (
                        <span className="btn-loading"><span className="spinner" /> Authenticating...</span>
                      ) : (
                        '🔐 Authenticate & Access Portal'
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* ── OFFICIAL SIGN UP ── */}
              {adminSubView === 'register' && (
                <>
                  <div className="admin-form-icon">👮‍♂️</div>
                  <h2 className="auth-form-title">Official Registration</h2>
                  <p className="auth-form-sub">Create your administrative staff profile</p>

                  <form onSubmit={handleAdminRegister} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="form-label-icon">👤</span> Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. V. Satyanarayana"
                        value={adminName}
                        onChange={e => setAdminName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="form-label-icon">🪪</span> Official ID (OFF-XXXX)
                      </label>
                      <input
                        type="text"
                        className={`form-control ${adminId.length > 0 ? (adminId.toUpperCase().startsWith('OFF-') ? 'valid' : 'invalid') : ''}`}
                        placeholder="e.g. OFF-1122"
                        value={adminId}
                        onChange={e => setAdminId(e.target.value.toUpperCase())}
                        required
                      />
                      {adminId.length > 0 && !adminId.startsWith('OFF-') && (
                        <span className="form-hint-error">ID must start with OFF- (e.g. OFF-1122)</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="form-label-icon">🔑</span> Password
                      </label>
                      <div className="password-input-wrap">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control password-input"
                          placeholder="Min 4 characters"
                          value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="btn-auth btn-auth-admin" disabled={adminLoading}>
                      {adminLoading ? (
                        <span className="btn-loading"><span className="spinner" /> Registering...</span>
                      ) : (
                        '🚀 Register & Sign In'
                      )}
                    </button>
                  </form>
                </>
              )}

              <p className="auth-switch-hint" style={{ marginTop: '20px' }}>
                Are you a citizen?{' '}
                <button className="auth-link-btn" onClick={() => setView('citizen')}>Register here</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
