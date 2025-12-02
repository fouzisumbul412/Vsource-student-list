"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();
  return (
    <div className="flex justify-center items-center flex-col w-full p-10 text-center">
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="mt-4">You do not have permission to view this page.</p>

      <Button
        onClick={() => router.back()}
        className="mt-4 bg-black/70 hover:bg-black"
      >
        Go Back
      </Button>
    </div>
  );
}
