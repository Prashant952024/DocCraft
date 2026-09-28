import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Globe,
  CheckCircle2,
  X,
  File,
  AlertCircle,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  FileCode,
  Check,
  AlertTriangle,
  Loader2,
  Eye,
} from 'lucide-react';
import { SourceType } from '@/types/transformation';
import { formatBytes, calculateSHA256 } from '@/lib/utils';
import {
  preprocessFile,
  preprocessRawText,
  PreprocessingResult,
} from '@/services/preprocessor';

interface SourceInputSectionProps {
  sourceType: SourceType;
  setSourceType: (type: SourceType) => void;
  sourceText: string;
  setSourceText: (text: string) => void;
  sourceUrl: string;
  setSourceUrl: (url: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  fileHash: string | null;
  setFileHash: (hash: string | null) => void;
  title: string;
  setTitle: (title: string) => void;
  preprocessingResult: PreprocessingResult | null;
  setPreprocessingResult: (result: PreprocessingResult | null) => void;
  isPreprocessing: boolean;
  setIsPreprocessing: (isPre: boolean) => void;
}

const SAMPLE_TEMPLATES = [
  {
    name: 'Cyber Incident Report',
    title: 'Critical Vulnerability Advisory: OpenSSL Memory Leak',
    content: `INCIDENT ADVISORY: CVE-2026-4412
Severity: Critical (CVSS 9.2)
Impacted Systems: Enterprise API Gateways & Edge Load Balancers running v3.1.2 - v3.4.0

Executive Overview:
A critical memory corruption vulnerability has been identified in the TLS session caching subsystem. An unauthenticated remote attacker can exploit this flaw by sending specially crafted handshake packets, causing denial-of-service and potential arbitrary memory disclosure up to 64KB per request.

Key Findings:
1. Active reconnaissance observed targeting cloud-hosted cluster ingress controllers starting 03:00 UTC on 28 September 2026.
2. No confirmed remote code execution in our deployment yet, but heap exfiltration has been demonstrated in laboratory replication.
3. Over 45 production instances require immediate patching and key rotation.

Remediation Actions Required:
- Upgrade edge balancer containers to v3.4.1 immediately.
- Revoke and regenerate active session ticket encryption keys (STEKs).
- Isolate perimeter endpoints behind Web Application Firewall (WAF) rule 941103.
- Conduct forensic log audit for anomalies in TLS handshake size exceeding 16KB.`,
  },
  {
    name: 'Tech Launch Memo',
    title: 'Product Brief: Autonomous Multimodal Transformation Engine v2',
    content: `Product Announcement: DocCraft v2.0 Platform Launch

We are pleased to introduce DocCraft v2.0, our next-generation automated content intelligence platform designed for regulated enterprises, defence agencies, and fast-moving technical organizations.

Core Capabilities:
- Instant transformation of complex raw inputs (incident reports, technical RFCs, meeting transcripts, policy documents) into executive briefings, advisory memos, and cross-channel communications.
- Zero-leakage architecture: All AI orchestration executes inside isolated Edge Functions with encrypted API secrets and strict Row-Level Security.
- SHA-256 cryptographic provenance: Every ingested source document receives an immutable integrity hash to verify factual fidelity and trace downstream artefacts.
- Multi-channel generation: Produces Executive Summaries, Compliance Advisories, LinkedIn technical insights, and Twitter/X executive updates simultaneously in seconds.

Rollout Schedule:
- Alpha Testing: Internal infrastructure team (Oct 2026)
- Enterprise General Availability: Q4 2026`,
  },
  {
    name: 'GovTech Directive',
    title: 'Emergency Directive: Critical Infrastructure Perimeter Hardening',
    content: `GOVERNMENT CYBERSECURITY DIRECTIVE: ED-2026-04
Issuing Agency: Federal Cyber Defense Administration
Target Audience: State, Local, Tribal, and Territorial (SLTT) Critical Infrastructure Operators
Priority: High Emergency Notice

Summary of Directive:
In response to widespread automated credential stuffing and edge appliance exploitation, all critical infrastructure entities operating public-facing supervisory control and data acquisition (SCADA) interfaces must enforce strict hardware-bound Multi-Factor Authentication (MFA) and terminate all legacy remote access protocols within 72 hours.

Key Mandatory Directives:
1. Disable unencrypted HTTP and Telnet management ports on all industrial edge routers.
2. Require FIDO2/WebAuthn compliant security keys for all administrative ingress points.
3. Establish out-of-band monitoring pipelines to stream syslog telemetry to the central intelligence hub.
4. Report all unauthorized authentication attempts exceeding 5 consecutive failures to the national incident coordinator.

Timeline:
- Initial compliance verification: 48 Hours
- Final remediation sign-off: 72 Hours`,
  },
];

export function SourceInputSection({
  sourceType,
  setSourceType,
  sourceText,
  setSourceText,
  sourceUrl,
  setSourceUrl,
  selectedFile,
  setSelectedFile,
  fileHash,
  setFileHash,
  title,
  setTitle,
  preprocessingResult,
  setPreprocessingResult,
  isPreprocessing,
  setIsPreprocessing,
}: SourceInputSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [calculatingHash, setCalculatingHash] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run preprocessing on file selection
  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileHash(null);
      setPreprocessingResult(null);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    // 1. Calculate SHA-256 hash on original raw file
    setCalculatingHash(true);
    try {
      const hash = await calculateSHA256(file);
      setFileHash(hash);
    } catch (e) {
      console.error('Error calculating hash:', e);
    } finally {
      setCalculatingHash(false);
    }

    // 2. Perform Intelligent Deterministic Preprocessing
    setIsPreprocessing(true);
    try {
      const prep = await preprocessFile(file);
      setPreprocessingResult(prep);

      // If text was successfully extracted, populate sourceText with clean normalized version
      if (prep.success && prep.normalizedText) {
        setSourceText(prep.normalizedText);
      } else if (prep.fallbackRequired) {
        if (!sourceText) {
          setSourceText(prep.rawExtractedText || `[Multimodal Source: ${file.name}]`);
        }
      }
    } catch (err) {
      console.error('Preprocessing error:', err);
    } finally {
      setIsPreprocessing(false);
    }
  };

