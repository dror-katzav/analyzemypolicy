import React from 'react';

export const AdvisorAvatar = ({ size = 64, className = '' }) => (
  <svg
    width={size} height={size} viewBox="0 0 64 64"
    className={`rounded-2xl flex-shrink-0 ${className}`}
    style={{ background: 'linear-gradient(135deg, #0e6cc4 0%, #1e40af 100%)' }}
  >
    <circle cx="32" cy="22" r="11" fill="white" fillOpacity="0.9" />
    <ellipse cx="32" cy="54" rx="18" ry="12" fill="white" fillOpacity="0.9" />
  </svg>
);

export const AdvisorAvatarRound = ({ size = 36, className = '' }) => (
  <svg
    width={size} height={size} viewBox="0 0 36 36"
    className={`rounded-full flex-shrink-0 ${className}`}
    style={{ background: 'linear-gradient(135deg, #0e6cc4 0%, #1e40af 100%)' }}
  >
    <circle cx="18" cy="13" r="7" fill="white" fillOpacity="0.9" />
    <ellipse cx="18" cy="31" rx="11" ry="7" fill="white" fillOpacity="0.9" />
  </svg>
);
