import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScannerNavbar from '../components/scanner/ScannerNavbar';
import UploadPalette from '../components/scanner/UploadPalette';
import ImagePreview from '../components/scanner/ImagePreview';
import LoadingAnimation from '../components/scanner/LoadingAnimation';
import ResultsDashboard from '../components/scanner/ResultsDashboard';
import RecyclingMascot from '../components/scanner/RecyclingMascot';
import { useImageUpload } from '../hooks/useImageUpload';
import { useClassify } from '../hooks/useClassify';
import { checkHealth } from '../services/api';
import type { HealthResponse } from '../types';

type PageState = 'idle' | 'preview' | 'uploading' | 'uploaded' | 'analysing' | 'results' | 'error';

export default function ScannerPage() {
  const [pageState, setPageState] = useState<PageState>('idle');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const { file, previewUrl, fileId, uploading, uploadError, setFile, upload, reset } = useImageUpload();
  const { result, error: classifyError, classify, reset: resetClassify } = useClassify();

  useEffect(() => {
    checkHealth().then(setHealth).catch(() => {});
  }, []);

  const handleImageSelected = (f: File) => {
    setFile(f);
    setPageState('preview');
  };

  const handleUpload = async () => {
    setPageState('uploading');
    const ok = await upload();
    if (ok) setPageState('uploaded');
    else setPageState('preview');
  };

  const handleAnalyse = async () => {
    if (!fileId) return;
    setPageState('analysing');
    await classify(fileId);
  };

  useEffect(() => {
    if (result) {
      setPageState('results');
    } else if (classifyError) {
      setPageState('error');
    }
  }, [result, classifyError]);

  const handleReset = () => {
    reset();
    resetClassify();
    setPageState('idle');
  };

  const isLoading = pageState === 'uploading' || pageState === 'analysing';
  const showPreview = pageState === 'preview' || pageState === 'uploaded';

  return (
    <div className="min-h-screen bg-black" style={{ background: 'radial-gradient(ellipse at top, #0a1a0a 0%, #000 60%)' }}>
      <ScannerNavbar />

      {/* Background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: Math.random() * 300 + 100, height: Math.random() * 300 + 100, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: 'radial-gradient(circle, rgba(34,197,94,0.03) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}
      </div>

      <div className="relative z-10 px-4 md:px-8 pb-16" style={{ paddingTop: '96px' }}>
        {/* Page header */}
        {!isLoading && pageState !== 'results' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-14"
          >
            <h1 className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-white mb-4" style={{ lineHeight: 0.95, letterSpacing: '-2px' }}>AI-Powered Waste Identification</h1>
            <p className="font-body text-sm md:text-base text-white/50 max-w-xl mx-auto leading-relaxed">Upload or capture an image. Let AI understand your waste and discover the right way to dispose of it.</p>

            {/* Health indicator */}
            {health && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className={`h-2 w-2 rounded-full ${health.rpi_connected ? 'bg-green-400' : 'bg-orange-400'}`} />
                <span className="font-body text-xs text-white/40">
                  {health.rpi_connected ? `Raspberry Pi connected · ${health.rpi_ip || 'Online'}` : 'Development mode · Raspberry Pi not connected'}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Results header */}
        {pageState === 'results' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
            <h1 className="font-heading italic text-3xl md:text-4xl text-white mb-2">Analysis Complete</h1>
            <p className="font-body text-sm text-white/50">Here are your waste classification results</p>
          </motion.div>
        )}

        {/* Main content */}
        <AnimatePresence mode="wait">
          {pageState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Mascot character above the upload palette */}
              <motion.div
                className="flex flex-col items-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <RecyclingMascot size={130} />
                <motion.p
                  className="font-body text-xs text-green-400/70 mt-2 tracking-wide"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Ready to sort your waste!
                </motion.p>
              </motion.div>
              <UploadPalette onImageSelected={handleImageSelected} />
            </motion.div>
          )}

          {showPreview && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ImagePreview
                file={file}
                previewUrl={previewUrl}
                fileId={fileId}
                uploading={uploading}
                uploadError={uploadError}
                onReset={handleReset}
                onUpload={handleUpload}
                onAnalyse={handleAnalyse}
              />
            </motion.div>
          )}

          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingAnimation />
            </motion.div>
          )}

          {pageState === 'results' && result && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultsDashboard result={result} previewUrl={previewUrl} onReset={handleReset} />
            </motion.div>
          )}

          {pageState === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <div className="text-5xl mb-4">❌</div>
              <h3 className="font-heading italic text-2xl text-white mb-3">Analysis Failed</h3>
              <p className="font-body text-sm text-white/60 mb-6">{classifyError || 'An unexpected error occurred during classification.'}</p>
              <button onClick={handleReset} className="rounded-full px-6 py-3 font-body font-medium text-sm text-black cursor-pointer hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
