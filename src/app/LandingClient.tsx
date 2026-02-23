'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PostCard } from '@/components/ui/PostCard';
import { FirstVisitModal } from '@/components/ui/FirstVisitModal';
import { Nav } from '@/components/layout/Nav';
import { PostPreview } from '@/types';
import { useReducedMotion } from '@/hooks/useReducedMotion'; // Import useReducedMotion

interface LandingClientProps {
  initialPosts: PostPreview[];
}

export function LandingClient({ initialPosts }: LandingClientProps) {
  const prefersReducedMotion = useReducedMotion(); // Use the hook

  const transitionDuration = prefersReducedMotion ? 0.1 : 0.8; // Standardized duration
  const postCardDelay = prefersReducedMotion ? 0.0 : 0.15; // Conditional delay

  return (
    <>
      <FirstVisitModal />
      <Nav />

      {/* Hero */}
      <section
        className="min-h-[100dvh] flex flex-col items-center justify-center px-8 text-center pt-[12vh] sm:pt-[15vh]"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.3 }} // Standardized duration
          className="max-w-3xl mx-auto w-full"
        >
          <p className="font-mono text-[9px] sm:text-xs text-mist/60 tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-10 sm:mb-16">
            The Quiet Room
          </p>

          <h1 className="font-serif text-whisper/95 mb-8 sm:mb-10 leading-[1.05] sm:leading-[0.95] tracking-tight">
            Leave it here.
          </h1>

          <p className="font-serif italic text-ghost/40 text-base sm:text-xl mb-16 sm:mb-24">
            Walk away lighter.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.3 }} // Standardized duration and delay
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link
              href="/write"
              className="w-full sm:w-auto"
            >
              <motion.span
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }} // Standardized scale
                className="btn-ghost w-full sm:w-auto !border-ash/60 hover:!border-mist/80 !text-pale/80 hover:!text-ghost px-10 sm:px-12 tracking-[0.3em]"
              >
                Unburden
              </motion.span>
            </Link>
            <Link
              href="/room"
              className="w-full sm:w-auto"
            >
              <motion.span
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }} // Standardized scale
                className="btn-ghost w-full sm:w-auto !border-ash/20 hover:!border-ash/50 !text-pale/50 hover:!text-pale/70 px-8 sm:px-10 tracking-[0.2em]"
              >
                Open the Archive
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.5 }} // Standardized duration and delay
          className="absolute bottom-10 sm:bottom-16 flex flex-col items-center gap-3"
        >
          <div className="w-[1px] h-10 sm:h-16 bg-gradient-to-b from-transparent via-ash/40 to-transparent" />
        </motion.div>
      </section>

      {/* Recent whispers */}
      <section className="px-6 pb-16 pt-24 sm:pt-32 max-w-3xl mx-auto w-full"> {/* Normalized pb, added pt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.2 }} // Standardized duration and delay
        >
          <p className="font-mono text-[10px] sm:text-xs text-mist tracking-[0.2em] uppercase mb-10 sm:mb-12">
            From the archive
          </p>

          {initialPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif italic text-pale/40 text-lg">
                The room is empty. Be the first to speak.
              </p>
            </div>
          ) : (
            <div className="w-full border-t border-ash/20 overflow-hidden space-y-8">
              {initialPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} postCardDelay={postCardDelay} />
              ))}
            </div>
          )}

          {initialPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: transitionDuration, delay: prefersReducedMotion ? 0 : 0.3 }} // Standardized duration and delay
              className="mt-16 text-center" {/* Increased mt */}
            >
              <Link
                href="/room"
                className="text-xs font-mono text-mist hover:text-pale tracking-[0.2em] uppercase transition-colors duration-500"
              >
                Enter the full archive →
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>
    </>
  );
}
