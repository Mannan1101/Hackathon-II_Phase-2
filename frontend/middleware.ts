import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected route middleware for Next.js App Router.
 *
 * Redirects unauthenticated users to /login when accessing protected routes.
 * Protected routes: /tasks and any other authenticated pages.
 * Public routes: /, /login, /register, /api/auth/*
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = pathname.startsWith("/api/auth");

  // Allow public routes and auth API routes
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Check for authentication token in cookies
  // Better Auth stores the session token in a cookie named "better-auth.session_token"
  const sessionToken = request.cookies.get("better-auth.session_token");

  // If no session token, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    // Add redirect parameter to return user to original destination after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on.
 *
 * Matcher configuration:
 * - Runs on all routes except static files, images, and Next.js internals
 * - Protects /tasks and other authenticated routes
 * - Allows public routes through for authentication check
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
