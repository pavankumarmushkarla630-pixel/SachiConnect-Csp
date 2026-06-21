import React, { useState, useEffect, useRef } from 'react';

export default function AIChatbot({ language, inline = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const t = {
    English: {
      botName: "Sachivalayam Bot",
      placeholder: "Ask about complaints, schemes...",
      greeting: "Hello! I am your Sachivalayam Assistant. How can I help you today?",
      suggestReport: "How do I report a complaint?",
      suggestTrack: "How do I track my grievance?",
      suggestPanchayat: "What is Grama Sachivalayam?",
      suggestSchemes: "What welfare schemes are available?",
      typing: "Assistant is typing..."
    },
    Telugu: {
      botName: "సచివాలయం బాట్",
      placeholder: "ఫిర్యాదులు, పథకాల గురించి అడగండి...",
      greeting: "నమస్కారం! నేను మీ సచివాలయం సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
      suggestReport: "ఫిర్యాదు నమోదు చేయడం ఎలా?",
      suggestTrack: "ఫిర్యాదు స్థితిని తనిఖీ చేయడం ఎలా?",
      suggestPanchayat: "గ్రామ సచివాలయం అంటే ఏమిటి?",
      suggestSchemes: "ఏయే పథకాలు అందుబాటులో ఉన్నాయి?",
      typing: "సహాయకుడు టైప్ చేస్తున్నాడు..."
    }
  }[language] || {
    botName: "Sachivalayam Bot",
    placeholder: "Ask about complaints, schemes...",
    greeting: "Hello! I am your Sachivalayam Assistant. How can I help you today?",
    suggestReport: "How do I report a complaint?",
    suggestTrack: "How do I track my grievance?",
    suggestPanchayat: "What is Grama Sachivalayam?",
    suggestSchemes: "What welfare schemes are available?",
    typing: "Assistant is typing..."
  };

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      { id: 'greet', sender: 'bot', text: t.greeting, timestamp: new Date() }
    ]);
  }, [language]);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Local rule-based AI responder
  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    
    // English rules
    if (language === 'English') {
      if (q.includes('complaint') || q.includes('report') || q.includes('submit') || q.includes('file')) {
        return "To file a new grievance, click the **Report** button (🎙️ icon) on the bottom navigation bar. The voice assistant will guide you step-by-step to describe the issue. After that, you will capture a photo to geo-tag your report.";
      }
      if (q.includes('track') || q.includes('status') || q.includes('check') || q.includes('history')) {
        return "You can check the status of all your submitted complaints by clicking on the **History** tab (📋 icon) in the bottom navigation menu. Simply select a grievance ID to view its real-time timeline.";
      }
      if (q.includes('sachivalayam') || q.includes('panchayat') || q.includes('village') || q.includes('office')) {
        return "Grama Sachivalayams were launched by the AP government to digitize and deliver over 500 citizen services, welfare schemes, and direct local administrative grievances closer to the rural communities.";
      }
      if (q.includes('scheme') || q.includes('welfare') || q.includes('pension') || q.includes('housing') || q.includes('money')) {
        return "Popular schemes at your local Sachivalayam include **YSR Pension Kanuka** (pension support), **Amma Vodi** (financial support for education), and housing benefits. You can inquire and apply at the Welfare Assistant counter inside your village panchayat office.";
      }
      return "I'm here to assist you with Sachivalayam Connect. You can ask me how to file complaints, check tracking status, or query village administration details!";
    } 
    
    // Telugu rules
    else {
      if (q.includes('ఫిర్యాదు') || q.includes('రిపోర్ట్') || q.includes('సమర్ప') || q.includes('నమోదు')) {
        return "కొత్త ఫిర్యాదును నమోదు చేయడానికి, క్రింది నావిగేషన్ బార్‌లోని **నివేదించు** (🎙️ చిహ్నం) బటన్‌ను క్లిక్ చేయండి. వాయిస్ అసిస్టెంట్ మిమ్మల్ని 4 దశల్లో నడిపిస్తుంది. చివరగా మీరు ఫోటో తీసి ఫిర్యాదును సమర్పించవచ్చు.";
      }
      if (q.includes('స్థితి') || q.includes('స్టేటస్') || q.includes('ట్రాక్') || q.includes('చరిత్ర') || q.includes('హిస్టరీ')) {
        return "మీరు సమర్పించిన ఫిర్యాదుల స్థితిని చూడటానికి క్రింది నావిగేషన్ బార్‌లోని **చరిత్ర** (📋 చిహ్నం) టాబ్‌పై క్లిక్ చేయండి. ఆపై నిర్దిష్ట ఫిర్యాదును ఎంచుకోవడం ద్వారా దాని పురోగతిని తెలుసుకోవచ్చు.";
      }
      if (q.includes('సచివాలయం') || q.includes('పంచాయతీ') || q.includes('గ్రామం') || q.includes('ఆఫీస్')) {
        return "గ్రామ సచివాలయాలు ప్రజలకు సులభంగా, వేగంగా పాలనను మరియు ప్రభుత్వ సేవలను ముంగిటకే అందించడానికి ఆంధ్రప్రదేశ్ ప్రభుత్వం ఏర్పాటు చేసిన సమర్థవంతమైన వ్యవస్థ.";
      }
      if (q.includes('పథకం') || q.includes('పథకాలు') || q.includes('పెన్షన్') || q.includes('ఇల్లు') || q.includes('డబ్బులు') || q.includes('అమ్మ ఒడి')) {
        return "సచివాలయం ద్వారా అందే పథకాలలో **వైఎస్ఆర్ పెన్షన్ కానుక** (పెన్షన్ సాయం), **జగనన్న అమ్మ ఒడి** (విద్యా సాయం) వంటి పథకాలు ఉన్నాయి. దరఖాస్తు చేసుకోవడానికి సచివాలయ సంక్షేమ సహాయకుడిని కలవండి.";
      }
      return "సచివాలయం కనెక్ట్ యాప్ ద్వారా ఫిర్యాదులను ఎలా నివేదించాలో, వాటిని ఎలా ట్రాక్ చేయాలో మరియు స్థానిక పథకాల వివరాలను నేను మీకు వివరించగలను. దయచేసి మీ సందేహాన్ని అడగండి!";
    }
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // User message
    const userMsg = { id: Date.now() + '-user', sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Bot response simulation after a short delay
    setTimeout(() => {
      const botText = getBotResponse(text);
      const botMsg = { id: Date.now() + '-bot', sender: 'bot', text: botText, timestamp: new Date() };
      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  const handleTextToSpeech = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // cancel any active reading
    
    // Remove markdown bold markings for cleaner speech
    const cleanText = text.replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'Telugu' ? 'te-IN' : 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const desiredLocale = language === 'Telugu' ? 'te-IN' : 'en-US';
    const voice = voices.find(v => v.lang.startsWith(desiredLocale));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  };

  const chatContent = (
    <div className={`chatbot-window ${inline ? 'inline' : ''}`}>
      {/* Header */}
      <div className="chatbot-header">
        <span className="chatbot-title">🤖 {t.botName}</span>
        {!inline && <button className="chatbot-close" onClick={() => setIsOpen(false)}>×</button>}
      </div>

      {/* Message List */}
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            <span>{msg.text}</span>
            {msg.sender === 'bot' && (
              <button 
                className="bot-speaker-btn"
                onClick={() => handleTextToSpeech(msg.text)}
                title="Read answer out loud"
              >
                🔊
              </button>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Query Chips Suggestions */}
      <div className="chatbot-suggestions">
        <div className="suggestion-chip" onClick={() => handleSendMessage(t.suggestReport)}>
          💡 {t.suggestReport}
        </div>
        <div className="suggestion-chip" onClick={() => handleSendMessage(t.suggestTrack)}>
          🔍 {t.suggestTrack}
        </div>
        <div className="suggestion-chip" onClick={() => handleSendMessage(t.suggestPanchayat)}>
          🏛️ {t.suggestPanchayat}
        </div>
        <div className="suggestion-chip" onClick={() => handleSendMessage(t.suggestSchemes)}>
          🌾 {t.suggestSchemes}
        </div>
      </div>

      {/* Free Text Input area */}
      <div className="chatbot-input-area">
        <input 
          type="text" 
          className="chatbot-input" 
          placeholder={t.placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
        />
        <button 
          className="chatbot-send" 
          onClick={() => handleSendMessage(inputValue)}
        >
          ➔
        </button>
      </div>
    </div>
  );

  if (inline) {
    return chatContent;
  }

  return (
    <>
      {/* Floating Button */}
      <button 
        className="chatbot-float" 
        onClick={() => setIsOpen(!isOpen)}
        title="Open Support Chatbot"
      >
        💬
      </button>

      {/* Glassmorphic Chat Window */}
      {isOpen && chatContent}
    </>
  );
}
