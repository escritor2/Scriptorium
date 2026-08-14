import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const segredo = new TextEncoder().encode(process.env.JWT_SECRET || "segredo-fallback");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("autor_session")?.value;
  const ehLogin = req.nextUrl.pathname === "/autor/login";

  if (!token) {
    if (ehLogin) return NextResponse.next();
    return NextResponse.redirect(new URL("/autor/login", req.url));
  }
  try {
    await jwtVerify(token, segredo);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/autor/login", req.url));
    res.cookies.delete("autor_session");
    return res;
  }
}

export const config = { matcher: "/autor/:path*" };