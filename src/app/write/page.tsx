'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Nav } from '@/components/layout/Nav';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { Mood } from '@/types';

const MOODS: { value: Mood; description: string }[] = [
  { value: 'Rain', description: 'something heavy' },
  { value: 'Static', description: 'something unresolved' },
  { value: 'Silence', description: 'something unspoken' },
  { value: 'Night', description: 'something dark' },
];

const DRAFT_KEY = 'quiet-room-draft';

function calcWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function calcReadingTime(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}

export default function WritePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood>('Silence');
  const [isPrivate, setIsPrivate] = useState(false);
  const [burnAfter, setBurnAfter] = useState(false);
  const [audioBlobOrFile, setAudioBlobOrFile] = useState<Blob | File | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showAudio, setShowAudio] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastKeyRef = useRef<number>(0);

  const wordCount = calcWordCount(body);
  const readingTime = calcReadingTime(wordCount);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setName(draft.name || '');
        setTitle(draft.title || '');
        setBody(draft.body || '');
        setMood(draft.mood || 'Silence');
      }
    } catch {}
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, title, body, mood }));
      } catch {}
    }, 1000);
    return () => clearTimeout(timeout);
  }, [name, title, body, mood]);

  // Typing sound
  function playTypingSound() {
    if (!soundOn) return;
    const now = Date.now();
    if (now - lastKeyRef.current < 80) return;
    lastKeyRef.current = now;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 800 + Math.random() * 200;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    if (body.length > 10000) {
      setError('Maximum 10,000 characters.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let userId = localStorage.getItem('quiet-room-user-id');
      if (!userId) {
        userId = uuidv4();
        localStorage.setItem('quiet-room-user-id', userId);
      }

      let audioFileId = '';

      // Upload audio first if present
      if (audioBlobOrFile) {
        const formData = new FormData();
        formData.append('audio', audioBlobOrFile, 'recording.webm');
        formData.append('userId', userId);

        const audioRes = await fetch('/api/audio/upload', {
          method: 'POST',
          body: formData,
        });

        if (audioRes.ok) {
          const audioData = await audioRes.json();
          audioFileId = audioData.fileId;
        }
      }

      // Submit post
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous',
          title: title.trim(),
          body: body.trim(),
          mood,
          userId,
          isPrivate,
          burnAfterDays: burnAfter ? 7 : undefined,
          audioFileId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Nav />
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="text-center max-w-sm"
          >
            <p className="font-serif text-2xl text-whisper/80 italic mb-4">
              Your words exist now.
            </p>
            <p className="font-sans text-sm text-pale/50 mb-10">
              They are stored. Quietly.
            </p>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => router.push('/room')}
                className="btn-ghost"
              >
                The Room
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setBody('');
                  setTitle('');
                  setName('');
                }}
                className="btn-ghost"
              >
                Write again
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />

      <div className="min-h-screen px-6 pt-24 sm:pt-28 pb-24 max-w-reading mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <p className="font-mono text-[10px] sm:text-xs text-mist tracking-[0.2em] uppercase mb-10 sm:mb-16">
            Write something
          </p>

          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            {/* Name */}
            <div>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="w-full bg-transparent border-b border-ash/50 pb-2 text-ghost/70 text-sm font-sans focus:border-mist/70 transition-colors duration-500 placeholder:text-mist/50 min-h-[44px]"
              />
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="A title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full bg-transparent border-b border-ash/50 pb-2 font-serif text-lg sm:text-xl text-whisper/70 focus:border-mist/70 transition-colors duration-500 placeholder:text-mist/40 min-h-[44px]"
              />
            </div>

            {/* Body */}
            <div>
              <textarea
                placeholder="Say what you need to say..."
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  playTypingSound();
                }}
                onKeyDown={() => playTypingSound()}
                rows={12}
                maxLength={10000}
                className="w-full bg-transparent font-serif text-base sm:text-lg text-ghost/80 leading-relaxed sm:leading-loose placeholder:text-mist/40 focus:outline-none"
                style={{ minHeight: '250px' }}
              />

              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] font-mono text-mist tracking-wider uppercase">
                  {wordCount} words · {readingTime} min read
                </span>
                <span className="text-[10px] font-mono text-mist tracking-wider">
                  {body.length} / 10,000
                </span>
              </div>
            </div>

            {/* Mood selector */}
            <div>
              <p className="text-[10px] sm:text-xs font-mono text-mist tracking-[0.2em] uppercase mb-4">
                Mood
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {MOODS.map(({ value, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMood(value)}
                    className="border py-3 px-4 text-[10px] sm:text-xs font-mono tracking-widest transition-all duration-500 text-left min-h-[50px] flex flex-col justify-center"
                    style={{
                      borderColor: mood === value ? 'rgba(136,136,136,0.6)' : 'rgba(42,42,42,0.8)',
                      color: mood === value ? 'rgba(176,176,176,0.9)' : 'rgba(61,61,61,0.9)',
                    }}
                  >
                    <span className="block font-medium uppercase tracking-widest">{value}</span>
                    <span className="block text-[8px] sm:text-[10px] opacity-50 mt-1 lowercase italic">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio section */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-[10px] sm:text-xs font-mono text-mist tracking-[0.2em] uppercase">
                  Audio (optional)
                </p>
                <button
                  type="button"
                  onClick={() => setShowAudio(!showAudio)}
                  className="text-[10px] sm:text-xs text-mist hover:text-pale transition-colors duration-300 font-mono tracking-widest uppercase min-h-[32px]"
                >
                  {showAudio ? '[ hide ]' : '[ add audio ]'}
                </button>
              </div>

              <AnimatePresence>
                {showAudio && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden"
                  >
                    <AudioRecorder onAudioReady={setAudioBlobOrFile} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Options */}
            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-4 cursor-pointer group min-h-[32px]">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="hidden"
                />
                <div className="w-5 h-5 border border-ash flex items-center justify-center transition-colors duration-300 group-hover:border-mist shrink-0">
                  {isPrivate && <div className="w-2.5 h-2.5 bg-pale/60" />}
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-mist tracking-widest uppercase">Keep private (draft only)</span>
              </label>

              <label className="flex items-center gap-4 cursor-pointer group min-h-[32px]">
                <input
                  type="checkbox"
                  checked={burnAfter}
                  onChange={(e) => setBurnAfter(e.target.checked)}
                  className="hidden"
                />
                <div className="w-5 h-5 border border-ash flex items-center justify-center transition-colors duration-300 group-hover:border-mist shrink-0">
                  {burnAfter && <div className="w-2.5 h-2.5 bg-pale/60" />}
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-mist tracking-widest uppercase">Burn after 7 days</span>
              </label>

              <label className="flex items-center gap-4 cursor-pointer group min-h-[32px]">
                <input
                  type="checkbox"
                  checked={soundOn}
                  onChange={(e) => setSoundOn(e.target.checked)}
                  className="hidden"
                />
                <div className="w-5 h-5 border border-ash flex items-center justify-center transition-colors duration-300 group-hover:border-mist shrink-0">
                  {soundOn && <div className="w-2.5 h-2.5 bg-pale/60" />}
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-mist tracking-widest uppercase">Soft typing sounds</span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-mono text-pale/60"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || body.trim().length < 10}
                className="btn-ghost w-full sm:w-auto disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving your words...' : 'Leave it here'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
