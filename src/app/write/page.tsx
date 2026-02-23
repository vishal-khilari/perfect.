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
      <div className="min-h-screen px-6 pt-24 sm:pt-32 pb-32 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <p className="font-mono text-[9px] sm:text-xs text-mist/60 tracking-[0.3em] uppercase mb-12 sm:mb-20">
            Write something
          </p>

          <form onSubmit={handleSubmit} className="space-y-12 sm:space-y-16">
            {/* Name */}
            <div className="group">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="w-full bg-transparent border-b border-ash/30 pb-3 text-ghost/80 text-base font-sans focus:border-mist/60 transition-colors duration-700 placeholder:text-mist/40 min-h-[50px] break-words"
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
                className="w-full bg-transparent border-b border-ash/30 pb-3 font-serif text-xl sm:text-2xl text-whisper/80 focus:border-mist/60 transition-colors duration-700 placeholder:text-mist/30 min-h-[50px] break-words"
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
                rows={10}
                maxLength={10000}
                className="w-full bg-transparent font-serif text-lg sm:text-xl text-ghost/90 leading-relaxed sm:leading-loose placeholder:text-mist/30 focus:outline-none break-words"
                style={{ minHeight: '300px' }}
              />

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-ash/10">
                <span className="text-[9px] sm:text-[10px] font-mono text-mist/50 tracking-[0.1em] uppercase">
                  {wordCount} words / {readingTime} min read
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-mist/50 tracking-[0.1em]">
                  {body.length} / 10,000
                </span>
              </div>
            </div>

            {/* Mood selector */}
            <div className="pt-4">
              <p className="text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.3em] uppercase mb-6 sm:mb-8">
                Mood
              </p>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3">
                {MOODS.map(({ value, description }) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setMood(value)}
                    whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="border py-4 px-5 text-[10px] sm:text-xs font-mono tracking-[0.15em] transition-all duration-700 text-left min-h-[64px] flex flex-col justify-center"
                    style={{
                      borderColor: mood === value ? 'rgba(136,136,136,0.5)' : 'rgba(42,42,42,0.4)',
                      color: mood === value ? 'rgba(176,176,176,1)' : 'rgba(107,127,143,0.5)',
                      backgroundColor: mood === value ? 'rgba(255,255,255,0.02)' : 'transparent',
                    }}
                  >
                    <span className="block font-medium uppercase tracking-[0.15em] mb-1">{value}</span>
                    <span className="block text-[8px] sm:text-[9px] opacity-40 lowercase italic">{description}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Audio section */}
            <div className="pt-4">
              <div className="flex items-center justify-between sm:justify-start gap-6 mb-6">
                <p className="text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.3em] uppercase">
                  Audio
                </p>
                <button
                  type="button"
                  onClick={() => setShowAudio(!showAudio)}
                  className="text-[9px] sm:text-xs text-mist hover:text-pale transition-all duration-500 font-mono tracking-[0.2em] uppercase min-h-[44px] px-2"
                >
                  {showAudio ? '[ - ]' : '[ + ]'}
                </button>
              </div>

              <AnimatePresence>
                {showAudio && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.8 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8">
                      <AudioRecorder onAudioReady={setAudioBlobOrFile} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Options */}
            <div className="space-y-6 pt-6 border-t border-ash/10">
              <label className="flex items-center gap-5 cursor-pointer group min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="hidden"
                />
                <div className="w-5 h-5 border border-ash/40 flex items-center justify-center transition-all duration-500 group-hover:border-mist shrink-0">
                  {isPrivate && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-pale/60" />}
                </div>
                <span className="text-[9px] sm:text-[11px] font-mono text-mist/60 group-hover:text-pale/80 tracking-[0.2em] uppercase transition-colors duration-500">Keep private</span>
              </label>

              <label className="flex items-center gap-5 cursor-pointer group min-h-[44px]">
                <input
                  type="checkbox"
                  checked={burnAfter}
                  onChange={(e) => setBurnAfter(e.target.checked)}
                  className="hidden"
                />
                <div className="w-5 h-5 border border-ash/40 flex items-center justify-center transition-all duration-500 group-hover:border-mist shrink-0">
                  {burnAfter && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-pale/60" />}
                </div>
                <span className="text-[9px] sm:text-[11px] font-mono text-mist/60 group-hover:text-pale/80 tracking-[0.2em] uppercase transition-colors duration-500">Burn after 7 days</span>
              </label>

              <label className="flex items-center gap-5 cursor-pointer group min-h-[44px]">
                <input
                  type="checkbox"
                  checked={soundOn}
                  onChange={(e) => setSoundOn(e.target.checked)}
                  className="hidden"
                />
                <div className="w-5 h-5 border border-ash/40 flex items-center justify-center transition-all duration-500 group-hover:border-mist shrink-0">
                  {soundOn && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-pale/60" />}
                </div>
                <span className="text-[9px] sm:text-[11px] font-mono text-mist/60 group-hover:text-pale/80 tracking-[0.2em] uppercase transition-colors duration-500">Soft typing sounds</span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-mono text-pale/60 text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <div className="pt-10">
              <motion.button
                type="submit"
                disabled={submitting || body.trim().length < 10}
                whileTap={{ scale: 0.98 }}
                className="btn-ghost w-full sm:w-auto disabled:opacity-20 disabled:cursor-not-allowed text-[10px] tracking-[0.3em] min-h-[56px] sm:min-h-[54px] sm:px-16"
              >
                {submitting ? 'Saving...' : 'Leave it here'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
