import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error("Preencha o .env.local com as chaves do Supabase antes de rodar.");
}

// Client "de servidor": lê/escreve a sessão do autor a partir do cookie.
// Use este em Server Components, Route Handlers e Server Actions.
// Como respeita RLS (usa a chave anon + sessão do usuário), qualquer
// insert/update já é automaticamente restrito ao próprio autor.
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(url!, anon!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // chamado a partir de um Server Component (sem permissão de escrever
          // cookie) — o middleware cuida de renovar a sessão nesse caso.
        }
      },
    },
  });
}
