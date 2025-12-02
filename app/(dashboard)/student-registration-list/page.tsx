"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";

export default function StudentRegistrationList() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const [masters, setMasters] = useState("ALL");
  const [team, setTeam] = useState("ALL");
  const [year, setYear] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState("name-asc");

  const fetchStudents = async () => {
    const res = await axios.get("/api/student-registration", {
      withCredentials: true,
    });
    return res.data.data || [];
  };

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student-registrations"],
    queryFn: fetchStudents,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/api/student-registration/${id}`, {
        withCredentials: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-registrations"] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteMutation.mutate(id);
    }
  };

  const mastersOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((s: any) => s.abroadMasters && set.add(s.abroadMasters));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  const teamOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((s: any) => s.processedBy && set.add(s.processedBy));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  const yearOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((s: any) => s.academicYear && set.add(s.academicYear));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((s: any) => s.status && set.add(s.status));
    return ["ALL", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item: any) => {
      if (masters !== "ALL" && item.abroadMasters !== masters) return false;
      if (team !== "ALL" && item.processedBy !== team) return false;
      if (year !== "ALL" && item.academicYear !== year) return false;
      if (status !== "ALL" && item.status !== status) return false;
      if (fromDate && new Date(item.registrationDate) < new Date(fromDate))
        return false;
      if (toDate && new Date(item.registrationDate) > new Date(toDate))
        return false;
      if (search) {
        const value = search.toLowerCase();
        if (
          !(
            item.studentName?.toLowerCase().includes(value) ||
            item.email?.toLowerCase().includes(value) ||
            item.mobileNumber?.includes(value)
          )
        )
          return false;
      }
      return true;
    });
  }, [data, masters, team, year, status, fromDate, toDate, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortOrder === "name-asc")
        return a.studentName.localeCompare(b.studentName);
      if (sortOrder === "name-desc")
        return b.studentName.localeCompare(a.studentName);
      if (sortOrder === "newest")
        return (
          new Date(b.registrationDate).getTime() -
          new Date(a.registrationDate).getTime()
        );
      if (sortOrder === "oldest")
        return (
          new Date(a.registrationDate).getTime() -
          new Date(b.registrationDate).getTime()
        );
      return 0;
    });
  }, [filtered, sortOrder]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = Math.ceil(sorted.length / pageSize);

  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(sorted);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Student Registrations");
    XLSX.writeFile(book, "student-registration-list.xlsx");
  };

  return (
    <Card className="p-6 m-4 shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Student Registration List</h2>
      <div>
        {/* FILTER PANEL */}
        <Card className="p-4 mb-6 border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>

          <div
            className="grid gap-4 
              xl:grid-cols-6 
              lg:grid-cols-4 
              md:grid-cols-3 
              sm:grid-cols-2 
              grid-cols-1"
          >
            {/* Masters */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Abroad Masters</label>
              <Select
                value={masters}
                onValueChange={(v) => {
                  setMasters(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {mastersOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "ALL" ? "All" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Team</label>
              <Select
                value={team}
                onValueChange={(v) => {
                  setTeam(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {teamOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "ALL" ? "All" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={year}
                onValueChange={(v) => {
                  setYear(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt === "ALL" ? "All" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                className="h-10"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                className="h-10"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={sortOrder}
                onValueChange={(v) => {
                  setSortOrder(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A → Z</SelectItem>
                  <SelectItem value="name-desc">Name Z → A</SelectItem>
                  <SelectItem value="newest">Newest → Oldest</SelectItem>
                  <SelectItem value="oldest">Oldest → Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Search</label>
              <Input
                className="h-10"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex flex-col justify-end">
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50 h-10"
                onClick={() => {
                  setMasters("ALL");
                  setTeam("ALL");
                  setYear("ALL");
                  setStatus("ALL");
                  setFromDate("");
                  setToDate("");
                  setSearch("");
                  setSortOrder("name-asc");
                  setPage(0);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button onClick={() => {}}>Submit</Button>

            <Button
              onClick={exportExcel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Export Excel
            </Button>
          </div>
        </Card>
      </div>

      <div className="hidden md:block mt-6">
        {isLoading && (
          <p className="text-center py-4 text-slate-500">Loading…</p>
        )}
        {isError && !isLoading && (
          <p className="text-center py-4 text-red-500">Failed to load data</p>
        )}

        {!isLoading && (
          <>
            <div className="border border-gray-300 rounded-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-300">
                    <TableHead className="border-r">S.No</TableHead>
                    <TableHead className="border-r">StdId</TableHead>
                    <TableHead className="border-r">Team</TableHead>
                    <TableHead className="border-r">Assignee</TableHead>
                    <TableHead className="border-r">Counsellor</TableHead>
                    <TableHead className="border-r">Student Name</TableHead>
                    <TableHead className="border-r">Mobile Number</TableHead>
                    <TableHead className="border-r">Email</TableHead>
                    <TableHead className="border-r">Masters</TableHead>
                    <TableHead className="border-r">Father Name</TableHead>
                    <TableHead className="border-r">Father Mobile</TableHead>
                    <TableHead className="border-r">Town</TableHead>
                    <TableHead className="border-r">Status</TableHead>
                    {user?.role !== "Accounts" && (
                      <TableHead className="border-r text-center">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginated.map((item: any, index: number) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 border-b"
                    >
                      <TableCell className="border-r">
                        {page * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="border-r">{item.stid}</TableCell>
                      <TableCell className="border-r">
                        {item.processedBy}
                      </TableCell>
                      <TableCell className="border-r">
                        {item.assigneeName}
                      </TableCell>
                      <TableCell className="border-r">
                        {item.counselorName}
                      </TableCell>
                      <TableCell className="border-r">
                        {item.studentName}
                      </TableCell>
                      <TableCell className="border-r">
                        {item.mobileNumber}
                      </TableCell>
                      <TableCell className="border-r">{item.email}</TableCell>
                      <TableCell className="border-r">
                        {item.abroadMasters}
                      </TableCell>
                      <TableCell className="border-r">
                        {item.fathersName}
                      </TableCell>
                      <TableCell className="border-r">
                        {item.parentMobile}
                      </TableCell>
                      <TableCell className="border-r">{item.city}</TableCell>
                      <TableCell className="border-r">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                            {
                              "bg-green-100 text-green-700":
                                item.status === "CONFIRMED",
                              "bg-yellow-100 text-yellow-700":
                                item.status === "HOLD",
                              "bg-red-100 text-red-700":
                                item.status === "CANCELLED",
                            }
                          )}
                        >
                          {item.status}
                        </span>
                      </TableCell>

                      {user?.role !== "Accounts" && (
                        <TableCell className="border-r text-center flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() =>
                              router.push(`/student-registration/${item.id}`)
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {paginated.length === 0 && (
              <p className="text-center py-4 text-slate-500">
                No records found
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span>
            Page {page + 1} of {totalPages || 1}
          </span>

          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
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
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          Next
        </Button>
      </div>

      <div className="md:hidden grid gap-4 mt-6">
        {paginated.map((item: any) => (
          <Card key={item.id} className="p-4 shadow-sm border">
            <div className="font-semibold">{item.studentName}</div>
            <div className="text-sm">ID: {item.stid}</div>
            <div className="text-sm">Mobile: {item.mobileNumber}</div>
            <div className="text-sm">Email: {item.email}</div>
            <div className="text-sm">Team: {item.processedBy}</div>
            <div
              className={cn("text-sm font-medium px-2 py-1 rounded-md w-fit", {
                "text-green-700 bg-green-100": item.status === "CONFIRMED",
                "text-amber-700 bg-amber-100": item.status === "HOLD",
                "text-red-700 bg-red-100": item.status === "CANCELLED",
              })}
            >
              {item.status}
            </div>

            {user?.role !== "Accounts" && (
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/student-registration/${item.id}`)
                  }
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        ))}

        {paginated.length === 0 && !isLoading && (
          <p className="text-center py-4 text-slate-500">No records found</p>
        )}
      </div>
    </Card>
  );
}
