"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
// import InvoiceModal from "@/components/invoice/InvoiceModal";

export default function InvoicePage({ params }: any) {
  const { id } = params;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get(`/api/payment/${id}`)
      .then((res) => setData(res.data.data))
      .catch(() => setError(true));
  }, [id]);

  if (error)
    return (
      <p className="text-center mt-10 text-red-600">Failed to load invoice</p>
    );

  if (!data) return <p className="text-center mt-10 text-gray-600">Loading…</p>;

  return <InvoiceModal data={data} onClose={() => {}} />;
}
