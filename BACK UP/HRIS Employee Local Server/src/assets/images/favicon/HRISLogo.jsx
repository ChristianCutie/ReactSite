import React from 'react';

const HRISLogo = ({ size = 60, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="#2563EB" opacity="0.1" />
      
      {/* Main circle border */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="#2563EB" strokeWidth="2" />
      
      {/* People/Team icons - Left person */}
      <circle cx="35" cy="38" r="8" fill="#2563EB" />
      <path
        d="M 25 50 Q 25 46 35 46 Q 45 46 45 50 L 45 58 Q 45 60 43 60 L 27 60 Q 25 60 25 58 Z"
        fill="#2563EB"
      />
      
      {/* People/Team icons - Right person */}
      <circle cx="65" cy="38" r="8" fill="#2563EB" />
      <path
        d="M 55 50 Q 55 46 65 46 Q 75 46 75 50 L 75 58 Q 75 60 73 60 L 57 60 Q 55 60 55 58 Z"
        fill="#2563EB"
      />
      
      {/* Center person (manager/leader) */}
      <circle cx="50" cy="32" r="9" fill="#2563EB" />
      <path
        d="M 38 47 Q 38 42 50 42 Q 62 42 62 47 L 62 58 Q 62 60 60 60 L 40 60 Q 38 60 38 58 Z"
        fill="#2563EB"
      />
      
      {/* Document/Papers icon at bottom */}
      <rect x="32" y="68" width="15" height="18" fill="none" stroke="#2563EB" strokeWidth="1.5" rx="1" />
      <line x1="36" y1="73" x2="44" y2="73" stroke="#2563EB" strokeWidth="1" />
      <line x1="36" y1="78" x2="44" y2="78" stroke="#2563EB" strokeWidth="1" />
      
      <rect x="53" y="68" width="15" height="18" fill="none" stroke="#2563EB" strokeWidth="1.5" rx="1" />
      <line x1="57" y1="73" x2="65" y2="73" stroke="#2563EB" strokeWidth="1" />
      <line x1="57" y1="78" x2="65" y2="78" stroke="#2563EB" strokeWidth="1" />
    </svg>
  );
};

export default HRISLogo;
