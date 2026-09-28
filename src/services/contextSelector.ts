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
  SourceReference,
  CanonicalSection,
} from '@/types/canonical';
import { ArtifactType } from '@/types/transformation';
import {
  ContextRequirements,
  SelectedAIContext,
  ContextSelectionMetadata,
} from '@/types/context';
import { estimateTokens } from './preprocessor';

/**
 * Output-specific default token budget limits (in tokens).
 */
export const OUTPUT_TOKEN_BUDGETS: Record<ArtifactType, number> = {
  x_post: 3000,
  linkedin_post: 4000,
  executive_summary: 5000,
  infographic: 5000,
  advisory: 8000,
  video: 8000,
  presentation: 10000,
};

/**
 * Calculate token estimation of an object or string.
 */
function estimateObjectTokens(obj: any): number {
  if (!obj) return 0;
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return estimateTokens(str);
}

/**
 * Deterministic Context Selector for a single output deliverable type.
 */
export function selectContextForOutput(
  canonical: CanonicalContent,
  outputType: ArtifactType,
  requirements?: ContextRequirements
): SelectedAIContext {
  const originalEstimatedTokens = estimateObjectTokens(canonical);
  const maxTokenBudget = requirements?.maxTokens || OUTPUT_TOKEN_BUDGETS[outputType] || 5000;

  const selectedFields: string[] = ['sourceSummary'];
  const excludedFields: string[] = [];
  const selectionReason: string[] = [];

  let facts: CanonicalFact[] = [];
  let entities: CanonicalEntity[] = [];
  let figures: CanonicalFigure[] = [];
  let dates: CanonicalDate[] = [];
  let locations: CanonicalLocation[] = [];
  let events: CanonicalEvent[] = [];
  let actions: CanonicalAction[] = [];
  let tables: CanonicalTable[] = [];
  let quotes: CanonicalQuote[] = [];
  let sourceReferences: SourceReference[] = [];
  let sections: CanonicalSection[] = [];

  const allFacts = canonical.facts || [];
  const allEntities = canonical.entities || [];
  const allFigures = canonical.figures || [];
  const allDates = canonical.dates || [];
  const allLocations = canonical.locations || [];
  const allEvents = canonical.events || [];
  const allActions = canonical.actions || [];
  const allTables = canonical.tables || [];
  const allQuotes = canonical.quotes || [];
  const allSections = canonical.sections || [];

  switch (outputType) {
    case 'executive_summary':
      // Prioritize high-importance facts, top figures, key dates, critical/high actions, major events
      facts = allFacts.filter((f) => f.importance === 'high');
      if (facts.length < 4) {
        facts = [...facts, ...allFacts.filter((f) => f.importance === 'medium').slice(0, 3)];
      }
      figures = allFigures.slice(0, 8);
      dates = allDates.slice(0, 5);
      events = allEvents.filter((e) => e.importance === 'high');
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high');
      entities = allEntities.slice(0, 6);
      locations = allLocations.slice(0, 4);

      selectedFields.push('facts (high)', 'figures', 'critical_actions', 'major_events', 'entities');
      excludedFields.push('tables', 'quotes', 'low_facts', 'verbose_sections');
      selectionReason.push('Tailored for executive distillation: prioritized high-impact findings, metrics, and strategic recommendations while omitting granular data tables.');
      break;

    case 'advisory':
      // Security / technical advisory: all high/med facts, actions, CVEs, dates, systems, tables, authoritative quotes
      facts = allFacts.filter((f) => f.importance === 'high' || f.importance === 'medium');
      figures = allFigures;
      dates = allDates;
      locations = allLocations;
      events = allEvents;
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high' || a.priority === 'medium');
      entities = allEntities;
      tables = allTables;
      quotes = allQuotes.filter((q) => q.speaker || q.role);
      sourceReferences = canonical.sourceReferences || [];
      sections = allSections;

      selectedFields.push('all_facts', 'security_actions', 'figures', 'dates', 'entities', 'tables', 'authoritative_quotes');
      excludedFields.push('low_priority_facts');
      selectionReason.push('Preserved comprehensive technical scope: retained CVE identifiers, mitigation workflows, impacted assets, and verification telemetry.');
      break;

    case 'linkedin_post':
      // Professional social: high facts, compelling metrics, key orgs, 1-2 authoritative quotes
      facts = allFacts.filter((f) => f.importance === 'high').slice(0, 5);
      figures = allFigures.slice(0, 5);
      entities = allEntities.slice(0, 4);
      dates = allDates.slice(0, 3);
      events = allEvents.filter((e) => e.importance === 'high').slice(0, 2);
      quotes = allQuotes.slice(0, 2);

      selectedFields.push('high_facts', 'key_metrics', 'entities', 'authoritative_quote');
      excludedFields.push('tables', 'internal_actions', 'detailed_sections', 'source_references');
      selectionReason.push('Optimized for LinkedIn professional audience: isolated key industry takeaways, compelling quantitative hooks, and thought-leadership quotes.');
      break;

    case 'x_post':
      // Ultra compact Twitter thread: top high facts, key metrics, major event
      facts = allFacts.filter((f) => f.importance === 'high').slice(0, 4);
      figures = allFigures.slice(0, 4);
      entities = allEntities.slice(0, 3);
      dates = allDates.slice(0, 2);
      events = allEvents.filter((e) => e.importance === 'high').slice(0, 1);
      actions = allActions.filter((a) => a.priority === 'critical').slice(0, 2);

      selectedFields.push('top_facts', 'top_figures', 'critical_action');
      excludedFields.push('tables', 'quotes', 'sections', 'source_references', 'medium_low_facts');
      selectionReason.push('Aggressively condensed for Twitter/X thread format: retained high-impact headlines, core metrics, and immediate call-to-action.');
      break;

    case 'infographic':
      // Visual & quantitative: ALL figures, statistics, tables, visual process actions, high facts
      figures = allFigures;
      facts = allFacts.filter((f) => f.importance === 'high' || (f.statement && /\d|%|\$|CVE/i.test(f.statement)));
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high');
      dates = allDates.slice(0, 6);
      tables = allTables.slice(0, 2);
      events = allEvents.slice(0, 4);
      entities = allEntities.slice(0, 6);

      selectedFields.push('all_figures', 'metrics', 'quantitative_tables', 'process_steps', 'key_facts');
      excludedFields.push('narrative_quotes', 'verbose_paragraphs', 'source_references');
      selectionReason.push('Configured for visual data storytelling: prioritized quantitative figures, structured tables, and sequential remediation steps.');
      break;

    case 'presentation':
      // Slide deck narrative: sections, structured facts, figures, timeline, tables, quotes
      sections = allSections;
      facts = allFacts.filter((f) => f.importance === 'high' || f.importance === 'medium');
      figures = allFigures.slice(0, 10);
      events = allEvents;
      dates = allDates;
      entities = allEntities;
      actions = allActions;
      tables = allTables;
      quotes = allQuotes.slice(0, 3);

      selectedFields.push('sections', 'facts', 'figures', 'events', 'tables', 'quotes');
      excludedFields.push('low_importance_noise');
      selectionReason.push('Preserved multi-slide narrative architecture: retained sectional breakdown, supporting facts, speaker quotes, and impact tables.');
      break;

    case 'video':
      // Chronology and scene narrative: events, timeline, high facts, voiceover actions, locations
      events = allEvents;
      dates = allDates;
      facts = allFacts.filter((f) => f.importance === 'high' || f.importance === 'medium');
      figures = allFigures.slice(0, 6);
      locations = allLocations;
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high');
      entities = allEntities.slice(0, 6);
      quotes = allQuotes.slice(0, 2);
      sections = allSections;

      selectedFields.push('chronological_events', 'timeline_dates', 'voiceover_facts', 'locations', 'actions');
      excludedFields.push('data_tables', 'complex_source_references');
      selectionReason.push('Structured for storyboard scene pacing: prioritized chronological timeline, visual scene actions, and concise voiceover facts.');
      break;

    default:
      facts = allFacts.filter((f) => f.importance === 'high');
      figures = allFigures.slice(0, 6);
      selectedFields.push('facts', 'figures');
  }

  // Calculate estimated tokens of the selected context
  const selectedContextDraft: SelectedAIContext = {
    outputType,
    sourceSummary: canonical.summary || '',
    facts,
    entities,
    figures,
    dates,
    locations,
    events,
    actions,
    tables,
    quotes,
    sourceReferences,
    sections,
    selectedFields,
    excludedFields,
    estimatedTokens: 0,
    originalEstimatedTokens,
    reductionRatio: 0,
    selectionReason,
  };

  let estimatedTokens = estimateObjectTokens(selectedContextDraft);

  // If over budget, trim lower priority entities/dates safely without touching high facts or critical actions
  if (estimatedTokens > maxTokenBudget) {
    if (quotes.length > 1) quotes = quotes.slice(0, 1);
    if (tables.length > 1) tables = tables.slice(0, 1);
    if (locations.length > 3) locations = locations.slice(0, 3);
    if (entities.length > 5) entities = entities.slice(0, 5);

    selectedContextDraft.quotes = quotes;
    selectedContextDraft.tables = tables;
    selectedContextDraft.locations = locations;
    selectedContextDraft.entities = entities;

    estimatedTokens = estimateObjectTokens(selectedContextDraft);
  }

  selectedContextDraft.estimatedTokens = estimatedTokens;

  // Calculate reduction ratio safely
  const ratio = originalEstimatedTokens > 0
    ? Math.max(0, Math.round((1 - estimatedTokens / originalEstimatedTokens) * 1000) / 10)
    : 0;

  selectedContextDraft.reductionRatio = ratio;

  return selectedContextDraft;
}

