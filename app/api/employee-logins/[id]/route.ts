import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const DELETE = apiHandler(async (req: Request, context: any) => {
    const { id } = context.params;

    if (!id) throw new ApiError(400, "Login record ID is required");

    await prisma.employeeLoginDetail.delete({
        where: { id },
    });

    return NextResponse.json(
        new ApiResponse(200, null, "Login record deleted successfully")
    );
});