  // Re-preprocess text when in text mode
  useEffect(() => {
    if (sourceType === 'text' && sourceText.trim().length > 10) {
      const result = preprocessRawText(sourceText);
      setPreprocessingResult(result);
    }
  }, [sourceType, sourceText, setPreprocessingResult]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (sample: typeof SAMPLE_TEMPLATES[0]) => {
    setTitle(sample.title);
    setSourceText(sample.content);
    setSourceType('text');
    setSelectedFile(null);
    setFileHash(null);
  };

  return (
    <div className="space-y-6">
      {/* Transformation Title Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Transformation Title <span className="text-cyan-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Critical Infrastructure Advisory — Q3 Update"
          className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
        />
      </div>

      {/* Input Modality Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Source Modality <span className="text-cyan-400">*</span>
          </label>

          {/* Sample loader */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Load Demo Sample:
            </span>
            {SAMPLE_TEMPLATES.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => loadSample(sample)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 text-cyan-400 hover:bg-slate-750 hover:text-cyan-300 border border-slate-700/60 transition-colors"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-4">
          <button
            type="button"
            onClick={() => {
              setSourceType('text');
              setSelectedFile(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              sourceType === 'text'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4 text-cyan-400" />
            <span>Text / Markdown</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceType('file')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              sourceType === 'file'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="h-4 w-4 text-blue-400" />
            <span>File Upload</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSourceType('url');
              setSelectedFile(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              sourceType === 'url'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4 text-emerald-400" />
            <span>Web URL</span>
          </button>
        </div>

        {/* 1. TEXT INPUT */}
        {sourceType === 'text' && (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                rows={9}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste your source content here (incident reports, raw data, meeting notes, articles, research memos)..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans leading-relaxed resize-y transition-all"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 px-1">
              <span>Supports structured plain text, markdown, and code blocks</span>
              <span>
                {sourceText.trim()
                  ? `${sourceText.trim().split(/\s+/).length} words • ${sourceText.length} characters`
                  : '0 words'}
              </span>
            </div>

            {/* Preprocessing Summary Card for Text */}
            {preprocessingResult && preprocessingResult.metadata.estimatedTokens > 0 && (
              <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 to-slate-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white">Source Context Normalized</span>
                      <p className="text-[11px] text-slate-400">Deterministic signal detection and token optimization active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      ~{preprocessingResult.metadata.estimatedTokens.toLocaleString()} Estimated AI Tokens
                    </span>
                  </div>
                </div>

                {/* Signals breakdown */}
                {preprocessingResult.metadata.detectedSignals && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {preprocessingResult.metadata.detectedSignals.dates.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        📅 {preprocessingResult.metadata.detectedSignals.dates.length} Dates Detected
                      </span>
                    )}
                    {preprocessingResult.metadata.detectedSignals.identifiers.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        🏷️ {preprocessingResult.metadata.detectedSignals.identifiers.length} Identifiers / CVEs
                      </span>
                    )}
                    {preprocessingResult.metadata.detectedSignals.percentages.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        📊 {preprocessingResult.metadata.detectedSignals.percentages.length} Metrics
                      </span>
                    )}
                    {preprocessingResult.metadata.detectedSignals.headings.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                        📑 {preprocessingResult.metadata.detectedSignals.headings.length} Sections
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. FILE UPLOAD */}
        {sourceType === 'file' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
              accept=".pdf,.docx,.txt,.md,.json,.png,.jpg,.jpeg,.mp4,.mp3,.wav"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-500/5'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Upload source document
                </h4>
                <p className="text-xs text-slate-400 mb-3 text-center max-w-sm">
                  Drag & drop files here, or browse from your computer
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-semibold">PDF (Auto-Extracted)</span> •
                  <span className="text-blue-400 font-semibold">DOCX (Structured)</span> •
                  <span>TXT/MD</span> •
                  <span className="text-emerald-400 font-semibold">Images</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                {/* File Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <File className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate max-w-xs">
                          {selectedFile.name}
                        </span>
                        {isPreprocessing ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Preprocessing...
                          </span>
                        ) : preprocessingResult?.fallbackRequired ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3" />
                            Multimodal Mode
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Preprocessed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {formatBytes(selectedFile.size)} • {selectedFile.type || 'Document'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* SHA-256 Provenance Box */}
                <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Hash className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-semibold text-slate-300">Original Source SHA-256:</span>
                  </div>
                  <span className="font-mono text-[11px] text-cyan-400 truncate max-w-sm">
                    {calculatingHash ? 'Calculating cryptographic hash...' : fileHash || 'Pending...'}
                  </span>
                </div>

                {/* Preprocessing Intelligence Badge Card */}
                {preprocessingResult && !isPreprocessing && (
                  <div
                    className={`rounded-xl p-4 border transition-all ${
                      preprocessingResult.fallbackRequired
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                        : 'bg-cyan-950/20 border-cyan-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {preprocessingResult.fallbackRequired ? (
                          <Layers className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Cpu className="h-4 w-4 text-cyan-400" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                          {preprocessingResult.fallbackRequired
                            ? 'Multimodal Routing Active'
                            : 'Intelligent Preprocessing Complete'}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          preprocessingResult.fallbackRequired
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {preprocessingResult.fallbackRequired
                          ? 'Multimodal Fallback'
                          : 'Optimized Text Context'}
                      </span>
                    </div>

                    {/* Preprocessing Metrics Grid */}
                    {!preprocessingResult.fallbackRequired ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 pb-2 text-xs">
                        {preprocessingResult.pageCount && (
                          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] uppercase text-slate-400 block">Pages</span>
                            <span className="font-bold text-white text-sm">{preprocessingResult.pageCount}</span>
                          </div>
                        )}
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] uppercase text-slate-400 block">Extracted Chars</span>
                          <span className="font-bold text-white text-sm">
                            {preprocessingResult.metadata.normalizedCharacterCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] uppercase text-slate-400 block">Word Count</span>
                          <span className="font-bold text-white text-sm">
                            {preprocessingResult.metadata.wordCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] uppercase text-slate-400 block">Estimated Tokens</span>
                          <span className="font-bold text-cyan-400 text-sm">
                            ~{preprocessingResult.metadata.estimatedTokens.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-300/90 leading-relaxed pt-1">
                        {preprocessingResult.fallbackReason ||
                          'Document routed to Gemini Multimodal visual processing engine.'}
                      </p>
                    )}

                    {/* Detected signals preview */}
                    {preprocessingResult.metadata.detectedSignals && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {preprocessingResult.metadata.detectedSignals.dates.length > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            📅 {preprocessingResult.metadata.detectedSignals.dates.length} Dates
                          </span>
                        )}
                        {preprocessingResult.metadata.detectedSignals.identifiers.length > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                            🏷️ {preprocessingResult.metadata.detectedSignals.identifiers.length} CVEs/IDs
                          </span>
                        )}
                        {preprocessingResult.metadata.detectedSignals.percentages.length > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                            📊 {preprocessingResult.metadata.detectedSignals.percentages.length} Metrics
                          </span>
                        )}
                        {preprocessingResult.metadata.detectedSignals.headings.length > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800">
                            📑 {preprocessingResult.metadata.detectedSignals.headings.length} Sections
                          </span>
                        )}
                      </div>
                    )}

                    {/* Collapsible Preview Toggle */}
                    {preprocessingResult.normalizedText && (
                      <div className="pt-3 border-t border-slate-800/80 mt-3">
                        <button
                          type="button"
                          onClick={() => setShowPreview(!showPreview)}
                          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{showPreview ? 'Hide Preprocessed AI Context' : 'Preview Preprocessed AI Context'}</span>
                          {showPreview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>

                        {showPreview && (
                          <div className="mt-3 rounded-xl bg-slate-950 p-3.5 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                            {preprocessingResult.aiContext || preprocessingResult.normalizedText}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Editable context override textarea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Extracted Text Context (Editable):
                  </label>
                  <textarea
                    rows={4}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Extracted document text will appear here automatically..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. URL INPUT */}
        {sourceType === 'url' && (
          <div className="space-y-4">
            <div>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => {
                    setSourceUrl(e.target.value);
                    if (!sourceText) {
                      setSourceText(`Source URL: ${e.target.value}\nIngested for automated content transformation.`);
                    }
                  }}
                  placeholder="https://example.com/press-release/incident-2026"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                URL Source Content / Summary Context:
              </label>
              <textarea
                rows={6}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste key article excerpts, main text, or summary points from the URL..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-3 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-400 leading-relaxed">
                URL extraction metadata and source content will be saved to <span className="text-slate-200 font-mono">source_documents</span> with SHA-256 fingerprint for audit and provenance.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
