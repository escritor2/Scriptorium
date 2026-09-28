import { supabaseServer } from "@/lib/supabase/server";

// Retorna o usuário autor logado (ou null). Substitui o antigo
// "ehAutor()" de senha única — agora cada autor tem sua própria conta.
export async function autorLogado() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
