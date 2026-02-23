'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Nav } from '@/components/layout/Nav';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { MoodIcon } from '@/components/ui/MoodIcon'; // Import MoodIcon
import { Mood, MOOD_COLORS, MOOD_HEX_COLORS } from '@/types'; // Import MOOD_COLORS, MOOD_HEX_COLORS

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
      setError('a few more words are needed.');
      return;
    }
    if (body.length > 10000) {
      setError('too many words, please refine.');
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
          name: name.trim() || 'anonymous',
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
        throw new Error(data.error || 'something went wrong');
      }

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'something went wrong. please try again.');
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
              a whisper has been left.
            </p>
            <p className="font-sans text-sm text-pale/50 mb-10">
              it rests here. quietly.
            </p>
            <div className="flex gap-6 justify-center">
              <motion.button
                onClick={() => router.push('/room')}
                className="btn-ghost"
              >
                to the room
              </motion.button>
              <motion.button
                onClick={() => {
                  setSubmitted(false);
                  setBody('');
                  setTitle('');
                  setName('');
                }}
                className="btn-ghost"
              >
                leave another
              </motion.button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  const getMoodColorValue = (m: Mood) => {
    // Helper to get hex color from MOOD_COLORS based on Mood enum
    // Note: MOOD_COLORS is for Tailwind classes, getMoodColorValue was for hex.
    // Now using MOOD_HEX_COLORS for direct hex values.
    return MOOD_HEX_COLORS[m] || '#888888';
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen px-6 pt-24 sm:pt-32 pb-32 max-w-3xl mx-auto w-full">
        {/* Section 8.1: Entry Atmosphere */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="pt-16 sm:pt-24"
        >
          <p className="font-mono text-[9px] sm:text-xs text-mist/60 tracking-[0.3em] uppercase mb-16 sm:mb-24">
            leave a whisper
          </p>

          <form onSubmit={handleSubmit}>
            {/* Section 8.2: Title Field Hierarchy */}
            {/* Name */}
            <div className="group mb-12 sm:mb-16">
              <input
                type="text"
                placeholder="your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="w-full bg-transparent border-b border-ash/30 pb-3 text-ghost/80 text-base font-sans focus:border-mist/60 transition-colors duration-700 placeholder:text-mist/40 min-h-[50px] break-words"
              />
            </div>

            {/* Title */}
            <div className="mb-16 sm:mb-20">
              <input
                type="text"
                placeholder="a title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full bg-transparent border-b border-ash/30 pb-3 font-serif text-xl sm:text-2xl text-whisper/80 focus:border-mist/60 transition-colors duration-700 placeholder:text-mist/30 min-h-[50px] break-words"
              />
            </div>

            {/* Section 8.3: Body Textarea Emotional Depth */}
            {/* Body */}
            <div className="mb-20 sm:mb-24">
              <textarea
                placeholder="leave your thoughts here..."
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  playTypingSound();
                }}
                onKeyDown={() => playTypingSound()}
                rows={10}
                maxLength={10000}
                className="w-full bg-transparent font-serif text-lg sm:text-xl text-ghost/90 leading-relaxed sm:leading-loose placeholder:text-mist/30 focus:outline-none break-words min-h-[300px] sm:min-h-[350px]"
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

            {/* Section 8.4: Mood Selection Emotional Tone */}
            {/* Mood selector */}
            <div className="pt-16 sm:pt-20">
              <p className="text-[9px] sm:text-xs font-mono text-mist/60 tracking-[0.3em] uppercase mb-10 sm:mb-14">
                the feeling
              </p>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {MOODS.map(({ value, description }) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setMood(value)}
                    whileTap={{ scale: 0.98, boxShadow: `0 0 10px ${getMoodColorValue(value)}40` }}
                    className="border py-4 px-5 text-[10px] sm:text-xs font-mono tracking-[0.15em] transition-all duration-700 text-left min-h-[64px] flex flex-col justify-center relative overflow-hidden group"
                    style={{
                      borderColor: mood === value ? 'rgba(136,136,136,0.5)' : 'rgba(42,42,42,0.4)',
                      color: mood === value ? 'rgba(176,176,176,1)' : 'rgba(136,136,136,0.6)',
                      backgroundColor: mood === value ? 'rgba(255,255,255,0.03)' : 'transparent',
                      boxShadow: mood === value ? `0 0 15px ${getMoodColorValue(value)}40` : 'none',
                    }}
                  >
                    <div className="flex items-center mb-1">
                      <MoodIcon mood={value} className={`mr-2 h-4 w-4 ${mood === value ? 'opacity-80' : 'opacity-40 group-hover:opacity-60'} transition-opacity duration-500`} />
                      <span className="block font-medium uppercase tracking-[0.15em]">{value}</span>
                    </div>
                    <span className="block text-[8px] sm:text-[9px] opacity-40 lowercase italic">{description}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Audio section */}
            <div className="pt-16 sm:pt-20">
              <div className="flex items-center justify-between sm:justify-start gap-6 mb-6">
                <p className="text-[9px] font-mono text-mist/60 tracking-[0.3em] uppercase">
                  record a whisper
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
            <div className="space-y-8 pt-16 sm:pt-20 border-t border-ash/10">
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
                <span className="text-[9px] sm:text-[11px] font-mono text-mist/60 group-hover:text-pale/80 tracking-[0.2em] uppercase transition-colors duration-500">keep this private</span>
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
                <span className="text-[9px] sm:text-[11px] font-mono text-mist/60 group-hover:text-pale/80 tracking-[0.2em] uppercase transition-colors duration-500">erase after 7 days</span>
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
                <span className="text-[9px] sm:text-[11px] font-mono text-mist/60 group-hover:text-pale/80 tracking-[0.2em] uppercase transition-colors duration-500">soft sounds for writing</span>
              </label>
            </div>

            {/* Section 8.6: Error / Validation Tone */}
            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-mono text-pale/60 text-center mt-12 sm:mt-16 mb-12 sm:mb-16"
              >
                {error}
              </motion.p>
            )}

            {/* Section 8.5: Submit Button Emotional Weight */}
            {/* Submit */}
            <div className="pt-20 sm:pt-24">
              <motion.button
                type="submit"
                disabled={submitting || body.trim().length < 10}
                whileTap={{ scale: 0.98 }}
                className="btn-ghost w-full sm:w-auto disabled:opacity-20 disabled:cursor-not-allowed text-[10px] tracking-[0.3em] min-h-[56px] sm:min-h-[54px] sm:px-16"
              >
                {submitting ? 'listening...' : 'Leave it here'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
