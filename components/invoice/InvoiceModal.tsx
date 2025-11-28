import { useRef } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { toWords } from "number-to-words";

const COMPANY = {
  name: "VSOURCE VARSITY PRIVATE LIMITED",
  address:
    "#PLOT NO:13, VASANTH NAGAR, DHARMA REDDY COLONY PHASE-2, KPHB COLONY, HYDERABAD - 500085 ",
  gstNo: "36AAKCV9728P1Z8",
  cin: "U85499TS2025PTC197291",
};
const splitGST = (state: string | undefined, totalGst: number) => {
  if (!state) return { cgst: "0", sgst: "0", igst: totalGst.toFixed(2) };
  if (state.toUpperCase() === "TELANGANA") {
    const half = (totalGst / 2).toFixed(2);
    return { cgst: half, sgst: half, igst: "0.00" };
  }
  return { cgst: "0.00", sgst: "0.00", igst: totalGst.toFixed(2) };
};
export function InvoiceModal({ data, onClose }: any) {
  if (!data) return null;
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  const p = data;
  const s = p.student;
  const gst = splitGST(s.state, p.gstAmount || 0);
  function numberToWordsFormatted(num: number) {
    return toWords(num).replace(/,/g, "").toUpperCase();
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${p?.invoiceNumber || "invoice"}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center py-10 z-50 overflow-y-auto">
      <div
        ref={invoiceRef}
        className="bg-white w-[210mm] min-h-[297mm] p-6 shadow-lg relative border border-gray-400 text-[13px] font-[Calibri] leading-tight"
      >
        {/* Header */}
        <h1 className="text-xl font-bold text-center mb-2 uppercase tracking-wide">
          TAX INVOICE
        </h1>

        {/* Top Section */}
        <div className="grid grid-cols-2 border border-gray-500">
          {/* Left Box */}
          <div className="p-3 border-r border-gray-500">
            <p>
              <span>From:</span>
              <br /> {COMPANY.name}
            </p>
            <p>
              <span>ADDRESS:</span> {COMPANY.address}
              <br />
              Mobile: +91 9160411119
            </p>
          </div>

          {/* Right Box */}
          <div className="p-3 text-sm">
            <p>
              <strong>Invoice No.</strong> {p.invoiceNumber}
            </p>
            <p>
              <strong>Dated </strong>
              {new Date(p.date).toLocaleDateString()}
            </p>
            <p>
              <strong>CIN:</strong> U80904TG2017PTC116397
            </p>
            <p>
              <strong>GST NO.</strong> 36AAFCV8632D1Z9
            </p>
            <p>
              <strong>SID:</strong> ABMS1
            </p>
          </div>
        </div>

        {/* Invoice To Section */}
        <div className="border border-gray-500 border-t-0 p-3 text-sm">
          <p className="font-bold uppercase">Invoice To:</p>
          <p className="">
            {s.studentName} S/O {s.fathersName}
          </p>
          <p className="text-xs">
            ADDRESS: H NO:- {s.addressLine1 || "Not Provided"}{" "}
            {s.addressLine2 || "Not Provided"} <br />
            {s.mobileNumber} {","} {s.parentMobile}
          </p>
        </div>

        {/* Table */}
        <table className="w-full mt-2 border border-gray-500 text-xs">
          <thead>
            <tr className="bg-gray-100 text-center uppercase text-[11px]">
              <th className="border p-1 w-12">S No</th>
              <th className="border p-1">Description</th>
              <th className="border p-1 w-16">HSN/SAC</th>
              <th className="border p-1 w-10">QTY</th>
              <th className="border p-1 w-20">Rate</th>
              <th className="border p-1 w-20">IGST 18%</th>
              <th className="border p-1 w-20">CGST 9%</th>
              <th className="border p-1 w-20">SGST 9%</th>
              <th className="border p-1 w-24">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr className="text-center">
              <td className="border p-1">1</td>
              <td className="border p-1">
                {s.feeType}
                <br />
                {s.abroadMasters}
              </td>
              <td className="border p-1">9992</td>
              <td className="border p-1">1</td>
              <td className="border p-1">₹{p.amount}</td>
              <td className="border p-1">₹{gst.igst}</td>
              <td className="border p-1">₹{gst.cgst}</td>
              <td className="border p-1">₹{gst.sgst}</td>
              <td className="border p-1">₹{p.amount + (p.gstAmount || 0)}</td>
            </tr>
            <tr className="text-right font-bold">
              <td className="border p-1 text-center" colSpan={8}>
                TOTAL
              </td>
              <td className="border p-1">
                ₹{(p.amount + (p.gstAmount || 0)).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words and notes */}
        <div className="border border-gray-500 border-t-0 p-3 text-xs">
          <p>
            <strong>Amount:</strong>{" "}
            {numberToWordsFormatted(p.amount + (p.gstAmount || 0))} RUPEES ONLY
          </p>

          <p className="mt-1">
            <strong>
              ({p.paymentMethod.toUpperCase()} -
              {p.paymentMethod ? p.referenceNo : ""})
            </strong>
          </p>
        </div>

        {/* Bank Details & Stamp Section */}
        <div className="grid grid-cols-2 border border-gray-500 border-t-0">
          {/* Bank Details */}
          <div className="p-3 text-xs border-r border-gray-500 leading-tight">
            <p className="font-bold uppercase">Bank Details:</p>
            <p>BANK NAME: HDFC BANK</p>
            <p>A/C NAME: VSOURCE EDUCATIONAL CONSULTANTS PVT. LTD</p>
            <p>A/C NO: 59209160411119</p>
            <p>A/C TYPE: CURRENT</p>
            <p>IFSC:- HDFC0004326</p>
            <p>MOSARAMBAGH BRANCH , HYDERABAD, TELANGANA</p>
          </div>

          {/* Stamp */}
          <div className="p-3 flex flex-col items-center justify-between">
            <img src="/assets/stamp.jpg" className="w-52 opacity-95" />
            <p className="text-[11px] font-semibold mt-2 text-center">
              FOR VSOURCE EDUCATIONAL CONSULTANTS PVT. LTD
            </p>
            <p className="text-[11px] mt-6">AUTHORIZED SIGNATORY</p>
          </div>
        </div>

        {/* Terms & Receiver Signature */}
        <div className="border border-gray-500 border-t-0 p-3 grid grid-cols-2 text-xs">
          <div>
            <p className="font-bold uppercase mb-2">Terms & Conditions:</p>
            <p>1) INCASE OF CANCELLATION AMOUNT WILL NOT BE REFUNDED</p>
            <p>2) SUBJECT TO HYDERABAD JURISDICTION ONLY</p>
          </div>
          <div className="flex justify-end items-end pr-20">
            <p>RECEIVER SIGNATURE</p>
          </div>
        </div>
      </div>
  <div className="no-print fixed bottom-6 right-6 flex gap-3">
  <Button variant="outline" onClick={handleDownloadPdf}>
    Download PDF
  </Button>
  <Button onClick={handlePrint}>Print A4</Button>
</div>

    </div>
  );
}
