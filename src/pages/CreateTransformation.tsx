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
import { calculateSHA256 } from '@/lib/utils';
import { Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

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

  // Settings state
  const [settings, setSettings] = useState<TransformationSettings>({
    audience: 'Executive',
    tone: 'Professional',
    language: 'English',
    detailLevel: 'Standard',
    objective: 'Inform',
    outputTypes: ['executive_summary', 'advisory', 'linkedin_post'],
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
    setStage('preparing_source');

    let transformationId: string | null = null;

    try {
      // Step 1: Create Transformation DB Record
      const transformation = await createTransformation(
        user.id,
        title.trim(),
        sourceType,
        settings
      );
      transformationId = transformation.id;

      // Step 2: Source Processing & File Upload / Hash
      let storagePath: string | undefined;
      let finalHash: string | undefined = fileHash || undefined;

      if (selectedFile) {
        if (!finalHash) {
          finalHash = await calculateSHA256(selectedFile);
        }
        const uploadResult = await uploadSourceFile(
          user.id,
          transformation.id,
          selectedFile
        );
        storagePath = uploadResult.storagePath;
      } else if (sourceText) {
        finalHash = await calculateSHA256(sourceText);
      }

      // Save Source Document metadata
      await saveSourceDocument(transformation.id, user.id, {
        fileName: selectedFile?.name,
        mimeType: selectedFile?.type,
        fileSize: selectedFile?.size,
        storagePath,
        sourceText: sourceText.trim() || undefined,
        sourceHash: finalHash,
        sourceUrl: sourceUrl.trim() || undefined,
      });

      // Step 3: Trigger AI Generation via Supabase Edge Function
      setStage('analyzing_content');

      // Small delay for smooth stage perception
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStage('orchestrating_outputs');

      const aiResponse = await generateContentWithAI({
        sourceText: sourceText.trim() || `[Attached File: ${selectedFile?.name}]`,
        outputTypes: settings.outputTypes,
        audience: settings.audience,
        tone: settings.tone,
        language: settings.language,
        detailLevel: settings.detailLevel,
        objective: settings.objective,
        sourceType,
      });

      // Step 4: Persist Generated Artifacts to DB
      setStage('persisting_results');
      await saveArtifacts(
        transformation.id,
        user.id,
        aiResponse.artifacts,
        aiResponse.analysis as unknown as Record<string, unknown>
      );

      // Step 5: Mark transformation as completed
      await updateTransformationStatus(transformation.id, 'completed');
      setStage('completed');

      // Navigate to results
      setTimeout(() => {
        navigate(`/transformation/${transformation.id}`);
      }, 500);
    } catch (err: any) {
      console.error('Transformation failed:', err);
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
          Ingest raw content through text, files, or URLs and orchestrate communication artefacts with AI.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Transformation Pipeline Error</span>
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
          <ShieldAlert className="h-5 w-5 text-cyan-400 shrink-0" />
          <span>
            Generative synthesis runs strictly in protected Supabase Edge Functions. Gemini API keys remain fully isolated.
          </span>
        </div>

        <Button
          type="button"
          variant="glow"
          size="lg"
          onClick={handleGenerate}
          loading={isGenerating}
          className="w-full sm:w-auto px-8"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Content Artefacts
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
