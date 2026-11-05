
export type ClassificationLabel =
  | 'Biodegradable'
  | 'Biodegradable + Recyclable'
  | 'Non-biodegradable + Non-recyclable'
  | 'Non-biodegradable + Recyclable'
  | 'Conditional'
  | 'No Waste Detected'
  | 'Unable to Classify';

export type Biodegradability =
  | 'biodegradable'
  | 'non-biodegradable'
  | 'conditional';

export type Recyclability =
  | 'yes'
  | 'no'
  | 'conditional';

export interface PredictionResult {
  status: 'success' | 'uncertain' | 'error' | 'no_waste';
  detection_status?: 'detected' | 'uncertain';
  detected_material: string;
  predicted_material?: string;
  classification: ClassificationLabel;

  biodegradable: Biodegradability;
  recyclable: Recyclability;

  biodegradability?: Biodegradability;
  recyclability?: Recyclability;

  confidence: number;
  model_score?: number;
  inference_time_ms: number;

  device: string;
  model: string;
  reason: string;
  recommendations: string[];
  environmental_impact: string[];

  all_scores?: Record<string, number>;

  composting_guide?: string[];
  recycling_guide?: string[];
  disposal_guide?: string[];

  dev_mode: boolean;
  error?: string;
  timestamp?: number;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  size: number;
  error?: string;
}

export interface HealthResponse {
  status: string;
  rpi_connected: boolean;
  dev_mode: boolean;
  rpi_ip?: string;
  rpi_port?: number;
}

export type AppState =
  | 'idle'
  | 'uploading'
  | 'uploaded'
  | 'analysing'
  | 'results'
  | 'error';
