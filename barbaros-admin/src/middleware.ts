import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutes = ["/dashboard", "/agenda", "/clientes", "/servicos", "/barbeiros", "/financeiro", "/configuracoes"];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route));
  if (!requiresAuth) return response;

  const hasSessionCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
