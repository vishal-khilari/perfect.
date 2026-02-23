import React from 'react';
import { Mood } from '@/types';

interface MoodIconProps {
  mood: Mood;
  className?: string;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ mood, className }) => {
  let iconPath: JSX.Element | null = null;

  // Minimalist SVG icons for each mood
  switch (mood) {
    case 'Rain':
      iconPath = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-rain">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a5 5 0 0 1 0 10h-2.21"></path>
          <path d="M16 14v6"></path>
          <path d="M8 10v6"></path>
          <path d="M12 12v6"></path>
        </svg>
      );
      break;
    case 'Static':
      iconPath = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-waveform">
          <path d="M2 13h2l2 8l4-16l4 16l2-8h2"></path>
        </svg>
      );
      break;
    case 'Silence':
      iconPath = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      );
      break;
    case 'Night':
      iconPath = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon">
          <path d="M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9Z"></path>
        </svg>
      );
      break;
    default:
      return null;
  }

  return <span className={className}>{iconPath}</span>;
};
