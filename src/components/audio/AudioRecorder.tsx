'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioRecorderProps {
  onAudioReady: (blob: Blob | null) => void;
}

export function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [micError, setMicError] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  function drawWaveform() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser!.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(136,136,136,0.5)';
      ctx.beginPath();

      const sliceWidth = canvas!.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas!.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas!.width, canvas!.height / 2);
      ctx.stroke();
    }

    draw();
  }

  async function startRecording() {
    setMicError(false);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Set up analyser for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudioReady(blob);
        stream.getTracks().forEach(t => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      drawWaveform();
    } catch (err) {
      console.error('Microphone access denied:', err);
      setMicError(true);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function clearRecording() {
    setAudioUrl(null);
    setUploadedFile(null);
    onAudioReady(null);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Audio file must be under 10MB');
      return;
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    onAudioReady(file);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4 p-4 border border-ash/20 rounded-sm">
      {!audioUrl ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="btn-ghost flex items-center gap-3 px-6"
                disabled={micError}
              >
                <span className="w-2 h-2 rounded-full bg-pale/60 group-hover:bg-whisper transition-colors" />
                Record
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="btn-ghost flex items-center gap-3 px-6"
                style={{ borderColor: 'rgba(136,136,136,0.6)', color: 'rgba(241,241,241,0.8)' }}
              >
                <span className="w-2.5 h-2.5 bg-red-400/70 animate-pulse" />
                Stop · {formatDuration(duration)}
              </button>
            )}

            <label className="btn-ghost cursor-pointer px-6">
              Upload
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {micError && (
            <p className="text-xs font-mono text-red-400/70 tracking-wide">
              Microphone access was denied. Please enable it in your browser settings.
            </p>
          )}
          
          {isRecording && (
            <canvas
              ref={canvasRef}
              className="waveform w-full"
              width={600}
              height={50}
            />
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-3"
        >
          <p className="text-xs text-mist font-mono tracking-wider uppercase mb-2 truncate">
            {uploadedFile ? uploadedFile.name : 'Recording ready'}
          </p>
          <audio
            src={audioUrl}
            controls
            className="audio-player w-full"
            style={{ height: '38px' }}
          />
          <button
            type="button"
            onClick={clearRecording}
            className="text-xs text-mist hover:text-pale transition-colors duration-300 font-mono tracking-widest"
          >
            remove audio
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Minimal audio player for post pages ──────────────────────────────────────

export function AudioPlayer({ fileId }: { fileId: string }) {
  const [loaded, setLoaded] = useState(false);

  if (!fileId) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="my-8"
    >
      <audio
        src={`/api/audio/${fileId}`}
        controls
        preload="metadata"
        onCanPlay={() => setLoaded(true)}
        className="w-full transition-opacity duration-700"
        style={{
          opacity: loaded ? 0.8 : 0.4,
          filter: 'invert(0.8) contrast(0.5)',
        }}
      />
    </motion.div>
  );
}
