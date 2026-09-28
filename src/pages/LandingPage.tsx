import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroVisualPipeline } from '@/components/landing/HeroVisualPipeline';
import { ShowcaseInteractive } from '@/components/landing/ShowcaseInteractive';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LinkedInIcon, XTwitterIcon } from '@/components/ui/BrandIcons';
import {
  Sparkles,
  ArrowRight,
  Shield,
  ShieldCheck,
  CheckCircle2,
  FileText,
  UploadCloud,
  Globe,
  FileCheck2,
  AlertTriangle,
  BarChart3,
  Presentation,
  Video,
  Database,
  Lock,
  Cpu,
  Layers,
  Check,
  FileSpreadsheet,
  Terminal,
  Clock,
  Eye,
  Edit3,
  Sliders,
  FolderSync,
  Hash,
  Scale,
  Users,
} from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#080c14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-radial-grid opacity-60 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-600/10 via-blue-600/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Navigation */}
      <LandingNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI-Powered Content Transformation</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            One Source.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Every Format.
            </span>
          </h1>

          {/* Supporting line & Paragraph */}
          <p className="text-lg md:text-xl font-medium text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Turn complex information into communication-ready content with AI.
          </p>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            DocCraft analyzes multimodal source content and transforms it into structured, audience-ready deliverables — from advisories and executive summaries to presentations, infographics, social posts, and video packages.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="glow" size="lg" icon={<Sparkles className="h-5 w-5" />}>
                  Open Intelligence Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="glow" size="lg" icon={<ArrowRight className="h-5 w-5" />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Sign In to Platform
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Trust Status Line */}
          <div className="pt-2 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span>Multimodal Ingestion</span>
            <span>•</span>
            <span>Gemini AI Engine</span>
            <span>•</span>
            <span>Cryptographic SHA-256 Provenance</span>
            <span>•</span>
            <span>Human-in-the-Loop Review</span>
          </div>
        </div>

        {/* Hero SaaS Pipeline Visual Preview */}
        <div className="mt-16 md:mt-20">
          <HeroVisualPipeline />
        </div>
      </section>

      {/* 2. PROBLEM -> SOLUTION SECTION */}
      <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
              THE TRANSFORMATION CHALLENGE
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              From information overload to communication-ready content.
            </h2>
            <p className="text-sm text-slate-400">
              Technical, cybersecurity, and operational teams struggle to communicate raw findings across multiple organizational stakeholders.
            </p>
          </div>

          {/* Problem Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-white">Multiple Information Formats</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Important information arrives as reports, PDFs, images, articles, advisories, and free-form text with fragmented structures.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-white">Manual Transformation Overhead</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turning one source into multiple communication formats takes hours of repeated rewriting, formatting, and manual synthesis.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-white">Audience-Specific Requirements</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The same source requires completely different register and detail for C-suite executives, engineering teams, and public channels.
              </p>
            </div>
          </div>

          {/* Solution Banner */}
          <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-blue-950/40 p-8 text-center space-y-3 shadow-xl shadow-cyan-950/20">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 font-mono">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              THE DOCCRAFT SOLUTION
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white">
              A unified transformation pipeline that understands once and generates everywhere.
            </h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              DocCraft ingests raw material, establishes a canonical factual representation, and transforms that core intelligence into tailored executive briefs, advisory memos, presentations, infographics, and social campaigns simultaneously.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 CONNECTED STEPS) */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
              ORCHESTRATION WORKFLOW
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              How DocCraft Works
            </h2>
            <p className="text-sm text-slate-400">
              Four structured phases from raw multimodal ingestion to approved communication deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 01 */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    STEP 01
                  </span>
                  <UploadCloud className="h-5 w-5 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-white">Provide the Source</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload or paste: PDF, DOCX, image schematics, raw markdown text, URLs, or incident reports.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300">
                SHA-256 Integrity Hashed
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    STEP 02
                  </span>
                  <Cpu className="h-5 w-5 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-white">Understand Content</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gemini multimodal AI analyzes context, key facts, identified entities, topics, timelines, and intent.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[10px] font-mono text-blue-300">
                Canonical Synthesis
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    STEP 03
                  </span>
                  <Sliders className="h-5 w-5 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-white">Transform Format</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select multiple target outputs and tune audience, tone, language, detail level, and objectives.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[10px] font-mono text-purple-300">
                Multi-Channel Synthesis
              </div>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    STEP 04
                  </span>
                  <CheckCircle2 className="h-5 w-5 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-white">Review & Approve</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspect specialized UI renderers, edit content inline, and grant operator approval before export.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-[10px] font-mono text-emerald-300">
                Human-in-the-Loop Locked
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MULTIMODAL INPUT & OUTPUT SECTIONS */}
      <section id="inputs-outputs" className="py-20 md:py-28 px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-7xl space-y-20">
          {/* Part A: Multimodal Inputs */}
          <div>
            <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
                SUPPORTED INPUT MODALITIES
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Start with what you already have.
              </h2>
              <p className="text-sm text-slate-400">
                Directly ingest diverse document and data formats without pre-formatting.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'PDF Documents', desc: 'Extract and understand structured reports and technical advisories.', icon: FileText, tag: 'Document' },
                { title: 'Image Schematics', desc: 'Analyze architecture diagrams, charts, and infographics via multimodal AI.', icon: UploadCloud, tag: 'Visual' },
                { title: 'Text & Markdown', desc: 'Transform raw notes, meeting minutes, and markdown transcripts.', icon: FileSpreadsheet, tag: 'Text' },
                { title: 'Web URLs', desc: 'Record and synthesize external news releases, blog posts, and articles.', icon: Globe, tag: 'Web' },
                { title: 'Cyber Advisories', desc: 'Ingest CVE records, vulnerability notes, and incident bulletins.', icon: AlertTriangle, tag: 'Security' },
                { title: 'DOCX Files', desc: 'Process word processing documents and enterprise policy briefs.', icon: FileCheck2, tag: 'Document' },
                { title: 'Audio Scripts', desc: 'Ingest audio transcripts and recorded executive briefings.', icon: Cpu, tag: 'Audio' },
                { title: 'Custom Prompts', desc: 'Provide direct synthesis instructions and domain-specific scenarios.', icon: Terminal, tag: 'Prompt' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 text-cyan-400">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Part B: Output Deliverables Grid */}
          <div>
            <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
                GENERATED OUTPUT FORMATS
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                One source. Multiple deliverables.
              </h2>
              <p className="text-sm text-slate-400">
                Tailored formats rendered through dedicated interactive components rather than plain text.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Executive Summary', desc: 'Condense complex information into an executive-ready brief with findings & impacts.', icon: FileText, color: 'text-cyan-400', badge: 'Decision Brief' },
                { title: 'Advisory Memo', desc: 'Convert source intelligence into a formal threat advisory with IOCs and immediate actions.', icon: AlertTriangle, color: 'text-amber-400', badge: 'Threat Intel' },
                { title: 'LinkedIn Post', desc: 'Generate high-impact professional breakdowns with key takeaways and strategic hashtags.', icon: LinkedInIcon, color: 'text-blue-400', badge: 'Professional Social' },
                { title: 'X / Twitter Thread', desc: 'Formulate viral, bite-sized tweet threads optimized for rapid public distribution.', icon: XTwitterIcon, color: 'text-sky-400', badge: 'Public Broadcast' },
                { title: 'Infographic Spec', desc: 'Structure visual data charts, metric gauge callouts, and step-by-step process flows.', icon: BarChart3, color: 'text-emerald-400', badge: 'Visual Spec' },
                { title: 'Presentation Slides', desc: 'Turn information into structured 16:9 slide decks complete with speaker notes.', icon: Presentation, color: 'text-purple-400', badge: 'Slide Deck' },
                { title: 'Video Package', desc: 'Generate a production-ready script, scene storyboard, voiceover narration, and subtitles.', icon: Video, color: 'text-rose-400', badge: 'Storyboard' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/80">
                          <Icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                      <span>Interactive Renderer</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE SHOWCASE SECTION */}
      <section id="showcase" className="py-20 md:py-28 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ShowcaseInteractive />
        </div>
      </section>

      {/* 6. AI INTELLIGENCE & CANONICAL REASONING */}
      <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
              UNDERSTANDING VS GENERATION
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              More than text generation.
            </h2>
            <p className="text-sm text-slate-400">
              DocCraft does not blindly summarize. It builds an intermediate canonical intelligence layer before creating downstream artefacts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Box 1: Content Understanding */}
            <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/60 p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">01 • Content Understanding</h3>
                  <p className="text-xs text-slate-400">Canonical Intelligence Extraction</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Context & Intent', desc: 'Identifies urgency and core mission' },
                  { label: 'Verified Facts', desc: 'Strict preservation of numbers & metrics' },
                  { label: 'Extracted Entities', desc: 'CVEs, organizations, affected systems' },
                  { label: 'Topic Taxonomy', desc: 'Domain and threat classification' },
                  { label: 'Temporal Markers', desc: 'Timelines, dates, and SLA windows' },
                  { label: 'Language Detection', desc: 'Multi-lingual input recognition' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-cyan-300 block mb-0.5">{item.label}</span>
                    <span className="text-[11px] text-slate-400">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2: Content Transformation */}
            <div className="rounded-3xl border border-blue-500/30 bg-slate-900/60 p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">02 • Content Transformation</h3>
                  <p className="text-xs text-slate-400">Target Guardrail Alignment</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Audience Tuning', desc: 'C-Suite, Engineers, Media, Public' },
                  { label: 'Tone & Register', desc: 'Professional, Formal, Informative' },
                  { label: 'Detail Level', desc: 'Brief, Standard, In-depth' },
                  { label: 'Communication Objective', desc: 'Alert, Summarize, Educate, Brief' },
                  { label: 'Channel Formatting', desc: 'Markdown, Slides, Social, Storyboard' },
                  { label: 'Structured JSON Specs', desc: 'Component-ready data payloads' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-blue-300 block mb-0.5">{item.label}</span>
                    <span className="text-[11px] text-slate-400">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HUMAN-IN-THE-LOOP SECTION */}
      <section className="py-20 md:py-28 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest font-mono">
            <Scale className="h-3.5 w-3.5" />
            GOVERNANCE & DECISION CONTROL
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            AI assists. Humans decide.
          </h2>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            DocCraft keeps the operator in total control. Generated content is never published automatically; every artefact is inspected, edited, and approved by human operators before release.
          </p>

          {/* Workflow Pipeline */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 font-medium text-slate-300">
              1. AI Generation
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 font-medium text-slate-300">
              2. Schema Validation
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 font-medium text-slate-300">
              3. Human Review
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 font-bold text-cyan-300">
              4. Edit / Approve
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 font-bold text-emerald-300 col-span-2 sm:col-span-1">
              5. Final Deliverable
            </div>
          </div>
        </div>
      </section>

      {/* 8. ENTERPRISE SECURITY SECTION */}
      <section id="security" className="py-20 md:py-28 px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              SECURITY & PROVENANCE
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Built with security in mind.
            </h2>
            <p className="text-sm text-slate-400">
              Every layer of DocCraft is designed with tenant isolation, cryptographic provenance, and zero API key leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Authentication', desc: 'Protected operator sessions via Supabase Auth with secure token refresh.', icon: Lock, tag: 'Auth' },
              { title: 'Row Level Security (RLS)', desc: 'Strict PostgreSQL RLS ensures operators can only access their own transformations and artifacts.', icon: Database, tag: 'PostgreSQL' },
              { title: 'Private Storage', desc: 'Uploaded source files reside in private storage buckets under user-partitioned directories.', icon: UploadCloud, tag: 'Storage' },
              { title: 'SHA-256 Provenance', desc: 'Cryptographic SHA-256 fingerprints provide immutable source integrity and audit tracing.', icon: Hash, tag: 'Cryptography' },
              { title: 'Air-Gapped AI Gateway', desc: 'Gemini API keys reside exclusively in Supabase Edge Secrets with zero client exposure.', icon: ShieldCheck, tag: 'Edge Runtime' },
              { title: 'Human Review Control', desc: 'Operators review, edit, approve, or reject generated content before final dissemination.', icon: Users, tag: 'Governance' },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{card.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. TECHNICAL ARCHITECTURE ("UNDER THE HOOD") */}
      <section className="py-20 md:py-28 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-10">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
              TECHNICAL ARCHITECTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Under the hood.
            </h2>
            <p className="text-sm text-slate-400">
              Modern full-stack pipeline built for speed, reliability, and cryptographic verification.
            </p>
          </div>

          {/* Technology Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['React 19', 'Vite', 'TypeScript', 'Tailwind CSS', 'Supabase Auth', 'PostgreSQL RLS', 'Supabase Storage', 'Deno Edge Functions', 'Gemini 2.5 Flash', 'Web Crypto SHA-256'].map((tech) => (
              <span
                key={tech}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Architecture flow */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 space-y-2 text-left overflow-x-auto">
            <div className="text-cyan-400 font-bold mb-2">// END-TO-END EXECUTION FLOW</div>
            <div>[Operator] → React + Vite UI → Authenticated Supabase Session</div>
            <div>[Ingest]   → SHA-256 Cryptographic Hash → Private Storage Bucket</div>
            <div>[AI Edge]  → Supabase Edge Function (Deno) → Gemini 2.5 Flash Multimodal</div>
            <div>[Outputs]  → Canonical Content + 7 Structured Artefact Schemas</div>
            <div>[Review]   → Operator Inspection UI → Human Edit & Approval → PostgreSQL RLS</div>
          </div>
        </div>
      </section>

      {/* 10. CAPABILITIES GRID */}
      <section id="capabilities" className="py-20 md:py-28 px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
              CORE CAPABILITIES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Designed for real-world communication workflows.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Multimodal Transformation', desc: 'Transform complex source material into audience-ready communication across 7 deliverables.', icon: Sparkles },
              { title: 'Multi-Output Synthesis', desc: 'Generate multiple deliverables from the exact same source in a single AI pass.', icon: Layers },
              { title: 'Configurable Controls', desc: 'Fine-tune target audience, tone, language, detail level, and communication objective.', icon: Sliders },
              { title: 'Cryptographic Provenance', desc: 'Track source fingerprints, SHA-256 hashes, model metadata, and creation timestamps.', icon: Hash },
              { title: 'Human Review & Approval', desc: 'Review, edit, approve, or reject AI-generated artefacts before final sign-off.', icon: CheckCircle2 },
              { title: 'Transformation History', desc: 'Filter, search, and manage previous transformation runs and generated artefacts.', icon: Clock },
            ].map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl border border-slate-800 bg-slate-900/50 space-y-3 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{cap.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. FINAL CALL TO ACTION BANNER */}
      <section className="py-20 md:py-28 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950 p-8 md:p-14 text-center space-y-6 shadow-2xl shadow-cyan-950/40 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/15 blur-3xl pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Turn information into action-ready communication.
          </h2>

          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Upload a source. Choose your outputs. Let DocCraft handle the transformation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {user ? (
              <Link to="/dashboard">
                <Button variant="glow" size="lg" icon={<Sparkles className="h-5 w-5" />}>
                  Open Intelligence Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="glow" size="lg" icon={<ArrowRight className="h-5 w-5" />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-6 lg:px-8 py-12 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">DocCraft</span>
              <p className="text-[11px] text-slate-500">AI-powered multimodal content transformation.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-cyan-400 transition-colors">Capabilities</a>
            <a href="#security" className="hover:text-cyan-400 transition-colors">Security</a>
            <Link to="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-cyan-400 transition-colors">Get Started</Link>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <div>Powered by React • Supabase • Gemini</div>
            <div className="text-cyan-400/80 font-medium">Built as a hackathon prototype</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
