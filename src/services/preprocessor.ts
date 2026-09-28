import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import {
  PreprocessingMetadata,
  DetectedSignals,
} from '@/types/transformation';

// Configure pdfjs-dist worker
try {
  if (typeof window !== 'undefined') {
    // Standard worker configuration with modern fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
} catch {
  // Fallback to CDN worker if local bundle fails
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
}

export interface PreprocessingResult {
  success: boolean;
  fallbackRequired: boolean;
  fallbackReason?: string;
  sourceType: string;
  pageCount?: number;
  rawExtractedText: string;
  normalizedText: string;
  aiContext: string;
  metadata: PreprocessingMetadata;
}

/**
 * Estimate token count using documented character-to-token approximation (1 token ≈ 4 characters).
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Normalize text: clean whitespace, malformed unicode, strip control characters, preserve structure.
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return '';

  return (
    rawText
      // 1. Unicode NFKC normalization
      .normalize('NFKC')
      // 2. Remove control characters (except newline, tab, carriage return)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // 3. Normalize windows line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // 4. Replace tabs with 2 spaces
      .replace(/\t/g, '  ')
      // 5. Replace multiple spaces on the same line with a single space
      .replace(/[^\S\n]+/g, ' ')
      // 6. Trim trailing whitespace from each line
      .replace(/[ \t]+$/gm, '')
      // 7. Limit consecutive blank lines to maximum 2
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/**
 * Deterministic signal extraction layer using regex and structural analysis.
 * Extracts dates, numbers, percentages, currencies, identifiers, CVEs, URLs, headings.
 */
export function extractSignals(text: string): DetectedSignals {
  if (!text) {
    return {
      headings: [],
      dates: [],
      percentages: [],
      currencies: [],
      identifiers: [],
      urls: [],
      bulletCount: 0,
      tableCount: 0,
    };
  }

  // 1. Headings (Markdown headers `# `, `## `, or short lines in Title/Upper case)
  const headingMatches = text.match(/^(?:#{1,6}\s+[^\n]+|[A-Z0-9\s:_-]{4,60}$)/gm) || [];
  const headings = Array.from(
    new Set(
      headingMatches
        .map((h) => h.replace(/^#{1,6}\s+/, '').trim())
        .filter((h) => h.length >= 3 && h.length <= 80 && !/^(PAGE|PAGE \d+|CONFIDENTIAL|REPORT)$/i.test(h))
    )
  ).slice(0, 12);

  // 2. Dates (e.g., 2026-09-29, 29/09/2026, 12 September 2026, Sep 29, 2026)
  const datePatterns = [
    /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/g,
    /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/g,
    /\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{2,4}\b/gi,
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{2,4}\b/gi,
  ];
  const dateSet = new Set<string>();
  for (const pattern of datePatterns) {
    const matches = text.match(pattern) || [];
    matches.forEach((m) => dateSet.add(m.trim()));
  }
  const dates = Array.from(dateSet).slice(0, 10);

  // 3. Percentages (e.g., 98%, 34.5%)
  const percentageMatches = text.match(/\b\d+(?:\.\d+)?%\b/g) || [];
  const percentages = Array.from(new Set(percentageMatches)).slice(0, 8);

  // 4. Currencies (e.g. $1,000, €45M, ₹50,000, 100 USD)
  const currencyMatches =
    text.match(/(?:[\$€£₹]\s*\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:k|m|b|million|billion|crore|lakh))?|\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:USD|EUR|GBP|INR)\b)/gi) || [];
  const currencies = Array.from(new Set(currencyMatches.map((c) => c.trim()))).slice(0, 8);

  // 5. Identifiers (CVEs, RFCs, IP addresses, UUIDs, incident codes)
  const identifierPatterns = [
    /\bCVE-\d{4}-\d{4,7}\b/gi,
    /\bRFC[- ]?\d{3,5}\b/gi,
    /\b(?:ADV|INC|SEC|TICKET|BUG)[-_]\d{3,8}\b/gi,
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  ];
  const idSet = new Set<string>();
  for (const pattern of identifierPatterns) {
    const matches = text.match(pattern) || [];
    matches.forEach((m) => idSet.add(m.trim()));
  }
  const identifiers = Array.from(idSet).slice(0, 10);

  // 6. URLs
  const urlMatches = text.match(/https?:\/\/[^\s)"]+/gi) || [];
  const urls = Array.from(new Set(urlMatches.map((u) => u.trim()))).slice(0, 6);

  // 7. Structure counts
  const bulletMatches = text.match(/^\s*[-*•]\s+/gm) || [];
  const tableMatches = text.match(/^\|.+?\|$/gm) || [];

  return {
    headings,
    dates,
    percentages,
    currencies,
    identifiers,
    urls,
    bulletCount: bulletMatches.length,
    tableCount: tableMatches.length > 0 ? Math.ceil(tableMatches.length / 3) : 0,
  };
}

/**
 * Section-aware text reduction for very large documents (>80k chars).
 * Preserves structure, headings, first/last paragraphs of sections, and tables.
 */
export function sectionAwareReduction(text: string, maxChars = 80000): string {
  if (text.length <= maxChars) {
    return text;
  }

  const sections = text.split(/(?=^#{1,3}\s+|^--- Page \d+ ---)/m);
  if (sections.length <= 1) {
    // If no distinct section markers, take head + tail with structure
    const headSize = Math.floor(maxChars * 0.7);
    const tailSize = Math.floor(maxChars * 0.25);
    return `${text.slice(0, headSize)}\n\n[... content condensed for AI context budget ...]\n\n${text.slice(-tailSize)}`;
  }

  const targetCharsPerSection = Math.floor((maxChars * 0.85) / sections.length);
  const condensedSections: string[] = [];

  for (const sec of sections) {
    if (sec.length <= targetCharsPerSection) {
      condensedSections.push(sec);
    } else {
      const paragraphs = sec.split(/\n\n+/);
      if (paragraphs.length <= 3) {
        condensedSections.push(sec.slice(0, targetCharsPerSection));
      } else {
        // Keep header, first 2 paragraphs, any table/bullet points, and last paragraph
        const headerAndIntro = paragraphs.slice(0, 2).join('\n\n');
        const structuralRows = paragraphs.filter((p) => p.includes('|') || p.startsWith('-') || p.startsWith('*')).slice(0, 4).join('\n\n');
        const conclusion = paragraphs[paragraphs.length - 1];
        condensedSections.push(
          `${headerAndIntro}\n\n${structuralRows ? structuralRows + '\n\n' : ''}[... section detail summarized ...]\n\n${conclusion}`
        );
      }
    }
  }

  return condensedSections.join('\n\n');
}

/**
 * Builds compact, structured AI context with metadata preamble and normalized source.
 */
export function buildAIContext(
  sourceType: string,
  normalizedText: string,
  metadata: PreprocessingMetadata,
  signals: DetectedSignals
): string {
  const signalParts: string[] = [];

  if (signals.headings.length > 0) {
    signalParts.push(`Key Headings: ${signals.headings.join(' | ')}`);
  }
  if (signals.dates.length > 0) {
    signalParts.push(`Key Dates: ${signals.dates.join(', ')}`);
  }
  if (signals.identifiers.length > 0) {
    signalParts.push(`Key Identifiers: ${signals.identifiers.join(', ')}`);
  }
  if (signals.percentages.length > 0) {
    signalParts.push(`Key Metrics: ${signals.percentages.join(', ')}`);
  }
  if (signals.currencies.length > 0) {
    signalParts.push(`Key Financials: ${signals.currencies.join(', ')}`);
  }
  if (signals.urls.length > 0) {
    signalParts.push(`Key URLs: ${signals.urls.join(', ')}`);
  }

  const signalsSection =
    signalParts.length > 0
      ? `\nDETECTED INFORMATION SIGNALS:\n${signalParts.map((s) => `- ${s}`).join('\n')}\n`
      : '';

  const safeContent = sectionAwareReduction(normalizedText, 80000);

  return `==============================
DOCUMENT PREPROCESSING METADATA
==============================
- Source Modality: ${sourceType.toUpperCase()}
- Extraction Method: ${metadata.method}
${metadata.pageCount ? `- Page Count: ${metadata.pageCount}\n` : ''}- Normalized Characters: ${metadata.normalizedCharacterCount.toLocaleString()}
- Estimated AI Tokens: ~${metadata.estimatedTokens.toLocaleString()}
- Preprocessing Applied: ${metadata.preprocessingApplied.join(', ')}
${signalsSection}
==============================
PREPROCESSED SOURCE CONTENT
==============================
${safeContent}
`;
}

/**
 * Extract text from PDF client-side using pdfjs-dist.
 */
export async function extractPdfText(file: File): Promise<{
  success: boolean;
  pageCount: number;
  extractedText: string;
  isScanned: boolean;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];
  const headerFooterFrequency: Record<string, number> = {};

  // First pass: extract text per page
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{
      str: string;
      transform: number[];
      width: number;
      height: number;
    }>;

    if (!items || items.length === 0) {
      pageTexts.push('');
      continue;
    }

    // Sort items by vertical position (descending Y) and horizontal position (ascending X)
    const sortedItems = [...items].sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 4) {
        return yDiff;
      }
      return a.transform[4] - b.transform[4];
    });

    // Group items into lines
    const lines: string[] = [];
    let currentLine = '';
    let currentY: number | null = null;

    for (const item of sortedItems) {
      if (!item.str) continue;
      const y = item.transform[5];

      if (currentY === null || Math.abs(currentY - y) > 4) {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
          // Track header/footer candidates
          if (lines.length === 1 || lines.length > 20) {
            const trimmed = currentLine.trim();
            if (trimmed.length > 5 && trimmed.length < 60) {
              headerFooterFrequency[trimmed] = (headerFooterFrequency[trimmed] || 0) + 1;
            }
          }
        }
        currentLine = item.str;
        currentY = y;
      } else {
        currentLine += (currentLine.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    pageTexts.push(lines.join('\n'));
  }

  // Detect repeated headers/footers (present in >= 3 pages)
  const repeatedHeaders = new Set<string>();
  for (const [line, count] of Object.entries(headerFooterFrequency)) {
    if (count >= 3 && count >= Math.floor(numPages * 0.5)) {
      repeatedHeaders.add(line);
    }
  }

  // Second pass: filter out repeated headers/footers and format
  const cleanedPages = pageTexts.map((pageText, idx) => {
    const lines = pageText
      .split('\n')
      .filter((l) => !repeatedHeaders.has(l.trim()));
    return `--- Page ${idx + 1} ---\n` + lines.join('\n');
  });

  const fullExtractedText = cleanedPages.join('\n\n').trim();
  const charCount = fullExtractedText.replace(/--- Page \d+ ---/g, '').trim().length;

  // Scanned document heuristic: very low character count relative to page count
  const isScanned = charCount < 100 || (numPages > 1 && charCount / numPages < 30);

  return {
    success: !isScanned,
    pageCount: numPages,
    extractedText: fullExtractedText,
    isScanned,
  };
}

/**
 * Extract structured text/markdown from DOCX files client-side using mammoth.
 */
export async function extractDocxText(file: File): Promise<{
  success: boolean;
  extractedText: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  let html = result.value || '';

  if (!html.trim()) {
    // Fallback to raw text extraction
    const rawResult = await mammoth.extractRawText({ arrayBuffer });
    return {
      success: rawResult.value.trim().length > 30,
      extractedText: rawResult.value || '',
    };
  }

  // Convert HTML elements into structured Markdown
  let markdown = html
    .replace(/<h1>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4>(.*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul>([\s\S]*?)<\/ul>/gi, '$1\n')
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, '$1\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<table[\s\S]*?>([\s\S]*?)<\/table>/gi, (_match, tableBody) => {
      // Basic table preservation
      const rows: string[] = [];
      const trRegex = /<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi;
      let trMatch;
      while ((trMatch = trRegex.exec(tableBody)) !== null) {
        const cells: string[] = [];
        const tdRegex = /<t[dh][\s\S]*?>([\s\S]*?)<\/t[dh]>/gi;
        let tdMatch;
        while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
          cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
        }
        if (cells.length > 0) {
          rows.push(`| ${cells.join(' | ')} |`);
        }
      }
      if (rows.length > 0) {
        const headerDivider = `| ${rows[0].split('|').slice(1, -1).map(() => '---').join(' | ')} |`;
        return `\n${rows[0]}\n${headerDivider}\n${rows.slice(1).join('\n')}\n\n`;
      }
      return '';
    })
    .replace(/<[^>]+>/g, '') // Strip any remaining HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  return {
    success: markdown.trim().length > 30,
    extractedText: markdown.trim(),
  };
}

