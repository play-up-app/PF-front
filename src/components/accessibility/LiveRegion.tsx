import React from 'react';

interface LiveRegionProps {
  message: string;
  role?: 'status' | 'alert' | 'log';
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ 
  message, 
  role = 'status',
  'aria-live': ariaLive = 'polite'
}) => {
  return (
    <div 
      aria-live={ariaLive}
      aria-atomic="true"
      role={role}
      className="sr-only"
    >
      {message}
    </div>
  );
};
