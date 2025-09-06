import React, { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onStateChange: (state: 'idle' | 'recording') => void;
  onRecordingComplete: (blob: Blob | null) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onStateChange, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Manages the recording timer.
    if (!isRecording) {
      return;
    }

    // Reset timer and start interval when recording begins.
    setTimer(0);
    const intervalId = window.setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    // Cleanup function: clear interval when isRecording becomes false or on unmount.
    return () => {
      clearInterval(intervalId);
    };
  }, [isRecording]);

  useEffect(() => {
    // Manages the media stream lifecycle for cleanup.
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      onStateChange('recording');
      audioChunksRef.current = [];
      
      const recorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        onRecordingComplete(audioBlob);
        setStream(null); // Triggers the stream cleanup useEffect
      };
      
      recorder.start();
      setIsRecording(true); // Triggers the timer useEffect
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access was denied. Please allow microphone access in your browser settings to use this feature.");
      onRecordingComplete(null);
      onStateChange('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false); // Triggers the timer useEffect cleanup
    onStateChange('idle');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
        <div className="mb-6 p-4 text-center bg-indigo-50 border-l-4 border-indigo-500 text-indigo-800 rounded-r-lg dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-200">
            <h3 className="font-semibold">Instructions</h3>
            <p>For the best analysis, please speak clearly for at least 20-30 seconds. You can describe your day, read a paragraph, or talk about how you are feeling.</p>
        </div>
      <div className={`relative w-32 h-32 flex items-center justify-center rounded-full transition-all duration-300 ${isRecording ? 'bg-red-100 dark:bg-red-500/20' : 'bg-indigo-100 dark:bg-indigo-500/20'}`}>
        {isRecording && <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping"></div>}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-105 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 7h10v10H7z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 14c1.654 0 3-1.346 3-3V5c0-1.654-1.346-3-3-3S9 3.346 9 5v6c0 1.654 1.346 3 3 3z"></path>
              <path d="M17 11h-1c0 2.757-2.243 5-5 5s-5-2.243-5-5H5c0 3.52 2.613 6.432 6 6.92V21h2v-3.08c3.387-.488 6-3.4 6-6.92z"></path>
            </svg>
          )}
        </button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-xl font-mono tracking-wider text-gray-700 dark:text-gray-300" aria-live="polite">
          {formatTime(timer)}
        </p>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isRecording ? 'Recording...' : 'Press the button to start'}
        </p>
      </div>
    </div>
  );
};

export default VoiceRecorder;