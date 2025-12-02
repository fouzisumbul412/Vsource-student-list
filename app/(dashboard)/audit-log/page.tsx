"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

type AuditLog = {
  id: string;
  userId: string | null;
  role: string | null;
  module: string;
  recordId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

const sensitiveFields = [
  "id",
  "userId",
  "studentId",
  "recordId",
  "password",
  "createdAt",
  "updatedAt",
  "date",
  "time",
];

const fetchAuditLogs = async () => {
  try {
    const { data } = await axios.get("/api/audit", { withCredentials: true });
    return data?.data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || "Failed to load audit logs"
    );
  }
};

export default function AuditLogPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AuditLog[]>({
    queryKey: ["audit-logs"],
    queryFn: fetchAuditLogs,
    staleTime: 0,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;

    const term = search.toLowerCase();

    return logs.filter((log) => {
      const module = log?.module?.toLowerCase() || "";
      const action = log?.action?.toLowerCase() || "";
      const name = log?.user?.name?.toLowerCase() || "";
      const email = log?.user?.email?.toLowerCase() || "";
      const role = log?.role?.toLowerCase() || "";

      return (
        module.includes(term) ||
        action.includes(term) ||
        name.includes(term) ||
        email.includes(term) ||
        role.includes(term)
      );
    });
  }, [logs, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const d1 = new Date(a.createdAt).getTime();
      const d2 = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? d2 - d1 : d1 - d2;
    });
  }, [filtered, sortOrder]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = Math.ceil(sorted.length / pageSize);

  return (
    <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-lg font-semibold sm:text-2xl">
              Audit Log History
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track all create, update, and delete actions in the system.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-end">
            {/* Search */}
            <div className="flex flex-col w-full sm:w-auto text-sm">
              <label className="text-xs mb-1 font-medium">Search</label>
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="rounded-lg border shadow-sm px-3 py-2 w-full sm:w-64"
              />
            </div>

            {/* 🔥 Sort Dropdown */}
            <div className="flex flex-col text-sm">
              <label className="text-xs mb-1 font-medium">Sort By</label>
              <Select
                value={sortOrder}
                onValueChange={(v) => {
                  setSortOrder(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest → Oldest</SelectItem>
                  <SelectItem value="asc">Oldest → Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card className="mt-4 p-4 shadow-md">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center gap-2 p-6">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              Loading...
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="p-6 text-red-600">
              {error?.message || "Failed to load audit logs"}
              <Button onClick={() => refetch()} className="mt-3">
                Retry
              </Button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && paginated.length === 0 && (
            <div className="p-6">No logs found</div>
          )}

          {/* TABLE */}
          {!isLoading && !isError && paginated.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((log) => (
                    <Fragment key={log.id}>
                      <TableRow className="text-center">
                        <TableCell>{log?.user?.name || "System"}</TableCell>
                        <TableCell>{log?.user?.email || "System"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.role || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>{log.module}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.action === "CREATE"
                                ? "default"
                                : log.action === "UPDATE"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.userAgent}
                        </TableCell>
                        <TableCell>
                          {new Date(log.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === log.id ? null : log.id
                              )
                            }
                          >
                            {expandedRow === log.id ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details */}
                      {expandedRow === log.id && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-gray-50 p-4">
                            <div className="overflow-x-auto border rounded-md">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-200 text-gray-900">
                                  <tr>
                                    <th className="p-2 border">Field</th>
                                    <th className="p-2 border text-red-600">
                                      Old Value
                                    </th>
                                    <th className="p-2 border text-green-600">
                                      New Value
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {Object.keys({
                                    ...log.oldValues,
                                    ...log.newValues,
                                  })
                                    .filter(
                                      (field) =>
                                        !sensitiveFields.includes(field)
                                    )
                                    .map((field) => {
                                      const oldValue =
                                        log.oldValues?.[field] ?? "--";
                                      const newValue =
                                        log.newValues?.[field] ?? "--";
                                      const changed = oldValue !== newValue;

                                      return (
                                        <tr
                                          key={field}
                                          className={
                                            changed ? "bg-red-50/40" : ""
                                          }
                                        >
                                          <td className="p-2 border font-medium">
                                            {field
                                              .replace(/([A-Z])/g, " $1")
                                              .replace(/_/g, " ")
                                              .toUpperCase()}
                                          </td>
                                          <td
                                            className={`p-2 border ${
                                              changed
                                                ? "text-red-600 font-medium"
                                                : "text-gray-500"
                                            }`}
                                          >
                                            {String(oldValue)}
                                          </td>
                                          <td
                                            className={`p-2 border ${
                                              changed
                                                ? "text-green-600 font-medium"
                                                : "text-gray-500"
                                            }`}
                                          >
                                            {String(newValue)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
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
        </Card>
      </div>
    </main>
  );
}
