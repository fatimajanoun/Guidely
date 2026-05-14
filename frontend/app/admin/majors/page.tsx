"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { getMajors, deleteMajor } from "@/services/majorsService";
import MajorsTable from "@/components/admin/majors/MajorsTable";
import MajorsFilters, { defaultMajorFilters, type MajorFilters } from "@/components/admin/majors/MajorsFilters";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";

const PER_PAGE = 15;

export default function AdminMajorsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MajorFilters>(defaultMajorFilters);
  const debouncedSearch = useDebounce(filters.search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-majors", page, debouncedSearch, filters.category, filters.difficulty, filters.featuredOnly],
    queryFn: () =>
      getMajors({
        page,
        per_page: PER_PAGE,
        search: debouncedSearch || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMajor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-majors"] });
      toast.success("Major deleted");
    },
    onError: () => toast.error("Failed to delete major"),
  });

  const handleFiltersChange = (next: MajorFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/majors/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this major? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Majors</h1>
          <p className="mt-1 text-sm text-gray-500">
            {meta ? `${meta.total} majors` : "Loading..."}
          </p>
        </div>
        <Button
          size="sm"
          fullWidth={false}
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/admin/majors/create")}
        >
          Add Major
        </Button>
      </div>

      <MajorsFilters filters={filters} onChange={handleFiltersChange} />

      <MajorsTable
        items={items}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {meta && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
