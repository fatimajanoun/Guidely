import api from "@/lib/api";

/* ── Types ── */
export interface QuizOption {
  id: number;
  text_en: string;
  text?: string;
}

export interface QuizQuestion {
  id: number;
  text_en: string;
  text?: string;
  options: QuizOption[];
}

export interface QuizAnswer {
  question_id: number;
  option_id: number;
}

export interface QuizResult {
  score?: number;
  recommended_majors?: Array<{
    id: number;
    name_en: string;
    slug: string;
    overview: string;
  }>;
  message?: string;
}

/* ── API calls ── */

// GET /student/test/questions
export const getQuizQuestions = async (): Promise<QuizQuestion[]> => {
  const res = await api.get("/student/test/questions");
  return res.data.data ?? res.data;
};

// POST /student/test/submit
export const submitQuiz = async (
  answers: QuizAnswer[],
): Promise<QuizResult> => {
  const res = await api.post("/student/test/submit", { answers });
  return res.data.data ?? res.data;
};
