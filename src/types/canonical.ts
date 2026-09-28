export type FactImportance = 'high' | 'medium' | 'low';
export type EntityType =
  | 'person'
  | 'organization'
  | 'product'
  | 'technology'
  | 'location'
  | 'event'
  | 'other';
export type LocationType =
  | 'country'
  | 'state'
  | 'city'
  | 'region'
  | 'facility'
  | 'address'
  | 'other';
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type SourceReferenceType = 'page' | 'section' | 'paragraph' | 'table' | 'url';
export type ExtractionMethod = 'deterministic' | 'gemini' | 'hybrid' | 'multimodal';

export interface CanonicalFact {
  id: string;
  statement: string;
  importance: FactImportance;
  sourceLocation?: string;
}

export interface CanonicalEntity {
  id: string;
  name: string;
  type: EntityType;
  description?: string;
  sourceLocation?: string;
}

export interface CanonicalFigure {
  id: string;
  value: string;
  label?: string;
  unit?: string;
  context?: string;
  sourceLocation?: string;
}

export interface CanonicalDate {
  id: string;
  value: string;
  normalized?: string;
  description?: string;
  sourceLocation?: string;
}

export interface CanonicalLocation {
  id: string;
  name: string;
  type?: LocationType;
  context?: string;
  sourceLocation?: string;
}

export interface CanonicalEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  entities?: string[];
  importance: FactImportance;
  sourceLocation?: string;
}

export interface CanonicalAction {
  id: string;
  action: string;
  priority: ActionPriority;
  owner?: string;
  deadline?: string;
  rationale?: string;
  sourceLocation?: string;
}

export interface CanonicalTable {
  id: string;
  title?: string;
  headers: string[];
  rows: string[][];
  sourceLocation?: string;
}

export interface CanonicalQuote {
  id: string;
  text: string;
  speaker?: string;
  role?: string;
  sourceLocation?: string;
}

export interface SourceReference {
  id: string;
  type: SourceReferenceType;
  location: string;
  description?: string;
}

export interface CanonicalSection {
  id: string;
  title: string;
  level: number;
  summary?: string;
  keyFacts?: string[];
  sourceLocation?: string;
}

export interface CanonicalExtractionMetadata {
  extractionMethod: ExtractionMethod;
  sourceCharacterCount: number;
  canonicalCharacterCount: number;
  estimatedInputTokens: number;
  extractedAt: string;
  confidence?: number;
  warnings: string[];
  sourceType: string;
}

export interface CanonicalContent {
  summary: string;
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
  topics: string[];
  contentType: string;
  language: string;
  extractionMetadata: CanonicalExtractionMetadata;
  // Compatibility / legacy helpers
  content_type?: string;
  primary_topic?: string;
  key_facts?: string[];
  detected_language?: string;
  audience?: string;
  objective?: string;
  source_hash?: string;
  validation_status?: 'VALIDATED' | 'NEEDS REVIEW';
}
