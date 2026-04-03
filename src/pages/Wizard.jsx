import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Send, Share, Clock, DollarSign, AlertTriangle, Calendar, MessageCircle, X } from 'lucide-react';
import VirtualAdvisorModal from '../components/VirtualAdvisorModal';

const LIFE_CHANGES = [
  'Marriage', 'Divorce', 'New child', 'Income change', 
  'Mortgage', 'Health changes', 'Business changes', 'None of these'
];

const Wizard = () => {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // Step 2 specific
  const [selectedChanges, setSelectedChanges] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  
  // Step 3 specific
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Modals
  const [showSchedule, setShowSchedule] = useState(false);
  const [showVirtualAdvisor, setShowVirtualAdvisor] = useState(false);
  
  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: "Hi there! 👋 I'm your policy advisor. I can help you review your life insurance coverage in just a few minutes.\n\nWould you like to:\n📄 Upload your existing life insurance policy\n🎯 Use a demo policy\n💬 Ask a general question about life insurance",
        actions: [
          { label: '📄 Use Demo Policy', value: 'demo' },
          { label: '📎 Upload My Policy', value: 'upload' },
          { label: '💬 Ask a Question', value: 'ask' }
        ]
      }
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step, loadingStep, activeQuestion]);

  const handleActionClick = (value) => {
    if (value === 'demo') {
      setMessages(prev => [
        ...prev, 
        { id: Date.now(), sender: 'user', text: '📄 Use Demo Policy' },
        { id: Date.now() + 1, sender: 'user', text: '📎 Demo_Life_Insurance_Policy.pdf', isFile: true }
      ]);
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now() + 2, 
            sender: 'ai', 
            text: "Great choice! I'm reviewing a demo policy — a $2M Term Life policy for a 42-year-old with two dependents and an existing estate plan." 
          },
          {
            id: Date.now() + 3,
            sender: 'ai',
            text: "Have you experienced any significant life changes since you purchased this policy?\nSelect all that apply:",
            isLifeChangesInput: true
          }
        ]);
        setStep(2);
      }, 1000);
    }
  };

  const submitLifeChanges = () => {
    const changesStr = selectedChanges.length > 0 ? selectedChanges.join(', ') : 'None';
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: `Life changes: ${changesStr}` }
    ]);
    
    // Remove input from previous message
    setMessages(prev => prev.map(m => m.isLifeChangesInput ? { ...m, isLifeChangesInput: false } : m));
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "Thank you for sharing. I'll factor these into your analysis. A few quick questions to get accurate results:",
          isFollowUp: true,
          questionIndex: 1,
          questionText: "What's your current household income range? (e.g. $500K, $1M+)"
        }
      ]);
      setActiveQuestion(1);
    }, 1000);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const text = inputValue;
    setInputValue('');
    
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text }
    ]);

    if (step === 2 && activeQuestion > 0) {
      // Remove follow-up input from AI state
      setMessages(prev => prev.map(m => m.isFollowUp ? { ...m, isFollowUp: false } : m));
      
      setTimeout(() => {
        if (activeQuestion === 1) {
          setMessages(prev => [...prev, {
            id: Date.now(), sender: 'ai', isFollowUp: true, questionIndex: 2,
            questionText: "Have your total assets or estate value changed significantly?"
          }]);
          setActiveQuestion(2);
        } else if (activeQuestion === 2) {
          setMessages(prev => [...prev, {
            id: Date.now(), sender: 'ai', isFollowUp: true, questionIndex: 3,
            questionText: "Do you have any new dependents or changes to your beneficiaries?"
          }]);
          setActiveQuestion(3);
        } else if (activeQuestion === 3) {
          setMessages(prev => [...prev, {
            id: Date.now(), sender: 'ai', isFollowUp: true, questionIndex: 4,
            questionText: "Have there been any changes to your outstanding debts or liabilities?"
          }]);
          setActiveQuestion(4);
        } else if (activeQuestion === 4) {
          setActiveQuestion(0);
          startAnalysis();
        }
      }, 600);
    } else if (step === 4) {
      // Quick reply handling
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(), sender: 'ai', 
          text: "I'm here to help with any questions about your policy. You can ask about:\n• Coverage adequacy and gaps\n• Premium optimization\n• What your score means\n• Next steps and recommendations\n• Scheduling an advisor call\n\nWhat would you like to explore? 😊"
        }]);
      }, 800);
    }
  };

  const startAnalysis = () => {
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'ai', text: "Thank you! I now have everything I need. Running your updated analysis…" },
      { id: Date.now()+1, sender: 'ai', isLoadingSim: true }
    ]);
    
    let currentLoader = 1;
    const interval = setInterval(() => {
      setLoadingStep(currentLoader);
      currentLoader++;
      if (currentLoader > 5) {
        clearInterval(interval);
        setTimeout(() => showResults(), 1000);
      }
    }, 1500);
  };

  const showResults = () => {
    setStep(3);
    setLoadingStep(6);
    
    setMessages(prev => [
      ...prev.filter(m => !m.isLoadingSim),
      { id: Date.now(), sender: 'ai', text: "Analysis complete! Here are your results. 🎉 Feel free to ask me any questions about what you see." },
      { id: Date.now()+1, sender: 'ai', isResultsPanel: true }
    ]);
    
    setTimeout(() => {
      setStep(4);
      setMessages(prev => [
        ...prev,
        { id: Date.now()+2, sender: 'ai', isCTA: true }
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-brand-dark font-sans text-text-primary">
      {/* Top Nav */}
      <nav className="h-[60px] flex items-center justify-between px-6 bg-brand-slate border-b border-brand-slate-light flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-white">
          <Shield size={24} className="text-accent-gold" />
          <span>AnalyzeMyPolicy</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="px-3 py-1 bg-amber-100 text-accent-amber-hover text-xs font-bold uppercase rounded-full">Demo Mode</span>
          <span className="text-text-secondary text-sm hidden md:inline">Analysis</span>
          <span className="text-accent-amber text-sm font-semibold cursor-pointer tracking-wide" onClick={() => navigate('/')}>↗ Exit Demo</span>
        </div>
      </nav>
      
      {/* Demo Banner */}
      <div className="bg-amber-500/10 text-accent-amber text-center py-3 text-sm border-b border-amber-500/20 flex-shrink-0">
        🎯 Demo Mode — Your data won't be saved. <span className="underline cursor-pointer" onClick={() => navigate('/')}>Create an account</span> to track your policy health over time.
      </div>
      
      {/* Step Indicator */}
      <div className="flex items-center justify-center py-6 bg-brand-dark flex-shrink-0 px-4">
        {[
          { num: 1, label: 'Understand' },
          { num: 2, label: 'Analyze' },
          { num: 3, label: 'Review' },
          { num: 4, label: 'Next Steps' }
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`flex items-center gap-2 text-sm font-bold ${step >= s.num ? (step > s.num ? 'text-green-500' : 'text-accent-amber') : 'text-text-muted'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= s.num ? (step > s.num ? 'bg-green-500 text-white' : 'bg-accent-amber text-brand-dark') : 'bg-brand-slate'}`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="hidden md:block">{s.label}</span>
            </div>
            {i !== 3 && <div className={`w-10 h-[2px] mx-2 md:mx-4 ${step > s.num ? 'bg-green-500' : 'bg-brand-slate'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center chat-scroll">
        <div className="w-full max-w-3xl flex flex-col gap-6 pb-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* AI normal message */}
              {msg.sender === 'ai' && !msg.isLoadingSim && !msg.isResultsPanel && !msg.isCTA && !msg.isFollowUp && !msg.isLifeChangesInput && (
                <div className="max-w-[85%] p-5 rounded-2xl text-base leading-relaxed bg-brand-slate text-text-primary rounded-tl-none">
                  <div className="whitespace-pre-line">{msg.text}</div>
                  
                  {msg.actions && step === 1 && (
                    <div className="flex flex-col gap-2 mt-5">
                      {msg.actions.map(action => (
                        <button key={action.value} className="bg-brand-dark border border-brand-slate-light text-text-primary px-4 py-3 rounded-full text-left cursor-pointer transition-colors text-sm hover:border-accent-amber hover:text-accent-amber" onClick={() => handleActionClick(action.value)}>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User message */}
              {msg.sender === 'user' && (
                <div className={`max-w-[85%] p-5 rounded-2xl text-base leading-relaxed border rounded-tr-none ${msg.isFile ? 'bg-brand-slate-light text-white border-transparent' : 'bg-amber-500/15 text-accent-amber border-amber-500/30'}`}>
                  {msg.text}
                </div>
              )}
              
              {/* AI FollowUp Question */}
              {msg.isFollowUp && (
                <div className="max-w-[85%] p-5 rounded-2xl text-base leading-relaxed bg-brand-slate text-text-primary rounded-tl-none">
                  {msg.questionText}
                </div>
              )}

              {/* Step 2: Life changes input block */}
              {msg.isLifeChangesInput && step === 2 && (
                <div className="max-w-[85%] p-5 rounded-2xl text-base leading-relaxed bg-brand-slate text-text-primary rounded-tl-none">
                  <div className="whitespace-pre-line mb-4">{msg.text}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {LIFE_CHANGES.map(change => {
                      const isSelected = selectedChanges.includes(change);
                      return (
                        <button 
                          key={change} 
                          className={`bg-brand-dark border px-4 py-2 rounded-full cursor-pointer transition-colors text-sm ${isSelected ? 'bg-amber-500/15 border-accent-amber text-accent-amber' : 'border-brand-slate-light text-text-primary'}`}
                          onClick={() => {
                            if (change === 'None of these') {
                              setSelectedChanges(['None of these']);
                            } else {
                              setSelectedChanges(prev => 
                                prev.includes('None of these') 
                                  ? [change] 
                                  : prev.includes(change) ? prev.filter(c => c !== change) : [...prev, change]
                              );
                            }
                          }}
                        >
                          {change}
                        </button>
                      )
                    })}
                  </div>
                  <button className="w-full mt-6 py-3 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-semibold rounded-lg transition-colors border border-transparent" onClick={submitLifeChanges}>
                    Continue
                  </button>
                </div>
              )}

              {/* Loading Simulator */}
              {msg.isLoadingSim && (
                <div className="w-full max-w-[85%] p-5 rounded-2xl text-base leading-relaxed bg-brand-slate text-text-primary rounded-tl-none">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-6 h-6 border-4 border-amber-500/30 border-t-accent-amber rounded-full animate-spin"></div>
                    <h3 className="text-accent-amber font-bold text-lg">Analyzing Your Policy...</h3>
                  </div>
                  <ul className="flex flex-col gap-3 text-sm">
                    {['Reading your policy document...', 'Identifying coverage and beneficiary details...', 'Analyzing premium structure...', 'Benchmarking against similar wealth profiles...', 'Preparing your personalized results...'].map((txt, i) => (
                      <li key={i} className={`flex items-center gap-2 ${loadingStep >= i + 1 ? (loadingStep > i + 1 ? 'text-green-500' : 'text-text-primary') : 'text-text-muted'}`}>
                        {loadingStep > i + 1 ? '✅' : (loadingStep === i + 1 ? '●' : '○')} {txt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Results Panel */}
              {msg.isResultsPanel && (
                <div className="w-full flex-col flex items-center gap-8 mt-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent-amber)_72%,var(--color-brand-slate)_0)] mb-2">
                      <div className="w-[140px] h-[140px] bg-brand-dark rounded-full flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-accent-amber leading-none">72</span>
                        <span className="text-[0.65rem] text-text-muted font-bold tracking-widest mt-1">OUT OF 100</span>
                      </div>
                    </div>
                    <h4 className="text-lg text-white font-bold">Policy Health Score</h4>
                    <span className="px-3 py-1 bg-amber-500/20 text-accent-amber font-semibold text-xs uppercase rounded-full">Needs Review</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {[
                      { icon: <Shield size={20} className="text-green-500" />, title: 'Coverage Fit', pill: 'Well matched', pillClass: 'bg-green-500/15 text-green-500', desc: "Your coverage aligns with your family's income, assets, and estate planning needs." },
                      { icon: <DollarSign size={20} className="text-accent-amber" />, title: 'Premium Efficiency', pill: 'Slightly high', pillClass: 'bg-amber-500/15 text-accent-amber', desc: "Your premium is above average for your profile. Comparable options may save $200+/year." },
                      { icon: <Clock size={20} className="text-green-500" />, title: 'Legacy Timeline', pill: 'Good fit', pillClass: 'bg-green-500/15 text-green-500', desc: "Your policy term covers your key wealth-building years and dependent care period." },
                      { icon: <AlertTriangle size={20} className="text-accent-amber" />, title: 'Review Needed', pill: '1 item', pillClass: 'bg-amber-500/15 text-accent-amber', desc: "Your beneficiary designations may need updating to reflect current estate plans." }
                    ].map((card, idx) => (
                      <div key={idx} className="bg-brand-slate p-6 rounded-xl border border-brand-slate-light">
                        <div className="flex items-center gap-2 font-bold mb-3 text-white">
                          {card.icon} {card.title}
                        </div>
                        <span className={`px-2 py-1 text-[0.7rem] font-bold uppercase rounded-full ${card.pillClass}`}>{card.pill}</span>
                        <p className="text-text-secondary text-sm mt-4 leading-relaxed">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* CTA Panel */}
              {msg.isCTA && (
                <div className="w-full flex flex-col items-center">
                  <div className="bg-brand-navy p-8 text-white rounded-xl w-full text-center border border-brand-slate-light shadow-2xl">
                    <h3 className="text-2xl font-bold mb-2">Speak with a Wealth Advisor</h3>
                    <p className="text-text-secondary mb-6 text-sm">Connect with a licensed advisor who specializes in high-value policies and estate planning.</p>
                    <button className="w-full py-3 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold flex justify-center items-center gap-2 rounded-lg transition-colors border border-transparent" onClick={() => setShowSchedule(true)}>
                      <Calendar size={20} /> Schedule a Call
                    </button>
                    <button 
                      className="w-full mt-4 py-3 px-6 bg-transparent hover:bg-brand-slate text-white font-bold flex gap-2 justify-center items-center rounded-lg transition-colors border border-brand-slate-light"
                      onClick={() => setShowVirtualAdvisor(true)}
                    >
                      <MessageCircle size={20} /> Virtual Advisor
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {['What do my results mean?', 'How can I improve my score?', 'Schedule an advisor call'].map(txt => (
                      <button key={txt} className="bg-transparent border border-brand-slate-light text-text-secondary px-4 py-2 rounded-full text-sm cursor-pointer transition-colors hover:bg-brand-slate hover:text-white" onClick={() => setInputValue(txt)}>
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Persistent Input Bar */}
      <div className="bg-brand-slate p-4 md:px-8 flex flex-col items-center flex-shrink-0">
        <div className="flex items-center gap-2 w-full max-w-3xl bg-brand-dark p-2 pl-4 rounded-full border border-brand-slate-light">
          <button className="text-text-muted hover:text-white p-2 rounded-full transition-colors"><Share size={20} /></button>
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 bg-transparent border-none outline-none text-white text-base disabled:opacity-50"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={step === 2 && !activeQuestion}
          />
          <button 
            className={`p-2 rounded-full flex items-center justify-center transition-colors ${inputValue.trim() ? 'bg-accent-amber text-brand-dark' : 'text-text-muted bg-transparent'}`} 
            onClick={handleSend}
          >
            <Send size={20} className={inputValue.trim() ? "translate-x-[1px]" : ""} />
          </button>
        </div>
        <p className="text-xs text-text-muted mt-3">✨ AI-powered analysis • Your data is secure and private</p>
      </div>

      {/* Modals */}
      {showSchedule && (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white text-brand-dark p-8 rounded-2xl w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-slate-400 hover:text-brand-dark" onClick={() => setShowSchedule(false)}><X size={24} /></button>
            <h3 className="flex items-center gap-2 text-xl font-bold mb-2"><Calendar size={20}/> Schedule a Call</h3>
            <p className="text-text-muted text-sm mb-6">Pick a time that works for you. A licensed advisor will call you.</p>
            
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-2 text-brand-navy">Select a Day</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <div className="px-4 py-2 border border-accent-amber bg-amber-50 text-accent-amber-hover font-bold rounded-full text-sm whitespace-nowrap cursor-pointer">Mon Feb 18</div>
                <div className="px-4 py-2 border border-slate-200 rounded-full text-sm whitespace-nowrap cursor-pointer hover:border-slate-300">Tue Feb 19</div>
                <div className="px-4 py-2 border border-slate-200 rounded-full text-sm whitespace-nowrap cursor-pointer hover:border-slate-300">Wed Feb 20</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-2 text-brand-navy">🕐 Select a Time</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="px-3 py-2 border border-slate-200 rounded-full text-center text-sm cursor-pointer hover:border-slate-300">9:00 AM</div>
                <div className="px-3 py-2 border border-accent-amber bg-amber-50 text-accent-amber-hover font-bold rounded-full text-center text-sm cursor-pointer">10:00 AM</div>
                <div className="px-3 py-2 border border-slate-200 rounded-full text-center text-sm cursor-pointer hover:border-slate-300">11:30 AM</div>
                <div className="px-3 py-2 border border-slate-200 rounded-full text-center text-sm cursor-pointer hover:border-slate-300">1:00 PM</div>
                <div className="px-3 py-2 border border-slate-200 rounded-full text-center text-sm cursor-pointer hover:border-slate-300">2:30 PM</div>
                <div className="px-3 py-2 border border-slate-200 rounded-full text-center text-sm cursor-pointer hover:border-slate-300">4:00 PM</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mb-6">
              <input type="text" placeholder="Your name *" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-accent-amber focus:ring-1 focus:ring-accent-amber transition-shadow"/>
              <input type="tel" placeholder="Phone number (optional)" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-accent-amber focus:ring-1 focus:ring-accent-amber transition-shadow"/>
            </div>
            
            <button className="w-full py-3 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg transition-colors border border-transparent" onClick={() => setShowSchedule(false)}>
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {showVirtualAdvisor && (
        <VirtualAdvisorModal 
          onClose={() => setShowVirtualAdvisor(false)} 
          initialContext={{ score: 72 }}
        />
      )}
    </div>
  );
};

export default Wizard;