/**
 * Select reduced contexts for all requested output formats in a single pass.
 */
export function selectContextsForOutputs(
  canonical: CanonicalContent,
  outputTypes: ArtifactType[],
  requirements?: ContextRequirements
): Record<ArtifactType, SelectedAIContext> {
  const result: Partial<Record<ArtifactType, SelectedAIContext>> = {};

  outputTypes.forEach((type) => {
    result[type] = selectContextForOutput(canonical, type, requirements);
  });

  return result as Record<ArtifactType, SelectedAIContext>;
}

/**
 * Build consolidated ContextSelectionMetadata to persist in source_documents.
 */
export function buildContextSelectionMetadata(
  selectedContexts: Record<string, SelectedAIContext>,
  originalCanonical: CanonicalContent
): ContextSelectionMetadata {
  const originalTokens = estimateObjectTokens(originalCanonical);

  let totalSelectedTokens = 0;
  const outputProfiles: ContextSelectionMetadata['outputProfiles'] = {};

  Object.entries(selectedContexts).forEach(([type, ctx]) => {
    totalSelectedTokens += ctx.estimatedTokens;
    outputProfiles[type] = {
      selectedFields: ctx.selectedFields,
      excludedFields: ctx.excludedFields,
      estimatedTokens: ctx.estimatedTokens,
      reductionRatio: ctx.reductionRatio,
      factCount: ctx.facts.length,
      figureCount: ctx.figures.length,
      actionCount: ctx.actions.length,
      tableCount: ctx.tables.length,
      quoteCount: ctx.quotes.length,
    };
  });

  const avgSelectedTokens = Object.keys(selectedContexts).length > 0
    ? Math.round(totalSelectedTokens / Object.keys(selectedContexts).length)
    : 0;

  const reductionRatio = originalTokens > 0
    ? Math.max(0, Math.round((1 - avgSelectedTokens / originalTokens) * 1000) / 10)
    : 0;

  return {
    method: 'deterministic_output_aware_selection',
    originalTokens,
    selectedTokens: avgSelectedTokens,
    reductionRatio,
    outputProfiles,
    selectedAt: new Date().toISOString(),
  };
}

