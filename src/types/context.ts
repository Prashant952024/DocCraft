import {
  CanonicalFact,
  CanonicalEntity,
  CanonicalFigure,
  CanonicalDate,
  CanonicalLocation,
  CanonicalEvent,
  CanonicalAction,
  CanonicalTable,
  CanonicalQuote,
  SourceReference,
  CanonicalSection,
} from './canonical';
import { ArtifactType } from './transformation';

export interface ContextRequirements {
  audience?: string;
  tone?: string;
  language?: string;
  detailLevel?: 'brief' | 'standard' | 'detailed';
  maxTokens?: number;
}

export interface SelectedAIContext {
  outputType: ArtifactType;
  sourceSummary: string;

  facts: CanonicalFact[];
  entities: CanonicalEntity[];
  figures: CanonicalFigure[];
  dates: CanonicalDate[];
  locations: CanonicalLocation[];
  events: CanonicalEvent[];
  actions: CanonicalAction[];
  tables: CanonicalTable[];
  quotes: CanonicalQuote[];
  sourceReferences: SourceReference[];
  sections: CanonicalSection[];

  selectedFields: string[];
  excludedFields: string[];

  estimatedTokens: number;
  originalEstimatedTokens: number;

  reductionRatio: number;

  selectionReason: string[];
}

export interface ContextSelectionMetadata {
  method: 'deterministic_output_aware_selection';
  originalTokens: number;
  selectedTokens: number;
  reductionRatio: number;
  outputProfiles: Record<string, {
    selectedFields: string[];
    excludedFields: string[];
    estimatedTokens: number;
    reductionRatio: number;
    factCount: number;
    figureCount: number;
    actionCount: number;
    tableCount: number;
    quoteCount: number;
  }>;
  selectedAt: string;
}
