"use client";

import { useEffect, useState } from "react";
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
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/audit")
      .then((res) => res.json())
      .then((data) => setLogs(data.data))
      .catch((err) => console.error("Error fetching audit logs:", err));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.role?.toLowerCase().includes(search.toLowerCase()) ||
      log.userId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="p-6 m-6 shadow-lg">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
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
            {filteredLogs.map((log) => (
              <>
                <TableRow key={log.id}>
                  <TableCell>{log.userId || "System"}</TableCell>
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
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => toggleExpand(log.id)}
                      className="flex items-center gap-2"
                    >
                      {expandedRow === log.id ? "Hide" : "Show"}
                      {expandedRow === log.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>

                {expandedRow === log.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted">
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">Old Values</h3>
                          <pre className="bg-gray-900 text-gray-200 p-3 rounded-lg text-sm overflow-auto max-h-64">
                            {log.oldValues
                              ? JSON.stringify(log.oldValues, null, 2)
                              : "N/A"}
                          </pre>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">New Values</h3>
                          <pre className="bg-gray-900 text-gray-200 p-3 rounded-lg text-sm overflow-auto max-h-64">
                            {log.newValues
                              ? JSON.stringify(log.newValues, null, 2)
                              : "N/A"}
                          </pre>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
