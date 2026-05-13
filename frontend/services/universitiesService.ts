import api from "@/lib/api";
import type {
  University,
  UniversityListItem,
  Paginated,
  CreateUniversityDTO,
  UpdateUniversityDTO,
} from "@/types/university";

export interface UniversityListParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
}

// GET /admin/universities
export const getUniversities = async (
  params: UniversityListParams = {}
): Promise<Paginated<UniversityListItem>> => {
  const res = await api.get("/admin/universities", { params });
  return res.data;
};

// GET /admin/universities/{id}
export const getUniversity = async (id: number): Promise<University> => {
  const res = await api.get(`/admin/universities/${id}`);
  return res.data.data ?? res.data;
};

// POST /admin/universities
export const createUniversity = async (
  data: CreateUniversityDTO
): Promise<University> => {
  const res = await api.post("/admin/universities", data);
  return res.data.data ?? res.data;
};

// PUT /admin/universities/{id}
export const updateUniversity = async (
  id: number,
  data: UpdateUniversityDTO
): Promise<University> => {
  const res = await api.put(`/admin/universities/${id}`, data);
  return res.data.data ?? res.data;
};

// DELETE /admin/universities/{id}
export const deleteUniversity = async (id: number): Promise<void> => {
  await api.delete(`/admin/universities/${id}`);
};
