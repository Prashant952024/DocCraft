import * as htmlToImage from 'html-to-image';
import type { Artifact, ArtifactType } from '../types/transformation';

export interface ProvenanceInfo {
  sourceHash?: string | null;
  transformationId?: string;
  transformationTitle?: string;
  createdAt?: string;
  modelUsed?: string;
}

/**
 * Sanitize strings into clean, safe filenames.
 * e.g., "Critical Advisory: CVE-2026" -> "critical_advisory_cve_2026"
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Trigger browser file download from Blob.
 */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Download raw text file.
 */
export function downloadTextFile(filename: string, content: string): void {
  const safeFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(safeFilename, blob);
}

/**
 * Download Markdown file.
 */
export function downloadMarkdownFile(filename: string, content: string): void {
  const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(safeFilename, blob);
}

/**
 * Download JSON specification file.
 */
export function downloadJsonFile(filename: string, data: unknown): void {
  const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(safeFilename, blob);
}

/**
 * Export rendered HTML Element to high-resolution PNG image.
 */
export async function exportElementToPng(element: HTMLElement, filename: string): Promise<void> {
  const safeFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
  try {
    const dataUrl = await htmlToImage.toPng(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#0a1120',
      filter: (node) => {
        // Exclude interactive export buttons from screenshot
        if (node instanceof HTMLElement && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      },
    });

    const link = document.createElement('a');
    link.download = safeFilename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export element to PNG:', err);
    throw new Error('Unable to render PNG image from visual canvas.');
  }
}

/**
 * Build clean, human-readable plain text for any deliverable.
 * Strips UI markup, ensuring purely generated deliverable content.
 */
