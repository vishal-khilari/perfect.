'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PostPreview, MOOD_COLORS } from '@/types';
import { useReducedMotion } from '@/hooks/useReducedMotion'; // Import useReducedMotion

interface PostCardProps {
  post: PostPreview;
  index?: number;
  postCardDelay?: number;
}

export function PostCard({ post, index = 0, postCardDelay }: PostCardProps) {
  const prefersReducedMotion = useReducedMotion(); // Use the hook

  const moodColor = MOOD_COLORS[post.mood as keyof typeof MOOD_COLORS] || 'text-pale';
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const delay = postCardDelay !== undefined ? postCardDelay : (index * 0.15);
  const scaleWhileTap = postCardDelay === 0 ? 1 : 0.995; // Use postCardDelay to determine if reduced motion is active

  const hasReactions = (post.reactFelt || 0) + (post.reactAlone || 0) + (post.reactUnderstand || 0) > 0;

  return (
    <Link href={`/post/${post.id}`} className="block w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.1 : 0.8, delay: delay }} // Standardized duration, delay respects reduced motion
        whileTap={{ scale: scaleWhileTap, opacity: 0.8 }} // Scale respects reduced motion
        className="post-card group border-b border-ash/20 py-8 sm:py-12 transition-all duration-700 w-full"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
          <h3 className="font-serif text-whisper/85 group-hover:text-whisper transition-colors duration-700 text-xl sm:text-2xl leading-tight break-words line-clamp-2">
            {post.title || 'Untitled'}
          </h3>
          <span className={`mood-badge self-start sm:self-auto shrink-0 ${moodColor}`}>
            {post.mood}
          </span>
        </div>

        <p className="preview-text font-sans text-[13px] sm:text-sm text-pale/60 leading-relaxed mb-6 sm:mb-8 line-clamp-3 sm:line-clamp-none break-words">
          {post.preview || '...'}
          {post.preview && post.preview.length >= 120 && (
            <span className="text-mist/40"> ···</span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] sm:text-xs font-mono text-pale/60 tracking-[0.1em] uppercase">
          <span className="text-pale/50">{post.name || 'Anonymous'}</span>
          <span className="opacity-20 text-[8px]">/</span>
          <span>{post.createdAt}</span>
          <span className="opacity-20 text-[8px]">/</span>
          <span>{post.readingTime} min</span>
          {post.hasAudio && (
            <>
              <span className="opacity-20 text-[8px]">/</span>
              <span className="text-pale/40">⟡ audio</span>
            </>
          )}
          {hasReactions && (
            <>
              <span className="opacity-20 text-[8px]">/</span>
              <motion.span
                initial={{ opacity: prefersReducedMotion ? 1 : 0.3 }} // No pulse if reduced motion
                animate={{ opacity: prefersReducedMotion ? 1 : [0.3, 0.6, 0.3] }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 1.5, repeat: prefersReducedMotion ? 0 : Infinity }} // Shorter duration, no repeat if reduced motion
                className="text-pale/60"
              >
                *
              </motion.span>
            </>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
