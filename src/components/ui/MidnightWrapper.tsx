'use client';

import { useEffect, useState } from 'react';

export function MidnightWrapper({ children }: { children: React.ReactNode }) {
  const [isMidnight, setIsMidnight] = useState(false);

  useEffect(() => {
    function checkMidnight() {
      const hour = new Date().getHours();
      setIsMidnight(hour >= 0 && hour < 5);
    }

    checkMidnight();
    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: isMidnight ? '#050505' : '#0e0e0e',
        minHeight: '100vh',
        transition: 'background-color 2s ease',
      }}
    >
      {children}
    </div>
  );
}