/**
 * Main entrypoint for client-side deterministic document preprocessing.
 */
export async function preprocessFile(file: File): Promise<PreprocessingResult> {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type || '';

  // 1. PDF Preprocessing
  if (fileName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      const pdfExtraction = await extractPdfText(file);

      if (pdfExtraction.isScanned) {
        return {
          success: false,
          fallbackRequired: true,
          fallbackReason: 'PDF contains little or no extractable text (detected as scanned/image-based). Multimodal visual processing will be used.',
          sourceType: 'pdf',
          pageCount: pdfExtraction.pageCount,
          rawExtractedText: pdfExtraction.extractedText,
          normalizedText: '',
          aiContext: '',
          metadata: {
            method: 'scanned_fallback',
            sourceType: 'pdf',
            pageCount: pdfExtraction.pageCount,
            extractedCharacterCount: pdfExtraction.extractedText.length,
            normalizedCharacterCount: 0,
            wordCount: 0,
            estimatedTokens: 0,
            extractionSuccessful: false,
            fallbackRequired: true,
            fallbackReason: 'PDF contains little or no extractable text',
            preprocessingApplied: ['pdf_text_extraction', 'scanned_document_detection'],
          },
        };
      }

      const normalized = normalizeText(pdfExtraction.extractedText);
      const signals = extractSignals(normalized);
      const estTokens = estimateTokens(normalized);
      const wordCount = normalized.trim().split(/\s+/).length;

      const metadata: PreprocessingMetadata = {
        method: 'client_pdf_extraction',
        sourceType: 'pdf',
        pageCount: pdfExtraction.pageCount,
        extractedCharacterCount: pdfExtraction.extractedText.length,
        normalizedCharacterCount: normalized.length,
        wordCount,
        estimatedTokens: estTokens,
        extractionSuccessful: true,
        fallbackRequired: false,
        preprocessingApplied: [
          'pdf_text_extraction',
          'whitespace_normalization',
          'header_footer_cleanup',
          'signal_detection',
          'context_structuring',
        ],
        detectedSignals: signals,
      };

      const aiContext = buildAIContext('pdf', normalized, metadata, signals);

      return {
        success: true,
        fallbackRequired: false,
        sourceType: 'pdf',
        pageCount: pdfExtraction.pageCount,
        rawExtractedText: pdfExtraction.extractedText,
        normalizedText: normalized,
        aiContext,
        metadata,
      };
    } catch (err: any) {
      console.warn('PDF extraction failed, falling back to multimodal:', err);
      return {
        success: false,
        fallbackRequired: true,
        fallbackReason: `PDF extraction encountered an error (${err?.message || 'Corrupted or encrypted PDF'}). Falling back to multimodal document analysis.`,
        sourceType: 'pdf',
        rawExtractedText: '',
        normalizedText: '',
        aiContext: '',
        metadata: {
          method: 'scanned_fallback',
          sourceType: 'pdf',
          extractedCharacterCount: 0,
          normalizedCharacterCount: 0,
          wordCount: 0,
          estimatedTokens: 0,
          extractionSuccessful: false,
          fallbackRequired: true,
          fallbackReason: err?.message || 'Extraction failed',
          preprocessingApplied: ['error_fallback'],
        },
      };
    }
  }

  // 2. DOCX Preprocessing
  if (
    fileName.endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const docxExtraction = await extractDocxText(file);

      if (!docxExtraction.success) {
        return {
          success: false,
          fallbackRequired: true,
          fallbackReason: 'DOCX document contains no readable text or is password-protected.',
          sourceType: 'docx',
          rawExtractedText: docxExtraction.extractedText,
          normalizedText: '',
          aiContext: '',
          metadata: {
            method: 'scanned_fallback',
            sourceType: 'docx',
            extractedCharacterCount: docxExtraction.extractedText.length,
            normalizedCharacterCount: 0,
            wordCount: 0,
            estimatedTokens: 0,
            extractionSuccessful: false,
            fallbackRequired: true,
            fallbackReason: 'DOCX text extraction yielded empty content',
            preprocessingApplied: ['docx_extraction_failure'],
          },
        };
      }

      const normalized = normalizeText(docxExtraction.extractedText);
      const signals = extractSignals(normalized);
      const estTokens = estimateTokens(normalized);
      const wordCount = normalized.trim().split(/\s+/).length;

      const metadata: PreprocessingMetadata = {
        method: 'client_docx_extraction',
        sourceType: 'docx',
        extractedCharacterCount: docxExtraction.extractedText.length,
        normalizedCharacterCount: normalized.length,
        wordCount,
        estimatedTokens: estTokens,
        extractionSuccessful: true,
        fallbackRequired: false,
        preprocessingApplied: [
          'mammoth_xml_parsing',
          'heading_and_table_preservation',
          'whitespace_normalization',
          'signal_detection',
        ],
        detectedSignals: signals,
      };

      const aiContext = buildAIContext('docx', normalized, metadata, signals);

      return {
        success: true,
        fallbackRequired: false,
        sourceType: 'docx',
        rawExtractedText: docxExtraction.extractedText,
        normalizedText: normalized,
        aiContext,
        metadata,
      };
    } catch (err: any) {
      console.warn('DOCX extraction error:', err);
      return {
        success: false,
        fallbackRequired: true,
        fallbackReason: `DOCX extraction error: ${err?.message || 'Unsupported format'}`,
        sourceType: 'docx',
        rawExtractedText: '',
        normalizedText: '',
        aiContext: '',
        metadata: {
          method: 'scanned_fallback',
          sourceType: 'docx',
          extractedCharacterCount: 0,
          normalizedCharacterCount: 0,
          wordCount: 0,
          estimatedTokens: 0,
          extractionSuccessful: false,
          fallbackRequired: true,
          fallbackReason: err?.message || 'DOCX parsing error',
          preprocessingApplied: ['docx_error_fallback'],
        },
      };
    }
  }

  // 3. Plain Text, Markdown, JSON Preprocessing
  if (
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.json') ||
    mimeType.startsWith('text/')
  ) {
    const raw = await file.text();
    const normalized = normalizeText(raw);
    const signals = extractSignals(normalized);
    const estTokens = estimateTokens(normalized);
    const wordCount = normalized.trim().split(/\s+/).length;

    const metadata: PreprocessingMetadata = {
      method: 'client_text_normalization',
      sourceType: fileName.endsWith('.md') ? 'markdown' : fileName.endsWith('.json') ? 'json' : 'text',
      extractedCharacterCount: raw.length,
      normalizedCharacterCount: normalized.length,
      wordCount,
      estimatedTokens: estTokens,
      extractionSuccessful: true,
      fallbackRequired: false,
      preprocessingApplied: ['unicode_normalization', 'whitespace_cleanup', 'signal_detection'],
      detectedSignals: signals,
    };

    const aiContext = buildAIContext(metadata.sourceType, normalized, metadata, signals);

    return {
      success: true,
      fallbackRequired: false,
      sourceType: metadata.sourceType,
      rawExtractedText: raw,
      normalizedText: normalized,
      aiContext,
      metadata,
    };
  }

  // 4. Images (Multimodal passthrough)
  if (
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.webp') ||
    mimeType.startsWith('image/')
  ) {
    return {
      success: true,
      fallbackRequired: true, // Requires visual multimodal handling
      fallbackReason: 'Image source requires full visual multimodal understanding (charts, diagrams, layouts).',
      sourceType: 'image',
      rawExtractedText: `[Image Source: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`,
      normalizedText: `[Image Source: ${file.name}]`,
      aiContext: `[Image Source: ${file.name}]`,
      metadata: {
        method: 'raw_multimodal_passthrough',
        sourceType: 'image',
        extractedCharacterCount: 0,
        normalizedCharacterCount: 0,
        wordCount: 0,
        estimatedTokens: 300,
        extractionSuccessful: true,
        fallbackRequired: true,
        fallbackReason: 'Visual multimodal input',
        preprocessingApplied: ['multimodal_visual_routing'],
      },
    };
  }

  // 5. Default/Other Media (audio/video)
  return {
    success: true,
    fallbackRequired: true,
    fallbackReason: 'Media file routed to multimodal processing.',
    sourceType: 'file',
    rawExtractedText: `[Attached Media: ${file.name}]`,
    normalizedText: `[Attached Media: ${file.name}]`,
    aiContext: `[Attached Media: ${file.name}]`,
    metadata: {
      method: 'raw_multimodal_passthrough',
      sourceType: 'file',
      extractedCharacterCount: 0,
      normalizedCharacterCount: 0,
      wordCount: 0,
      estimatedTokens: 0,
      extractionSuccessful: true,
      fallbackRequired: true,
      preprocessingApplied: ['media_passthrough'],
    },
  };
}

/**
 * Preprocess raw text input directly.
 */
export function preprocessRawText(text: string): PreprocessingResult {
  const normalized = normalizeText(text);
  const signals = extractSignals(normalized);
  const estTokens = estimateTokens(normalized);
  const wordCount = normalized.trim().split(/\s+/).length;

  const metadata: PreprocessingMetadata = {
    method: 'client_text_normalization',
    sourceType: 'text',
    extractedCharacterCount: text.length,
    normalizedCharacterCount: normalized.length,
    wordCount,
    estimatedTokens: estTokens,
    extractionSuccessful: true,
    fallbackRequired: false,
    preprocessingApplied: ['unicode_normalization', 'whitespace_cleanup', 'signal_detection'],
    detectedSignals: signals,
  };

  const aiContext = buildAIContext('text', normalized, metadata, signals);

  return {
    success: true,
    fallbackRequired: false,
    sourceType: 'text',
    rawExtractedText: text,
    normalizedText: normalized,
    aiContext,
    metadata,
  };
}
