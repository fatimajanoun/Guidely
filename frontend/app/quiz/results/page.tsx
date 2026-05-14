"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import type { QuizResult } from "@/services/quizService";
import Link from "next/link";

export default function QuizResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("quizResult");
    if (!stored) {
      router.push("/quiz");
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-gray-900 font-heading">
            Your Results
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Success banner */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">
            Quiz Complete!
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {result.message ??
              "Here are your recommended majors based on your answers."}
          </p>

          {/* Score if available */}
          {result.score !== undefined && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2">
              <span className="text-sm font-semibold text-brand-700">
                Score: {result.score}
              </span>
            </div>
          )}
        </div>

        {/* Recommended majors */}
        {result.recommended_majors && result.recommended_majors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Recommended Majors
            </h3>
            {result.recommended_majors.map((major) => (
              <div
                key={major.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {major.name_en}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {major.overview}
                    </p>
                  </div>
                  <Link
                    href={`/majors/${major.slug}`}
                    className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
                  >
                    View
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("quizResult");
              router.push("/quiz");
            }}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </button>
          <Link
            href="/majors"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Explore All Majors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
