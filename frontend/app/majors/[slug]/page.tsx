import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MajorDetail from "./MajorDetail";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchMajor(slug: string) {
  const res = await fetch(`${API_BASE}/student/majors/${slug}/show`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const major = await fetchMajor(slug);
    if (!major) return { title: "Major not found" };
    return {
      title: `${major.name_en} | Guidely`,
      description: major.description ?? major.overview ?? `Learn about ${major.name_en} at Guidely.`,
    };
  } catch {
    return { title: "Guidely" };
  }
}

export default async function MajorDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let major = null;
  let fetchError = false;

  try {
    major = await fetchMajor(slug);
  } catch {
    fetchError = true;
  }

  if (!fetchError && major === null) notFound();

  return <MajorDetail slug={slug} initialData={major} error={fetchError} />;
}
