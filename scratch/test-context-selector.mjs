// Direct test of Context Selection algorithms & reduction metrics
const OUTPUT_TOKEN_BUDGETS = {
  x_post: 3000,
  linkedin_post: 4000,
  executive_summary: 5000,
  infographic: 5000,
  advisory: 8000,
  video: 8000,
  presentation: 10000,
};

function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function estimateObjectTokens(obj) {
  if (!obj) return 0;
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return estimateTokens(str);
}

function selectContextForOutput(canonical, outputType, requirements) {
  const originalEstimatedTokens = estimateObjectTokens(canonical);
  const maxTokenBudget = requirements?.maxTokens || OUTPUT_TOKEN_BUDGETS[outputType] || 5000;

  const selectedFields = ['sourceSummary'];
  const excludedFields = [];
  const selectionReason = [];

  let facts = [];
  let entities = [];
  let figures = [];
  let dates = [];
  let locations = [];
  let events = [];
  let actions = [];
  let tables = [];
  let quotes = [];
  let sourceReferences = [];
  let sections = [];

  const allFacts = canonical.facts || [];
  const allEntities = canonical.entities || [];
  const allFigures = canonical.figures || [];
  const allDates = canonical.dates || [];
  const allLocations = canonical.locations || [];
  const allEvents = canonical.events || [];
  const allActions = canonical.actions || [];
  const allTables = canonical.tables || [];
  const allQuotes = canonical.quotes || [];

  switch (outputType) {
    case 'x_post':
      facts = allFacts.filter((f) => f.importance === 'high').slice(0, 3);
      figures = allFigures.slice(0, 4);
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high').slice(0, 1);
      quotes = allQuotes.slice(0, 1);
      dates = allDates.slice(0, 2);
      excludedFields.push('tables', 'sections', 'sourceReferences', 'locations', 'low_priority_facts');
      selectionReason.push('Aggressive context pruning for high-impact 280-character thread constraint');
      break;

    case 'linkedin_post':
      facts = allFacts.filter((f) => f.importance === 'high' || f.importance === 'medium').slice(0, 5);
      figures = allFigures.slice(0, 6);
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high').slice(0, 3);
      quotes = allQuotes.slice(0, 2);
      entities = allEntities.slice(0, 4);
      dates = allDates.slice(0, 3);
      excludedFields.push('tables', 'sections', 'sourceReferences', 'low_priority_facts');
      selectionReason.push('Preserved high-impact business metrics, thought leadership takeaways, and key actions');
      break;

    case 'infographic':
      figures = allFigures;
      tables = allTables;
      facts = allFacts.filter((f) => f.importance === 'high' || f.importance === 'medium').slice(0, 6);
      entities = allEntities.slice(0, 8);
      dates = allDates.slice(0, 5);
      actions = allActions.slice(0, 3);
      excludedFields.push('quotes', 'sections', 'sourceReferences', 'narrative_prose');
      selectionReason.push('Maximized quantitative figures, data tables, and high-impact visual datapoints');
      break;

    case 'advisory':
      facts = allFacts;
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high');
      figures = allFigures;
      entities = allEntities;
      dates = allDates;
      events = allEvents;
      tables = allTables;
      quotes = allQuotes;
      excludedFields.push('low_priority_actions', 'casual_narrative');
      selectionReason.push('Retained security context, vulnerabilities, prioritized remediation steps, and risk factors');
      break;

    case 'executive_summary':
      facts = allFacts.filter((f) => f.importance === 'high' || f.importance === 'medium').slice(0, 8);
      figures = allFigures.slice(0, 8);
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high').slice(0, 5);
      entities = allEntities.slice(0, 6);
      dates = allDates.slice(0, 4);
      events = allEvents.slice(0, 3);
      tables = allTables.slice(0, 2);
      quotes = allQuotes.slice(0, 2);
      excludedFields.push('low_priority_facts', 'raw_sections', 'exhaustive_references');
      selectionReason.push('Distilled strategic high-level takeaways, macro figures, and critical organizational actions');
      break;

    case 'presentation':
      facts = allFacts.filter((f) => f.importance === 'high' || f.importance === 'medium');
      figures = allFigures;
      actions = allActions;
      entities = allEntities;
      dates = allDates;
      events = allEvents;
      tables = allTables;
      quotes = allQuotes.slice(0, 3);
      sections = canonical.sections || [];
      excludedFields.push('low_priority_facts');
      selectionReason.push('Preserved comprehensive slide narrative structures, key milestones, and speaker quotes');
      break;

    case 'video':
      facts = allFacts.filter((f) => f.importance === 'high' || f.importance === 'medium').slice(0, 6);
      figures = allFigures.slice(0, 6);
      events = allEvents;
      quotes = allQuotes;
      actions = allActions.filter((a) => a.priority === 'critical' || a.priority === 'high');
      entities = allEntities.slice(0, 5);
      excludedFields.push('tables', 'sections', 'sourceReferences', 'low_priority_facts');
      selectionReason.push('Selected dynamic storytelling elements, memorable soundbites, and dramatic visual hooks');
      break;
  }

  if (facts.length > 0) selectedFields.push('facts');
  if (entities.length > 0) selectedFields.push('entities');
  if (figures.length > 0) selectedFields.push('figures');
  if (dates.length > 0) selectedFields.push('dates');
  if (locations.length > 0) selectedFields.push('locations');
  if (events.length > 0) selectedFields.push('events');
  if (actions.length > 0) selectedFields.push('actions');
  if (tables.length > 0) selectedFields.push('tables');
  if (quotes.length > 0) selectedFields.push('quotes');
  if (sourceReferences.length > 0) selectedFields.push('sourceReferences');
  if (sections.length > 0) selectedFields.push('sections');

  const selectedPayload = {
    sourceSummary: canonical.summary,
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
  };

  const estimatedTokens = estimateObjectTokens(selectedPayload);
  const reductionRatio = originalEstimatedTokens > 0
    ? Math.max(0, Math.round((1 - estimatedTokens / originalEstimatedTokens) * 1000) / 10)
    : 0;

  return {
    outputType,
    sourceSummary: canonical.summary,
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
    estimatedTokens,
    originalEstimatedTokens,
    reductionRatio,
    selectionReason,
  };
}

