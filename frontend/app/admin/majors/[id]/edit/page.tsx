"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MajorForm from "@/components/admin/majors/MajorForm";
import { getMajor } from "@/services/majorsService";

interface EditMajorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMajorPage({ params }: EditMajorPageProps) {
  const { id } = use(params);
  const majorId = Number(id);
  const router = useRouter();

  const { data: major, isLoading, isError } = useQuery({
    queryKey: ["major", majorId],
    queryFn: () => getMajor(majorId),
    enabled: !isNaN(majorId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError || !major) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">Major not found.</p>
        <Link href="/admin/majors" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
          Back to majors
        </Link>
      </div>
    );
  }

  const initialData = {
    name_en: major.name_en,
    name_ar: major.name_ar,
    slug: major.slug,
    category_id: major.category_id,
    difficulty_level: major.difficulty_level,
    duration_years: major.duration_years,
    salary_min: major.salary_min,
    salary_max: major.salary_max,
    is_featured: major.is_featured,
    overview: major.overview ?? "",
    description: major.description ?? "",
    points: major.points ?? [],
    skills: major.skills?.map((s) => ({ skill_id: s.id })) ?? [],
    jobs: major.jobs ?? [],
    companies: major.companies ?? [],
    faqs: major.faqs ?? [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/majors"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Edit Major</h1>
          <p className="text-sm text-gray-500">{major.name_en}</p>
        </div>
      </div>

      <MajorForm
        mode="edit"
        initialData={initialData}
        majorId={majorId}
        onSuccess={() => router.push("/admin/majors")}
      />
    </div>
  );
}
