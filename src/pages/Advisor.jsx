import React, { useState } from 'react';
import {
  Star, Calendar, MessageCircle, Phone, Video,
  CheckCircle, Clock, Send, Shield, ChevronRight,
} from 'lucide-react';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';

const ADVISOR = {
  name: 'Michael Torres, CFP®',
  title: 'Senior Policy Advisor',
  firm: 'AnalyzeMyPolicy Advisory',
  avatar: 'MT',
  avatarColor: '#0e6cc4',
  rating: 4.9,
  reviews: 214,
  specialty: ['Estate Planning', 'Whole Life', 'Long-Term Care'],
  bio: 'Michael has 18 years of experience helping high-net-worth families optimize their life insurance portfolios. He specializes in estate planning integration and permanent life strategies.',
  responseTime: 'Typically replies within 2 hours',
};

const getUpcomingCall = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const UPCOMING = [
  {
    id: 'call-1',
    type: 'video',
    title: 'Policy Review — MetLife Whole Life',
    date: getUpcomingCall(),
    time: '10:00 AM EST',
    status: 'confirmed',
  },
];

const MESSAGES = [
  {
    id: 'm-1',
    from: 'advisor',
    text: "I've reviewed your portfolio analysis. Your MetLife policy is in great shape. I'd like to discuss the beneficiary update and the paid-up additions option on our upcoming call.",
    time: 'Apr 27, 2:14 PM',
  },
  {
    id: 'm-2',
    from: 'user',
    text: 'That sounds great, looking forward to it. Should I bring the original policy documents?',
    time: 'Apr 27, 3:01 PM',
  },
  {
    id: 'm-3',
    from: 'advisor',
    text: "No need — I already have your analysis from AnalyzeMyPolicy. Just bring any questions you have about the conversion option for your Protective term policy. That's the main opportunity I want to walk you through.",
    time: 'Apr 28, 9:22 AM',
  },
];

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

