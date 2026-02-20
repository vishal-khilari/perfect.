'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="text-center max-w-sm"
      >
        <p className="font-serif italic text-pale/40 text-lg mb-3">
          This room is empty.
        </p>
        <p className="font-sans text-xs text-mist mb-10">
          The words may have burned.
        </p>
        <Link href="/" className="btn-ghost">
          Return to the entrance
        </Link>
      </motion.div>
    </div>
  );
}
