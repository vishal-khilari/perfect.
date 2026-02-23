'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function Nav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'the door' }, // Refined
    { href: '/room', label: 'the room' },
    { href: '/write', label: 'leave something' }, // Refined
  ];

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 py-5 sm:py-8"
      style={{ background: 'linear-gradient(to bottom, rgba(14,14,14,0.95) 0%, transparent 100%)' }}
    >
      <div className="max-w-3xl mx-auto px-6 flex justify-between items-center w-full">
        <Link
          href="/"
          className="font-serif text-whisper/60 hover:text-whisper/90 transition-all duration-500 text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] uppercase"
        >
          <span className="hidden sm:inline">the quiet room</span> {/* Softened */}
          <span className="sm:hidden">quiet room</span> {/* Softened */}
        </Link>

        <div className="flex gap-4 sm:gap-10">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className="relative font-sans text-[9px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.25em] uppercase transition-colors duration-500 py-1"
              style={{
                color: pathname === href ? 'rgba(241,241,241,0.9)' : 'rgba(136,136,136,0.65)',
              }}
            >
              {label}
              {pathname === href && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute -bottom-0.5 left-0 right-0 h-[1px] bg-whisper/40"
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
