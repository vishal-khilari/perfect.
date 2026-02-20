'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function Nav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'entrance' },
    { href: '/room', label: 'the room' },
    { href: '/write', label: 'write' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center"
      style={{ background: 'linear-gradient(to bottom, rgba(14,14,14,0.9) 0%, transparent 100%)' }}
    >
      <Link
        href="/"
        className="font-serif text-whisper/60 hover:text-whisper/90 transition-colors duration-500 text-sm tracking-widest uppercase"
      >
        The Quiet Room
      </Link>

      <div className="flex gap-8">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="relative font-sans text-xs tracking-widest uppercase transition-colors duration-500"
            style={{
              color: pathname === href ? 'rgba(241,241,241,0.8)' : 'rgba(136,136,136,0.6)',
            }}
          >
            {label}
            {pathname === href && (
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-whisper/30" />
            )}
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
