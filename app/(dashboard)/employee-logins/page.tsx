"use client";

import React, { useMemo, useState } from "react";
import { LoginLog, getISTDateISO, getISTTodayISO } from "@/types/loginLog";
import { EmployeeLoginTable } from "@/components/login/EmployeeLoginTable";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function EmployeeLoginPage() {
  const [search, setSearch] = useState("");
  const [pendingDate, setPendingDate] = useState<string>(() =>
    getISTTodayISO()
  );
  const [activeDate, setActiveDate] = useState<string>(() => getISTTodayISO());

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const getLoginUsers = async () => {
    const { data } = await axios.get("/api/employee-logins", {
      withCredentials: true,
    });
    return data?.data;
  };

  const {
    data: logs = [],
    isLoading,
    isError,
    error,
  } = useQuery<LoginLog[]>({
    queryKey: ["employee-login"],
    queryFn: getLoginUsers,
    placeholderData: keepPreviousData,
  });

  const filtered = useMemo(() => {
    const byDate = logs.filter((log) => {
      if (!activeDate) return true;
      const logDateISO = getISTDateISO(log?.loginTime);
      return logDateISO === activeDate;
    });
    if (!search.trim()) return byDate;
    const term = search.toLowerCase();
    return byDate.filter((log) => {
      const id = log?.user?.employeeId?.toLowerCase() || "";
      const name = log?.user?.name?.toLowerCase() || "";
      const email = log?.user?.email?.toLowerCase() || "";
      const role = log?.user?.role?.toLowerCase() || "";
      const loginType = log?.user?.loginType?.toLowerCase() || "";
      return (
        id.includes(term) ||
        name.includes(term) ||
        email.includes(term) ||
        role.includes(term) ||
        loginType.includes(term)
      );
    });
  }, [logs, activeDate, search]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSubmitDate = () => {
    setActiveDate(pendingDate);
    setPage(0);
  };

  const todayDisplay = useMemo(() => {
    const [y, m, d] = activeDate.split("-");
    return `${d}-${m}-${y}`;
  }, [activeDate]);

  return (
    <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-lg font-semibold sm:text-2xl">
              Employee Login History
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Today’s Login Details —
              <span className="font-semibold text-slate-900">
                {todayDisplay}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-end">
            <div className="flex flex-col text-sm w-full sm:w-auto">
              <label className="text-xs mb-1 font-medium">Date</label>
              <input
                type="date"
                value={pendingDate}
                onChange={(e) => setPendingDate(e.target.value)}
                className="rounded-lg border shadow-sm px-3 py-2 w-full sm:w-48"
              />
            </div>

            <Button
              onClick={handleSubmitDate}
              className="bg-red-600 text-white w-full sm:w-auto"
            >
              Submit
            </Button>

            <div className="flex flex-col text-sm w-full sm:w-auto">
              <label className="text-xs mb-1 font-medium">Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border shadow-sm px-3 py-2 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <EmployeeLoginTable
          items={paginated}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          isError={isError}
          error={error}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
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
      </div>
    </main>
  );
}
