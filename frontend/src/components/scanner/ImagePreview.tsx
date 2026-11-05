import { motion } from 'framer-motion';
import { XIcon, UploadIcon, SpinnerIcon } from '../ui/Icons';

interface ImagePreviewProps {
  file: File | null;
  previewUrl: string | null;
  fileId: string | null;
  uploading: boolean;
  uploadError: string | null;
  onReset: () => void;
  onUpload: () => void;
  onAnalyse: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImagePreview({ file, previewUrl, fileId, uploading, uploadError, onReset, onUpload, onAnalyse }: ImagePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="liquid-glass rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="font-body text-sm text-white/80">Image Selected</span>
          </div>
          <button onClick={onReset} className="liquid-glass rounded-full p-2 hover:bg-white/10 transition-colors flex items-center gap-1.5 px-3">
            <XIcon size={14} className="text-white/50" />
            <span className="font-body text-xs text-white/50">Change</span>
          </button>
        </div>

        {/* Image preview */}
        {previewUrl && (
          <div className="relative bg-black/50" style={{ maxHeight: '420px', overflow: 'hidden' }}>
            <img
              src={previewUrl}
              alt="Selected waste"
              className="w-full object-contain"
              style={{ maxHeight: '420px' }}
            />
          </div>
        )}

        {/* File info */}
        {file && (
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
            <span className="font-body text-xs text-white/50 truncate max-w-[200px]">{file.name}</span>
            <span className="font-body text-xs text-white/30">{formatSize(file.size)}</span>
          </div>
        )}

        {/* Error */}
        {uploadError && (
          <div className="mx-6 mb-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="font-body text-sm text-red-400">{uploadError}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onUpload}
            disabled={uploading || !!fileId}
            className="flex-1 liquid-glass-strong rounded-2xl py-3.5 font-body font-medium text-sm text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? (
              <><SpinnerIcon size={16} className="animate-spin text-white/70" /> Uploading...</>
            ) : fileId ? (
              <><span className="text-green-400">✓</span> Uploaded</>
            ) : (
              <><UploadIcon size={16} /> Upload Image</>
            )}
          </button>
          <button
            onClick={onAnalyse}
            disabled={!fileId || uploading}
            className="flex-1 rounded-2xl py-3.5 font-body font-medium text-sm text-black flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: fileId ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(34,197,94,0.3)', boxShadow: fileId ? '0 0 30px rgba(34,197,94,0.3)' : 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Analyse Waste
          </button>
        </div>
      </div>
    </motion.div>
  );
}
