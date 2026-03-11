import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { AnalysisResult } from "@/lib/types";

// ── Input validation ────────────────────────────────────────────────────────
const requestSchema = z.object({
  company: z.string().min(1, "Company is required"),
  esText: z.string().min(10, "ES text must be at least 10 characters"),
});

// ── Output validation (mirrors the JSON schema we ask OpenAI to return) ─────
const scoresSchema = z.object({
  logicalClarity: z.number().min(1).max(10),
  leadership: z.number().min(1).max(10),
  problemSolving: z.number().min(1).max(10),
  quantifiedResults: z.number().min(1).max(10),
  impact: z.number().min(1).max(10),
});

const analysisSchema = z.object({
  scores: scoresSchema,
  feedback: z.string(),
  improvements: z.string(),
  improvedEs: z.string(),
});

export async function POST(req: NextRequest) {
  // ── Parse & validate request body ────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { company, esText } = parsed.data;

  // ── Call OpenAI ───────────────────────────────────────────────────────────
  // Instantiate inside the handler so the module can be imported without the key
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let analysis: AnalysisResult;
  try {
    const prompt = `You are a senior recruiting consultant at ${company}.
Evaluate the following entry sheet (ES) written by a consulting job applicant.

ES:
"""
${esText}
"""

Return ONLY a valid JSON object — no markdown, no code fence — with exactly this shape:
{
  "scores": {
    "logicalClarity": <integer 1-10>,
    "leadership": <integer 1-10>,
    "problemSolving": <integer 1-10>,
    "quantifiedResults": <integer 1-10>,
    "impact": <integer 1-10>
  },
  "feedback": "<detailed 2–4 sentence evaluation>",
  "improvements": "<2–4 specific, actionable improvement suggestions>",
  "improvedEs": "<rewritten ES using the STAR framework (Situation, Task, Action, Result)>"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from OpenAI");

    const validated = analysisSchema.safeParse(JSON.parse(raw));
    if (!validated.success) {
      console.error("OpenAI response failed schema validation", validated.error);
      throw new Error("AI returned unexpected format");
    }
    analysis = validated.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // ── Persist to Supabase if the user is authenticated ─────────────────────
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const supabase = createAdminClient();
      // Verify the user token and get user info
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (!userError && user) {
        const { error: insertError } = await supabase
          .from("es_history")
          .insert({
            user_id: user.id,
            company,
            es_text: esText,
            analysis_result: analysis,
          });
        if (insertError) {
          // Log but don't fail — analysis result is still returned
          console.error("Failed to save history:", insertError.message);
        }
      }
    } catch (err) {
      console.error("Supabase persistence error:", err);
    }
  }

  return NextResponse.json({ analysis });
}
