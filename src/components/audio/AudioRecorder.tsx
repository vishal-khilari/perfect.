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
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
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
    };
  }, []);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {!audioUrl ? (
        <div className="space-y-3">
          {/* Record button */}
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="btn-ghost flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-pale/60 inline-block" />
                Record
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="btn-ghost flex items-center gap-2"
                style={{ borderColor: 'rgba(136,136,136,0.6)' }}
              >
                <span className="w-2 h-2 bg-whisper/60 inline-block" />
                Stop · {formatDuration(duration)}
              </button>
            )}

            {/* File upload */}
            <label className="btn-ghost cursor-pointer">
              Upload
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Live waveform */}
          {isRecording && (
            <canvas
              ref={canvasRef}
              className="waveform w-full"
              width={600}
              height={40}
            />
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-2"
        >
          <p className="text-xs text-mist font-mono tracking-wider uppercase mb-2">
            {uploadedFile ? uploadedFile.name : 'Recording ready'}
          </p>
          <audio
            src={audioUrl}
            controls
            className="audio-player w-full"
            style={{ height: '32px' }}
          />
          <button
            type="button"
            onClick={clearRecording}
            className="text-xs text-mist hover:text-pale transition-colors duration-300 font-mono tracking-wider"
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
      <p className="text-xs text-mist font-mono tracking-widest uppercase mb-3">
        ⟡ audio accompaniment
      </p>
      <audio
        src={`/api/audio/${fileId}`}
        controls
        onLoadedData={() => setLoaded(true)}
        className="w-full"
        style={{
          opacity: loaded ? 0.6 : 0.3,
          filter: 'invert(0.8) contrast(0.4)',
          transition: 'opacity 0.5s ease',
        }}
      />
    </motion.div>
  );
}
