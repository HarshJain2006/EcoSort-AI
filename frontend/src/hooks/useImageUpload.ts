import { useState, useCallback } from 'react';
import { uploadImage } from '../services/api';

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UseImageUploadReturn {
  file: File | null;
  previewUrl: string | null;
  fileId: string | null;
  uploading: boolean;
  uploadError: string | null;
  setFile: (f: File) => void;
  upload: () => Promise<boolean>;
  reset: () => void;
  validateFile: (f: File) => string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [file, setFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = (f: File): string | null => {
    if (!VALID_TYPES.includes(f.type)) return 'Only JPG, PNG and WEBP images are supported.';
    if (f.size > 20 * 1024 * 1024) return 'Image must be under 20 MB.';
    return null;
  };

  const setFile = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) { setUploadError(err); return; }
    setUploadError(null);
    setFileId(null);
    setFileState(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }, []);

  const upload = useCallback(async (): Promise<boolean> => {
    if (!file) return false;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadImage(file);
      setFileId(res.file_id);
      setUploading(false);
      return true;
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      return false;
    }
  }, [file]);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFileState(null);
    setPreviewUrl(null);
    setFileId(null);
    setUploading(false);
    setUploadError(null);
  }, [previewUrl]);

  return { file, previewUrl, fileId, uploading, uploadError, setFile, upload, reset, validateFile };
}
