import React, { useEffect } from 'react';

export default function Splash({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="splash-screen" 
      style={{ 
        background: 'linear-gradient(135deg, #1e3a8a, #0f172a, #0d9488)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 8s ease infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        padding: '80px 20px 40px 20px',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        zIndex: 9999,
        fontFamily: 'var(--font-heading)'
      }}
    >
      <div style={{ height: '10px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* Animated Premium Logo icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.08)', 
            border: '1.5px solid rgba(255, 255, 255, 0.2)', 
            padding: '28px', 
            borderRadius: '50%', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            animation: 'logoEnter 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, glowRipple 3s infinite ease-in-out'
          }}>
            <svg 
              width="60" 
              height="60" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
            >
              {/* Classical Administrative Capitol Building Icon */}
              <path d="M4 20h16M4 17v-7h16v7M2 20h20M12 2v4m5-4-5-4-5 4M8 10v7M12 10v7M16 10v7" />
            </svg>
          </div>

          <h1 style={{ 
            fontSize: '34px', 
            fontWeight: '900', 
            letterSpacing: '-0.03em', 
            margin: '0 0 8px 0',
            textAlign: 'center',
            animation: 'textEnter 1s ease-out 0.2s both',
            background: 'linear-gradient(to right, #FFFFFF, #E2E8F0, #FFFFFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}>
            Sachivalayam Connect
          </h1>
        </div>

        {/* Removed "SPEAK" from tagline as requested */}
        <div style={{ 
          fontSize: '13px', 
          letterSpacing: '5px', 
          color: 'rgba(20, 184, 166, 0.9)', 
          fontWeight: '800', 
          textTransform: 'uppercase',
          animation: 'textEnter 1s ease-out 0.5s both',
          marginTop: '4px'
        }}>
          Report. Resolve.
        </div>

        {/* Loading bar animation */}
        <div style={{ 
          width: '180px', 
          height: '4px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '2px', 
          overflow: 'hidden', 
          marginTop: '24px',
          animation: 'textEnter 1s ease-out 0.7s both'
        }}>
          <div style={{ 
            width: '100%', 
            height: '100%', 
            background: 'linear-gradient(to right, #0d9488, #22c55e, #10b981)', 
            transformOrigin: 'left', 
            animation: 'loadBar 2.8s ease-in-out forwards' 
          }}></div>
        </div>
      </div>

      <div style={{ 
        fontSize: '11px', 
        fontWeight: '700', 
        color: 'rgba(255,255,255,0.3)', 
        letterSpacing: '2px',
        animation: 'textEnter 1s ease-out 0.9s both'
      }}>
        AP Panchayat Raj & Rural Development
      </div>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes loadBar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes logoEnter {
          0% { transform: scale(0.5) rotate(-15deg); opacity: 0; filter: blur(4px); }
          60% { transform: scale(1.08) rotate(3deg); opacity: 0.9; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; filter: blur(0); }
        }
        @keyframes textEnter {
          0% { transform: translateY(15px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes glowRipple {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.15), 0 0 0 0 rgba(13,148,136,0.1); }
          70% { box-shadow: 0 0 0 15px rgba(255,255,255,0), 0 0 0 25px rgba(13,148,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0), 0 0 0 0 rgba(13,148,136,0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
