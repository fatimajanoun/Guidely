"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { BookOpen, Building2, Users, ClipboardList } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { getMajors } from "@/services/majorsService";
import { universityService } from "@/services/universityService";
import { userService } from "@/services/userService";

export default function AdminOverviewPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push("/login?redirect=/admin");
        return;
      }
      if (user.role !== "admin") {
        router.push("/");
        return;
      }
    }
  }, [isAuthenticated, user, loading, router]);

  const [majorsQuery, unisQuery, usersQuery] = useQueries({
    queries: [
      {
        queryKey: ["admin-overview-majors"],
        queryFn: () => getMajors({ per_page: 1, page: 1 }),
        enabled: isAuthenticated && user?.role === "admin",
      },
      {
        queryKey: ["admin-overview-unis"],
        queryFn: () => universityService.getAll(1),
        enabled: isAuthenticated && user?.role === "admin",
      },
      {
        queryKey: ["admin-overview-users"],
        queryFn: () => userService.getAll(1),
        enabled: isAuthenticated && user?.role === "admin",
      },
    ],
  });

  const statsConfig = [
    {
      label: "Majors",
      icon: BookOpen,
      value: majorsQuery.isLoading ? null : (majorsQuery.data?.meta?.total ?? "—"),
    },
    {
      label: "Universities",
      icon: Building2,
      value: unisQuery.isLoading ? null : (unisQuery.data?.meta?.total ?? "—"),
    },
    {
      label: "Users",
      icon: Users,
      value: usersQuery.isLoading ? null : (usersQuery.data?.meta?.total ?? "—"),
    },
    {
      label: "Test Questions",
      icon: ClipboardList,
      value: "—",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Platform stats and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <Icon className="h-4 w-4 text-brand-600" />
            </div>
            {value === null ? (
              <div className="mt-3 h-8 w-16 rounded bg-gray-100 animate-pulse" />
            ) : (
              <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
