'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion'; // Import useReducedMotion

export function AudioPlayer({ fileId }: { fileId: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false); // State to track if audio is loaded

  const prefersReducedMotion = useReducedMotion(); // Use the hook

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setLoaded(true); // Set loaded to true once metadata is available
    };
    const setAudioTime = () => {
      setProgress(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0); // Reset progress when audio ends
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setProgress(Number(e.target.value));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!fileId) return null;

  return (
    <div className="audio-player flex flex-col items-center">
      <audio ref={audioRef} src={`/api/audio/${fileId}`} preload="metadata" />
      <div className="flex items-center w-full gap-4 mt-4">
        <motion.button
          onClick={togglePlayPause}
          whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }} // Respect reduced motion
          className="p-3 rounded-full bg-mist/20 hover:bg-mist/40 transition-colors duration-300"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-whisper" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8.75A.75.75 0 006.25 9v2.5a.75.75 0 00.75.75h.5a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.25h-.5zm4 0A.75.75 0 0010.25 9v2.5a.75.75 0 00.75.75h.5a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.25h-.5z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-whisper" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8.25A.75.75 0 017.75 7h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017 8.25z" />
            </svg>
          )}
        </motion.button>
        <input
          type="range"
          min="0"
          max={duration}
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 bg-mist/30 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-mono text-whisper/70">{formatTime(progress)} / {formatTime(duration)}</span>
      </div>
    </div>
  );
}