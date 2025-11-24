import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 via-slate-50 to-sky-50 px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          VSource Education Admin Panel
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Secure portal for student registrations, payments, invoices and
          employee activity.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
