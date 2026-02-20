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
    <div className="min-h-screen px-6 pt-28 pb-32" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8 }}
      >
        {/* Mood badge */}
        <div className="mb-8">
          <span className={`mood-badge ${moodColor}`}>{post.mood}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-whisper/90 mb-6 leading-tight">
          {post.title || 'Untitled'}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 items-center mb-12 text-xs font-mono text-mist tracking-wider">
          <span>{post.name || 'Anonymous'}</span>
          <span>·</span>
          <span>{post.createdDate}</span>
          <span>·</span>
          <span>{post.wordCount} words</span>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>

        <hr className="divider" />

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.4 }}
          className="reading-body mt-12 mb-12"
        >
          {post.body}
        </motion.div>

        {/* Audio */}
        {post.hasAudio && post.audioFileId && (
          <AudioPlayer fileId={post.audioFileId} />
        )}

        <hr className="divider" />

        {/* Reactions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12"
        >
          <p className="text-xs font-mono text-mist tracking-[0.2em] uppercase mb-6">
            If this moved you
          </p>

          <div className="flex flex-wrap gap-3">
            {REACTIONS.map(({ key, label, countKey }) => (
              <button
                key={key}
                onClick={() => handleReaction(key)}
                className={`reaction-btn ${reacted.has(key) ? 'reacted' : ''}`}
                disabled={reacted.has(key)}
              >
                {label}
                {counts[key] > 0 && (
                  <span className="ml-2 text-mist font-mono text-xs">
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {reacted.size > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="mt-6 text-xs font-mono text-mist italic"
            >
              Your presence was noted.
            </motion.p>
          )}
        </motion.div>

        {/* Back link */}
        <div className="mt-20">
          <a
            href="/room"
            className="text-xs font-mono text-mist hover:text-pale tracking-[0.2em] uppercase transition-colors duration-500"
          >
            ← Back to the room
          </a>
        </div>
      </motion.article>
    </div>
  );
}
