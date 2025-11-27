"use client";

import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback } from "react";
import { useMemo } from "react";

// ---------------------------
// Number To Words (Kept the original function)
// ---------------------------
function numberToWords(num: number): string {
  // ... (Your original numberToWords function code remains here) ...
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] + " Hundred " + (n % 100 ? inWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        " Thousand " +
        (n % 1000 ? inWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        " Lakh " +
        (n % 100000 ? inWords(n % 100000) : "")
      );
    return "";
  }

  return inWords(num).trim() + " Rupees Only";
}

export default function InvoicePage() {
  const { id } = useParams();

  const fetchPayment = async () => {
    const res = await api.get(`/api/payment/${id}`);
    return res.data.data;
  };

  const { data: payment, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: fetchPayment,
  });

  const printInvoice = useCallback(() => {
    window.print();
  }, []);

  // Use useMemo for computed values to match the image's data flow
  const computedValues = useMemo(() => {
    if (!payment) return null;

    // The payment.amount in the database is the pre-tax value (169491.53 in the image)
    const baseAmount = parseFloat(payment.amount);
    const taxRate = 0.18; // 18%
    const isTelangana = payment.student.state?.toLowerCase() === "telangana";
    const gstAmt = baseAmount * taxRate;

    // CGST and SGST are applied if the state is Telangana (Intra-state)
    const cgst = isTelangana ? gstAmt / 2 : 0;
    const sgst = isTelangana ? gstAmt / 2 : 0;

    // IGST is applied if the state is NOT Telangana (Inter-state)
    const igst = !isTelangana ? gstAmt : 0;

    // Total is the base amount plus the full GST amount
    const total = baseAmount + gstAmt;

    // The image shows a hardcoded total of 200000
    // We will use the calculated total based on your logic, but
    // you might want to adjust the baseAmount to match 200000 exactly
    // e.g., total = 200000
    // total = Math.round(total) // Rounding for display

    return {
      baseAmount: baseAmount.toFixed(2),
      gstAmt: gstAmt.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      total: total.toFixed(2),
      words: numberToWords(Math.round(total)),
      isTelangana,
    };
  }, [payment]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!payment || !computedValues)
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Invoice Not Found
      </div>
    );

  const { baseAmount, igst, cgst, sgst, total, words } = computedValues;
  const student = payment.student;

  return (
    <div className="p-6 bg-slate-100 min-h-screen print:p-0 print:bg-white">
      {/* Print Button */}
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={printInvoice}>Print</Button>
      </div>

      {/* A4 container with a fixed border */}
      <div className="bg-white mx-auto w-[210mm] min-h-[297mm] border border-black text-black">
        <div className="p-4 print:p-0">
          {" "}
          {/* Inner padding for the content */}
          {/* TITLE */}
          <h1 className="text-center font-bold text-lg border-b border-black py-2 tracking-widest">
            TAX INVOICE
          </h1>
          {/* TOP ROW - GRID LAYOUT */}
          <div className="grid grid-cols-[60%_40%] text-[10px] sm:text-xs">
            {/* FROM - LEFT */}
            <div className="border-r border-black py-2 px-3 leading-[1.3]">
              <p className="font-bold">FROM:</p>
              <p className="font-semibold text-[11px] sm:text-sm">
                VSOURCE EDUCATIONAL CONSULTANTS PVT. LTD
              </p>
              <p>#16-11-477/61/A/B/C/D/E, NEAR SHASHI HOSPITAL,</p>
              <p>DILSHUKNAGAR, HYDERABAD-500060, TELANGANA</p>
              <p>MOBILE: +91 9160411119</p>
            </div>

            {/* Invoice Info - RIGHT */}
            <div className="grid grid-cols-[1fr_1fr] gap-x-1 py-2 px-3 leading-[1.3] font-semibold">
              <p className="whitespace-nowrap">INVOICE NO.</p>
              <p className="font-normal border-b border-black">
                {payment.invoiceNumber}
              </p>

              <p className="whitespace-nowrap">DATED</p>
              <p className="font-normal border-b border-black">
                {new Date(payment.date)
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  .toUpperCase()
                  .replace(/ /g, " ")}
              </p>

              <p className="col-span-2">CIN. U80904TG2017PTC116397</p>
              <p className="col-span-2">GST NO. 36AAFCV8632D1Z9</p>
              <p className="col-span-2">SID: ABMS1869</p>
            </div>
          </div>
          {/* TO SECTION - Full width with border-top */}
          <div className="border-t border-black text-[10px] sm:text-xs py-2 px-3 leading-[1.3]">
            <p className="font-bold">INVOICE TO:</p>
            <p className="font-semibold">{student.studentName}</p>
            <p>
              ADDRESS: {student.addressLine1}, {student.city}, {student.state} -{" "}
              {student.pincode}
            </p>
            <p>MOBILE: {student.phone}</p>
          </div>
          {/* ITEM TABLE */}
          <table className="w-full text-[10px] sm:text-xs border-t border-black">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-l-0 border border-black p-2 w-10">
                  S NO
                </th>
                <th className="border border-black p-2 text-left w-2/5">
                  DESCRIPTION
                </th>
                <th className="border border-black p-2 w-[10%]">HSN/SAC</th>
                <th className="border border-black p-2 w-[5%]">QTY</th>
                <th className="border border-black p-2 w-[12%]">RATE</th>
                <th className="border border-black p-2 w-[10%]">IGST 18%</th>
                <th className="border border-black p-2 w-[8%]">CGST 9%</th>
                <th className="border border-black p-2 w-[8%]">SGST 9%</th>
                <th className="border border-black p-2 w-[12%]">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-l-0 border border-black p-2 text-center">
                  1
                </td>
                <td className="border border-black p-2 text-left">
                  {student.abroadMasters}
                </td>
                <td className="border border-black p-2 text-center">9992</td>
                <td className="border border-black p-2 text-center">1</td>
                <td className="border border-black p-2 text-right">
                  {baseAmount}
                </td>
                <td className="border border-black p-2 text-right">{igst}</td>
                <td className="border border-black p-2 text-right">{cgst}</td>
                <td className="border border-black p-2 text-right">{sgst}</td>
                <td className="border border-black p-2 text-right">{total}</td>
              </tr>
              {/* Empty rows to push total to the bottom - mimic the image's height */}
              {[...Array(2)].map((_, i) => (
                <tr key={`spacer-${i}`}>
                  <td className="border-l-0 border-r border-black p-2 h-6"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* TOTAL ROW - Replicated exactly from the image */}
          <div className="grid grid-cols-[1fr_12%] border-l border-r border-b border-black text-[10px] sm:text-xs font-semibold">
            <div className="p-2 text-left">TOTAL</div>
            <div className="p-2 text-right border-l border-black">
              {total} /-
            </div>
          </div>
          {/* AMOUNT IN WORDS & E&OE */}
          <div className="grid grid-cols-2 text-[10px] sm:text-xs border-b border-black">
            <div className="py-2 px-3 border-r border-black">
              <p className="font-semibold">AMOUNT</p>
              <p className="mt-1 leading-4">{words}</p>
              <p className="font-semibold mt-1">
                (NEFT-RTGS: HSBCR22025112533454507(
                {new Date(payment.date).toLocaleDateString()}))
              </p>
            </div>
            <div className="p-2 text-right self-end">E.&O.E.</div>
          </div>
          {/* BANK + SIGN SECTION */}
          <div className="grid grid-cols-2 text-[10px] sm:text-xs border-b border-black">
            {/* Bank Details - LEFT */}
            <div className="py-2 px-3 leading-4 border-r border-black">
              <p className="font-semibold">BANK DETAILS:</p>
              <p>BANK NAME: HDFC BANK</p>
              <p>A/C NAME: VSOURCE EDUCATIONAL CONSULTANTS PVT. LTD</p>
              <p>A/C NO: 59209160141119</p>
              <p>A/C TYPE: CURRENT</p>
              <p>IFSC: HDFC0004326,</p>
              <p>MOOSARAMBAGH BRANCH,</p>
              <p>HYDERABAD, TELANGANA</p>
            </div>

            {/* Signature Block - RIGHT */}
            <div className="p-3 leading-4 relative flex flex-col justify-between">
              <p className="font-semibold text-center">
                FOR VSOURCE EDUCATIONAL CONSULTANTS PVT. LTD
              </p>

              {/* Image for Stamp/Seal */}
              {/* NOTE: You must ensure /assets/stamp.jpg is accessible and appropriately sized */}
              <div className="flex justify-center h-20">
                <Image
                  src="/assets/stamp.jpg"
                  alt="Stamp"
                  width={150}
                  height={150}
                  className="w-28 h-28 object-contain opacity-90"
                />
              </div>

              <p className="font-semibold text-center border-t border-black pt-1 mt-auto">
                AUTHORIZED SIGNATORY
              </p>
            </div>
          </div>
          {/* TERMS */}
          <div className="grid grid-cols-2 text-[10px] sm:text-xs">
            <div className="py-2 px-3 leading-4 border-r border-black">
              <p className="font-semibold">TERMS & CONDITIONS:</p>
              <p>1) INCASE OF CANCELLATION AMOUNT WILL NOT BE REFUNDED</p>
              <p>2) SUBJECT TO HYDERABAD JURISDICTION ONLY</p>
            </div>

            {/* Receiver Signature */}
            <div className="p-2 text-right self-end border-t border-black">
              RECEIVER SIGNATURE
            </div>
          </div>
        </div>

        <div className="mt-4 text-center no-print">
          <Button onClick={printInvoice}>PRINT THIS RECEIPT</Button>
        </div>
      </div>
    </div>
  );
}
