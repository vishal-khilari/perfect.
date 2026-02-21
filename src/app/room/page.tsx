'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Nav } from '@/components/layout/Nav';
import { PostCard } from '@/components/ui/PostCard';
import { PostPreview, Mood } from '@/types';

type SortOrder = 'latest' | 'oldest' | 'random';
type FilterMood = Mood | 'all';

export default function RoomPage() {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOrder>('latest');
  const [moodFilter, setMoodFilter] = useState<FilterMood>('all');
  const [audioOnly, setAudioOnly] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort,
        ...(moodFilter !== 'all' ? { mood: moodFilter } : {}),
        ...(audioOnly ? { audioOnly: '1' } : {}),
      });

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [sort, moodFilter, audioOnly]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function loadRandom() {
    const res = await fetch('/api/posts?sort=random&limit=1');
    const data = await res.json();
    if (data.posts?.[0]) {
      window.location.href = `/post/${data.posts[0].id}`;
    }
  }

  const moods: FilterMood[] = ['all', 'Rain', 'Static', 'Silence', 'Night'];
  const sorts: { value: SortOrder; label: string }[] = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'random', label: 'Random' },
  ];

  return (
    <>
      <Nav />

      <div className="min-h-screen px-6 pt-24 sm:pt-28 pb-24 max-w-reading mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <p className="font-mono text-[10px] sm:text-xs text-mist tracking-[0.2em] uppercase mb-3">
            The Archive
          </p>
          <p className="font-serif italic text-pale/40 text-sm sm:text-base mb-10 sm:mb-14">
            What people left behind.
          </p>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 sm:mb-12">
            {/* Sort */}
            <div className="flex gap-4">
              {sorts.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSort(value)}
                  className="text-[10px] sm:text-xs font-mono tracking-widest transition-colors duration-400 min-h-[32px]"
                  style={{
                    color: sort === value ? 'rgba(176,176,176,0.9)' : 'rgba(61,61,61,0.9)',
                    textDecoration: sort === value ? 'underline' : 'none',
                    textUnderlineOffset: '3px',
                    textDecorationColor: 'rgba(136,136,136,0.4)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mood filter */}
            <div className="flex gap-3 flex-wrap">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMoodFilter(m)}
                  className="text-[10px] sm:text-xs font-mono tracking-widest capitalize transition-colors duration-400 min-h-[32px]"
                  style={{
                    color: moodFilter === m ? 'rgba(176,176,176,0.9)' : 'rgba(61,61,61,0.9)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Audio only */}
            <button
              onClick={() => setAudioOnly(!audioOnly)}
              className="text-[10px] sm:text-xs font-mono tracking-widest transition-colors duration-400 min-h-[32px] text-left"
              style={{
                color: audioOnly ? 'rgba(176,176,176,0.9)' : 'rgba(61,61,61,0.9)',
              }}
            >
              ⟡ with audio
            </button>
          </div>

          {/* Random confession button */}
          <div className="mb-10 sm:mb-12">
            <button
              onClick={loadRandom}
              className="text-[10px] sm:text-xs font-mono text-mist hover:text-pale tracking-[0.2em] uppercase transition-colors duration-500 min-h-[44px] flex items-center"
            >
              Open a random confession →
            </button>
          </div>

          <hr className="divider" />

          {/* Posts */}
          {loading ? (
            <div className="py-20 text-center">
              <p className="font-serif italic text-pale/30 text-base animate-pulse">
                Gathering whispers...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif italic text-pale/40 text-base">
                Nothing here yet. The silence is complete.
              </p>
            </div>
          ) : (
            <div>
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <p className="mt-12 text-center text-xs font-mono text-mist tracking-wider">
              {posts.length} {posts.length === 1 ? 'voice' : 'voices'} in this room
            </p>
          )}
        </motion.div>
      </div>
    </>
  );
}
