import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_COOKIE = "unimanage_role";

function getRoleHome(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "INSTRUCTOR":
      return "/instructor";
    case "STUDENT":
      return "/dashboard";
    default:
      return "/login";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuthPage && role) {
    return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!role) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  if (pathname.startsWith("/instructor")) {
    if (!role) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "INSTRUCTOR") return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!role) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "STUDENT") return NextResponse.redirect(new URL(getRoleHome(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*", "/dashboard/:path*", "/login", "/register"],
};
