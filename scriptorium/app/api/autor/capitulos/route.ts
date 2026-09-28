import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { autorLogado } from "@/lib/auth";

export async function POST(req: Request) {
  const autor = await autorLogado();
  if (!autor) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const { livro_id, titulo, conteudo } = await req.json();
  if (!livro_id || !titulo || !conteudo) {
    return NextResponse.json({ erro: "Preencha todos os campos." }, { status: 400 });
  }

  // client autenticado do próprio autor. A policy "capitulos: dono do livro
  // cria" já confere no banco se livro_id pertence a este autor — se não
  // pertencer, o insert falha (RLS), mesmo que o livro_id venha manipulado.
  const supabase = await supabaseServer();

  const { data: ultimo } = await supabase
    .from("capitulos")
    .select("numero")
    .eq("livro_id", livro_id)
    .order("numero", { ascending: false })
    .limit(1);

  const numero = (ultimo?.[0]?.numero ?? 0) + 1;

  const { data, error } = await supabase
    .from("capitulos")
    .insert({ livro_id, numero, titulo, conteudo })
    .select()
    .single();

  if (error) {
    // erro mais comum aqui costuma ser RLS (livro não é seu) ou coluna
    // "conteudo" com tamanho limitado no schema (varchar em vez de text)
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
