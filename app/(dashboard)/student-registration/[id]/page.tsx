"use client";

import { useQuery } from "@tanstack/react-query";
import RegistrationForm from "@/components/student-registration/RegistrationForm";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-registration", id],
    queryFn: async () => {
      const res = await axios.get(`/api/student-registration/${id}`, {
        withCredentials: true,
      });
      const student = res.data.data;

      return {
        ...student,
        // normalize for <input type="date" />
        dateOfBirth: student.dateOfBirth
          ? student.dateOfBirth.slice(0, 10)
          : "",
        registrationDate: student.registrationDate
          ? student.registrationDate.slice(0, 10)
          : "",
      };
    },
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        Loading...
      </div>
    );
  }

  if (isError || !data) {
    return <p className="p-4 text-red-500">Failed to load student</p>;
  }

  return (
    <div className="p-4">
      <RegistrationForm mode="edit" id={id} defaultValues={data} />
    </div>
  );
}
