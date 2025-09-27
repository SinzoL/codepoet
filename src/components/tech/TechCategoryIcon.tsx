import React from 'react';

interface TechCategoryIconProps {
  techCategoryId: string;
  className?: string;
}

export default function TechCategoryIcon({ techCategoryId, className = "w-4 h-4" }: TechCategoryIconProps) {
  const iconProps = {
    className,
    fill: "currentColor",
    viewBox: "0 0 24 24"
  };

  switch (techCategoryId) {
    case 'website':
      return (
        <svg {...iconProps}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          <path d="M12 2v20"/>
        </svg>
      );

    case 'frontend':
      return (
        <svg {...iconProps}>
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>
          <path d="M2 12h20"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      );

    case 'security':
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      );

    case 'backend':
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          <circle cx="7" cy="9" r="1"/>
          <circle cx="12" cy="9" r="1"/>
          <circle cx="17" cy="9" r="1"/>
        </svg>
      );

    case 'fun':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      );

    case 'ctf':
      return (
        <svg {...iconProps}>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
          <path d="M12 8l-2 3h4l-2 3"/>
        </svg>
      );

    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      );
  }
}