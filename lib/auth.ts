import { NextRequest } from "next/server";

const AUTH_COOKIE = "vsource_jwt";

export function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  return Boolean(token);
}