function selectContextsForOutputs(canonical, outputTypes, requirements) {
  const result = {};
  outputTypes.forEach((type) => {
    result[type] = selectContextForOutput(canonical, type, requirements);
  });
  return result;
}

function buildContextSelectionMetadata(selectedContexts, originalCanonical) {
  const originalTokens = estimateObjectTokens(originalCanonical);
  let totalSelectedTokens = 0;
  const outputProfiles = {};

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

const mockCanonical = {
  summary: "Acme Corp announced Q3 2026 revenue of $42.5M (+18% YoY) and expanded its European cloud operations into Frankfurt. However, 2 high-severity vulnerabilities (CVE-2026-8812) were discovered in legacy API clusters, necessitating urgent patching by Nov 15, 2026.",
  facts: [
    { id: "f1", statement: "Acme Corp reported $42.5M revenue in Q3 2026, representing 18% YoY growth.", importance: "high", confidence: 0.99 },
    { id: "f2", statement: "European cloud operations expanded into Frankfurt datacenter cluster EU-Central-1.", importance: "medium", confidence: 0.95 },
    { id: "f3", statement: "Security audit identified CVE-2026-8812 in legacy API gateway with CVSS score 8.8.", importance: "high", confidence: 0.98 },
    { id: "f4", statement: "Minor branding guideline adjustments were published on the internal wiki.", importance: "low", confidence: 0.8 },
    { id: "f5", statement: "Engineering team hosted a pizza lunch on Friday afternoon.", importance: "low", confidence: 0.7 }
  ],
  figures: [
    { id: "fig1", value: "$42.5M", label: "Q3 2026 Revenue", context: "18% year-over-year increase" },
    { id: "fig2", value: "+18%", label: "YoY Growth", context: "Compared to Q3 2025" },
    { id: "fig3", value: "8.8", label: "CVSS Severity Score", context: "CVE-2026-8812 API vulnerability" },
    { id: "fig4", value: "350+", label: "New Enterprise Customers", context: "Onboarded in Q3" }
  ],
  actions: [
    { id: "a1", action: "Deploy emergency patch for CVE-2026-8812 to all edge gateways", priority: "critical", deadline: "Nov 15, 2026", rationale: "Prevents unauthorized token bypass" },
    { id: "a2", action: "Scale Frankfurt datacenter capacity by 40%", priority: "high", deadline: "Dec 01, 2026", rationale: "Support European customer influx" },
    { id: "a3", action: "Review internal wiki navigation sidebar links", priority: "low", rationale: "Routine documentation hygiene" }
  ],
  dates: [
    { id: "d1", value: "Q3 2026", context: "Financial reporting period" },
    { id: "d2", value: "Nov 15, 2026", context: "Security patching deadline" }
  ],
  locations: [
    { id: "l1", name: "Frankfurt", context: "New EU cloud region" }
  ],
  events: [
    { id: "e1", title: "Q3 Earnings Call", date: "Oct 28, 2026", description: "Executive leadership presented quarterly performance" }
  ],
  entities: [
    { id: "e1", name: "Acme Corp", type: "organization" },
    { id: "e2", name: "CVE-2026-8812", type: "product" },
    { id: "e3", name: "EU-Central-1", type: "technology" }
  ],
  tables: [
    {
      id: "t1",
      title: "Quarterly Revenue Breakdown by Region",
      headers: ["Region", "Q3 2025 ($M)", "Q3 2026 ($M)", "Growth"],
      rows: [
        ["North America", "22.0", "25.5", "+15.9%"],
        ["EMEA", "10.0", "12.5", "+25.0%"],
        ["APAC", "4.0", "4.5", "+12.5%"]
      ]
    }
  ],
  quotes: [
    { id: "q1", text: "Our European expansion and enterprise momentum drove exceptional Q3 results.", speaker: "Jane Doe", role: "CEO" }
  ],
  sourceReferences: [
    { id: "sr1", source: "SEC Form 10-Q", type: "document" }
  ],
  sections: [
    { title: "Financial Overview", level: 1, content: "Complete quarterly report analysis..." }
  ],
  topics: ["earnings", "cloud-expansion", "cybersecurity", "q3-2026"],
  contentType: "report",
  language: "en"
};

const allOutputTypes = [
  'executive_summary',
  'advisory',
  'linkedin_post',
  'x_post',
  'infographic',
  'presentation',
  'video'
];

const selectedContexts = selectContextsForOutputs(mockCanonical, allOutputTypes);
const metadata = buildContextSelectionMetadata(selectedContexts, mockCanonical);

console.log('================================================================');
console.log('   DOCCRAFT PHASE C DETERMINISTIC CONTEXT SELECTOR AUDIT        ');
console.log('================================================================');
console.log(`Original Canonical Graph Tokens : ~${metadata.originalTokens}`);
console.log(`Average Selected Tokens Payload : ~${metadata.selectedTokens}`);
console.log(`Consolidated Token Reduction    : -${metadata.reductionRatio}%`);
console.log('----------------------------------------------------------------');

allOutputTypes.forEach((type) => {
  const ctx = selectedContexts[type];
  console.log(`\nDeliverable: [${type.toUpperCase()}]`);
  console.log(`  - Selected Tokens : ~${ctx.estimatedTokens} (Reduction: -${ctx.reductionRatio}%)`);
  console.log(`  - Retained Items  : Facts: ${ctx.facts.length}, Figures: ${ctx.figures.length}, Actions: ${ctx.actions.length}, Tables: ${ctx.tables.length}, Quotes: ${ctx.quotes.length}`);
  console.log(`  - Excluded Fields : ${ctx.excludedFields.join(', ') || 'None'}`);
  console.log(`  - Rationale       : ${ctx.selectionReason.join(' | ')}`);
});
console.log('\n================================================================');
