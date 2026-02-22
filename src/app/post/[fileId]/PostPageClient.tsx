'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AudioPlayer } from '@/components/audio/AudioRecorder';
import { FullPost, MOOD_COLORS } from '@/types';

interface PostPageClientProps {
  post: FullPost;
}

type ReactionType = 'felt' | 'alone' | 'understand';

const REACTIONS: { key: ReactionType; label: string; countKey: keyof FullPost }[] = [
  { key: 'felt', label: 'I felt this.', countKey: 'reactFelt' },
  { key: 'alone', label: "You're not alone.", countKey: 'reactAlone' },
  { key: 'understand', label: 'I understand.', countKey: 'reactUnderstand' },
];

export function PostPageClient({ post }: PostPageClientProps) {
  const [reacted, setReacted] = useState<Set<ReactionType>>(new Set());
  const [counts, setCounts] = useState({
    felt: post.reactFelt,
    alone: post.reactAlone,
    understand: post.reactUnderstand,
  });

  const moodColor = MOOD_COLORS[post.mood as keyof typeof MOOD_COLORS] || 'text-pale';

  async function handleReaction(type: ReactionType) {
    if (reacted.has(type)) return;

    setReacted((prev) => new Set([...prev, type]));
    setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));

    try {
      await fetch(`/api/reactions/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: type }),
      });
    } catch {
      // Silent failure
    }
  }

  return (
    <div className="min-h-screen px-6 pt-24 sm:pt-32 pb-40 max-w-3xl mx-auto w-full">
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8 }}
      >
        {/* Mood badge */}
        <div className="mb-10 sm:mb-14">
          <span className={`mood-badge px-4 py-1.5 text-[9px] sm:text-xs tracking-[0.2em] ${moodColor}`}>{post.mood}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-whisper/95 mb-8 leading-[1.1] sm:leading-tight max-w-full break-words">
          {post.title || 'Untitled'}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 mb-12 sm:mb-16 text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.1em] uppercase border-y border-ash/10 py-6 w-full overflow-hidden">
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
          transition={{ duration: 1.5, delay: 0.4 }}
          className="reading-body mb-20 sm:mb-24"
        >
          {post.body}
        </motion.div>

        {/* Audio */}
        {post.hasAudio && post.audioFileId && (
          <div className="mb-20 sm:mb-24 p-8 border border-ash/10 bg-white/[0.01]">
            <p className="text-[9px] font-mono text-mist/40 tracking-[0.3em] uppercase mb-6 text-center">Voice Recording</p>
            <AudioPlayer fileId={post.audioFileId} />
          </div>
        )}

        <hr className="divider opacity-30 my-16 sm:my-20" />

        {/* Reactions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.3em] uppercase mb-10 text-center sm:text-left">
            If this moved you
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
            {REACTIONS.map(({ key, label, countKey }) => (
              <motion.button
                key={key}
                onClick={() => handleReaction(key)}
                whileTap={{ scale: 0.98 }}
                className={`reaction-btn flex-1 sm:flex-none px-8 py-4 transition-all duration-1000 min-h-[56px] ${reacted.has(key) ? 'reacted bg-white/[0.03]' : 'hover:bg-white/[0.01]'}`}
                disabled={reacted.has(key)}
              >
                <span className="tracking-[0.1em]">{label}</span>
                {counts[key] > 0 && (
                  <span className="ml-3 text-mist/40 font-mono text-[10px]">
                    {counts[key]}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {reacted.size > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
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
