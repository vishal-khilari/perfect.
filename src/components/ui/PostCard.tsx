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
      <Link href={`/post/${post.id}`} className="block">
        <div
          className="post-card group border-b border-ash/20 py-10 sm:py-12 cursor-pointer transition-all duration-700 hover:translate-y-[-2px] w-full"        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 sm:mb-6">
            <h3 className="font-serif text-whisper/85 group-hover:text-whisper transition-colors duration-700 text-xl sm:text-2xl leading-tight break-words">              {post.title || 'Untitled'}
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

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.1em] uppercase">
            <span className="text-pale/50">{post.name || 'Anonymous'}</span>
            <span className="opacity-20 text-[8px]">/</span>
            <span>{date}</span>
            <span className="opacity-20 text-[8px]">/</span>
            <span>{post.readingTime} min</span>
            {post.hasAudio && (
              <>
                <span className="opacity-20 text-[8px]">/</span>
                <span className="text-pale/40">⟡ audio</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
