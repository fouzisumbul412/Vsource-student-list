import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = apiHandler(async () => {
  cookies().set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });

  return NextResponse.json(
    new ApiResponse(200, null, "Logged out successfully")
  );
});
