import React from 'react';

export default function LanguageSelection({ onSelectLanguage }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px', background: 'var(--bg-color)' }}>
      <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        
        {/* Onboarding Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
          <h2 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>
            Welcome / స్వాగతం
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>
            Select language to start grievance registration / సేవలను ప్రారంభించడానికి భాషను ఎంచుకోండి
          </p>
        </div>

        {/* Options grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          
          {/* Telugu Card */}
          <div 
            className="card card-interactive" 
            onClick={() => onSelectLanguage('Telugu')}
            style={{ 
              padding: '24px', 
              textAlign: 'left', 
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              border: '1.5px solid var(--border-color)',
              background: 'var(--surface-color)'
            }}
          >
            <div style={{ fontSize: '32px', background: 'rgba(20, 184, 166, 0.08)', padding: '12px', borderRadius: '12px' }}>🗣️</div>
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--accent)', fontWeight: '800' }}>తెలుగు</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '2px', fontWeight: '500' }}>
                వాయిస్ సహాయంతో ఫిర్యాదు చేయండి
              </p>
            </div>
          </div>

          {/* English Card */}
          <div 
            className="card card-interactive" 
            onClick={() => onSelectLanguage('English')}
            style={{ 
              padding: '24px', 
              textAlign: 'left', 
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              border: '1.5px solid var(--border-color)',
              background: 'var(--surface-color)'
            }}
          >
            <div style={{ fontSize: '32px', background: 'rgba(37, 99, 235, 0.08)', padding: '12px', borderRadius: '12px' }}>🗣️</div>
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '800' }}>English</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '2px', fontWeight: '500' }}>
                Report your grievance using voice guide
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
