"use client";

import { Fragment, useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { User } from "@/types/loginLog";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
  user: User;
};

const sensitiveFields = [
  // Generic identifiers
  "id",
  "userId",
  "studentId",
  "recordId",
  "paymentId",
  "employeeId",

  // Contact & credentials
  "password",
  "email",
  "phone",
  "mobileNumber",
  "parentMobile",
  "passportNumber",

  // Payment-specific confidential
  "gstAmount",
  "referenceNo",
  "invoiceNumber",

  // System metadata
  "createdAt",
  "updatedAt",
  "date",
  "time",
];

const fetchAuditLogs = async () => {
  const { data } = await axios.get("/api/audit", { withCredentials: true });
  return data?.data;
};

export default function AuditLogPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: fetchAuditLogs,
    staleTime: 0,
  });

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredLogs =
    !isLoading &&
    response?.filter(
      (log) =>
        log.module.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.role?.toLowerCase().includes(search.toLowerCase()) ||
        log.userId?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Card className="p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Audit Logs</h2>
        <Input
          placeholder="Search by user, role, action, module..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72"
        />
      </div>

      <Separator className="mb-4" />

      {isLoading ? (
        <div>Loading...</div>
      ) : !response ? (
        <div>No Auduit Logs Found</div>
      ) : isError ? (
        <div>{"Failed to load Audit Logs"}</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log, id) => (
                <Fragment key={log?.id || id}>
                  <TableRow>
                    <TableCell>{log?.user.name || "System"}</TableCell>
                    <TableCell>{log?.user.email || "System"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log?.role || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>{log?.module}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log?.action === "CREATE"
                            ? "default"
                            : log?.action === "UPDATE"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {log?.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log?.ipAddress}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log?.userAgent}
                    </TableCell>
                    <TableCell>
                      {new Date(log?.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() => toggleExpand(log?.id)}
                        className="flex items-center gap-2"
                      >
                        {expandedRow === log?.id ? "Hide" : "Show"}
                        {expandedRow === log?.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {expandedRow === log.id && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-gray-50 p-4">
                        <div className="overflow-x-auto border rounded-md">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-200 text-gray-900">
                              <tr>
                                <th className="p-2 border">Field Name</th>
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
                                  (field) => !sensitiveFields.includes(field)
                                )
                                .map((field) => {
                                  const oldValue = log.oldValues?.[field];
                                  const newValue = log.newValues?.[field];
                                  const changed = oldValue !== newValue;

                                  return (
                                    <tr
                                      key={field}
                                      className={changed ? "bg-red-50/5" : ""}
                                    >
                                      {/* Format field names to Title Case */}
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
                                        {oldValue !== undefined
                                          ? String(oldValue)
                                          : "--"}
                                      </td>

                                      <td
                                        className={`p-2 border ${
                                          changed
                                            ? "text-green-600 font-semibold"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {newValue !== undefined
                                          ? String(newValue)
                                          : "--"}
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
    </Card>
  );
}