export function getArtifactPlainContent(artifact: Artifact): string {
  const structured = artifact.metadata?.structured_data as any;
  const raw = artifact.content;

  switch (artifact.artifact_type) {
    case 'linkedin_post': {
      if (structured?.hook || structured?.body) {
        const parts: string[] = [];
        if (structured.hook) parts.push(structured.hook);
        if (structured.body) parts.push(structured.body);
        if (structured.takeaways && structured.takeaways.length > 0) {
          parts.push('Key Executive Takeaways:');
          structured.takeaways.forEach((item: string) => parts.push(`• ${item}`));
        }
        if (structured.callToAction) parts.push(structured.callToAction);
        if (structured.hashtags && structured.hashtags.length > 0) {
          const tags = structured.hashtags.map((t: string) => (t.startsWith('#') ? t : `#${t}`)).join(' ');
          parts.push(tags);
        }
        return parts.join('\n\n');
      }
      return raw;
    }

    case 'x_post': {
      if (structured?.thread && Array.isArray(structured.thread)) {
        return structured.thread
          .map((t: { tweetNumber?: number; content: string }, idx: number) => {
            const num = t.tweetNumber || idx + 1;
            return `${num}/ ${t.content}`;
          })
          .join('\n\n');
      }
      return raw;
    }

    case 'executive_summary': {
      if (structured?.executiveBrief) {
        const parts: string[] = [];
        parts.push(`EXECUTIVE SUMMARY: ${(artifact.metadata?.title as string) || 'Executive Briefing'}\n`);
        parts.push(`OVERVIEW:\n${structured.executiveBrief}\n`);
        if (structured.keyFindings?.length) {
          parts.push('KEY FINDINGS:');
          structured.keyFindings.forEach((f: string, i: number) => parts.push(`${i + 1}. ${f}`));
          parts.push('');
        }
        if (structured.strategicImpacts?.length) {
          parts.push('STRATEGIC IMPACTS:');
          structured.strategicImpacts.forEach((imp: string) => parts.push(`• ${imp}`));
          parts.push('');
        }
        if (structured.recommendations?.length) {
          parts.push('RECOMMENDATIONS:');
          structured.recommendations.forEach((r: string, i: number) => parts.push(`[ ] ${i + 1}. ${r}`));
          parts.push('');
        }
        if (structured.confidenceScore) {
          parts.push(`Synthesis Confidence: ${structured.confidenceScore}`);
        }
        return parts.join('\n');
      }
      return raw;
    }

    case 'advisory': {
      if (structured?.threatSummary || structured?.advisoryId) {
        const parts: string[] = [];
        parts.push(`SECURITY ADVISORY: ${structured.advisoryId || 'ADV-2026'}`);
        parts.push(`SEVERITY: ${structured.severity || 'CRITICAL'}\n`);
        parts.push(`THREAT SUMMARY:\n${structured.threatSummary || raw}\n`);
        if (structured.affectedSystems?.length) {
          parts.push('AFFECTED SYSTEMS & COMPONENTS:');
          structured.affectedSystems.forEach((s: string) => parts.push(`- ${s}`));
          parts.push('');
        }
        if (structured.immediateActions?.length) {
          parts.push('IMMEDIATE ACTIONS REQUIRED:');
          structured.immediateActions.forEach((act: string, i: number) => parts.push(`${i + 1}. ${act}`));
          parts.push('');
        }
        if (structured.indicatorsOfCompromise?.length) {
          parts.push('INDICATORS OF COMPROMISE:');
          structured.indicatorsOfCompromise.forEach((ioc: string) => parts.push(`- ${ioc}`));
          parts.push('');
        }
        if (structured.longTermRecommendations?.length) {
          parts.push('LONG-TERM STRATEGIC RECOMMENDATIONS:');
          structured.longTermRecommendations.forEach((rec: string) => parts.push(`- ${rec}`));
          parts.push('');
        }
        return parts.join('\n');
      }
      return raw;
    }

    case 'presentation': {
      if (structured?.slides && Array.isArray(structured.slides)) {
        const parts: string[] = [];
        parts.push(`PRESENTATION: ${structured.presentationTitle || 'Executive Presentation Deck'}`);
        parts.push(`TOTAL SLIDES: ${structured.slides.length}\n`);
        structured.slides.forEach((s: any, idx: number) => {
          parts.push(`==================================================`);
          parts.push(`SLIDE ${s.slideNumber || idx + 1}: ${s.title}`);
          parts.push(`==================================================`);
          if (s.bulletPoints?.length) {
            s.bulletPoints.forEach((b: string) => parts.push(`• ${b}`));
          }
          if (s.speakerNotes) {
            parts.push(`\n[SPEAKER NOTES]\n${s.speakerNotes}`);
          }
          if (s.visualCue) {
            parts.push(`\n[VISUAL DIRECTION]\n${s.visualCue}`);
          }
          parts.push('\n');
        });
        return parts.join('\n');
      }
      return raw;
    }

    case 'video': {
      if (structured?.scenes && Array.isArray(structured.scenes)) {
        const parts: string[] = [];
        parts.push(`VIDEO STORYBOARD & SCRIPT: ${structured.title || 'Briefing Package'}`);
        parts.push(`TARGET DURATION: ~${structured.targetDurationSeconds || 60}s | FORMAT: ${structured.targetFormat || '16:9 Landscape'}\n`);
        structured.scenes.forEach((sc: any, idx: number) => {
          parts.push(`--------------------------------------------------`);
          parts.push(`SCENE ${sc.sceneNumber || idx + 1} (${sc.durationSeconds || 15} seconds)`);
          parts.push(`--------------------------------------------------`);
          parts.push(`VISUAL: ${sc.visualDescription}`);
          parts.push(`VOICEOVER: "${sc.narrationVoiceover}"`);
          if (sc.onScreenText) parts.push(`ON-SCREEN TEXT: [${sc.onScreenText}]`);
          if (sc.transition) parts.push(`TRANSITION: ${sc.transition}`);
          parts.push('');
        });
        return parts.join('\n');
      }
      return raw;
    }

    case 'infographic': {
      if (structured?.headline || structured?.keyMetrics) {
        const parts: string[] = [];
        parts.push(`INFOGRAPHIC SPECIFICATION: ${structured.headline || 'Visual Intelligence'}\n`);
        if (structured.keyMetrics?.length) {
          parts.push('KEY METRICS:');
          structured.keyMetrics.forEach((m: any) => parts.push(`- ${m.label}: ${m.value} (${m.change || 'N/A'})`));
          parts.push('');
        }
        if (structured.steps?.length) {
          parts.push('PROCESS STEPS:');
          structured.steps.forEach((st: any) => parts.push(`${st.step || 1}. ${st.title}: ${st.description}`));
          parts.push('');
        }
        if (structured.callout?.text) {
          parts.push(`CALLOUT (${structured.callout.title || 'Attention'}): ${structured.callout.text}`);
        }
        return parts.join('\n');
      }
      return raw;
    }

    default:
      return raw;
  }
}

/**
 * Format Markdown file with structured headers and optional provenance footer.
 */
