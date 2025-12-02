"use client";

import React, { useMemo, useState } from "react";
import { SubAdmin, BranchCode } from "@/types/subAdmin";
import { subAdminService } from "@/services/subAdmin.service";
import {
  SubAdminModal,
  FormState,
  FormErrors,
} from "@/components/subadmin/SubAdminModal";
import { SubAdminTable } from "@/components/subadmin/SubAdminTable";
import { useSubAdmins } from "@/hooks/useSubAdmins";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const emptyForm: FormState = {
  staffName: "",
  mobile: "",
  email: "",
  password: "",
  branchCode: "",
};

export default function SubAdminPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();
  const { data: subAdmins = [], isLoading } = useSubAdmins();

  const filtered = useMemo(() => {
    if (!search.trim()) return subAdmins;
    const term = search.toLowerCase();
    return subAdmins.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.phone.toLowerCase().includes(term) ||
        s.employeeId.toLowerCase().includes(term)
    );
  }, [search, subAdmins]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item: SubAdmin) => {
    setEditingId(item.id);
    setForm({
      staffName: item.name,
      mobile: item.phone,
      email: item.email,
      password: item.password || "",
      branchCode: item.branch as BranchCode,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.staffName) newErrors.staffName = "Required";
    if (!form.mobile) newErrors.mobile = "Required";
    if (!form.email) newErrors.email = "Required";
    if (!form.password) newErrors.password = "Required";
    if (!form.branchCode) newErrors.branchCode = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        return subAdminService.update(editingId, {
          name: form.staffName,
          email: form.email,
          phone: form.mobile,
          password: form.password,
          branch: form.branchCode,
        });
      } else {
        return subAdminService.create({
          name: form.staffName,
          email: form.email,
          phone: form.mobile,
          password: form.password,
          branch: form.branchCode,
          loginType: "SUB_ADMIN",
          role: "SUB_ADMIN",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subAdminService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
    },
  });

  const handleDelete = (item: SubAdmin) => {
    if (confirm(`Delete "${item.name}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Sub Admin List</h1>
            <p className="text-sm text-slate-600">
              Manage staff sub admin accounts.
            </p>
          </div>

          <div className="flex gap-2 flex-col sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="rounded-lg border px-3 py-2 text-sm shadow-sm sm:w-64"
            />

            <button
              onClick={openCreateModal}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm"
            >
              + Add Sub Admin
            </button>
          </div>
        </div>

        <SubAdminTable
          items={paginated}
          loading={isLoading}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <p className="text-sm">
              Page {page + 1} of {totalPages || 1}
            </p>

            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            disabled={page + 1 >= totalPages}
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
          >
            Next
          </Button>
        </div>

        <SubAdminModal
          open={modalOpen}
          loading={saveMutation.isPending}
          title={editingId ? "Edit Sub Admin" : "Add Sub Admin"}
          mode={editingId ? "add" : "edit"}
          form={form}
          errors={errors}
          onChange={handleChange}
          onClose={() => setModalOpen(false)}
          onSubmit={() => {
            if (validate()) saveMutation.mutate();
          }}
        />
      </div>
    </main>
  );
}
