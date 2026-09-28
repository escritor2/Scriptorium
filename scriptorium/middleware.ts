import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ehLogin = req.nextUrl.pathname === "/autor/login";
  const ehCadastro = req.nextUrl.pathname === "/autor/cadastro";

  if (!user && !ehLogin && !ehCadastro) {
    return NextResponse.redirect(new URL("/autor/login", req.url));
  }
  if (user && (ehLogin || ehCadastro)) {
    return NextResponse.redirect(new URL("/autor/painel", req.url));
  }

  return res;
}

export const config = { matcher: "/autor/:path*" };
