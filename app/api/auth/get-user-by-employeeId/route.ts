import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const POST = apiHandler(async (req: Request) => {
  const { employeeId } = await req.json();

  if (!employeeId) throw new ApiError(400, "Employee ID is required");

  const user = await prisma.user.findUnique({
    where: { employeeId },
    select: { name: true, employeeId: true },
  });

  if (!user) throw new ApiError(404, "No user found with this Employee ID");

  return NextResponse.json(
    new ApiResponse(200, { user }, "User fetched successfully")
  );
});
