"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Search, X, Eye, ShieldBan, ShieldCheck } from "lucide-react";

import { userService } from "@/services/userService";
import type { User } from "@/types/user";

export default function MentorsPage() {
  const [data, setData] = useState<User[]>([]);
  const [originalData, setOriginalData] = useState<User[]>([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);

  const [selected, setSelected] = useState<User | null>(null);
  const [openView, setOpenView] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSearch = useRef("");

  // ================= FETCH ALL MENTORS =================
  const fetchData = async (pageNum = 1) => {
    setPageLoading(true);

    try {
      const res = await userService.getAll(pageNum, "mentor");

      const users = Array.isArray(res.data) ? res.data : [];

      setData(users);
      setOriginalData(users);

      setPage(res.meta?.current_page ?? pageNum);
      setHasNext(!!res.links?.next);
    } catch {
      toast.error("Failed to fetch mentors.");
      setData([]);
      setOriginalData([]);
    } finally {
      setPageLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  // ================= SEARCH API =================
  const handleSearch = async (value: string) => {
    setPageLoading(true);

    try {
      const res = await userService.search(value);

      const users = Array.isArray(res.data) ? res.data : [];

      setData(users);
      setHasNext(false);
      setPage(1);
    } catch {
      toast.error("Failed to fetch results.");
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  // ================= SEARCH CONTROL =================
  const handleSearchChange = (value: string) => {
    setSearch(value);

    const trimmed = value.trim();

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (trimmed.length < 2) {
        lastSearch.current = "";
        setData(originalData);
        return;
      }

      if (trimmed === lastSearch.current) return;

      lastSearch.current = trimmed;
      handleSearch(trimmed);
    }, 400);
  };

  // ================= PAGINATION =================
  const handleNext = async () => {
    if (!hasNext || pageLoading || search.trim().length >= 2) return;
    await fetchData(page + 1);
  };

  const handlePrev = async () => {
    if (page <= 1 || pageLoading || search.trim().length >= 2) return;
    await fetchData(page - 1);
  };

  const isEmpty = hasLoaded && !pageLoading && data.length === 0;

  // ================= BLOCK =================
  const toggleBlock = async (id: number) => {
    try {
      await userService.toggleBlock(id);

      setData((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_blocked: !u.is_blocked } : u
        )
      );

      setOriginalData((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_blocked: !u.is_blocked } : u
        )
      );

      toast.success("Updated");
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 relative overflow-hidden p-6">

      {/* BACKGROUND */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-200 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-brand-300 rounded-full blur-3xl opacity-30" />

      {/* HEADER */}
      <div className="mb-6 relative z-20">
        <h1 className="text-4xl font-heading text-gray-900">
          Mentors Management
        </h1>
        <p className="text-gray-500 text-sm">
         Mentor Accounts
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative w-full md:max-w-sm mb-6 z-20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700 z-10" />

          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search mentors..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-100 bg-white/90 backdrop-blur text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                lastSearch.current = "";
                setData(originalData);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-card border border-brand-100 overflow-hidden relative z-20">

        <div className="p-4 text-xs text-gray-400">
          Showing {data.length} mentors
        </div>

        {pageLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 p-4 border-b animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="p-6 text-center text-gray-500">
            No mentors found
          </div>
        ) : (
          <table className="w-full text-sm">
           <thead className="bg-brand-50/60 text-gray-600">
           <tr>
          <th className="p-4 text-left">Mentor</th>
          <th className="p-4 text-left">Username</th>
          <th className="p-4 text-left">Email</th>
          <th className="p-4 text-left">Status</th>
          <th className="p-4 text-right">Actions</th>
          </tr>
           </thead>

            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-t hover:bg-brand-50/40 transition">
                  <td className="p-4 font-medium text-left">{u.name}</td>
                  <td className="p-4 text-gray-600 text-left">{u.username}</td>
                  <td className="p-4 text-gray-600 text-left">{u.email}</td>

                  <td className="p-4 text-left align-middle">
                    {u.is_blocked ? (
                      <span className="text-red-600 text-xs px-2 py-1 bg-red-50 rounded-full">
                        Blocked
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs px-2 py-1 bg-green-50 rounded-full">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right align-middle">
                    <div className="flex justify-end items-center gap-2">

                      <button
                        onClick={() => {
                          setSelected(u);
                          setOpenView(true);
                        }}
                        className="p-2 rounded-lg hover:bg-brand-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => toggleBlock(u.id)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        {u.is_blocked ? (
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <ShieldBan className="h-4 w-4 text-red-600" />
                        )}
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-4 border-t border-brand-100">

          <button
            onClick={handlePrev}
            disabled={page === 1 || pageLoading || search.trim().length >= 2}
            className="px-4 py-2 rounded-xl bg-white border disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-gray-500">
            Page {page}
          </span>

          <button
            onClick={handleNext}
            disabled={!hasNext || pageLoading || search.trim().length >= 2}
            className="px-4 py-2 rounded-xl bg-white border disabled:opacity-50"
          >
            Next
          </button>

        </div>
      </div>

      {/* VIEW MODAL */}
      {openView && selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">

          <div className="bg-white w-[500px] rounded-2xl shadow-card p-6 border border-brand-100">

            <h2 className="text-xl font-semibold mb-4">
              Mentor Details
            </h2>

            <div className="space-y-2 text-sm">
              <p><b>Name:</b> {selected.name}</p>
              <p><b>Email:</b> {selected.email}</p>
              <p><b>Username:</b> {selected.username}</p>
              <p><b>Phone:</b> {selected.phone || "N/A"}</p>
              <p><b>Status:</b> {selected.is_blocked ? "Blocked" : "Active"}</p>
            </div>

            <button
              onClick={() => setOpenView(false)}
              className="mt-5 w-full bg-brand-600 text-white py-2 rounded-xl"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}