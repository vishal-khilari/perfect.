'use client';

import { useEffect, useState } from 'react';

export function MidnightWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMidnight, setIsMidnight] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hour = new Date().getHours();
    setIsMidnight(hour >= 0 && hour < 5);
  }, []);

  if (!isMounted) {
    return <div style={{ backgroundColor: '#0e0e0e', minHeight: '100vh' }}>{children}</div>;
  }

  return (
    <div
      className={isMidnight ? 'midnight' : ''}
      style={{
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
}
