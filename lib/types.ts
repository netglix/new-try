// Shared TypeScript types for EScope

/** Scores for each evaluation category (1–10) */
export interface AnalysisScores {
  logicalClarity: number;
  leadership: number;
  problemSolving: number;
  quantifiedResults: number;
  impact: number;
}

/** Full analysis result returned by the AI */
export interface AnalysisResult {
  scores: AnalysisScores;
  feedback: string;
  improvements: string;
  improvedEs: string;
}

/** A row from the es_history Supabase table */
export interface EsHistoryRecord {
  id: string;
  created_at: string;
  user_id: string;
  company: string;
  es_text: string;
  analysis_result: AnalysisResult;
}

/** Companies available in the dropdown */
export const COMPANIES = [
  "McKinsey",
  "BCG",
  "Bain",
  "Deloitte",
  "Accenture",
] as const;

export type Company = (typeof COMPANIES)[number];
