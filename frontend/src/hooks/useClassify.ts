import { useState, useCallback } from 'react';
import { analyseWaste } from '../services/api';
import type { PredictionResult, AppState } from '../types';

interface UseClassifyReturn {
  appState: AppState;
  result: PredictionResult | null;
  error: string | null;
  classify: (fileId: string) => Promise<void>;
  reset: () => void;
}

export function useClassify(): UseClassifyReturn {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classify = useCallback(async (fileId: string) => {
    setAppState('analysing');
    setError(null);
    setResult(null);
    try {
      const res = await analyseWaste(fileId);
      setResult(res);
      setAppState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setAppState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setAppState('idle');
    setResult(null);
    setError(null);
  }, []);

  return { appState, result, error, classify, reset };
}