export function getArtifactMarkdown(artifact: Artifact, provenance?: ProvenanceInfo): string {
  const plain = getArtifactPlainContent(artifact);
  const title = (artifact.metadata?.title as string) || artifact.artifact_type.replace('_', ' ').toUpperCase();

  let md = `# ${title}\n\n${plain}\n`;

  // Provenance Footer (Exclude for public social media exports to maintain authenticity)
  if (
    provenance &&
    artifact.artifact_type !== 'linkedin_post' &&
    artifact.artifact_type !== 'x_post'
  ) {
    md += `\n\n---\n`;
    md += `*Generated by DocCraft Multimodal Content Intelligence*\n`;
    if (provenance.sourceHash) md += `- **Source Fingerprint (SHA-256):** \`${provenance.sourceHash}\`\n`;
    if (provenance.transformationId) md += `- **Transformation ID:** \`${provenance.transformationId}\`\n`;
    if (provenance.modelUsed || artifact.metadata?.model_used) {
      md += `- **AI Engine:** \`${provenance.modelUsed || artifact.metadata?.model_used || 'Gemini 3.8 Flash'}\`\n`;
    }
    if (provenance.createdAt) md += `- **Timestamp:** ${new Date(provenance.createdAt).toUTCString()}\n`;
  }

  return md;
}

/**
 * Print / Save as PDF using the browser's native print engine with clean document styling.
 */
