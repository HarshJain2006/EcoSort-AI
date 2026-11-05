import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadIcon, CameraIcon } from '../ui/Icons';
import CameraCapture from './CameraCapture';

interface UploadPaletteProps {
  onImageSelected: (file: File) => void;
}

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function UploadPalette({ onImageSelected }: UploadPaletteProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!VALID_TYPES.includes(file.type)) {
      setDragError('Please use JPG, PNG or WEBP images.');
      setTimeout(() => setDragError(null), 3000);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setDragError('Image must be under 20 MB.');
      setTimeout(() => setDragError(null), 3000);
      return;
    }
    onImageSelected(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={(file) => { setShowCamera(false); onImageSelected(file); }}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Main drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-3xl transition-all duration-300 cursor-pointer
          ${
            isDragOver
              ? 'border-2 border-green-400 bg-green-500/5 shadow-[0_0_60px_rgba(34,197,94,0.15)]'
              : 'border-2 border-dashed border-white/20 hover:border-white/40'
          }
        `}
        style={{ background: isDragOver ? 'rgba(34,197,94,0.03)' : 'rgba(255,255,255,0.01)', backdropFilter: 'blur(20px)' }}
        onClick={() => !isDragOver && fileInputRef.current?.click()}
      >
        <div className="px-8 py-16 md:py-20 flex flex-col items-center text-center">
          {/* Upload icon */}
          <motion.div
            animate={{ y: isDragOver ? -8 : [0, -6, 0] }}
            transition={{ repeat: isDragOver ? 0 : Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="mb-6"
          >
            <div className="liquid-glass h-20 w-20 rounded-2xl flex items-center justify-center">
              <UploadIcon size={36} className={isDragOver ? 'text-green-400' : 'text-green-500'} />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isDragOver ? (
              <motion.div key="drag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="text-2xl font-heading italic text-green-400 mb-2">Drop it here!</h3>
                <p className="text-sm font-body text-green-400/70">Release to select this image</p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <h3 className="text-2xl font-heading italic text-white mb-2">Drop your waste image here</h3>
                <p className="text-sm font-body text-white/50 mb-1">JPG · PNG · WEBP · Max 20MB</p>
                <p className="text-sm font-body text-white/40 mb-8">Or choose one of the options below</p>

                {dragError && (
                  <p className="text-sm font-body text-red-400 mb-4">{dragError}</p>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 font-body font-medium text-sm text-white hover:bg-white/10 transition-all"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    Browse Image
                  </button>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="rounded-full px-6 py-3 flex items-center gap-2 font-body font-medium text-sm text-white transition-all hover:brightness-110"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
                  >
                    <CameraIcon size={18} className="text-green-400" />
                    Capture Image
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-center text-xs font-body text-white/30 mt-4">
        Your image is processed locally on Raspberry Pi. It is not sent to any cloud service.
      </p>
    </motion.div>
  );
}
