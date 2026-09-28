import React from 'react';
import {
  TargetAudience,
  ToneType,
  LanguageType,
  DetailLevel,
  CommunicationObjective,
  TransformationSettings,
} from '@/types/transformation';
import { Sliders, Users, MessageSquare, Languages, FileSpreadsheet, Target } from 'lucide-react';

interface SettingsSectionProps {
  settings: TransformationSettings;
  setSettings: React.Dispatch<React.SetStateAction<TransformationSettings>>;
}

const AUDIENCE_OPTIONS: TargetAudience[] = [
  'Executive',
  'Technical Team',
  'Government Official',
  'General Public',
  'Internal Team',
  'Social Media Audience',
];

const TONE_OPTIONS: ToneType[] = [
  'Professional',
  'Formal',
  'Informative',
  'Concise',
  'Persuasive',
  'Technical',
];

const LANGUAGE_OPTIONS: LanguageType[] = ['English', 'Hindi'];

const DETAIL_OPTIONS: DetailLevel[] = ['Brief', 'Standard', 'Detailed'];

const OBJECTIVE_OPTIONS: CommunicationObjective[] = [
  'Inform',
  'Summarize',
  'Alert',
  'Explain',
  'Educate',
  'Brief',
];

export function SettingsSection({ settings, setSettings }: SettingsSectionProps) {
  const updateField = <K extends keyof TransformationSettings>(
    key: K,
    value: TransformationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <Sliders className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold tracking-wide text-white">
          Transformation Parameters & Guardrails
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Target Audience */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            Target Audience
          </label>
          <select
            value={settings.audience}
            onChange={(e) => updateField('audience', e.target.value as TargetAudience)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Tone */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
            Tone & Style
          </label>
          <select
            value={settings.tone}
            onChange={(e) => updateField('tone', e.target.value as ToneType)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            {TONE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Objective */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            Communication Objective
          </label>
          <select
            value={settings.objective}
            onChange={(e) => updateField('objective', e.target.value as CommunicationObjective)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            {OBJECTIVE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Language */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Languages className="h-3.5 w-3.5 text-amber-400" />
            Language Output
          </label>
          <select
            value={settings.language}
            onChange={(e) => updateField('language', e.target.value as LanguageType)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Detail Level */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <FileSpreadsheet className="h-3.5 w-3.5 text-purple-400" />
            Detail Level
          </label>
          <select
            value={settings.detailLevel}
            onChange={(e) => updateField('detailLevel', e.target.value as DetailLevel)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            {DETAIL_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
