import api from "@/lib/api";

export interface PublicMajorItem {
  name_en: string;
  name_ar: string;
  slug: string;
  overview: string;
  description: string;
  duration_years: number;
  difficulty_level: string;
  salary_min: number;
  salary_max: number;
  local_demand: string;
  international_demand: string;
  is_featured: boolean;
  cover_image: string | null;
  category: {
    name: string;
    name_en: string;
    slug: string;
  } | null;
  skills: { name: string }[];
}

export interface PublicMajorsResponse {
  recommended: PublicMajorItem[];
  featured: PublicMajorItem[];
  others: {
    data: PublicMajorItem[];
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

// GET /student/majors
export const getPublicMajors = async (params: { per_page?: number; page?: number } = {}): Promise<PublicMajorsResponse> => {
  const res = await api.get("/student/majors", { params });
  return res.data.data ?? res.data;
};

// GET /student/majors/{slug}/show
export const getPublicMajor = async (slug: string) => {
  const res = await api.get(`/student/majors/${slug}/show`);
  return res.data.data ?? res.data;
};

// GET /student/categories
export const getCategories = async () => {
  const res = await api.get("/student/categories");
  return (res.data.data ?? res.data) as Array<{
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    description: string | null;
    icon: string | null;
  }>;
};
