import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const DELETE = apiHandler(async (req: Request, context: any) => {
    const { id } = context.params;
    if (!id) {
        return NextResponse.json(
            new ApiResponse(400, null, "Audit Log ID is required"),
            { status: 400 }
        );
    }

    const deleted = await prisma.auditLog.delete({
        where: { id },
    });

    return NextResponse.json(
        new ApiResponse(200, deleted, "Audit log deleted successfully")
    );
});