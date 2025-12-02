import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { roleAccess } from "./utils/roleAccess";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/login-step1",
  "/auth/login-step2",
  "/access-denied",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const isPublicRoute = PUBLIC_PATHS.includes(pathname);

  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const decoded: any = jwt.decode(token);
    const role = decoded?.role;

    if (role === "SUB_ADMIN") {
      return NextResponse.redirect(new URL("/student-registration", req.url));
    }

    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isPublicRoute) {
    if (pathname === "/access-denied") {
      return NextResponse.next();
    }

    if (token) {
      const decoded: any = jwt.decode(token);
      const role = decoded?.role;

      if (role === "SUB_ADMIN") {
        return NextResponse.redirect(new URL("/student-registration", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const decoded: any = jwt.decode(token);
  const role = decoded?.role;

  const allowedRoutes = roleAccess[role];

  if (allowedRoutes?.includes("*")) {
    return NextResponse.next();
  }

  const isAllowed = allowedRoutes?.some((route) => pathname.startsWith(route));

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
