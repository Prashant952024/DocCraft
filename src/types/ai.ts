import { ArtifactType, TargetAudience, ToneType, LanguageType, DetailLevel, CommunicationObjective } from './transformation';

export interface AIGenerationRequest {
  sourceText: string;
  outputTypes: ArtifactType[];
  audience?: TargetAudience;
  tone?: ToneType;
  language?: LanguageType;
  detailLevel?: DetailLevel;
  objective?: CommunicationObjective;
  sourceType?: string;
  metadata?: Record<string, unknown>;
}

export interface AIAnalysis {
  summary: string;
  keyFacts: string[];
  entities: string[];
  topics: string[];
}

export interface GeneratedArtifact {
  type: ArtifactType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface AIGenerationResponse {
  analysis: AIAnalysis;
  artifacts: GeneratedArtifact[];
}

export type GenerationStage =
  | 'idle'
  | 'preparing_source'
  | 'analyzing_content'
  | 'orchestrating_outputs'
  | 'generating_artefacts'
  | 'persisting_results'
  | 'completed'
  | 'error';
