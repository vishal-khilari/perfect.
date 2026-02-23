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
  { key: 'felt', initialLabel: 'I felt this.', changedLabel: 'Felt.', countKey: 'reactFelt' },
  { key: 'alone', initialLabel: "You're not alone.", changedLabel: 'Not Alone.', countKey: 'reactAlone' },
  { key: 'understand', initialLabel: 'I understand.', changedLabel: 'Understood.', countKey: 'reactUnderstand' },
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
  const transitionDuration = prefersReducedMotion ? 0.1 : 0.8; // Short duration for reduced motion
  const whileTapScale = prefersReducedMotion ? 1 : 0.98;

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
    }, prefersReducedMotion ? 100 : 1500); // Shorter duration for reduced motion

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
        transition={{ duration: transitionDuration }}
        className="max-w-reading mx-auto"
      >
        {/* Mood badge */}
        <div className="mb-16 sm:mb-20">
          <span className={`mood-badge px-4 py-1.5 text-[9px] sm:text-xs tracking-[0.2em] ${moodTailwindClass}`}>{post.mood}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-whisper/95 mb-12 sm:mb-16 leading-[1.1] sm:leading-tight max-w-full break-words">
          {post.title || 'Untitled'}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 mb-16 sm:mb-20 text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.1em] uppercase border-y border-ash/10 py-6 w-full overflow-hidden">
          <span className="text-pale/60">{post.name || 'Anonymous'}</span>
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
          transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.4 }}
          className="reading-body mb-24 sm:mb-32"
        >
          {post.body}
        </motion.div>

        {/* Audio */}
        {post.hasAudio && post.audioFileId && (
          <div className="mb-24 sm:mb-32 p-8 border border-ash/10 bg-white/[0.01]">
            <p className="text-[9px] font-mono text-mist/40 tracking-[0.3em] uppercase mb-6 text-center">Voice Recording</p>
            <AudioPlayer fileId={post.audioFileId} />
          </div>
        )}

        <hr className="divider opacity-30 my-20 sm:my-24" />

        {/* Reactions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.8 }}
        >
          <p className="text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.3em] uppercase mb-12 sm:mb-16 text-center sm:text-left">
            If this moved you
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
            {REACTIONS_CONFIG.map(({ key, countKey }) => (
              <motion.button
                key={key}
                onClick={() => handleReaction(key)}
                whileTap={{ scale: whileTapScale, boxShadow: prefersReducedMotion ? 'none' : `0 0 10px ${moodHexColor}40` }}
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
                      key={key + '-particle'} // Unique key for AnimatePresence
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
              transition={{ duration: transitionDuration }}
              className="mt-10 text-[10px] sm:text-xs font-mono text-mist/50 italic text-center sm:text-left tracking-wide"
            >
              Your presence was noted.
            </motion.p>
          )}
        </motion.div>

        {/* Back link */}
        <div className="mt-24 sm:mt-32 pt-12 border-t border-ash/10 text-center sm:text-left">
          <a
            href="/room"
            className="text-[9px] sm:text-xs font-mono text-mist/50 hover:text-pale tracking-[0.3em] uppercase transition-all duration-700 inline-flex items-center gap-2 group"
          >
            <span className="transition-transform duration-500 group-hover:-translate-x-1">←</span> Back to the room
          </a>
        </div>
      </motion.article>
    </div>
  );
}