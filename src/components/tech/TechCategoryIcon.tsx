import React from 'react';

interface TechCategoryIconProps {
  techCategoryId: string;
  className?: string;
}

export default function TechCategoryIcon({ techCategoryId, className = "w-4 h-4" }: TechCategoryIconProps) {
  const iconProps = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24"
  };

  switch (techCategoryId) {
    case 'website':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
          <path d="M12 2a14.5 14.5 0 0 1 0 20"/>
        </svg>
      );

    case 'frontend':
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          <path d="M7 8l3 3-3 3"/>
          <path d="M13 14h4"/>
        </svg>
      );

    case 'security':
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="8" r="1"/>
        </svg>
      );

    case 'backend':
      return (
        <svg {...iconProps}>
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/>
          <line x1="10" y1="6" x2="10.01" y2="6"/>
          <line x1="6" y1="18" x2="6.01" y2="18"/>
          <line x1="10" y1="18" x2="10.01" y2="18"/>
        </svg>
      );

    case 'fun':
      return (
        <svg {...iconProps}>
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3c0 .552.448 1 1 1"/>
          <path d="M3 12v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M12 6V2"/>
          <path d="M8 2h8"/>
        </svg>
      );

    case 'ctf':
      return (
        <svg {...iconProps}>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
          <path d="M12 8v8"/>
          <path d="M8 12h8"/>
          <circle cx="12" cy="8" r="2"/>
        </svg>
      );

    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      );
  }
}