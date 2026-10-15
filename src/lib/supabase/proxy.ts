import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./env";

/**
 * Refreshes the Supabase session cookie on dashboard and portal requests and sends
 * signed-out visitors to the right login page. Admin rights are re-checked on the server.
 */
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Must run straight after creating the client so expired tokens are refreshed.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;

  // Internship portal: invite links work signed out; everything else needs a session.
  if (pathname.startsWith("/portal")) {
    const isPortalLogin = pathname === "/portal/login";
    const isPublic = isPortalLogin || pathname.startsWith("/portal/join/");
    if (!signedIn && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return redirectWithCookies(url, response);
    }
    if (signedIn && isPortalLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      url.search = "";
      return redirectWithCookies(url, response);
    }
    return response;
  }

  const isLogin = pathname === "/admin/login";
  // Coordinator invite links work signed out, so new team members can create an account.
  if (pathname.startsWith("/admin/join/")) return response;

  if (!signedIn && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return redirectWithCookies(url, response);
  }
  if (signedIn && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
