// src/components/login/EmployeeLoginTable.tsx
"use client";

import React, { useState } from "react";
import { LoginLog } from "@/types/loginLog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { Button } from "../ui/button";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Props = {
  items: LoginLog[];
  loading?: boolean;
  isError?: boolean;
  error?: Error | null;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export const EmployeeLoginTable: React.FC<Props> = ({
  items,
  loading,
  page,
  pageSize,
  total,
}) => {
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + items.length, total);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/employee-logins/${id}`);
      return res.data;
    },
    onSuccess: async (data) => {
      setDeleteOpen(false);
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["employee-login"] });
      toast.success(data?.message || "Deleted Successfully");
    },
    onError: async (err: any) => {
      toast.error(err?.response?.data?.message || "Delete failed");
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
  };

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>S No</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Login Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-6 text-center text-sm text-slate-600"
                >
                  Loading login history...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-6 text-center text-sm text-slate-600"
                >
                  No login records found for the selected date.
                </TableCell>
              </TableRow>
            ) : (
              items.map((log, idx) => (
                <TableRow key={log?.id} className="hover:bg-slate-50/60">
                  <TableCell className="text-xs text-slate-500">
                    {startIndex + idx + 1}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-900">
                    {log?.user?.employeeId}
                  </TableCell>
                  <TableCell className="text-sm text-slate-800">
                    {log?.user?.name}
                  </TableCell>
                  <TableCell className="text-sm text-slate-800">
                    {log?.user?.email}
                  </TableCell>
                  <TableCell className="text-sm text-slate-800">
                    {log?.user?.loginType}
                  </TableCell>
                  <TableCell className="text-sm text-slate-800">
                    {log?.loginTime
                      ? new Date(log.loginTime).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-800">
                    {log?.loginTime
                      ? new Date(log.loginTime).toLocaleString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteId(log.id);
                        setDeleteOpen(true);
                      }}
                      className="bg-white"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-600">
          {total === 0 ? (
            "Showing 0 to 0 of 0 entries"
          ) : (
            <>
              Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
              <span className="font-semibold">{endIndex}</span> of{" "}
              <span className="font-semibold">{total}</span> entries
            </>
          )}
        </div>
      </div>
      <DeleteConfirmDialog
        isLoading={deleteMutation.isPending}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Login Record"
        description="Are you sure you want to delete this login history entry? This cannot be undone."
      />
    </div>
  );
};
