import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.


    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 1. Enforce Auth for Protected Routes
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/project") ||
        request.nextUrl.pathname.startsWith("/reviewer") ||
        request.nextUrl.pathname.startsWith("/organizer");

    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // 2. Role-Based Logic for Authenticated Users
    if (user) {
        // Fetch user profile to get role
        // Note: This adds a DB call to every protected request. 
        // In high-scale apps, this should be cached (e.g., in a session cookie or JWT custom claim).
        // For MVP, direct DB call is acceptable.
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();

        const role = profile?.role;

        // 3. Handle Root/Login Redirection (If logged in, go to specific dashboard)
        if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/login") {
            if (role === 'admin') return NextResponse.redirect(new URL("/admin/users", request.url));
            if (role === 'reviewer') return NextResponse.redirect(new URL("/reviewer", request.url));
            if (role === 'organizer') return NextResponse.redirect(new URL("/organizer", request.url));
            return NextResponse.redirect(new URL("/project", request.url)); // Default to project leader
        }

        // 4. Enforce Role Protection on Specific Routes
        const path = request.nextUrl.pathname;
        let isAuthorized = true;

        if (path.startsWith("/admin") && role !== 'admin') isAuthorized = false;
        if (path.startsWith("/reviewer") && role !== 'reviewer') isAuthorized = false;
        if (path.startsWith("/organizer") && role !== 'organizer') isAuthorized = false;

        if (!isAuthorized) {
            // Redirect to their allowed home
            if (role === 'admin') return NextResponse.redirect(new URL("/admin/users", request.url));
            if (role === 'reviewer') return NextResponse.redirect(new URL("/reviewer", request.url));
            if (role === 'organizer') return NextResponse.redirect(new URL("/organizer", request.url));
            return NextResponse.redirect(new URL("/project", request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
