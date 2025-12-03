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
  const [sortOrder, setSortOrder] = useState<"new" | "old">("new");

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

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt ?? 0).getTime();
      const dateB = new Date(b.createdAt ?? 0).getTime();

      return sortOrder === "new" ? dateB - dateA : dateA - dateB;
    });
  }, [filtered, sortOrder]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

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
      password: "", // never load hashed password into form
      branchCode: item.branch as BranchCode,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.staffName.trim()) newErrors.staffName = "Required";
    if (!form.mobile.trim()) newErrors.mobile = "Required";
    if (!form.email.trim()) newErrors.email = "Required";

    // password required only on create
    if (!editingId && !form.password.trim()) {
      newErrors.password = "Required";
    }

    if (!form.branchCode) newErrors.branchCode = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const payload: {
          name: string;
          email: string;
          phone: string;
          branch: string;
          password?: string;
        } = {
          name: form.staffName,
          email: form.email,
          phone: form.mobile,
          branch: form.branchCode,
        };

        // only send password if user typed a new one
        if (form.password.trim()) {
          payload.password = form.password;
        }

        return subAdminService.update(editingId, payload);
      }

      // create
      return subAdminService.create({
        name: form.staffName,
        email: form.email,
        phone: form.mobile,
        password: form.password, // backend will hash this
        branch: form.branchCode,
        loginType: "SUB_ADMIN",
        role: "SUB_ADMIN",
      });
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

            {/* Sort dropdown */}
            <Select
              value={sortOrder}
              onValueChange={(value: "new" | "old") => {
                setSortOrder(value);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest to Oldest</SelectItem>
                <SelectItem value="old">Oldest to Newest</SelectItem>
              </SelectContent>
            </Select>

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

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <p className="text-sm">
              Page {page + 1} of {totalPages}
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
          mode={editingId ? "edit" : "add"} // ✅ fixed
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
