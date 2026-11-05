import type { UploadResponse, PredictionResult, HealthResponse } from '../types';

const BASE = '';

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export async function analyseWaste(fileId: string): Promise<PredictionResult> {
  const res = await fetch(`${BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Analysis failed: ${res.status}`);
  }
  return res.json();
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/api/health`);
  if (!res.ok) throw new Error('Backend unreachable');
  return res.json();
}

export async function getResults(): Promise<{ results: PredictionResult[] }> {
  const res = await fetch(`${BASE}/api/results`);
  if (!res.ok) throw new Error('Failed to fetch results');
  return res.json();
}
