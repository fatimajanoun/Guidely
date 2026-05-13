"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, HelpCircle, ChevronDown } from "lucide-react";

import { getMajors } from "@/services/majorsService";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "@/services/faqsService";
import type { FAQ, MajorListItem } from "@/types/major";
import FaqModal from "@/components/admin/faqs/FaqModal";

export default function FaqsPage() {
  const queryClient = useQueryClient();

  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch all majors for the selector (no pagination needed for dropdown)
  const { data: majorsData } = useQuery({
    queryKey: ["majors-all"],
    queryFn: () => getMajors({ per_page: 100 }),
  });

  const majors: MajorListItem[] = majorsData?.data ?? [];

  // Fetch FAQs for selected major
  const {
    data: faqs = [],
    isLoading: faqsLoading,
  } = useQuery({
    queryKey: ["faqs", selectedMajorId],
    queryFn: () => getFaqs(selectedMajorId!),
    enabled: selectedMajorId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (data: { question: string; answer: string; sort_order: number }) =>
      createFaq(selectedMajorId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs", selectedMajorId] });
      toast.success("FAQ created");
      setModalOpen(false);
    },
    onError: () => toast.error("Failed to create FAQ"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { question: string; answer: string; sort_order: number } }) =>
      updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs", selectedMajorId] });
      toast.success("FAQ updated");
      setModalOpen(false);
      setEditingFaq(null);
    },
    onError: () => toast.error("Edit not available yet — backend route pending"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs", selectedMajorId] });
      toast.success("FAQ deleted");
      setDeletingId(null);
    },
    onError: () => toast.error("Delete not available yet — backend route pending"),
  });

  const handleModalSubmit = async (data: { question: string; answer: string; sort_order: number }) => {
    if (editingFaq) {
      await updateMutation.mutateAsync({ id: editingFaq.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const openCreate = () => {
    setEditingFaq(null);
    setModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setModalOpen(true);
  };

  const selectedMajor = majors.find((m) => m.id === selectedMajorId);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 relative overflow-hidden p-6">

      {/* Background blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-brand-300 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="mb-6 relative z-20">
        <h1 className="text-4xl font-heading text-gray-900">FAQs Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage frequently asked questions per major</p>
      </div>

      {/* Major Selector + Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-20">
        <div className="relative flex-1 max-w-sm">
          <select
            value={selectedMajorId ?? ""}
            onChange={(e) => setSelectedMajorId(e.target.value ? Number(e.target.value) : null)}
            className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-brand-100 bg-white/90 backdrop-blur text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-300 text-gray-700"
          >
            <option value="">Select a major...</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name_en}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <button
          onClick={openCreate}
          disabled={!selectedMajorId}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add FAQ
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-card border border-brand-100 overflow-hidden relative z-20">

        {/* Table header info */}
        <div className="flex items-center justify-between p-4 border-b border-brand-50">
          <span className="text-xs text-gray-400">
            {selectedMajor
              ? `${faqs.length} FAQ${faqs.length !== 1 ? "s" : ""} for ${selectedMajor.name_en}`
              : "Select a major to view FAQs"}
          </span>
        </div>

        {/* States */}
        {!selectedMajorId ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <HelpCircle className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Choose a major from the dropdown above</p>
          </div>
        ) : faqsLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 p-4 border-b animate-pulse gap-4">
                <div className="col-span-2 h-4 bg-gray-200 rounded" />
                <div className="col-span-2 h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <HelpCircle className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No FAQs yet for this major</p>
            <button
              onClick={openCreate}
              className="mt-3 text-sm text-brand-600 hover:underline font-medium"
            >
              Add the first one
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-brand-50/60 text-gray-600">
              <tr>
                <th className="p-4 text-left w-8">#</th>
                <th className="p-4 text-left">Question</th>
                <th className="p-4 text-left">Answer</th>
                <th className="p-4 text-center w-24">Order</th>
                <th className="p-4 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq, i) => (
                <tr key={faq.id} className="border-t hover:bg-brand-50/40 transition">
                  <td className="p-4 text-gray-400 text-xs">{i + 1}</td>
                  <td className="p-4 font-medium text-gray-800 max-w-xs">
                    <span className="line-clamp-2">{faq.question}</span>
                  </td>
                  <td className="p-4 text-gray-500 max-w-sm">
                    <span className="line-clamp-2">{faq.answer}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
                      {faq.sort_order}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button
                        onClick={() => openEdit(faq)}
                        title="Edit FAQ"
                        className="p-2 rounded-lg hover:bg-brand-50 text-gray-500 hover:text-brand-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this FAQ?")) {
                            setDeletingId(faq.id);
                            deleteMutation.mutate(faq.id);
                          }
                        }}
                        disabled={deleteMutation.isPending && deletingId === faq.id}
                        title="Delete FAQ"
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <FaqModal
        open={modalOpen}
        faq={editingFaq}
        onClose={() => {
          setModalOpen(false);
          setEditingFaq(null);
        }}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