export function printArtifactDocument(artifact: Artifact, provenance?: ProvenanceInfo): void {
  const title = (artifact.metadata?.title as string) || `${artifact.artifact_type.replace('_', ' ')} - DocCraft`;
  const structured = artifact.metadata?.structured_data as any;

  // Build clean HTML content according to deliverable type
  let bodyHtml = '';

  switch (artifact.artifact_type) {
    case 'advisory': {
      bodyHtml = `
        <div class="header-band advisory-band">
          <div class="flex-between">
            <span class="badge ${structured?.severity?.toLowerCase() || 'critical'}">${structured?.severity || 'CRITICAL'} SEVERITY</span>
            <span class="doc-code">${structured?.advisoryId || 'ADV-2026'}</span>
          </div>
          <h1 class="doc-title">${title}</h1>
          <p class="summary-lead">${structured?.threatSummary || artifact.content}</p>
        </div>

        ${structured?.affectedSystems?.length ? `
          <div class="section">
            <h2 class="section-title">Impacted Systems & Infrastructure</h2>
            <ul class="bullet-list">
              ${structured.affectedSystems.map((s: string) => `<li><strong>${s}</strong></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${structured?.immediateActions?.length ? `
          <div class="section alert-section">
            <h2 class="section-title">Mandatory Immediate Remediation</h2>
            <ol class="numbered-list">
              ${structured.immediateActions.map((a: string) => `<li>${a}</li>`).join('')}
            </ol>
          </div>
        ` : ''}

        ${structured?.indicatorsOfCompromise?.length ? `
          <div class="section">
            <h2 class="section-title">Indicators of Compromise (IoC)</h2>
            <ul class="bullet-list mono-list">
              ${structured.indicatorsOfCompromise.map((i: string) => `<li><code>${i}</code></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${structured?.longTermRecommendations?.length ? `
          <div class="section">
            <h2 class="section-title">Long-Term Strategic Recommendations</h2>
            <ul class="bullet-list">
              ${structured.longTermRecommendations.map((r: string) => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      `;
      break;
    }

    case 'executive_summary': {
      bodyHtml = `
        <div class="header-band">
          <span class="badge info">EXECUTIVE DECISION BRIEF</span>
          <h1 class="doc-title">${title}</h1>
          <p class="summary-lead">${structured?.executiveBrief || artifact.content}</p>
        </div>

        ${structured?.keyFindings?.length ? `
          <div class="section">
            <h2 class="section-title">Key Executive Findings</h2>
            <ol class="numbered-list">
              ${structured.keyFindings.map((f: string) => `<li>${f}</li>`).join('')}
            </ol>
          </div>
        ` : ''}

        ${structured?.strategicImpacts?.length ? `
          <div class="section">
            <h2 class="section-title">Strategic Impacts & Risk Assessment</h2>
            <ul class="bullet-list">
              ${structured.strategicImpacts.map((imp: string) => `<li>${imp}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${structured?.recommendations?.length ? `
          <div class="section">
            <h2 class="section-title">Strategic Recommendations</h2>
            <ul class="checklist">
              ${structured.recommendations.map((rec: string) => `<li>[✓] ${rec}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      `;
      break;
    }

    case 'presentation': {
      const slides = structured?.slides || [];
      bodyHtml = `
        <div class="presentation-deck">
          <div class="deck-cover">
            <span class="badge purple">EXECUTIVE PRESENTATION DECK</span>
            <h1 class="doc-title">${structured?.presentationTitle || title}</h1>
            <p class="summary-lead">Total Slides: ${slides.length} • Generated by DocCraft</p>
          </div>

          ${slides.map((s: any, idx: number) => `
            <div class="slide-page">
              <div class="slide-header">
                <span class="slide-number">SLIDE ${s.slideNumber || idx + 1} OF ${slides.length}</span>
                <h2 class="slide-title">${s.title}</h2>
              </div>
              <div class="slide-body">
                <ul class="slide-bullets">
                  ${(s.bulletPoints || []).map((b: string) => `<li>${b}</li>`).join('')}
                </ul>
              </div>
              ${s.speakerNotes ? `
                <div class="slide-notes">
                  <strong>Speaker Notes:</strong> ${s.speakerNotes}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    case 'video': {
      const scenes = structured?.scenes || [];
      bodyHtml = `
        <div class="header-band">
          <span class="badge rose">VIDEO PRODUCTION STORYBOARD & SCRIPT</span>
          <h1 class="doc-title">${structured?.title || title}</h1>
          <p class="summary-lead">Format: ${structured?.targetFormat || '16:9 Landscape'} • Target Duration: ~${structured?.targetDurationSeconds || 60}s</p>
        </div>

        <div class="storyboard-grid">
          ${scenes.map((sc: any, idx: number) => `
            <div class="storyboard-card">
              <div class="scene-header">
                <span class="scene-num">SCENE 0${sc.sceneNumber || idx + 1}</span>
                <span class="scene-dur">${sc.durationSeconds || 15}s</span>
              </div>
              <div class="scene-field">
                <strong>Visual Direction:</strong>
                <p>${sc.visualDescription}</p>
              </div>
              <div class="scene-field voiceover">
                <strong>Narration Script:</strong>
                <p>"${sc.narrationVoiceover}"</p>
              </div>
              ${sc.onScreenText ? `
                <div class="scene-field">
                  <strong>On-Screen Text:</strong> <code>[${sc.onScreenText}]</code>
                </div>
              ` : ''}
              ${sc.transition ? `
                <div class="scene-footer">Transition: ${sc.transition}</div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    default: {
      bodyHtml = `
        <div class="header-band">
          <h1 class="doc-title">${title}</h1>
        </div>
        <div class="content-body">
          <pre class="plain-pre">${getArtifactPlainContent(artifact)}</pre>
        </div>
      `;
      break;
    }
  }

  // Provenance HTML Footer
  let provenanceHtml = '';
  if (provenance) {
    provenanceHtml = `
      <div class="provenance-footer">
        <div class="prov-brand">DOCCRAFT ENTERPRISE CONTENT INTELLIGENCE</div>
        <div class="prov-grid">
          ${provenance.sourceHash ? `<div><strong>Source Fingerprint:</strong> <code>${provenance.sourceHash}</code></div>` : ''}
          ${provenance.transformationId ? `<div><strong>Transformation ID:</strong> <code>${provenance.transformationId}</code></div>` : ''}
          <div><strong>AI Engine:</strong> ${provenance.modelUsed || artifact.metadata?.model_used || 'Gemini 3.8 Flash'}</div>
          <div><strong>Generated:</strong> ${new Date(provenance.createdAt || Date.now()).toLocaleString()}</div>
        </div>
      </div>
    `;
  }

  // Complete Print HTML Document with dedicated print styling
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          @page slide {
            size: A4 landscape;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 11pt;
            line-height: 1.5;
            padding: 20px;
          }
          .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header-band {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .advisory-band {
            border-left: 5px solid #dc2626;
            padding-left: 15px;
          }
          .badge {
            display: inline-block;
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
            padding: 3px 8px;
            border-radius: 4px;
            letter-spacing: 0.5px;
          }
          .badge.critical { background: #fee2e2; color: #991b1b; }
          .badge.info { background: #e0f2fe; color: #075985; }
          .badge.purple { background: #f3e8ff; color: #6b21a8; }
          .badge.rose { background: #ffe4e6; color: #9f1239; }
          .doc-code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 10pt;
            font-weight: 600;
            color: #475569;
          }
          .doc-title {
            font-size: 18pt;
            font-weight: 800;
            color: #0f172a;
            margin-top: 10px;
            margin-bottom: 8px;
            line-height: 1.25;
          }
          .summary-lead {
            font-size: 11.5pt;
            color: #334155;
            line-height: 1.5;
          }
          .section {
            margin-bottom: 20px;
          }
          .alert-section {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 12px 16px;
          }
          .section-title {
            font-size: 12pt;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .bullet-list, .numbered-list, .checklist {
            padding-left: 20px;
          }
          .bullet-list li, .numbered-list li, .checklist li {
            margin-bottom: 6px;
            color: #1e293b;
          }
          .mono-list code {
            font-family: ui-monospace, SFMono-Regular, monospace;
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10pt;
          }
          .plain-pre {
            font-family: inherit;
            white-space: pre-wrap;
            color: #1e293b;
            line-height: 1.6;
          }
          /* Presentation slide styling for print */
          .presentation-deck {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .slide-page {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 24px;
            page-break-after: always;
            min-height: 480px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .slide-header {
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 16px;
          }
          .slide-number {
            font-size: 9pt;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 1px;
          }
          .slide-title {
            font-size: 16pt;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }
          .slide-bullets {
            padding-left: 20px;
            font-size: 12pt;
            line-height: 1.6;
          }
          .slide-bullets li {
            margin-bottom: 10px;
          }
          .slide-notes {
            margin-top: 20px;
            padding: 10px 14px;
            background: #f8fafc;
            border-left: 3px solid #9333ea;
            font-size: 9.5pt;
            color: #475569;
          }
          /* Storyboard styles */
          .storyboard-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .storyboard-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 14px;
            background: #ffffff;
            page-break-inside: avoid;
          }
          .scene-header {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 10pt;
            color: #9f1239;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .scene-field {
            margin-bottom: 6px;
            font-size: 10pt;
          }
          .scene-field.voiceover {
            background: #fff1f2;
            padding: 6px 10px;
            border-radius: 4px;
            border-left: 3px solid #f43f5e;
          }
          .provenance-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #cbd5e1;
            font-size: 8.5pt;
            color: #64748b;
          }
          .prov-brand {
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 6px;
            color: #0f172a;
          }
          .prov-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          .prov-grid code {
            font-family: ui-monospace, monospace;
            font-size: 8pt;
          }
        </style>
      </head>
      <body>
        ${bodyHtml}
        ${provenanceHtml}
      </body>
    </html>
  `;

  // Create an iframe to print cleanly without affecting parent page styling
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow?.document;
  if (!frameDoc) {
    // Fallback to popup window if iframe restricted
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(fullHtml);
      win.document.close();
      win.focus();
      win.print();
      win.close();
    }
    return;
  }

  frameDoc.open();
  frameDoc.write(fullHtml);
  frameDoc.close();

  setTimeout(() => {
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  }, 500);
}

/**
 * Download All Artifacts sequentially.
 */
export async function downloadAllArtifacts(
  artifacts: Artifact[],
  provenance?: ProvenanceInfo,
  onProgress?: (completed: number, total: number, currentName: string) => void
): Promise<void> {
  const total = artifacts.length;
  for (let i = 0; i < artifacts.length; i++) {
    const art = artifacts[i];
    const artTitle = (art.metadata?.title as string) || art.artifact_type.replace('_', ' ');
    const safeTitle = sanitizeFilename(artTitle);
    const filename = `doccraft_${art.artifact_type}_${safeTitle}`;

    if (onProgress) {
      onProgress(i + 1, total, artTitle);
    }

    switch (art.artifact_type) {
      case 'linkedin_post':
      case 'x_post': {
        const text = getArtifactPlainContent(art);
        downloadTextFile(filename, text);
        break;
      }
      case 'infographic': {
        const md = getArtifactMarkdown(art, provenance);
        downloadMarkdownFile(filename, md);
        break;
      }
      default: {
        const md = getArtifactMarkdown(art, provenance);
        downloadMarkdownFile(filename, md);
        break;
      }
    }

    // Small delay between downloads so the browser doesn't block multi-download
    await new Promise((r) => setTimeout(r, 400));
  }
}
