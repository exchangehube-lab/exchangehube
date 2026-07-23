import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';

export function VoicePlayer({ url, duration }: { url: string; duration?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || duration || 1)) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    // Attempt to preload duration if possible
    audio.addEventListener('loadedmetadata', () => {
       if (audio.duration && audio.duration !== Infinity) {
          // Duration is available
       }
    });

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [url, duration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = (Number(e.target.value) / 100) * (audioRef.current.duration || duration || 0);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(Number(e.target.value));
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayDuration = duration || (audioRef.current?.duration !== Infinity ? audioRef.current?.duration : 0) || 0;

  return (
    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl min-w-[200px] sm:min-w-[250px]">
      <button 
        onClick={togglePlay} 
        className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 transition-colors shrink-0"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
      </button>
      <div className="flex-1 flex flex-col">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress || 0} 
          onChange={handleSeek}
          className="w-full accent-purple-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-[10px] text-white/50 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(displayDuration)}</span>
        </div>
      </div>
    </div>
  );
}

export function VoiceRecorder({ 
  onSend, 
  onCancel,
  disabled 
}: { 
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) { // 5 minutes max
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone permission required for voice messages.");
      onCancel();
    }
  };

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, recordingTime);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
        <button onClick={onCancel} className="p-2 text-red-400 hover:bg-white/10 rounded-full transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="flex-1 flex justify-center">
          <VoicePlayer url={URL.createObjectURL(audioBlob)} duration={recordingTime} />
        </div>
        <button onClick={handleSend} disabled={disabled} className="w-10 h-10 shrink-0 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 flex-1 bg-white/5 border border-red-500/30 rounded-xl px-4 py-2 min-h-[48px]">
      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
      <span className="text-red-400 font-mono flex-1">{formatTime(recordingTime)}</span>
      
      <button onClick={onCancel} className="p-2 text-[#B8C0D0] hover:text-white hover:bg-white/10 rounded-full transition-colors text-sm">
        Cancel
      </button>
      <button onClick={stopRecording} className="w-10 h-10 shrink-0 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl flex items-center justify-center transition-colors">
        <Square className="w-5 h-5" fill="currentColor" />
      </button>
    </div>
  );
}
