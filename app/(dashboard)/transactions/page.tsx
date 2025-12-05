"use client";

import { useState, useMemo, useEffect } from "react";
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

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as XLSX from "xlsx";
import { FileDown, Loader2, Scroll } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const paymentOptions = [
  { value: "online", label: "By Online Payment" },
  { value: "cash", label: "By Cash" },
  { value: "cash-deposit", label: "By Cash-Deposit" },
  { value: "neft", label: "By NEFT" },
  { value: "card-swipe", label: "By Card Swipe" },
  { value: "cheque", label: "By Cheque" },
  { value: "link", label: "By Link" },
  { value: "cash-swipe", label: "By Cash & Swipe" },
  { value: "online-cash", label: "By Online & Cash" },
];

export default function TransactionsPage() {
  const { user } = useAuth();

  const [masters, setMasters] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [openEdit, setOpenEdit] = useState<any>(null);
  const queryClient = useQueryClient();

  const [editForm, setEditForm] = useState({
    feeType: "",
    paymentMethod: "",
    amount: "",
    status: "",
    invoiceNumber: "",
    date: "",
  });

  useEffect(() => {
    if (openEdit) {
      const formattedDate = openEdit.date ? openEdit.date.split("T")[0] : "";
      setEditForm({
        feeType: openEdit.feeType || "",
        paymentMethod: openEdit.paymentMethod || "",
        amount: openEdit.amount || "",
        status: openEdit.status || "",
        invoiceNumber: openEdit.invoiceNumber || "",
        date: formattedDate,
      });
    }
  }, [openEdit]);

  const fetchPayments = async () => {
    const res = await axios.get(`/api/payment?status=APPROVED`, {
      withCredentials: true,
    });
    return res.data.data;
  };

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchPayments,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const filtered = useMemo(() => {
    return data.filter((pay: any) => {
      const s = pay.student;

      if (masters !== "ALL" && masters && s.abroadMasters !== masters)
        return false;

      if (team !== "ALL" && team && s.processedBy !== team) return false;

      if (year !== "ALL" && year && s.academicYear !== year) return false;

      if (fromDate && new Date(pay.date) < new Date(fromDate)) return false;

      if (toDate && new Date(pay.date) > new Date(toDate)) return false;

      if (search) {
        const v = search.toLowerCase();
        if (
          !(
            s.studentName.toLowerCase().includes(v) ||
            s.email.toLowerCase().includes(v) ||
            s.mobileNumber.includes(v)
          )
        )
          return false;
      }

      return true;
    });
  }, [data, masters, team, year, fromDate, toDate, search]);

  const sorted = useMemo(() => {
    return [...filtered]?.sort((a, b) => {
      const d1 = new Date(a?.date).getTime();
      const d2 = new Date(b?.date).getTime();
      return sortOrder === "desc" ? d2 - d1 : d1 - d2;
    });
  }, [filtered, sortOrder]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return sorted?.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const totalPages = Math.ceil(sorted.length / pageSize);

  const exportExcel = () => {
    const rows = sorted.map((p: any) => ({
      Invoice: p.invoiceNumber,
      Student: p.student.studentName,
      Masters: p.student.abroadMasters,
      Amount: p.amount,
      Method: p.paymentMethod,
      Date: new Date(p.date).toLocaleDateString(),
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Transactions");

    XLSX.writeFile(book, "transactions.xlsx");
  };

  const updatePaymentMutation = useMutation({
    mutationFn: async (updatedData: any) =>
      await axios.patch(`/api/payment/${updatedData.id}`, updatedData, {
        withCredentials: true,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setOpenEdit(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-blue-700">Loading data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-red-600 font-semibold">
          {error?.message || "Failed to fetch data"}
        </p>

        <Button onClick={() => refetch()} className="mt-4 bg-blue-600">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card className="p-6  shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>

        {/* ---------------- Filters ---------------- */}
        <div className="grid lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6">
          {/* Masters */}
          <div>
            <label className="text-sm font-medium">Abroad Masters</label>
            <Select
              value={masters}
              onValueChange={(v) => {
                setMasters(v);
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="ABROADMASTERS-USA">USA</SelectItem>
                <SelectItem value="ABROADMASTERS-UK">UK</SelectItem>
                <SelectItem value="ABROADMASTERS-AUSTRALIA">
                  Australia
                </SelectItem>
                <SelectItem value="ABROADMASTERS-CANADA">Canada</SelectItem>
                <SelectItem value="ABROADMASTERS-GERMANY">Germany</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team */}
          <div>
            <label className="text-sm font-medium">Team</label>
            <Select
              value={team}
              onValueChange={(v) => {
                setTeam(v);
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="TEAM-1">TEAM-1</SelectItem>
                <SelectItem value="TEAM-2">TEAM-2</SelectItem>
                <SelectItem value="TEAM-ONLINE">TEAM-ONLINE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div>
            <label className="text-sm font-medium">Year</label>
            <Select
              value={year}
              onValueChange={(v) => {
                setYear(v);
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="SPRING-2024">SPRING-2024</SelectItem>
                <SelectItem value="SPRING-2025">SPRING-2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">From</label>
            <Input
              value={fromDate}
              type="date"
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium">To</label>
            <Input
              value={toDate}
              type="date"
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
            />
          </div>

          {/* Search */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>

          {/* Sort Dropdown (NEW) */}
          <div>
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={sortOrder}
              onValueChange={(v) => {
                setSortOrder(v);
                setPage(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest → Oldest</SelectItem>
                <SelectItem value="asc">Oldest → Newest</SelectItem>
              </SelectContent>
            </Select>
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
                setFromDate("");
                setToDate("");
                setSearch("");
                setSortOrder("desc");
                setPage(0);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Export */}
        <Button
          onClick={exportExcel}
          className="bg-green-600 hover:bg-green-700 mb-4 flex gap-2"
        >
          <FileDown className="w-4 h-4" /> Export Excel
        </Button>

        {/* ---------------- Table ---------------- */}
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Student Id</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Counsellor</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Mobile No</TableHead>
                <TableHead>Masters</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Invoice No</TableHead>
                {user?.role !== "Accounts" && <TableHead>Actions</TableHead>}
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((p: any, i: number) => (
                <TableRow key={p.id}>
                  <TableCell>{page * pageSize + i + 1}</TableCell>

                  <TableCell>{p?.student?.stid}</TableCell>
                  <TableCell>{p?.student?.processedBy}</TableCell>
                  <TableCell>{p?.student?.assigneeName}</TableCell>
                  <TableCell>{p?.student?.counselorName}</TableCell>
                  <TableCell>{p?.student?.studentName}</TableCell>
                  <TableCell>{p?.student?.mobileNumber}</TableCell>
                  <TableCell>{p?.student?.abroadMasters}</TableCell>

                  <TableCell>₹{p?.amount}</TableCell>
                  <TableCell>{p?.paymentMethod}</TableCell>

                  <TableCell>
                    {new Date(p?.date).toLocaleDateString()}
                  </TableCell>

                  <TableCell>{p?.invoiceNumber}</TableCell>

                  {/* Edit */}
                  {user?.role !== "Accounts" && (
                    <TableCell>
                      <div className="text-center">
                        <button
                          onClick={() => setOpenEdit(p)}
                          className="text-blue-600 font-medium underline-offset-4 hover:underline hover:text-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </TableCell>
                  )}

                  {/* Invoice Button */}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex gap-2"
                      onClick={() => window.open(`/invoice/${p.id}`, "_blank")}
                    >
                      <Scroll className="w-4 h-4" />
                      Open
                    </Button>
                  </TableCell>

                  <TableCell>
                    <span className="text-green-600 font-semibold">
                      Approved
                    </span>
                  </TableCell>
                </TableRow>
              ))}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ---------------- Pagination Controls ---------------- */}
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

      {/* ---------------- Edit Modal ---------------- */}
      <Dialog open={!!openEdit} onOpenChange={() => setOpenEdit(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Information</DialogTitle>
          </DialogHeader>

          {openEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              <Input
                value={openEdit?.student?.studentName}
                readOnly
                className="bg-gray-100"
              />

              <Input
                value={openEdit?.student?.mobileNumber}
                readOnly
                className="bg-gray-100"
              />

              <Input
                value={openEdit?.student?.abroadMasters}
                readOnly
                className="bg-gray-100"
              />

              <Select
                value={editForm.feeType}
                onValueChange={(v) => setEditForm({ ...editForm, feeType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Fee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service-fee">Service Fee</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={editForm.paymentMethod}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, paymentMethod: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentOptions.map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm({ ...editForm, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
              />

              <Input
                value={editForm.invoiceNumber}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    invoiceNumber: e.target.value,
                  })
                }
              />

              <Input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              disabled={updatePaymentMutation.isPending}
              onClick={() => {
                const payload = {
                  ...editForm,
                  amount: Number(editForm.amount),
                  date: editForm.date
                    ? new Date(editForm.date).toISOString()
                    : null,
                };

                updatePaymentMutation.mutate({
                  id: openEdit.id,
                  ...payload,
                });
              }}
            >
              {updatePaymentMutation.isPending ? "Saving..." : "Submit"}
            </Button>

            <Button variant="destructive" onClick={() => setOpenEdit(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
