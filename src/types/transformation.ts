export type SourceType = 'text' | 'file' | 'url' | 'pdf' | 'docx' | 'image' | 'audio' | 'video';

export type TransformationStatus = 'draft' | 'processing' | 'completed' | 'failed';

export type ArtifactStatus = 'pending_review' | 'approved' | 'rejected';

export type ArtifactType =
  | 'executive_summary'
  | 'advisory'
  | 'linkedin_post'
  | 'x_post'
  | 'infographic'
  | 'presentation'
  | 'video';

export type TargetAudience =
  | 'General Public'
  | 'Executive'
  | 'Technical Team'
  | 'Government Official'
  | 'Internal Team'
  | 'Social Media Audience';

export type ToneType =
  | 'Professional'
  | 'Formal'
  | 'Informative'
  | 'Concise'
  | 'Persuasive'
  | 'Technical';

export type LanguageType =
  | 'English'
  | 'Hindi';

export type DetailLevel =
  | 'Brief'
  | 'Standard'
  | 'Detailed';

export type CommunicationObjective =
  | 'Inform'
  | 'Summarize'
  | 'Alert'
  | 'Explain'
  | 'Educate'
  | 'Brief';

export interface TransformationSettings {
  audience: TargetAudience;
  tone: ToneType;
  language: LanguageType;
  detailLevel: DetailLevel;
  objective: CommunicationObjective;
  outputTypes: ArtifactType[];
}

export interface Transformation {
  id: string;
  user_id: string;
  title: string;
  source_type: SourceType;
  status: TransformationStatus;
  settings: TransformationSettings;
  created_at: string;
  updated_at: string;
}

export interface SourceDocument {
  id: string;
  transformation_id: string;
  user_id: string;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  storage_path?: string | null;
  source_text?: string | null;
  source_hash?: string | null;
  source_url?: string | null;
  created_at: string;
}

export interface Artifact {
  id: string;
  transformation_id: string;
  user_id: string;
  artifact_type: ArtifactType;
  content: string;
  status: ArtifactStatus;
  metadata: {
    title?: string;
    structured_data?: any;
    analysis?: CanonicalContent;
    model_used?: string;
    review_notes?: string;
    reviewed_at?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface CanonicalContent {
  summary: string;
  content_type: string;
  primary_topic?: string;
  topics: string[];
  entities: string[];
  key_facts: string[];
  dates?: string[];
  locations?: string[];
  detected_language: string;
  audience?: string;
  objective?: string;
  source_hash?: string;
  validation_status: 'VALIDATED' | 'NEEDS REVIEW';
}
