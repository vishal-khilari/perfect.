'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion'; // Import useReducedMotion

export function Nav() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion(); // Use the hook
  const transitionDuration = prefersReducedMotion ? 0.1 : 0.8; // Standardized duration
  const transitionDelay = prefersReducedMotion ? 0 : 0.2; // Standardized delay

  const links = [
    { href: '/', label: 'the door' },
    { href: '/room', label: 'the room' },
    { href: '/write', label: 'leave something' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: transitionDuration, delay: transitionDelay }} // Standardized duration and delay
      className="fixed top-0 left-0 right-0 z-50 py-5 sm:py-8"
      style={{ background: 'linear-gradient(to bottom, rgba(14,14,14,0.95) 0%, transparent 100%)' }}
    >
      <div className="max-w-3xl mx-auto px-6 flex justify-between items-center w-full">
        <Link
          href="/"
          className="font-serif text-whisper/60 hover:text-whisper/90 transition-all duration-500 text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] uppercase"
        >
          <span className="hidden sm:inline">the quiet room</span>
          <span className="sm:hidden">quiet room</span>
        </Link>

        <div className="flex gap-6 sm:gap-12">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className="relative font-sans text-[9px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.25em] uppercase transition-colors duration-500 py-2"
              style={{
                color: pathname === href ? '#f1f1f1' : 'rgba(136,136,136,0.8)',
              }}
            >
              {label}
              {pathname === href && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute -bottom-0.5 left-0 right-0 h-[1px] bg-whisper/40"
                  transition={{ duration: transitionDuration }} // Standardized duration for layout animation
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
