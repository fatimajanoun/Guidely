import api from "@/lib/api";

export const userService = {
  getAll: async (
    page = 1,
    role?: "student" | "mentor" | "admin",
    search?: string
  ) => {
    const params = new URLSearchParams();

    params.append("page", page.toString());

    if (role) {
      params.append("role", role);
    }

    if (search) {
      params.append("search", search);
    }

    const res = await api.get(
      `admin/users?${params.toString()}`
    );

    return res.data;
  },

  search: async (username: string) => {
    const res = await api.get(
      `admin/users/search?username=${username}`
    );

    return res.data;
  },

  toggleBlock: async (id: number) => {
    const res = await api.patch(
      `admin/users/${id}/toggleBlock`
    );

    return res.data;
  },
};