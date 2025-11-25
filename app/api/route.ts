// app/api/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await prisma.user.findMany();
    return NextResponse.json({ user });
}
