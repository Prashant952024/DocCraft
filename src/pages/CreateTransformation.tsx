import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  SourceType,
  ArtifactType,
  TransformationSettings,
} from '@/types/transformation';
import { GenerationStage } from '@/types/ai';
import { SourceInputSection } from '@/components/transformation/SourceInputSection';
import { SettingsSection } from '@/components/transformation/SettingsSection';
import { OutputTypeSelector } from '@/components/transformation/OutputTypeSelector';
import { GenerationProgressModal } from '@/components/transformation/GenerationProgressModal';
import { Button } from '@/components/ui/Button';
import {
  createTransformation,
  updateTransformationStatus,
  saveSourceDocument,
  saveArtifacts,
} from '@/services/transformations';
import { uploadSourceFile } from '@/services/storage';
import { generateContentWithAI } from '@/services/ai';
import { preprocessFile, preprocessRawText, PreprocessingResult } from '@/services/preprocessor';
import { calculateSHA256 } from '@/lib/utils';
import { Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

export function CreateTransformation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Source state
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('text');
  const [sourceText, setSourceText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);

  // Preprocessing state
  const [preprocessingResult, setPreprocessingResult] = useState<PreprocessingResult | null>(null);
  const [isPreprocessing, setIsPreprocessing] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<TransformationSettings>({
    audience: 'Executive',
    tone: 'Professional',
    language: 'English',
    detailLevel: 'Standard',
    objective: 'Inform',
    outputTypes: ['executive_summary', 'advisory', 'linkedin_post', 'x_post', 'infographic'],
  });

  // Pipeline execution state
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);

    // Validations
    if (!user) {
      setError('You must be authenticated to start a transformation.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for this transformation.');
      return;
    }

    if (!sourceText.trim() && !selectedFile && !sourceUrl.trim()) {
      setError('Please enter source text, select a file, or enter a URL.');
      return;
    }

    if (settings.outputTypes.length === 0) {
      setError('Please select at least one output artefact format.');
      return;
    }

    setIsGenerating(true);

    let transformationId: string | null = null;

    try {
      // Stage 1: Secure Ingestion & SHA-256 Hashing of Original Source
      setStage('secure_ingestion');

      let storagePath: string | undefined;
      let finalHash: string | undefined = fileHash || undefined;

      // Create database transformation record
      const transformation = await createTransformation(
        user.id,
        title.trim(),
        sourceType,
        settings
      );
      transformationId = transformation.id;

      if (selectedFile) {
        if (!finalHash) {
          finalHash = await calculateSHA256(selectedFile);
          setFileHash(finalHash);
        }
        // Upload ORIGINAL raw file to Supabase Storage (Preserving Provenance & Fallback)
        const uploadResult = await uploadSourceFile(
          user.id,
          transformation.id,
          selectedFile
        );
        storagePath = uploadResult.storagePath;
      } else if (sourceText) {
        finalHash = await calculateSHA256(sourceText);
        setFileHash(finalHash);
      }

      // Stage 2: Deterministic Preprocessing (Extraction & Verification)
      setStage('source_preprocessing');

      let activePrepResult = preprocessingResult;
      if (!activePrepResult) {
        if (selectedFile) {
          activePrepResult = await preprocessFile(selectedFile);
        } else if (sourceText.trim()) {
          activePrepResult = preprocessRawText(sourceText);
        }
      }

      // Stage 3: Content Extraction & Normalization
      setStage('content_extraction');

      // Save Source Document Record with Original SHA-256 and Preprocessing Metadata
      await saveSourceDocument(transformation.id, user.id, {
        fileName: selectedFile?.name,
        mimeType: selectedFile?.type,
        fileSize: selectedFile?.size,
        storagePath,
        sourceText: (activePrepResult?.normalizedText || sourceText).trim() || undefined,
        sourceHash: finalHash,
        sourceUrl: sourceUrl.trim() || undefined,
        preprocessingMetadata: activePrepResult?.metadata,
      });

      // Stage 4: Context Preparation
      setStage('context_preparation');

      // Determine Payload routing:
      // If client preprocessing succeeded without fallback requirement, send preprocessed AI context (NO raw PDF/DOCX binary)
      const isPreprocessed = activePrepResult ? !activePrepResult.fallbackRequired : false;
      const useMultimodalFallback = activePrepResult ? activePrepResult.fallbackRequired : false;

      const aiSourceContext =
        activePrepResult && isPreprocessed
          ? activePrepResult.aiContext || activePrepResult.normalizedText
          : sourceText.trim() || (selectedFile ? `[Attached Source File: ${selectedFile.name}]` : undefined);

      // Stage 5: AI Transformation via Supabase Edge Function & Gemini Flash
      setStage('ai_generation');
      const aiResponse = await generateContentWithAI({
        sourceText: aiSourceContext,
        storagePath,
        fileMimeType: selectedFile?.type,
        outputTypes: settings.outputTypes,
        audience: settings.audience,
        tone: settings.tone,
        language: settings.language,
        detailLevel: settings.detailLevel,
        objective: settings.objective,
        sourceType,
        isPreprocessed,
        useMultimodalFallback,
        preprocessingMetadata: activePrepResult?.metadata,
      });

      // Stage 6: Output Validation & Schema Verification
      setStage('output_validation');
      if (!aiResponse || !aiResponse.artifacts || aiResponse.artifacts.length === 0) {
        throw new Error('Validation failed: No valid artifacts returned by AI model.');
      }

      // Stage 7: Artifact Storage & Provenance Locking
      setStage('artifact_storage');
      await saveArtifacts(
        transformation.id,
        user.id,
        aiResponse.artifacts,
        aiResponse.analysis
      );

      await updateTransformationStatus(transformation.id, 'completed');
      setStage('completed');

      // Navigate to transformation details workspace
      setTimeout(() => {
        navigate(`/transformation/${transformation.id}`);
      }, 500);
    } catch (err: any) {
      console.error('Transformation pipeline error:', err);
      const errMsg = err.message || 'An error occurred during content transformation.';
      setError(errMsg);
      setStage('error');
      if (transformationId) {
        await updateTransformationStatus(transformationId, 'failed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-cyan-400" />
          Create Multimodal Transformation
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Ingest raw multimodal content with intelligent client-side preprocessing and orchestrate high-fidelity deliverables with Gemini.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Pipeline Execution Alert</span>
            {error}
          </div>
        </div>
      )}

      {/* Section 1: Source Material */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 md:p-8 backdrop-blur-md shadow-xl shadow-black/20">
        <SourceInputSection
          sourceType={sourceType}
          setSourceType={setSourceType}
          sourceText={sourceText}
          setSourceText={setSourceText}
          sourceUrl={sourceUrl}
          setSourceUrl={setSourceUrl}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          fileHash={fileHash}
          setFileHash={setFileHash}
          title={title}
          setTitle={setTitle}
          preprocessingResult={preprocessingResult}
          setPreprocessingResult={setPreprocessingResult}
          isPreprocessing={isPreprocessing}
          setIsPreprocessing={setIsPreprocessing}
        />
      </div>

      {/* Section 2: Generation Settings */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 md:p-8 backdrop-blur-md shadow-xl shadow-black/20">
        <SettingsSection settings={settings} setSettings={setSettings} />
      </div>

      {/* Section 3: Target Artefact Output Selection */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 md:p-8 backdrop-blur-md shadow-xl shadow-black/20">
        <OutputTypeSelector
          selectedOutputs={settings.outputTypes}
          setSelectedOutputs={(updater) => {
            if (typeof updater === 'function') {
              setSettings((prev) => ({
                ...prev,
                outputTypes: updater(prev.outputTypes),
              }));
            } else {
              setSettings((prev) => ({
                ...prev,
                outputTypes: updater,
              }));
            }
          }}
        />
      </div>

      {/* Section 4: Primary Generate Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>
            Deterministic preprocessing preserves original SHA-256 provenance while optimizing Gemini token quota.
          </span>
        </div>

        <Button
          type="button"
          variant="glow"
          size="lg"
          onClick={handleGenerate}
          loading={isGenerating || isPreprocessing}
          className="w-full sm:w-auto px-8"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Execute Multimodal Transformation
        </Button>
      </div>

      {/* Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={isGenerating || stage === 'completed'}
        stage={stage}
        error={error}
        outputCount={settings.outputTypes.length}
      />
    </div>
  );
}
