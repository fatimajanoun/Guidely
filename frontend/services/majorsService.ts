import api from "@/lib/api";
import type { Major, MajorListItem, Paginated } from "@/types/major";

export interface MajorListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

// GET /admin/majors
export const getMajors = async (
  params: MajorListParams = {}
): Promise<Paginated<MajorListItem>> => {
  const res = await api.get("/admin/majors", { params });
  return res.data;
};

// GET /admin/majors/{id}
export const getMajor = async (id: number): Promise<Major> => {
  const res = await api.get(`/admin/majors/${id}`);
  return res.data.data ?? res.data;
};

// POST /admin/majors
export const createMajor = async (data: Record<string, unknown>): Promise<Major> => {
  const res = await api.post("/admin/majors", data);
  return res.data.data ?? res.data;
};

// PUT /admin/majors/{id}
export const updateMajor = async (id: number, data: Record<string, unknown>): Promise<Major> => {
  const res = await api.put(`/admin/majors/${id}`, data);
  return res.data.data ?? res.data;
};

// DELETE /admin/majors/{id}
export const deleteMajor = async (id: number): Promise<void> => {
  await api.delete(`/admin/majors/${id}`);
};
