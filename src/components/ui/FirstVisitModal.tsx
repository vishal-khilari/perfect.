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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="text-center w-[calc(100%-48px)] sm:w-full max-w-[300px] sm:max-w-sm px-8 sm:px-10 py-16 border border-ash/10 bg-void/60 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-serif text-2xl sm:text-3xl text-whisper/95 mb-4 italic leading-tight">
              You are entering a quiet place.
            </p>
            <p className="font-serif text-lg sm:text-xl text-ghost/40 italic mb-12 sm:mb-16 tracking-wide">
              Speak softly.
            </p>
            <button
              onClick={dismiss}
              className="btn-ghost w-full px-12 py-4 text-[10px] sm:text-xs tracking-[0.3em] min-h-[54px] sm:min-h-[50px] flex items-center justify-center"
            >
              I understand
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
