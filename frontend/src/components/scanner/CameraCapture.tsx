import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCamera } from '../../hooks/useCamera';
import { CameraIcon, XIcon, CheckIcon } from '../ui/Icons';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const { videoRef, isStreaming, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const file = capturePhoto();
    if (file) {
      setCapturedFile(file);
      setCapturedUrl(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const handleRetake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedFile(null);
    setCapturedUrl(null);
    startCamera();
  };

  const handleUse = () => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="liquid-glass rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CameraIcon size={18} className="text-green-400" />
            <span className="font-body font-medium text-white text-sm">
              {capturedUrl ? 'Photo Preview' : 'Live Camera'}
            </span>
          </div>
          <button onClick={onCancel} className="liquid-glass rounded-full p-2 hover:bg-white/10 transition-colors">
            <XIcon size={16} className="text-white/70" />
          </button>
        </div>

        {/* Camera/Preview area */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <CameraIcon size={48} className="text-white/20" />
              <div className="text-center px-6">
                <p className="font-body text-white/70 text-sm mb-1">Camera access denied</p>
                <p className="font-body text-white/40 text-xs">{error}</p>
              </div>
              <button
                onClick={onCancel}
                className="liquid-glass-strong rounded-full px-4 py-2 font-body text-sm text-white hover:bg-white/10"
              >
                Use Browse Instead
              </button>
            </div>
          ) : capturedUrl ? (
            <img src={capturedUrl} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin text-green-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                </div>
              )}
              {/* Viewfinder overlay */}
              {isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-green-400/50 rounded-2xl" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)' }} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-6 py-5">
          {capturedUrl ? (
            <>
              <button
                onClick={handleRetake}
                className="liquid-glass rounded-full px-5 py-2.5 font-body text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                ↩ Retake
              </button>
              <button
                onClick={handleUse}
                className="rounded-full px-6 py-2.5 font-body font-medium text-sm text-black flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                <CheckIcon size={16} className="text-black" />
                Use This Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="liquid-glass rounded-full px-5 py-2.5 font-body text-sm text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                disabled={!isStreaming}
                className="h-14 w-14 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: isStreaming ? '0 0 20px rgba(34,197,94,0.4)' : 'none' }}
              >
                <CameraIcon size={22} className="text-black" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
