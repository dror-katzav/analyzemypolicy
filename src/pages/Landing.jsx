import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('none'); 
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full font-sans">
      {/* Left Panel - Branding */}
      <div className="flex-1 bg-brand-dark p-8 md:p-16 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-24">
          <Shield size={32} className="text-accent-gold" />
          <span className="text-white text-2xl font-bold tracking-tight">AnalyzeMyPolicy</span>
        </div>
        
        <div className="max-w-[600px] flex-1">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-white">Your Policy.</span><br/>
            <span className="text-accent-amber">Your Legacy.</span><br/>
            <span className="text-white">Protected.</span>
          </h1>
          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            Institutional-grade life insurance monitoring for families who demand clarity and confidence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">98%</h3>
              <p className="text-text-muted text-sm">Client satisfaction</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">$2B+</h3>
              <p className="text-text-muted text-sm">Policies analyzed</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">12k+</h3>
              <p className="text-text-muted text-sm">Families protected</p>
            </div>
          </div>
          
          <div className="inline-block px-6 py-3 bg-brand-slate rounded-full border border-brand-slate-light text-text-secondary text-sm">
            <span>🔒 Bank-grade encryption • SOC 2 compliant • Private & confidential</span>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Auth */}
      <div className="flex-1 bg-white p-8 md:p-16 flex items-center justify-center text-brand-dark">
        
        {authMode === 'none' && (
          <div className="w-full max-w-[440px]">
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-text-muted mb-10">Access your policy dashboard or start a new analysis.</p>
            
            <button 
              className="w-full py-4 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-semibold rounded-lg transition-colors border border-transparent"
              onClick={() => setAuthMode('signin')}
            >
              👤 Sign In to My Account
            </button>
            <button 
              className="w-full mt-4 py-4 px-6 bg-transparent hover:bg-bg-light text-brand-dark font-semibold rounded-lg transition-colors border border-brand-slate-light"
              onClick={() => setAuthMode('create')}
            >
              Create an Account →
            </button>
            
            <div className="flex items-center text-center my-8">
              <div className="flex-1 border-b border-slate-200"></div>
              <span className="px-4 text-text-muted text-sm">or</span>
              <div className="flex-1 border-b border-slate-200"></div>
            </div>
            
            <div 
              className="flex justify-between items-center p-6 border border-slate-200 rounded-xl cursor-pointer hover:border-accent-amber hover:shadow-sm transition-all"
              onClick={() => navigate('/analyze')}
            >
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                  Continue as Guest 
                  <span className="px-3 py-1 bg-amber-100 text-accent-amber-hover text-xs font-bold uppercase rounded-full">Demo Mode</span>
                </h3>
                <p className="text-text-muted text-sm">Explore a full demo. No data saved.</p>
              </div>
              <span className="text-2xl text-text-muted">→</span>
            </div>
            
            <p className="text-center mt-10 text-xs text-text-muted">
              Protected by 256-bit encryption. We never sell your data.
            </p>
          </div>
        )}
        
        {authMode === 'signin' && (
          <div className="w-full max-w-[440px]">
            <button className="text-text-muted text-sm mb-6 hover:text-brand-dark" onClick={() => setAuthMode('none')}>← Back</button>
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-text-muted mb-10">Sign in to access your policy dashboard.</p>
            
            <div className="space-y-4 mb-6">
              <input 
                type="email" 
                placeholder="james@harrison.com" 
                className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors"
              />
              <input 
                type="password" 
                placeholder="Your password" 
                className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors"
              />
            </div>
            
            <button 
              className="w-full py-4 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-semibold rounded-lg transition-colors border border-transparent"
              onClick={() => navigate('/dashboard')}
            >
              Sign In →
            </button>
            
            <p className="text-center mt-6 text-text-muted text-sm">
              Don't have an account? <span className="text-accent-amber font-semibold cursor-pointer hover:text-accent-amber-hover" onClick={() => setAuthMode('create')}>Sign up</span>
            </p>
          </div>
        )}
        
        {authMode === 'create' && (
          <div className="w-full max-w-[440px]">
            <button className="text-text-muted text-sm mb-6 hover:text-brand-dark" onClick={() => setAuthMode('none')}>← Back</button>
            <h2 className="text-3xl font-bold mb-2">Create your account</h2>
            <p className="text-text-muted mb-10">Start monitoring your family's policy health.</p>
            
            <div className="flex gap-4 mb-4">
              <input 
                type="text" 
                placeholder="First Name *" 
                className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors"
              />
              <input 
                type="text" 
                placeholder="Last Name" 
                className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors"
              />
            </div>
            <div className="space-y-4 mb-6">
              <input 
                type="email" 
                placeholder="james@harrison.com *" 
                className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors"
              />
              <input 
                type="password" 
                placeholder="Minimum 8 characters *" 
                className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors"
              />
            </div>
            
            <button 
              className="w-full py-4 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-semibold rounded-lg transition-colors border border-transparent"
              onClick={() => navigate('/dashboard')}
            >
              Create Account
            </button>
            
            <p className="text-center mt-6 text-text-muted text-sm">
              Already have an account? <span className="text-accent-amber font-semibold cursor-pointer hover:text-accent-amber-hover" onClick={() => setAuthMode('signin')}>Sign in</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Landing;
