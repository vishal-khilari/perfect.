'use client';

import { useState, useEffect, useRef } from 'react'; // Added useEffect and useRef
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { AudioPlayer } from '@/components/audio/AudioRecorder';
import { FullPost, Mood, MOOD_COLORS, MOOD_HEX_COLORS } from '@/types'; // Import MOOD_HEX_COLORS
import { useReducedMotion } from '@/hooks/useReducedMotion'; // Import useReducedMotion

interface PostPageClientProps {
  post: FullPost;
}

type ReactionType = 'felt' | 'alone' | 'understand';

interface ReactionButtonState {
  label: string;
  isTemporarilyChanged: boolean;
}

const REACTIONS_CONFIG: { key: ReactionType; initialLabel: string; changedLabel: string; countKey: keyof FullPost }[] = [
  { key: 'felt', initialLabel: 'i felt this.', changedLabel: 'felt.', countKey: 'reactFelt' }, // Refined
  { key: 'alone', initialLabel: "you are not alone.", changedLabel: 'not alone.', countKey: 'reactAlone' }, // Refined
  { key: 'understand', initialLabel: 'i understand.', changedLabel: 'understood.', countKey: 'reactUnderstand' }, // Refined
];

// Component for subtle particle animation
const WhisperParticle: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: -5 }}
      animate={{ opacity: 0, y: -20, x: 5 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute bg-whisper w-1 h-1 rounded-full pointer-events-none"
    />
  );
};

export function PostPageClient({ post }: PostPageClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const transitionDuration = prefersReducedMotion ? 0.1 : 0.8; // Standardized duration
  const whileTapScale = prefersReducedMotion ? 1 : 0.98; // Standardized scale

  const [reacted, setReacted] = useState<Set<ReactionType>>(() => new Set());
  const [counts, setCounts] = useState({
    felt: post.reactFelt,
    alone: post.reactAlone,
    understand: post.reactUnderstand,
  });
  const [buttonStates, setButtonStates] = useState<{ [key in ReactionType]: ReactionButtonState }>(() => {
    const initialState: { [key in ReactionType]: ReactionButtonState } = {} as any;
    REACTIONS_CONFIG.forEach(r => {
      initialState[r.key] = { label: r.initialLabel, isTemporarilyChanged: false };
    });
    return initialState;
  });
  const [showParticleForReaction, setShowParticleForReaction] = useState<ReactionType | null>(null); // New state for particle trigger

  const moodTailwindClass = MOOD_COLORS[post.mood] || 'text-pale'; // For mood badge class
  const moodHexColor = MOOD_HEX_COLORS[post.mood] || '#888888'; // For boxShadow hex value

  async function handleReaction(type: ReactionType) {
    if (reacted.has(type)) return;

    // Haptic feedback
    if (!prefersReducedMotion && navigator.vibrate) {
      navigator.vibrate(50);
    }

    setReacted((prev) => new Set([...prev, type]));
    setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));

    // Microcopy change
    setButtonStates(prev => ({ ...prev, [type]: { label: REACTIONS_CONFIG.find(r => r.key === type)!.changedLabel, isTemporarilyChanged: true } }));
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [type]: { label: REACTIONS_CONFIG.find(r => r.key === type)!.initialLabel, isTemporarilyChanged: false } }));
    }, prefersReducedMotion ? 100 : 800); // Standardized micro-interaction duration (0.8s)

    // Particle animation
    if (!prefersReducedMotion) {
      setShowParticleForReaction(type);
      setTimeout(() => setShowParticleForReaction(null), prefersReducedMotion ? 100 : 800); // Clear after animation
    }

    try {
      await fetch(`/api/reactions/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: type }),
      });
    } catch {
      // Silent failure, revert state? (Future improvement: show error)
      // For now, assume success for UX feedback
    }
  }

  return (
    <div className="min-h-screen px-6 pt-24 sm:pt-32 pb-40 max-w-3xl mx-auto w-full">
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: transitionDuration }} // Standardized duration
        className="max-w-reading mx-auto"
      >
        {/* Mood badge */}
        <div className="mb-16 sm:mb-20">
          <span className={`mood-badge px-4 py-1.5 text-[9px] sm:text-xs tracking-[0.2em] ${moodTailwindClass}`}>{post.mood}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-whisper/95 mb-12 sm:mb-16 leading-[1.1] sm:leading-tight max-w-full break-words">
          {post.title || 'untitled'}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 mb-16 sm:mb-20 text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.1em] uppercase border-y border-ash/10 py-6 w-full overflow-hidden">
          <span className="text-pale/60">{post.name || 'anonymous'}</span>
          <span className="opacity-20 text-[8px]">/</span>
          <span>{post.createdDate}</span>
          <span className="opacity-20 text-[8px]">/</span>
          <span>{post.wordCount} words</span>
          <span className="opacity-20 text-[8px]">/</span>
          <span>{post.readingTime} min read</span>
        </div>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.4 }} // Standardized duration, delay 0.4s for micro-interaction
          className="reading-body mb-24 sm:mb-32"
        >
          {post.body}
        </motion.div>

        {/* Audio */}
        {post.hasAudio && post.audioFileId && (
          <div className="mb-24 sm:mb-32 p-8 border border-ash/10 bg-white/[0.01]">
            <p className="text-[9px] font-mono text-mist/40 tracking-[0.3em] uppercase mb-6 text-center">voice recording</p>
            <AudioPlayer fileId={post.audioFileId} />
          </div>
        )}

        <hr className="divider opacity-30 my-20 sm:my-24" />

        {/* Reactions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.8 }} // Standardized duration
        >
          <p className="text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.3em] uppercase mb-12 sm:mb-16 text-center sm:text-left">
            if this stayed with you
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
            {REACTIONS_CONFIG.map(({ key, countKey }) => (
              <motion.button
                key={key}
                onClick={() => handleReaction(key)}
                whileTap={{ scale: whileTapScale, boxShadow: prefersReducedMotion ? 'none' : `0 0 10px ${moodHexColor}40` }} // Standardized scale
                className={`reaction-btn flex-1 sm:flex-none px-8 py-4 transition-all duration-1000 min-h-[56px] relative overflow-hidden ${reacted.has(key) ? 'reacted' : 'hover:bg-white/[0.01]'}`}
                disabled={reacted.has(key)}
              >
                <span className="tracking-[0.1em]">{buttonStates[key].label}</span>
                {counts[key] > 0 && !buttonStates[key].isTemporarilyChanged && (
                  <span className="ml-3 text-mist/40 font-mono text-[10px]">
                    {counts[key]}
                  </span>
                )}
                {/* Particle effect */}
                <AnimatePresence>
                  {showParticleForReaction === key && !prefersReducedMotion && (
                    <motion.div
                      key={key + '-particle'}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <WhisperParticle />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {reacted.size > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: transitionDuration }} // Standardized duration
              className="mt-10 text-[10px] sm:text-xs font-mono text-mist/50 italic text-center sm:text-left tracking-wide"
            >
              your listening was noted.
            </motion.p>
          )}
        </motion.div>

        {/* Back link */}
        <div className="mt-24 sm:mt-32 pt-12 border-t border-ash/10 text-center sm:text-left">
          <a
            href="/room"
            className="text-[9px] sm:text-xs font-mono text-mist/50 hover:text-pale tracking-[0.3em] uppercase transition-colors duration-700 inline-flex items-center gap-2 group"
          >
            <span className="transition-transform duration-500 group-hover:-translate-x-1">←</span> back to the room
          </a>
        </div>
      </motion.article>
    </div>
  );
}
