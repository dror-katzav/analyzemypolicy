import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const Btn = ({ loading, onClick, children }) => (
  <button
    type="button"
    disabled={loading}
    onClick={onClick}
    className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors border border-slate-300 text-sm shadow-sm disabled:opacity-60"
  >
    <GoogleIcon />
    {loading ? 'Connecting…' : children}
  </button>
);

// Only rendered when GoogleOAuthProvider is in the tree (i.e. VITE_GOOGLE_CLIENT_ID is set).
// useGoogleLogin is called inside this component so it only fires when the component is rendered.
function RealGoogleButton({ onSuccess, onError, children }) {
  const [loading, setLoading] = useState(false);

  const triggerOAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();
        onSuccess(profile);
      } catch {
        onError?.('Failed to retrieve Google profile. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
      onError?.('Google sign-in was cancelled or failed.');
    },
  });

  return (
    <Btn loading={loading} onClick={() => { setLoading(true); triggerOAuth(); }}>
      {children}
    </Btn>
  );
}

// Shown when VITE_GOOGLE_CLIENT_ID is not configured.
function SetupNotice() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors border border-slate-300 text-sm shadow-sm"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-slate-900 font-bold text-base mb-2">Google OAuth not configured</h3>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              To enable real Google sign-in, add your Client ID to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code>:
            </p>
            <pre className="bg-slate-900 text-green-400 text-xs rounded-lg p-3 mb-4 overflow-x-auto font-mono">
              {`VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`}
            </pre>
            <p className="text-slate-500 text-xs mb-4 leading-relaxed">
              Create a project at <span className="text-blue-600">console.cloud.google.com</span>, enable the OAuth consent screen, and add <code className="bg-slate-100 px-1 rounded">http://localhost:5174</code> as an authorized JavaScript origin.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function GoogleLoginButton({ onSuccess, onError, children }) {
  if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return <RealGoogleButton onSuccess={onSuccess} onError={onError}>{children}</RealGoogleButton>;
  }
  return <SetupNotice />;
}
