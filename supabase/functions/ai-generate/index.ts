import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  sourceText: string;
  outputTypes: string[];
  audience?: string;
  tone?: string;
  language?: string;
  detailLevel?: string;
  objective?: string;
  sourceType?: string;
  metadata?: Record<string, unknown>;
}

interface AnalysisData {
  summary: string;
  keyFacts: string[];
  entities: string[];
  topics: string[];
}

interface ArtifactData {
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

interface GenerationResponse {
  analysis: AnalysisData;
  artifacts: ArtifactData[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized user session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse and validate body
    const body: RequestBody = await req.json();
    const {
      sourceText,
      outputTypes,
      audience = "Executive",
      tone = "Professional",
      language = "English",
      detailLevel = "Standard",
      objective = "Inform",
    } = body;

    if (!sourceText || typeof sourceText !== "string" || sourceText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Source text is required for transformation" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(outputTypes) || outputTypes.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one output type must be selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get Gemini API Key
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service configuration error. Please ensure GEMINI_API_KEY is configured in Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Construct System Prompt & Instructions
    const systemPrompt = `You are an enterprise-grade AI content transformation engine.
Your task is to analyze the provided source information and transform it into high-quality, communication-ready artefacts.

RULES:
1. Preserve factual fidelity to the source.
2. Do NOT invent facts, numbers, dates, people, or external events not stated or directly implied by the source.
3. Adapt language, vocabulary, formatting, and tone strictly to the requested audience and objective.
4. Generate each requested output independently and comprehensively with clear Markdown formatting (headings, bullet points, executive sections).
5. For LinkedIn posts: include relevant strategic hashtags, engaging hook, structured insights, and call-to-action suitable for professional networks.
6. For X (Twitter) posts: include concise high-impact messaging, thread format if needed, and relevant hashtags within platform limits.
7. For Executive Summary: focus on strategic takeaways, critical data, risks, and recommendations.
8. For Advisory: format as a clear advisory memo with situation analysis, impact, guidance, and actionable next steps.
9. For Infographic/Presentation/Audio/Video scripts: provide structured slide-by-slide or section-by-section script/layout specifications based on the source.
10. You MUST respond with ONLY a valid, parseable JSON object matching the exact schema specified below. Do not wrap in markdown backticks or commentary.

JSON Schema format:
{
  "analysis": {
    "summary": "Brief 2-3 sentence distillation of the source material",
    "keyFacts": ["Fact 1", "Fact 2", "Fact 3"],
    "entities": ["Entity/Organization/Product 1", "Entity 2"],
    "topics": ["Topic 1", "Topic 2"]
  },
  "artifacts": [
    {
      "type": "exact_type_name_matching_request",
      "title": "Clear descriptive title for the artefact",
      "content": "Fully formed markdown content for this artefact"
    }
  ]
}`;

    const userPrompt = `SOURCE CONTENT:
"""
${sourceText.trim()}
"""

TRANSFORMATION PARAMETERS:
- Target Audience: ${audience}
- Tone: ${tone}
- Language: ${language}
- Detail Level: ${detailLevel}
- Communication Objective: ${objective}
- Requested Output Types: ${JSON.stringify(outputTypes)}

Generate the analysis and all requested artifacts for these types: ${outputTypes.join(", ")}. Return only valid JSON.`;

    // 5. Call Gemini API
    // We try gemini-2.5-flash first, fallback to gemini-2.0-flash or gemini-1.5-flash
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let geminiData: any = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: systemPrompt },
                    { text: userPrompt },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                topP: 0.95,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (response.ok) {
          geminiData = await response.json();
          break;
        } else {
          const errText = await response.text();
          lastError = `Model ${model} returned ${response.status}: ${errText}`;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!geminiData) {
      return new Response(
        JSON.stringify({ error: "Failed to generate content from AI model. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return new Response(
        JSON.stringify({ error: "AI model returned an empty response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Parse and validate JSON
    let parsedResult: GenerationResponse;
    try {
      const cleanJson = candidateText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (parseErr) {
      return new Response(
        JSON.stringify({ error: "Failed to parse structured response from AI model" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure artifacts array exists
    if (!parsedResult.artifacts || !Array.isArray(parsedResult.artifacts)) {
      parsedResult.artifacts = [];
    }

    return new Response(
      JSON.stringify(parsedResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred during content transformation" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
