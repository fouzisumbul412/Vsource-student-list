import { RegistrationStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";


export const PUT = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;
  if (!id) throw new ApiError(400, "student ID is required");

  const body = await req.json();

  // 🔒 Build a clean payload with correct types
  const data = {
    // Personal Information
    studentName: body.studentName as string,
    nationality: body.nationality as string,
    fathersName: body.fathersName as string,
    dateOfBirth: body.dateOfBirth
      ? new Date(body.dateOfBirth)
      : undefined,
    mobileNumber: body.mobileNumber as string,
    email: body.email as string,
    parentMobile: body.parentMobile as string,
    gender: body.gender as string,
    registrationDate: body.registrationDate
      ? new Date(body.registrationDate)
      : undefined,

    // Present Address
    addressLine1: body.addressLine1 as string,
    addressLine2: body.addressLine2 ?? null,
    country: body.country as string,
    state: body.state as string,
    city: body.city as string,
    district: body.district as string,
    pincode: body.pincode as string,

    // Course Details
    abroadMasters: body.abroadMasters as string,
    courseName: body.courseName as string,
    serviceCharge:
      body.serviceCharge === "" || body.serviceCharge == null
        ? 0
        : Number(body.serviceCharge),
    academicYear: body.academicYear as string,
    processedBy: body.processedBy as string,
    counselorName: body.counselorName as string,
    officeCity: body.officeCity as string,
    assigneeName: body.assigneeName as string,
    passportNumber: body.passportNumber ?? null,

    // Status (enum)
    status: body.status
      ? (body.status as RegistrationStatus)
      : undefined,
  };

  const updatedStudent = await prisma.studentRegistration.update({
    where: { id },
    data,
  });

  return NextResponse.json(
    new ApiResponse(200, updatedStudent, "Student updated successfully")
  );
});


export const DELETE = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;
  if (!id) throw new ApiError(400, "student ID is required");
  await prisma.studentRegistration.delete({ where: { id } });
  return NextResponse.json(
    new ApiResponse(200, null, "Student deleted successfully")
  );
});

export const GET = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;

  if (!id) throw new ApiError(400, "student ID is required");

  const student = await prisma.studentRegistration.findUnique({
    where: { id },
    select: {
      id: true,
      stid: true,

      // personal info
      studentName: true,
      dateOfBirth: true,
      mobileNumber: true,
      email: true,
      parentMobile: true,
      fathersName: true,
      nationality: true,
      gender: true,
      registrationDate: true,

      // address
      addressLine1: true,
      addressLine2: true,
      country: true,
      state: true,
      city: true,
      district: true,
      pincode: true,

      // course details
      abroadMasters: true,
      courseName: true,
      passportNumber: true,
      serviceCharge: true,
      academicYear: true,
      officeCity: true,
      processedBy: true,
      counselorName: true,
      assigneeName: true,

      // status / others
      status: true,
      payment: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!student) {
    throw new ApiError(404, `No student found with this id ${id}`);
  }

  return NextResponse.json(
    new ApiResponse(200, student, "user fetched successfully")
  );
});
