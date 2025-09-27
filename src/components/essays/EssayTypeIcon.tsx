interface EssayTypeIconProps {
  type: 'reading' | 'thoughts' | 'life';
  className?: string;
}

export default function EssayTypeIcon({ type, className = "w-8 h-8" }: EssayTypeIconProps) {
  switch (type) {
    case 'reading':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
          <path 
            d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20V4H6.5C5.11929 4 4 5.11929 4 6.5V19.5Z" 
            fill="url(#bookGradient)" 
            fillOpacity="0.2"
          />
          <path 
            d="M6.5 17C5.11929 17 4 18.1193 4 19.5C4 20.8807 5.11929 22 6.5 22H20V17H6.5Z" 
            fill="url(#bookGradient)"
          />
          <path 
            d="M4 6.5C4 5.11929 5.11929 4 6.5 4H20V17H6.5C5.11929 17 4 18.1193 4 19.5V6.5Z" 
            stroke="url(#bookGradient)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M9 9H16M9 13H14" 
            stroke="url(#bookGradient)" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </svg>
      );
    
    case 'thoughts':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="thoughtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#5B21B6" />
            </linearGradient>
          </defs>
          <path 
            d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3596 22 8.77516 21.6039 7.35418 20.8583L3 21L4.14168 16.6458C3.39606 15.2248 3 13.6404 3 12C3 6.47715 7.47715 2 12 2Z" 
            fill="url(#thoughtGradient)" 
            fillOpacity="0.2"
          />
          <path 
            d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3596 22 8.77516 21.6039 7.35418 20.8583L3 21L4.14168 16.6458C3.39606 15.2248 3 13.6404 3 12C3 6.47715 7.47715 2 12 2Z" 
            stroke="url(#thoughtGradient)" 
            strokeWidth="2"
          />
          <circle cx="8" cy="12" r="1" fill="url(#thoughtGradient)" />
          <circle cx="12" cy="12" r="1" fill="url(#thoughtGradient)" />
          <circle cx="16" cy="12" r="1" fill="url(#thoughtGradient)" />
        </svg>
      );
    
    case 'life':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lifeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <path 
            d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
            fill="url(#lifeGradient)" 
            fillOpacity="0.3"
          />
          <path 
            d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
            stroke="url(#lifeGradient)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 16C12 16 8 18 8 21C8 22.1046 9.34315 23 11 23H13C14.6569 23 16 22.1046 16 21C16 18 12 16 12 16Z" 
            fill="url(#lifeGradient)" 
            fillOpacity="0.4"
          />
          <path 
            d="M12 16C12 16 8 18 8 21C8 22.1046 9.34315 23 11 23H13C14.6569 23 16 22.1046 16 21C16 18 12 16 12 16Z" 
            stroke="url(#lifeGradient)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle cx="6" cy="6" r="1.5" fill="url(#lifeGradient)" fillOpacity="0.6" />
          <circle cx="18" cy="6" r="1" fill="url(#lifeGradient)" fillOpacity="0.4" />
          <circle cx="18" cy="18" r="1.5" fill="url(#lifeGradient)" fillOpacity="0.6" />
        </svg>
      );
    
    default:
      return null;
  }
}