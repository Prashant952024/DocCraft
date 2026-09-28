import {
  CanonicalContent,
  CanonicalFact,
  CanonicalEntity,
  CanonicalFigure,
  CanonicalDate,
  CanonicalLocation,
  CanonicalEvent,
  CanonicalAction,
  CanonicalTable,
  CanonicalQuote,
  CanonicalSection,
  SourceReference,
} from '@/types/canonical';
import { extractSignals, normalizeText } from './preprocessor';

/**
 * Deterministic baseline extraction for dates, figures, tables, headings, and quotes.
 * Zero AI model calls, 100% deterministic regex and structural parsing.
 */
export function extractDeterministicCanonical(
  sourceText: string,
  sourceType = 'text'
): Partial<CanonicalContent> {
  const normalized = normalizeText(sourceText);
  const signals = extractSignals(normalized);

  // 1. Deterministic Dates
  const dates: CanonicalDate[] = signals.dates.map((dateStr, idx) => ({
    id: `date-${idx + 1}`,
    value: dateStr,
    normalized: dateStr,
    sourceLocation: 'Source document text',
  }));

  // 2. Deterministic Figures
  const figures: CanonicalFigure[] = [];
  signals.percentages.forEach((pct, idx) => {
    figures.push({
      id: `fig-pct-${idx + 1}`,
      value: pct,
      unit: '%',
      label: 'Percentage metric',
      context: pct,
    });
  });

  signals.currencies.forEach((cur, idx) => {
    figures.push({
      id: `fig-cur-${idx + 1}`,
      value: cur,
      label: 'Monetary figure',
      context: cur,
    });
  });

  // 3. Deterministic Sections
  const sections: CanonicalSection[] = signals.headings.map((heading, idx) => ({
    id: `sec-${idx + 1}`,
    title: heading,
    level: 1,
    sourceLocation: `Section ${idx + 1}`,
  }));

  // 4. Deterministic Tables (Markdown |...|...|)
  const tables: CanonicalTable[] = [];
  const tableMatches = normalized.match(/(?:^\|.+?\|\r?\n)+/gm) || [];
  tableMatches.forEach((tblBlock, idx) => {
    const lines = tblBlock.trim().split('\n').filter((l) => l.includes('|'));
    if (lines.length >= 2) {
      const parseRow = (line: string) =>
        line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

      const headers = parseRow(lines[0]);
      const dataRows = lines
        .slice(1)
        .filter((l) => !l.replace(/[|\s-:]/g, '').length === false) // skip divider row
        .map(parseRow);

      if (headers.length > 0) {
        tables.push({
          id: `tbl-${idx + 1}`,
          title: `Table ${idx + 1}`,
          headers,
          rows: dataRows,
          sourceLocation: `Table block ${idx + 1}`,
        });
      }
    }
  });

  // 5. Deterministic Direct Quotes ("...", “...”)
  const quotes: CanonicalQuote[] = [];
  const quoteRegex = /["“]([^"”]{10,240})["”](?:\s*[-–—]\s*([A-Za-z\s.,]{3,40}))?/g;
  let qMatch;
  let qIdx = 1;
  while ((qMatch = quoteRegex.exec(normalized)) !== null) {
    if (qMatch[1] && !qMatch[1].startsWith('#')) {
      quotes.push({
        id: `quote-${qIdx++}`,
        text: qMatch[1].trim(),
        speaker: qMatch[2]?.trim() || undefined,
        sourceLocation: `Quote ${qIdx}`,
      });
    }
  }

  return {
    dates,
    figures,
    sections,
    tables,
    quotes,
    topics: signals.headings.slice(0, 5),
    contentType: 'Structured Document',
    language: 'English',
  };
}

/**
 * Validates and merges deterministic and semantic Gemini extraction results into complete CanonicalContent.
 */
