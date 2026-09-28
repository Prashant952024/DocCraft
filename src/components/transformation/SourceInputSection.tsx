import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, Globe, CheckCircle2, X, File, AlertCircle, Hash, Sparkles } from 'lucide-react';
import { SourceType } from '@/types/transformation';
import { formatBytes, calculateSHA256 } from '@/lib/utils';

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
1. Active reconnaissance observed targeting cloud-hosted cluster ingress controllers starting 03:00 UTC.
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
}: SourceInputSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [calculatingHash, setCalculatingHash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileHash(null);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Compute SHA-256 hash
    setCalculatingHash(true);
    try {
      const hash = await calculateSHA256(file);
      setFileHash(hash);

      // If text-readable file (txt, json, md), also populate sourceText for immediate processing
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
        const text = await file.text();
        setSourceText(text);
      } else if (file.type.startsWith('image/')) {
        // Prepare info text for image upload
        if (!sourceText) {
          setSourceText(`[Attached Image Source: ${file.name} - Size: ${formatBytes(file.size)}]`);
        }
      } else if (file.type === 'application/pdf') {
        if (!sourceText) {
          setSourceText(`[Source PDF: ${file.name} (${formatBytes(file.size)}) - Ingested for multimodal transformation]`);
        }
      }
    } catch (e) {
      console.error('Error calculating hash:', e);
    } finally {
      setCalculatingHash(false);
    }
  };

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
            onClick={() => setSourceType('text')}
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
            onClick={() => setSourceType('url')}
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
          <div className="space-y-2">
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
                {sourceText.trim() ? `${sourceText.trim().split(/\s+/).length} words • ${sourceText.length} characters` : '0 words'}
              </span>
            </div>
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
                  Upload source material
                </h4>
                <p className="text-xs text-slate-400 mb-3 text-center max-w-sm">
                  Drag & drop files here, or browse from your computer
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-semibold">PDF</span> •
                  <span className="text-blue-400 font-semibold">DOCX</span> •
                  <span>TXT/MD</span> •
                  <span className="text-emerald-400 font-semibold">Images</span> •
                  <span className="text-amber-400 font-semibold">Audio</span> •
                  <span className="text-purple-400 font-semibold">Video</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <File className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate max-w-xs">
                          {selectedFile.name}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {formatBytes(selectedFile.size)} • {selectedFile.type || 'Binary Document'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* SHA-256 Hash Display */}
                <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Hash className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-semibold text-slate-300">SHA-256 Source Fingerprint:</span>
                  </div>
                  <span className="font-mono text-[11px] text-cyan-400 truncate max-w-sm">
                    {calculatingHash ? 'Calculating cryptographic hash...' : fileHash || 'Calculating...'}
                  </span>
                </div>

                {/* Extracted text preview for files */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Extracted / Accompanying Content Context:
                  </label>
                  <textarea
                    rows={4}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter additional briefing notes or extracted content summary for this file..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                URL extraction metadata will be stored in <span className="text-slate-200 font-mono">source_documents</span> for audit and provenance.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
