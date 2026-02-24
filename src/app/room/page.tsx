'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Nav } from '@/components/layout/Nav';
import { PostCard } from '@/components/ui/PostCard';
import { MoodIcon } from '@/components/ui/MoodIcon';
import { SkeletonPostCard } from '@/components/ui/SkeletonPostCard';
import { PostPreview, Mood, MOOD_COLORS } from '@/types';
import { useReducedMotion } from '@/hooks/useReducedMotion'; // Import useReducedMotion

type SortOrder = 'latest' | 'oldest' | 'random';
type FilterMood = Mood | 'all';

const sorts = [
  { value: 'latest' as const, label: 'Latest' },
  { value: 'oldest' as const, label: 'Oldest' },
  { value: 'random' as const, label: 'Random' },
];

const moods: FilterMood[] = ['all', 'Rain', 'Static', 'Silence', 'Night'];

function getMoodColorValue(m: Mood) {
  return MOOD_COLORS[m] || '#888888';
}

export default function RoomPage() {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOrder>('latest');
  const [moodFilter, setMoodFilter] = useState<FilterMood>('all');
  const [audioOnly, setAudioOnly] = useState(false);

  const prefersReducedMotion = useReducedMotion(); // Use the hook

  // Standardize duration to 0.8s for fade/entry
  const transitionDuration = prefersReducedMotion ? 0.1 : 0.8;
  // Conditional delay for PostCard
  const postCardDelay = prefersReducedMotion ? 0.0 : 0.15;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('sort', sort);
      if (moodFilter !== 'all') {
        queryParams.append('mood', moodFilter);
      }
      if (audioOnly) {
        queryParams.append('audioOnly', 'true');
      }

      const response = await fetch(`/api/posts?${queryParams.toString()}`);
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [sort, moodFilter, audioOnly]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadRandom = useCallback(() => {
    setSort('random');
  }, []);
  return (
    <>
      <Nav />

      <div className="min-h-screen px-6 pt-24 sm:pt-32 pb-32 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: transitionDuration }}
        >
          {/* Section 9.2: Room Page Tone */}
          <div className="mb-16 sm:mb-24">
            <p className="font-mono text-[9px] sm:text-xs text-mist/60 tracking-[0.15em] mb-6 sm:mb-8"> {/* Adjusted tracking */}
              the archive {/* Restored */}
            </p>
            <h2 className="font-serif italic text-pale/30 text-lg sm:text-2xl mb-10 sm:mb-14">
              what has been left here.
            </h2>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-10 mt-16 sm:mt-24 mb-16 sm:mb-24">
            {/* Sort */}
            <div className="flex flex-col gap-4">
              <span className="text-[9px] font-mono text-mist/40 tracking-[0.15em]">sort by</span> {/* Adjusted tracking */}
              <div className="flex gap-8 sm:gap-10 overflow-x-auto pb-2 scrollbar-hide">
                {sorts.map(({ value, label }) => (
                  <motion.button
                    key={value}
                    onClick={() => setSort(value)}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                    className="text-[10px] sm:text-xs font-mono tracking-[0.2em] transition-all duration-500 min-h-[48px] relative py-1 whitespace-nowrap"
                    style={{
                      color: sort === value ? 'rgba(176,176,176,1)' : 'rgba(136,136,136,0.6)',
                    }}
                  >
                    {label.toLowerCase()}
                    {sort === value && (
                      <motion.div layoutId="sort-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-pale/40" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 sm:items-end sm:justify-between">
              {/* Mood filter */}
              <div className="flex flex-col gap-4">
                <span className="text-[9px] font-mono text-mist/40 tracking-[0.15em]">mood</span> {/* Adjusted tracking */}
                <div className="flex gap-4 sm:gap-6 flex-wrap">
                  {moods.map((m) => (
                                      <motion.button
                                        key={m}
                                        onClick={() => setMoodFilter(m)}
                                        whileTap={{ scale: prefersReducedMotion ? 1 : 0.98, boxShadow: prefersReducedMotion ? 'none' : `0 0 10px ${moodFilter === m ? `${getMoodColorValue(m as Mood)}60` : 'transparent'}` }}
                                        className="text-xs sm:text-sm font-mono tracking-[0.1em] capitalize transition-all duration-500 min-h-[44px] px-5 border flex items-center justify-center relative overflow-hidden group"
                                        style={{
                                          color: moodFilter === m ? 'rgba(255,255,255,1)' : 'rgba(176,176,176,0.8)',
                                          borderColor: moodFilter === m ? 'rgba(255,255,255,0.4)' : 'rgba(42,42,42,0.6)',
                                          backgroundColor: moodFilter === m ? 'rgba(255,255,255,0.05)' : 'transparent',
                                          boxShadow: moodFilter === m ? `0 0 10px ${m === 'all' ? 'rgba(136,136,136,0.2)' : `${getMoodColorValue(m as Mood)}60`}` : 'none', // Slightly increased glow intensity for active, adjusted to be more subtle overall
                                        }}
                                      >
                                          {m !== 'all' && (
                                            <MoodIcon mood={m as Mood} className={`mr-2 h-4 w-4 ${moodFilter === m ? 'opacity-90' : 'opacity-50 group-hover:opacity-70'} transition-opacity duration-500`} />
                                          )}
                                          {m}
                                        </motion.button>
                                      ))}
                </div>
              </div>

              {/* Audio only */}
              <motion.button
                onClick={() => setAudioOnly(!audioOnly)}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                className="text-[10px] sm:text-xs font-mono tracking-[0.2em] transition-all duration-500 min-h-[50px] flex items-center gap-3 border border-ash/10 sm:border-transparent px-4 sm:px-0"
                style={{
                  color: audioOnly ? 'rgba(176,176,176,1)' : 'rgba(107,127,143,0.4)',
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${audioOnly ? 'bg-pale/60' : 'bg-ash/40'}`} />
                with a voice
              </motion.button>
            </div>
          </div>

          {/* Random confession button */}
          <div className="mb-16 sm:mb-20">
            <motion.button
              onClick={loadRandom}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
              className="text-[10px] sm:text-xs font-mono text-mist/60 hover:text-pale tracking-[0.15em] transition-all duration-700 min-h-[56px] flex items-center border border-ash/20 px-6 hover:bg-white/[0.02] w-full sm:w-auto justify-center sm:justify-start"
            >
              a random whisper → {/* Restored */}
            </motion.button>
          </div>

          <hr className="divider opacity-30" />

          {/* Posts */}
          {loading ? (
            <div className="space-y-8 pt-16 sm:pt-20">
              {[...Array(3)].map((_, i) => (
                <SkeletonPostCard key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <>
              <div className="py-32 text-center pt-16 sm:pt-20">
                <p className="font-serif italic text-pale/30 text-lg tracking-wide">
                  nothing has been left here yet.
                </p>
              </div>
              <div className="space-y-12 pt-16 sm:pt-20">
                {posts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} postCardDelay={postCardDelay} />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-12 pt-16 sm:pt-20">
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} postCardDelay={postCardDelay} />
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <p className="mt-16 text-center text-xs font-mono text-mist tracking-[0.15em]"> {/* Adjusted tracking */}
              {posts.length} {posts.length === 1 ? 'whisper' : 'whispers'} now heard {/* Restored */}
            </p>
          )}
        </motion.div>
      </div>
    </>
  );
}