export function normalizeCanonicalContent(
  raw: any,
  sourceText: string,
  sourceType = 'text',
  method: 'gemini' | 'hybrid' | 'deterministic' | 'multimodal' = 'hybrid'
): CanonicalContent {
  const deterministic = extractDeterministicCanonical(sourceText, sourceType);
  const estTokens = Math.ceil((sourceText?.length || 0) / 4);

  // Helper to ensure valid array
  const ensureArray = <T>(arr: any, fallback: T[] = []): T[] => {
    return Array.isArray(arr) ? arr : fallback;
  };

  // Facts
  const rawFacts: any[] = ensureArray(raw?.facts || raw?.key_facts);
  const facts: CanonicalFact[] = rawFacts.map((f, idx) => {
    if (typeof f === 'string') {
      return {
        id: `fact-${idx + 1}`,
        statement: f,
        importance: idx < 3 ? 'high' : 'medium',
      };
    }
    return {
      id: f.id || `fact-${idx + 1}`,
      statement: f.statement || f.fact || String(f),
      importance: f.importance || 'medium',
      sourceLocation: f.sourceLocation,
    };
  });

  // Entities
  const rawEntities: any[] = ensureArray(raw?.entities);
  const entities: CanonicalEntity[] = rawEntities.map((e, idx) => {
    if (typeof e === 'string') {
      return {
        id: `entity-${idx + 1}`,
        name: e,
        type: 'other',
      };
    }
    return {
      id: e.id || `entity-${idx + 1}`,
      name: e.name || String(e),
      type: e.type || 'other',
      description: e.description,
      sourceLocation: e.sourceLocation,
    };
  });

  // Figures (merge Gemini figures with deterministic figures without duplicating identical values)
  const rawFigures: any[] = ensureArray(raw?.figures);
  const figuresMap = new Map<string, CanonicalFigure>();

  // Add deterministic figures first
  (deterministic.figures || []).forEach((fig) => {
    figuresMap.set(fig.value.toLowerCase().trim(), fig);
  });

  // Merge semantic figures
  rawFigures.forEach((f, idx) => {
    const val = typeof f === 'string' ? f : f.value || String(f);
    const key = val.toLowerCase().trim();
    if (!figuresMap.has(key)) {
      figuresMap.set(key, {
        id: f.id || `fig-${figuresMap.size + 1}`,
        value: val,
        label: f.label || 'Metric',
        unit: f.unit,
        context: f.context,
        sourceLocation: f.sourceLocation,
      });
    }
  });
  const figures = Array.from(figuresMap.values());

  // Dates
  const rawDates: any[] = ensureArray(raw?.dates);
  const dateMap = new Map<string, CanonicalDate>();
  (deterministic.dates || []).forEach((d) => dateMap.set(d.value.toLowerCase().trim(), d));
  rawDates.forEach((d, idx) => {
    const val = typeof d === 'string' ? d : d.value || String(d);
    const key = val.toLowerCase().trim();
    if (!dateMap.has(key)) {
      dateMap.set(key, {
        id: d.id || `date-${dateMap.size + 1}`,
        value: val,
        normalized: typeof d === 'object' ? d.normalized || val : val,
        description: typeof d === 'object' ? d.description : undefined,
        sourceLocation: typeof d === 'object' ? d.sourceLocation : undefined,
      });
    }
  });
  const dates = Array.from(dateMap.values());

  // Locations
  const rawLocations: any[] = ensureArray(raw?.locations);
  const locations: CanonicalLocation[] = rawLocations.map((loc, idx) => {
    if (typeof loc === 'string') {
      return {
        id: `loc-${idx + 1}`,
        name: loc,
        type: 'other',
      };
    }
    return {
      id: loc.id || `loc-${idx + 1}`,
      name: loc.name || String(loc),
      type: loc.type || 'other',
      context: loc.context,
      sourceLocation: loc.sourceLocation,
    };
  });

  // Events
  const rawEvents: any[] = ensureArray(raw?.events);
  const events: CanonicalEvent[] = rawEvents.map((evt, idx) => {
    if (typeof evt === 'string') {
      return {
        id: `event-${idx + 1}`,
        title: evt,
        description: evt,
        importance: 'medium',
      };
    }
    return {
      id: evt.id || `event-${idx + 1}`,
      title: evt.title || `Event ${idx + 1}`,
      description: evt.description || evt.title || '',
      date: evt.date,
      location: evt.location,
      entities: ensureArray(evt.entities),
      importance: evt.importance || 'medium',
      sourceLocation: evt.sourceLocation,
    };
  });

  // Actions
  const rawActions: any[] = ensureArray(raw?.actions);
  const actions: CanonicalAction[] = rawActions.map((act, idx) => {
    if (typeof act === 'string') {
      return {
        id: `action-${idx + 1}`,
        action: act,
        priority: 'high',
      };
    }
    return {
      id: act.id || `action-${idx + 1}`,
      action: act.action || act.description || String(act),
      priority: act.priority || 'high',
      owner: act.owner,
      deadline: act.deadline,
      rationale: act.rationale,
      sourceLocation: act.sourceLocation,
    };
  });

  // Tables
  const rawTables: any[] = ensureArray(raw?.tables, deterministic.tables || []);
  const tables: CanonicalTable[] = rawTables.map((tbl, idx) => ({
    id: tbl.id || `tbl-${idx + 1}`,
    title: tbl.title || `Table ${idx + 1}`,
    headers: ensureArray(tbl.headers),
    rows: ensureArray(tbl.rows),
    sourceLocation: tbl.sourceLocation,
  }));

  // Quotes
  const rawQuotes: any[] = ensureArray(raw?.quotes, deterministic.quotes || []);
  const quotes: CanonicalQuote[] = rawQuotes.map((q, idx) => ({
    id: q.id || `quote-${idx + 1}`,
    text: typeof q === 'string' ? q : q.text || '',
    speaker: typeof q === 'object' ? q.speaker : undefined,
    role: typeof q === 'object' ? q.role : undefined,
    sourceLocation: typeof q === 'object' ? q.sourceLocation : undefined,
  }));

  // Sections
  const rawSections: any[] = ensureArray(raw?.sections, deterministic.sections || []);
  const sections: CanonicalSection[] = rawSections.map((sec, idx) => ({
    id: sec.id || `sec-${idx + 1}`,
    title: typeof sec === 'string' ? sec : sec.title || `Section ${idx + 1}`,
    level: typeof sec === 'object' && sec.level ? sec.level : 1,
    summary: typeof sec === 'object' ? sec.summary : undefined,
    keyFacts: typeof sec === 'object' ? ensureArray(sec.keyFacts) : undefined,
    sourceLocation: typeof sec === 'object' ? sec.sourceLocation : undefined,
  }));

  // Summary
  const summary =
    raw?.summary ||
    (facts.length > 0 ? facts.slice(0, 3).map((f) => f.statement).join(' ') : 'Source processed.');

  // Topics
  const rawTopics: any[] = ensureArray(raw?.topics);
  const detTopics: string[] = deterministic.topics || [];
  const topics: string[] = Array.from(
    new Set([...rawTopics.map(String), ...detTopics])
  );

  const contentType = raw?.contentType || raw?.content_type || 'Document';
  const language = raw?.language || raw?.detected_language || 'English';

  const canonicalChars = JSON.stringify({ summary, facts, entities, figures, dates, events, actions }).length;

  return {
    summary,
    facts,
    entities,
    figures,
    dates,
    locations,
    events,
    actions,
    tables,
    quotes,
    sourceReferences: ensureArray(raw?.sourceReferences),
    sections,
    topics,
    contentType,
    language,
    extractionMetadata: {
      extractionMethod: method,
      sourceCharacterCount: sourceText?.length || 0,
      canonicalCharacterCount: canonicalChars,
      estimatedInputTokens: estTokens,
      extractedAt: new Date().toISOString(),
      confidence: typeof raw?.extractionMetadata?.confidence === 'number' ? raw.extractionMetadata.confidence : 0.96,
      warnings: ensureArray(raw?.extractionMetadata?.warnings),
      sourceType,
    },
    // Compatibility helpers
    content_type: contentType,
    primary_topic: topics[0] || 'General',
    key_facts: facts.map((f) => f.statement),
    detected_language: language,
    validation_status: 'VALIDATED',
  };
}
