import React, { useEffect } from 'react';
 
 export default function Splash({ onComplete }) {
   useEffect(() => {
     const timer = setTimeout(() => {
       onComplete();
     }, 2800);
     return () => clearTimeout(timer);
   }, [onComplete]);
 
   return (
     <div 
       className="splash-screen" 
       style={{ 
         background: 'linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%)',
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
         zIndex: 9999
       }}
     >
       {/* Top spacer to vertically center the logo block */}
       <div style={{ height: '0px' }} />

       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
         
         {/* Animated Premium Logo icon */}
         <div className="splash-logo" style={{ animation: 'pulseLogo 2s infinite ease-in-out', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '24px', borderRadius: '50%', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg 
               width="60" 
               height="60" 
               viewBox="0 0 24 24" 
               fill="none" 
               stroke="#FFFFFF" 
               strokeWidth="2.5" 
               strokeLinecap="round" 
               strokeLinejoin="round"
               style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
             >
               <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
               <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
               <line x1="12" x2="12" y1="19" y2="22" />
             </svg>
           </div>
           <span style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>
             Sachivalayam Connect
           </span>
         </div>
 
         <div className="splash-tagline" style={{ fontSize: '14px', letterSpacing: '3px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '700', textTransform: 'uppercase' }}>
           Speak. Report. Resolve.
         </div>
 
         {/* Loading bar animation */}
         <div style={{ width: '140px', height: '4px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '2px', overflow: 'hidden', marginTop: '12px' }}>
           <div style={{ width: '100%', height: '100%', background: '#FFFFFF', transformOrigin: 'left', animation: 'loadBar 2.5s ease-in-out forwards' }}></div>
         </div>
       </div>
 
       <div className="splash-footer" style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px' }}>
         AP Panchayat Raj & Rural Development
       </div>
 
       {/* Embedded inline keyframes for custom splash loading */}
       <style>{`
         @keyframes loadBar {
           0% { transform: scaleX(0); }
           100% { transform: scaleX(1); }
         }
       `}</style>
     </div>
   );
 }
