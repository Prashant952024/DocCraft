import {
  ArtifactType,
  TargetAudience,
  ToneType,
  LanguageType,
  DetailLevel,
  CommunicationObjective,
  CanonicalContent,
  ArtifactStatus,
} from './transformation';

export interface AIGenerationRequest {
  sourceText?: string;
  storagePath?: string;
  fileMimeType?: string;
  sourceType?: string;
  outputTypes: ArtifactType[];
  audience?: TargetAudience;
  tone?: ToneType;
  language?: LanguageType;
  detailLevel?: DetailLevel;
  objective?: CommunicationObjective;
  metadata?: Record<string, unknown>;
}

export interface GeneratedArtifact {
  id?: string;
  type: ArtifactType;
  title: string;
  content: string;
  status?: ArtifactStatus;
  metadata?: Record<string, unknown>;
  structured_data?: any;
}

export interface AIGenerationResponse {
  analysis: CanonicalContent;
  artifacts: GeneratedArtifact[];
}

export type GenerationStage =
  | 'idle'
  | 'secure_ingestion'
  | 'source_analysis'
  | 'content_understanding'
  | 'context_preparation'
  | 'ai_generation'
  | 'output_validation'
  | 'artifact_storage'
  | 'completed'
  | 'error';
