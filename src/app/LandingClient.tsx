'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PostCard } from '@/components/ui/PostCard';
import { FirstVisitModal } from '@/components/ui/FirstVisitModal';
import { Nav } from '@/components/layout/Nav';
import { PostPreview } from '@/types';

interface LandingClientProps {
  initialPosts: PostPreview[];
}

export function LandingClient({ initialPosts }: LandingClientProps) {
  return (
    <>
      <FirstVisitModal />
      <Nav />

      {/* Hero */}
      <section
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-[10vh] sm:pt-[15vh]"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="max-w-reading mx-auto"
        >
          <p className="font-mono text-[10px] sm:text-xs text-mist tracking-[0.25em] uppercase mb-8 sm:mb-12">
            The Quiet Room
          </p>

          <h1 className="font-serif text-whisper/95 mb-6 sm:mb-8 leading-[0.95] tracking-tight">
            Are you winning, son?
          </h1>

          <p className="font-serif italic text-ghost/40 text-base sm:text-lg mb-12 sm:mb-20">
            Or did something change?
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          >
            <Link
              href="/write"
              className="inline-block border border-ash text-pale/70 hover:text-ghost hover:border-mist px-8 sm:px-10 py-3 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-sans transition-all duration-700 min-h-[44px] flex items-center justify-center"
            >
              Enter the Room
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 sm:bottom-12 flex flex-col items-center gap-2"
        >
          <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-transparent to-ash/60" />
        </motion.div>
      </section>

      {/* Recent whispers */}
      <section className="px-6 pb-24 sm:pb-32 max-w-reading mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.8 }}
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
            <div className="w-full border-t border-ash/20 overflow-hidden">
              {initialPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}

          {initialPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.5 }}
              className="mt-12 text-center"
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
