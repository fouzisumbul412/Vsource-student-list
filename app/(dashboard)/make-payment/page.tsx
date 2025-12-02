"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function MakePaymentPage() {
  const router = useRouter();

  const fetchConfirmedStudents = async () => {
    try {
      const { data } = await axios.get(
        "/api/student-registration?status=CONFIRMED",
        { withCredentials: true }
      );
      return data;
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message || "Failed to load students"
      );
    }
  };

  const {
    data: students,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["confirmed-students"],
    queryFn: fetchConfirmedStudents,
    placeholderData: keepPreviousData,
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState("name-asc");

  if (isError) {
    toast({
      title: error.message,
      description: "Failed to load students",
    });
  }

  const list = students?.data || [];

  const sorted = useMemo(() => {
    return [...list].sort((a, b) => {
      if (sortOrder === "name-asc") {
        return a.studentName.localeCompare(b.studentName);
      }
      if (sortOrder === "name-desc") {
        return b.studentName.localeCompare(a.studentName);
      }
      if (sortOrder === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortOrder === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return 0;
    });
  }, [list, sortOrder]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = Math.ceil(sorted.length / pageSize);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Make Payments</h1>

      <div className="flex items-center justify-between mb-4">
        <Select
          value={sortOrder}
          onValueChange={(v) => {
            setSortOrder(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A → Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z → A)</SelectItem>
            <SelectItem value="newest">Newest → Oldest</SelectItem>
            <SelectItem value="oldest">Oldest → Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-md">
        <table className="min-w-full text-sm border">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Student Name</th>
              <th className="p-3 border">Mobile</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Abroad-Masters</th>
              <th className="p-3 border">Service Fee</th>
              <th className="p-3 border text-center">Make Payment</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading &&
              paginated.map((item: any, index: number) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="p-3 border">{page * pageSize + index + 1}</td>
                  <td className="p-3 border">{item.studentName}</td>
                  <td className="p-3 border">{item.mobileNumber}</td>
                  <td className="p-3 border">{item.email}</td>
                  <td className="p-3 border">{item.abroadMasters}</td>
                  <td className="p-3 border">{item.serviceCharge}</td>

                  <td className="p-3 border text-center">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push(`/make-payment/${item.id}`)}
                    >
                      +
                    </Button>
                  </td>

                  <td className="p-3 border text-green-600 font-semibold">
                    {item.status}
                  </td>
                </tr>
              ))}

            {!isLoading && paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-slate-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
        >
          Next
        </Button>
      </div>
    </main>
  );
}
