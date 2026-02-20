'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function FirstVisitModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('quiet-room-visited');
    if (!seen) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  function dismiss() {
    localStorage.setItem('quiet-room-visited', '1');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-center max-w-sm px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-serif text-xl text-whisper/80 mb-2 italic">
              You are entering a quiet place.
            </p>
            <p className="font-serif text-lg text-ghost/60 italic mb-10">
              Speak softly.
            </p>
            <button
              onClick={dismiss}
              className="btn-ghost"
            >
              I understand
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
