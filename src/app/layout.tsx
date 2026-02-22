import type { Metadata, Viewport } from 'next';
import { EB_Garamond, DM_Sans, Courier_Prime } from 'next/font/google';
import './globals.css';
import { MidnightWrapper } from '@/components/ui/MidnightWrapper';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
});

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  variable: '--font-courier-prime',
  display: 'swap',
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'The Quiet Room',
  description: 'A quiet place where people whisper their thoughts.',
  openGraph: {
    title: 'The Quiet Room',
    description: 'A minimalist archive of human experience.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${dmSans.variable} ${courierPrime.variable}`}>
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