/**
 * Formats a clean, structured payload of selected contexts ready for Gemini prompt ingestion.
 */
export function formatSelectedContextForPrompt(
  selectedContexts: Record<string, SelectedAIContext>
): string {
  const sections: string[] = [];

  Object.entries(selectedContexts).forEach(([type, ctx]) => {
    const lines: string[] = [
      `=== TARGET OUTPUT CONTEXT: ${type.toUpperCase()} ===`,
      `Estimated Context Tokens: ~${ctx.estimatedTokens} (Reduction: -${ctx.reductionRatio}%)`,
      `Summary: ${ctx.sourceSummary}`,
    ];

    if (ctx.facts.length > 0) {
      lines.push(`Key Facts (${ctx.facts.length}):`);
      ctx.facts.forEach((f) => lines.push(`- [${f.importance.toUpperCase()}] ${f.statement}`));
    }

    if (ctx.figures.length > 0) {
      lines.push(`Key Figures & Metrics (${ctx.figures.length}):`);
      ctx.figures.forEach((f) => lines.push(`- ${f.value}: ${f.label || ''} ${f.context ? `(${f.context})` : ''}`));
    }

    if (ctx.actions.length > 0) {
      lines.push(`Required Actions (${ctx.actions.length}):`);
      ctx.actions.forEach((a) => lines.push(`- [${a.priority.toUpperCase()}] ${a.action} ${a.deadline ? `(Deadline: ${a.deadline})` : ''}`));
    }

    if (ctx.dates.length > 0) {
      lines.push(`Dates: ${ctx.dates.map((d) => d.value).join(', ')}`);
    }

    if (ctx.entities.length > 0) {
      lines.push(`Entities: ${ctx.entities.map((e) => `${e.name} (${e.type})`).join(', ')}`);
    }

    if (ctx.events.length > 0) {
      lines.push(`Events:`);
      ctx.events.forEach((e) => lines.push(`- ${e.title}: ${e.description}`));
    }

    if (ctx.tables.length > 0) {
      lines.push(`Tables:`);
      ctx.tables.forEach((t) => {
        lines.push(`| ${t.headers.join(' | ')} |`);
        lines.push(`| ${t.headers.map(() => '---').join(' | ')} |`);
        t.rows.forEach((r) => lines.push(`| ${r.join(' | ')} |`));
      });
    }

    if (ctx.quotes.length > 0) {
      lines.push(`Direct Quotes:`);
      ctx.quotes.forEach((q) => lines.push(`- "${q.text}" — ${q.speaker || 'Source'}`));
    }

    sections.push(lines.join('\n'));
  });

  return sections.join('\n\n');
}
