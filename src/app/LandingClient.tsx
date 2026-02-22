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
        className="min-h-[100dvh] flex flex-col items-center justify-center px-8 text-center pt-[12vh] sm:pt-[15vh]"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="max-w-reading mx-auto"
        >
          <p className="font-mono text-[9px] sm:text-xs text-mist/60 tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-10 sm:mb-16">
            The Quiet Room
          </p>

          <h1 className="font-serif text-whisper/95 mb-8 sm:mb-10 leading-[1.05] sm:leading-[0.95] tracking-tight">
            Are you winning, son?
          </h1>

          <p className="font-serif italic text-ghost/40 text-base sm:text-xl mb-16 sm:mb-24">
            Or did something change?
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          >
            <Link
              href="/write"
              className="inline-flex border border-ash/40 text-pale/70 hover:text-ghost hover:border-mist px-10 sm:px-14 py-4 text-[9px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase font-sans transition-all duration-1000 min-h-[50px] items-center justify-center bg-transparent"
            >
              Enter the Room
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute bottom-10 sm:bottom-16 flex flex-col items-center gap-3"
        >
          <div className="w-[1px] h-10 sm:h-16 bg-gradient-to-b from-transparent via-ash/40 to-transparent" />
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
