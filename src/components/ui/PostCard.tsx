'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PostPreview, MOOD_COLORS } from '@/types';

interface PostCardProps {
  post: PostPreview;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const moodColor = MOOD_COLORS[post.mood as keyof typeof MOOD_COLORS] || 'text-pale';
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: index * 0.15 }}
    >
      <Link href={`/post/${post.id}`}>
        <div
          className="post-card group border-b border-ash/50 py-8 cursor-pointer transition-all duration-700 hover:border-ash hover:translate-y-[-2px] w-full overflow-hidden"        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="font-serif text-whisper/80 group-hover:text-whisper transition-all duration-700 text-lg leading-tight group-hover:tracking-wide break-words">              {post.title || 'Untitled'}
            </h3>
            <span className={`mood-badge shrink-0 ${moodColor}`}>
              {post.mood}
            </span>
          </div>

          <p className="preview-text font-sans text-sm text-pale/70 leading-relaxed mb-4 break-words">
            {post.preview || '...'}
            {post.preview && post.preview.length >= 120 && (
              <span className="text-mist"> ···</span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs font-mono text-mist tracking-wider uppercase">
            <span>{post.name || 'Anonymous'}</span>
            <span className="opacity-30">·</span>
            <span>{date}</span>
            <span className="opacity-30">·</span>
            <span>{post.readingTime} min</span>
            {post.hasAudio && (
              <>
                <span className="opacity-30">·</span>
                <span className="text-pale/60">⟡ audio</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
