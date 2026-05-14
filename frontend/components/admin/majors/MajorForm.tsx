"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { majorFormSchema, type MajorFormData } from "@/lib/validations/major";
import { createMajor, updateMajor } from "@/services/majorsService";
import BasicInfoSection from "./sections/BasicInfoSection";
import OverviewSection from "./sections/OverviewSection";
import ProsConsSection from "./sections/ProsConsSection";
import SkillsSection from "./sections/SkillsSection";
import JobsSection from "./sections/JobsSection";
import CompaniesSection from "./sections/CompaniesSection";
import FaqsSection from "./sections/FaqsSection";
import DayInLifeSection from "./sections/DayInLifeSection";
import ChallengesSection from "./sections/ChallengesSection";
import Button from "@/components/ui/Button";

const TABS: { id: string; label: string }[] = [
  { id: "basic", label: "Basic Info" },
  { id: "overview", label: "Overview" },
  { id: "pros-cons", label: "Pros & Cons" },
  { id: "skills", label: "Skills" },
  { id: "jobs", label: "Jobs" },
  { id: "companies", label: "Companies" },
  { id: "faqs", label: "FAQs" },
  { id: "day-in-life", label: "Day in Life" },
  { id: "challenges", label: "Challenges" },
];

const DEFAULT_VALUES: Partial<MajorFormData> = {
  name_en: "",
  name_ar: "",
  slug: "",
  overview: "",
  description: "",
  cover_image: "",
  duration_years: 4,
  salary_min: 0,
  salary_max: 0,
  is_featured: false,
  points: [],
  skills: [],
  jobs: [],
  companies: [],
  faqs: [],
  day_in_life: "",
  challenges: [],
};

const LS_KEY = "major_form_draft";

interface MajorFormProps {
  initialData?: Partial<MajorFormData>;
  mode: "create" | "edit";
  majorId?: number;
  onSuccess?: () => void;
}

export default function MajorForm({ initialData, mode, majorId, onSuccess }: MajorFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"draft" | "publish" | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const methods = useForm<MajorFormData>({
    resolver: zodResolver(majorFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialData },
    mode: "onBlur",
  });

  const { handleSubmit, watch, setError, formState: { isDirty } } = methods;

  // On create: check localStorage for saved draft and prompt resume
  useEffect(() => {
    if (mode !== "create") return;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<MajorFormData>;
      if (confirm("Resume your unsaved draft?")) {
        methods.reset({ ...DEFAULT_VALUES, ...parsed });
      } else {
        localStorage.removeItem(LS_KEY);
      }
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage every 10s (both modes)
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(methods.getValues()));
        setAutoSaving(true);
        setTimeout(() => setAutoSaving(false), 800);
      } catch {
        // storage quota exceeded — ignore
      }
    }, 10000);
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [methods]);

  const clearDraft = () => {
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (!confirm("You have unsaved changes. Leave without saving?")) return;
    }
    clearDraft();
    router.push("/admin/majors");
  };

  const onSubmit = async (data: MajorFormData, action: "draft" | "publish") => {
    setIsSubmitting(true);
    setSubmitAction(action);
    try {
      const payload = { ...data, status: action };
      if (mode === "create") {
        await createMajor(payload as Record<string, unknown>);
        toast.success("Major created successfully");
      } else if (majorId) {
        await updateMajor(majorId, payload as Record<string, unknown>);
        toast.success("Major updated successfully");
      }
      clearDraft();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/majors");
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ errors?: Record<string, string[]>; message?: string }>;
      const apiErrors = axiosErr?.response?.data?.errors;
      if (apiErrors) {
        // Set inline field errors from API 422 response
        (Object.entries(apiErrors) as [keyof MajorFormData, string[]][]).forEach(([field, messages]) => {
          setError(field, { message: messages[0] });
        });
        toast.error("Please fix the highlighted fields");
      } else {
        toast.error(axiosErr?.response?.data?.message ?? "Failed to save major");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-brand-950 text-brand-950"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Section content */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {activeTab === "basic" && <BasicInfoSection />}
          {activeTab === "overview" && <OverviewSection />}
          {activeTab === "pros-cons" && <ProsConsSection />}
          {activeTab === "skills" && <SkillsSection />}
          {activeTab === "jobs" && <JobsSection />}
          {activeTab === "companies" && <CompaniesSection />}
          {activeTab === "faqs" && <FaqsSection />}
          {activeTab === "day-in-life" && <DayInLifeSection />}
          {activeTab === "challenges" && <ChallengesSection />}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
          <span className="mr-auto text-xs text-gray-400">
            {autoSaving ? "Draft saved" : ""}
          </span>
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            isLoading={isSubmitting && submitAction === "draft"}
            onClick={handleSubmit((data) => onSubmit(data, "draft"))}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            isLoading={isSubmitting && submitAction === "publish"}
            onClick={handleSubmit((data) => onSubmit(data, "publish"))}
          >
            Publish
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
