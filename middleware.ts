import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except auth pages and API routes
        const { pathname } = req.nextUrl

        // Allow access to auth pages
        if (pathname.startsWith("/auth/")) {
          return true
        }

        // Allow access to API routes (they handle their own auth)
        if (pathname.startsWith("/api/")) {
          return true
        }

        // Require authentication for all other pages
        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
}
