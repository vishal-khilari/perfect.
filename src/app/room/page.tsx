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

      <div className="min-h-screen px-6 pt-24 sm:pt-32 pb-32 max-w-reading mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="mb-12 sm:mb-20">
            <p className="font-mono text-[9px] sm:text-xs text-mist/60 tracking-[0.3em] uppercase mb-4">
              The Archive
            </p>
            <h2 className="font-serif italic text-pale/30 text-lg sm:text-2xl">
              What people left behind.
            </h2>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-10 mb-12 sm:mb-20">
            {/* Sort */}
            <div className="flex flex-col gap-4">
              <span className="text-[9px] font-mono text-mist/40 tracking-[0.2em] uppercase">Order by</span>
              <div className="flex gap-6 sm:gap-8">
                {sorts.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSort(value)}
                    className="text-[10px] sm:text-xs font-mono tracking-[0.2em] transition-all duration-500 min-h-[44px] relative py-1"
                    style={{
                      color: sort === value ? 'rgba(176,176,176,1)' : 'rgba(107,127,143,0.4)',
                    }}
                  >
                    {label}
                    {sort === value && (
                      <motion.div layoutId="sort-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-pale/40" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 sm:items-end sm:justify-between">
              {/* Mood filter */}
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-mono text-mist/40 tracking-[0.2em] uppercase">Filter by mood</span>
                <div className="flex gap-4 flex-wrap">
                  {moods.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMoodFilter(m)}
                      className="text-[10px] sm:text-xs font-mono tracking-[0.1em] capitalize transition-all duration-500 min-h-[36px] px-3 border border-transparent"
                      style={{
                        color: moodFilter === m ? 'rgba(176,176,176,1)' : 'rgba(107,127,143,0.4)',
                        borderColor: moodFilter === m ? 'rgba(136,136,136,0.2)' : 'transparent',
                        backgroundColor: moodFilter === m ? 'rgba(255,255,255,0.03)' : 'transparent',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio only */}
              <button
                onClick={() => setAudioOnly(!audioOnly)}
                className="text-[10px] sm:text-xs font-mono tracking-[0.2em] transition-all duration-500 min-h-[44px] flex items-center gap-2"
                style={{
                  color: audioOnly ? 'rgba(176,176,176,1)' : 'rgba(107,127,143,0.4)',
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${audioOnly ? 'bg-pale/60' : 'bg-ash/40'}`} />
                with audio
              </button>
            </div>
          </div>

          {/* Random confession button */}
          <div className="mb-12 sm:mb-20">
            <button
              onClick={loadRandom}
              className="text-[10px] sm:text-xs font-mono text-mist/60 hover:text-pale tracking-[0.2em] uppercase transition-all duration-700 min-h-[50px] flex items-center border border-ash/20 px-6 hover:bg-white/[0.02]"
            >
              Open a random confession →
            </button>
          </div>

          <hr className="divider opacity-30" />

          {/* Posts */}
          {loading ? (
            <div className="py-32 text-center">
              <p className="font-serif italic text-pale/20 text-lg animate-pulse tracking-widest">
                Gathering whispers...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-32 text-center">
              <p className="font-serif italic text-pale/30 text-lg tracking-wide">
                The silence is complete.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
