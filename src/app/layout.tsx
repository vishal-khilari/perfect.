import type { Metadata } from 'next';
import './globals.css';
import { MidnightWrapper } from '@/components/ui/MidnightWrapper';

export const metadata: Metadata = {
  title: 'The Quiet Room',
  description: 'A quiet place where people whisper their thoughts.',
  openGraph: {
    title: 'The Quiet Room',
    description: 'A minimalist archive of human experience.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <MidnightWrapper>
          {/* Beetle silhouette watermark */}
          <svg
            className="beetle-watermark"
            viewBox="0 0 100 80"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Minimalist beetle - abstract geometric */}
            <ellipse cx="50" cy="42" rx="18" ry="26" />
            <ellipse cx="50" cy="24" rx="9" ry="10" />
            {/* Antennae */}
            <line x1="44" y1="16" x2="30" y2="4" stroke="currentColor" strokeWidth="1.5" />
            <line x1="56" y1="16" x2="70" y2="4" stroke="currentColor" strokeWidth="1.5" />
            {/* Legs */}
            <line x1="35" y1="40" x2="18" y2="32" stroke="currentColor" strokeWidth="1.5" />
            <line x1="35" y1="48" x2="16" y2="48" stroke="currentColor" strokeWidth="1.5" />
            <line x1="35" y1="56" x2="20" y2="64" stroke="currentColor" strokeWidth="1.5" />
            <line x1="65" y1="40" x2="82" y2="32" stroke="currentColor" strokeWidth="1.5" />
            <line x1="65" y1="48" x2="84" y2="48" stroke="currentColor" strokeWidth="1.5" />
            <line x1="65" y1="56" x2="80" y2="64" stroke="currentColor" strokeWidth="1.5" />
            {/* Wing division */}
            <line x1="50" y1="20" x2="50" y2="68" stroke="#0e0e0e" strokeWidth="1.5" />
          </svg>

          <main>{children}</main>
        </MidnightWrapper>
      </body>
    </html>
  );
}