const getNextWeekdays = () => {
  const days = [];
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1); // start tomorrow
  while (days.length < 5) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push({
        label: labels[dow],
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
};
const DAYS = getNextWeekdays();

export default function Advisor() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(() => DAYS[0]?.date ?? '');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [callType, setCallType] = useState('video');
  const [scheduled, setScheduled] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [messages, setMessages] = useState(MESSAGES);
  const [tab, setTab] = useState('overview');

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    const newMsg = {
      id: 'm-' + Date.now(),
      from: 'user',
      text: msgInput.trim(),
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setMsgInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'm-r' + Date.now(),
          from: 'advisor',
          text: "Thanks for your message. I'll review and get back to you shortly — or we can discuss this on our upcoming call.",
          time: 'Just now',
        },
      ]);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col">
      <AppNav variant="dashboard" />

      {/* Header */}
      <div className="px-6 md:px-8 py-8 border-b border-brand-slate-light">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Your Advisor</h1>
          <p className="text-text-secondary text-sm mt-1">
            Communicate, schedule, and collaborate with your dedicated policy advisor.
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 md:px-8 py-8 max-w-5xl mx-auto w-full">

        {/* Advisor profile card */}
        <div className="bg-brand-slate border border-brand-slate-light rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: ADVISOR.avatarColor }}
          >
            {ADVISOR.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-white font-bold text-lg">{ADVISOR.name}</h2>
                <p className="text-text-secondary text-sm">{ADVISOR.title} · {ADVISOR.firm}</p>
              </div>
              <div className="flex items-center gap-1 text-accent-amber text-sm font-bold">
                <Star size={14} fill="currentColor" />
                {ADVISOR.rating}
                <span className="text-text-muted font-normal text-xs ml-1">({ADVISOR.reviews} reviews)</span>
              </div>
            </div>
            <p className="text-text-secondary text-sm mt-3 leading-relaxed">{ADVISOR.bio}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {ADVISOR.specialty.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-brand-navy border border-brand-slate-light rounded-full text-xs text-text-secondary">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-green-400 flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              {ADVISOR.responseTime}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-slate-light mb-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'schedule', label: 'Schedule a Call' },
            { key: 'messages', label: `Messages (${messages.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-accent-amber text-accent-amber'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Video size={20} className="text-blue-400" />, label: 'Video Call', sub: 'Start a scheduled meeting', action: () => setTab('schedule') },
                { icon: <MessageCircle size={20} className="text-accent-amber" />, label: 'Send Message', sub: 'Secure advisor messaging', action: () => setTab('messages') },
                { icon: <Phone size={20} className="text-green-400" />, label: 'Request a Call', sub: 'Available Mon–Fri 9–5 EST', action: () => setTab('schedule') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-4 p-5 bg-brand-slate border border-brand-slate-light rounded-xl hover:border-accent-amber/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm group-hover:text-accent-amber transition-colors">{item.label}</p>
                    <p className="text-text-muted text-xs mt-0.5">{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Upcoming call */}
            {UPCOMING.map((call) => (
              <div key={call.id} className="bg-brand-slate border border-brand-slate-light rounded-xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-text-muted" /> Upcoming
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Video size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{call.title}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {call.date} at {call.time}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold rounded-full">
                    Confirmed
                  </span>
                </div>
              </div>
            ))}

            {/* Recent message preview */}
            <div
              className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 cursor-pointer hover:border-accent-amber/40 transition-colors group"
              onClick={() => setTab('messages')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <MessageCircle size={16} className="text-text-muted" /> Recent Message
                </h3>
                <span className="flex items-center gap-1 text-xs text-accent-amber font-semibold group-hover:translate-x-0.5 transition-transform">
                  View all <ChevronRight size={12} />
                </span>
              </div>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: ADVISOR.avatarColor }}
                >
                  {ADVISOR.avatar}
                </div>
                <div>
                  <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                    {messages[messages.length - 1].text}
                  </p>
                  <p className="text-text-muted text-xs mt-1">{messages[messages.length - 1].time}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Schedule tab ── */}
        {tab === 'schedule' && (
          <div className="bg-brand-slate border border-brand-slate-light rounded-2xl p-6">
            {!scheduled ? (
              <>
                <h2 className="text-white font-bold text-lg mb-1">Schedule a Call</h2>
                <p className="text-text-muted text-sm mb-6">Pick a date, time, and format that works for you.</p>

                {/* Call type */}
                <div className="mb-6">
                  <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-3">Call Type</p>
                  <div className="flex gap-3">
                    {[
                      { key: 'video', icon: <Video size={15} />, label: 'Video Call' },
                      { key: 'phone', icon: <Phone size={15} />, label: 'Phone Call' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setCallType(opt.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                          callType === opt.key
                            ? 'border-accent-amber bg-accent-amber/10 text-accent-amber'
                            : 'border-brand-slate-light text-text-secondary hover:border-accent-amber/40'
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day picker */}
                <div className="mb-6">
                  <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-3">Select a Day</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {DAYS.map((d) => (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDay(d.date)}
                        className={`flex flex-col items-center px-4 py-3 rounded-xl border text-sm font-semibold flex-shrink-0 transition-colors ${
                          selectedDay === d.date
                            ? 'border-accent-amber bg-accent-amber/10 text-accent-amber'
                            : 'border-brand-slate-light text-text-secondary hover:border-accent-amber/40'
                        }`}
                      >
                        <span className="text-[10px] text-text-muted font-normal">{d.label}</span>
                        {d.date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time picker */}
                <div className="mb-6">
                  <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-3">Select a Time (EST)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                          selectedTime === t
                            ? 'border-accent-amber bg-accent-amber/10 text-accent-amber'
                            : 'border-brand-slate-light text-text-secondary hover:border-accent-amber/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name / phone */}
                <div className="space-y-3 mb-6">
                  <input
                    type="text"
                    defaultValue={user ? `${user.firstName} ${user.lastName}`.trim() : ''}
                    placeholder="Your name *"
                    className="w-full p-3 rounded-lg border border-brand-slate-light bg-brand-navy text-text-primary text-sm outline-none focus:border-accent-amber transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (for phone calls)"
                    className="w-full p-3 rounded-lg border border-brand-slate-light bg-brand-navy text-text-primary text-sm outline-none focus:border-accent-amber transition-colors"
                  />
                </div>

                <button
                  className="w-full py-3.5 px-5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg transition-colors text-sm"
                  onClick={() => setScheduled(true)}
                >
                  Confirm {callType === 'video' ? 'Video' : 'Phone'} Call — {selectedDay} at {selectedTime}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Call Confirmed!</h3>
                <p className="text-text-secondary text-sm mb-1">
                  {callType === 'video' ? 'Video' : 'Phone'} call with {ADVISOR.name}
                </p>
                <p className="text-accent-amber font-bold">{selectedDay} at {selectedTime} EST</p>
                <p className="text-text-muted text-xs mt-4">
                  A calendar invite has been sent to {user?.email ?? 'your email'}.
                </p>
                <button
                  className="mt-6 px-6 py-2.5 border border-brand-slate-light text-text-secondary hover:text-white rounded-lg text-sm transition-colors"
                  onClick={() => setScheduled(false)}
                >
                  Schedule Another
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Messages tab ── */}
        {tab === 'messages' && (
          <div className="bg-brand-slate border border-brand-slate-light rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b border-brand-slate-light">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: ADVISOR.avatarColor }}
              >
                {ADVISOR.avatar}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{ADVISOR.name}</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Active
                </p>
              </div>
              <span className="ml-auto px-3 py-1 bg-brand-navy border border-brand-slate-light rounded-full text-xs text-text-muted flex items-center gap-1">
                <Shield size={10} /> Encrypted
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 chat-scroll">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: msg.from === 'user' ? '#f59e0b' : ADVISOR.avatarColor,
                      color: '#fff',
                    }}
                  >
                    {msg.from === 'user' ? (user?.firstName?.[0] ?? 'U') : ADVISOR.avatar}
                  </div>
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-accent-amber/15 text-text-primary border border-accent-amber/20 rounded-tr-none'
                        : 'bg-brand-navy border border-brand-slate-light text-text-primary rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                    <p className="text-[10px] text-text-muted mt-1.5">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-brand-slate-light">
              <div className="flex items-center gap-2 bg-brand-navy border border-brand-slate-light rounded-xl p-2 pl-4 focus-within:border-accent-amber/60 transition-colors">
                <input
                  type="text"
                  placeholder="Send a secure message…"
                  className="flex-1 bg-transparent outline-none text-text-primary text-sm"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  disabled={!msgInput.trim()}
                  onClick={sendMessage}
                  className="w-9 h-9 rounded-lg bg-accent-amber disabled:bg-brand-slate-light text-brand-dark disabled:text-text-muted flex items-center justify-center transition-colors"
                >
                  <Send size={14} className="translate-x-[1px]" />
                </button>
              </div>
              <p className="text-[10px] text-text-muted text-center mt-2">
                Messages are end-to-end encrypted and visible only to you and your advisor.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
