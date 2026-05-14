"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { getQuizQuestions, submitQuiz } from "@/services/quizService";
import type { QuizQuestion, QuizAnswer } from "@/services/quizService";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuizQuestions();
        setQuestions(data);
      } catch {
        setError("Failed to load questions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasAnsweredCurrent = currentQuestion
    ? answers[currentQuestion.id] !== undefined
    : false;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleAnswer = (optionId: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: QuizAnswer[] = Object.entries(answers).map(
        ([questionId, optionId]) => ({
          question_id: Number(questionId),
          option_id: optionId,
        }),
      );
      const result = await submitQuiz(payload);
      // Store result and redirect to results page
      sessionStorage.setItem("quizResult", JSON.stringify(result));
      router.push("/quiz/results");
    } catch {
      setError("Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto" />
          <p className="text-gray-500 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-gray-900 font-heading">
            Major Guidance Quiz
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200">
        <div
          className="h-full bg-brand-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion?.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleAnswer(option.id)}
                  className={cn(
                    "w-full text-left rounded-xl border px-5 py-4 text-sm font-medium transition-all",
                    isSelected
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all",
                        isSelected
                          ? "border-brand-600 bg-brand-600"
                          : "border-gray-300",
                      )}
                    >
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      )}
                    </span>
                    {option.text}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                currentIndex === 0
                  ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-6 py-2 text-sm font-semibold text-white transition-all",
                  allAnswered && !isSubmitting
                    ? "bg-brand-600 hover:bg-brand-700"
                    : "bg-gray-300 cursor-not-allowed",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  hasAnsweredCurrent
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed",
                )}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Answered count */}
          <p className="text-center text-xs text-gray-400 mt-4">
            {Object.keys(answers).length} of {totalQuestions} answered
          </p>
        </div>
      </div>
    </div>
  );
}
