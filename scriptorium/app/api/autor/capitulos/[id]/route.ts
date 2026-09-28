import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { autorLogado } from "@/lib/auth";

export async function PATCH(req: Request) {
  const autor = await autorLogado();
  if (!autor) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const id = req.url.split("/api/autor/capitulos/")[1].split("?")[0];
  const { titulo, conteudo } = await req.json();

  if (!titulo || !conteudo) {
    return NextResponse.json({ erro: "Preencha título e conteúdo." }, { status: 400 });
  }

  // client autenticado: a policy "capitulos: dono do livro edita" já bloqueia
  // no banco qualquer tentativa de editar capítulo de livro que não é seu
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("capitulos")
    .update({ titulo, conteudo })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { erro: error?.message ?? "Capítulo não encontrado ou você não é o autor do livro dele." },
      { status: error ? 500 : 403 }
    );
  }
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const autor = await autorLogado();
  if (!autor) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const id = req.url.split("/api/autor/capitulos/")[1].split("?")[0];
  const supabase = await supabaseServer();
  const { error, count } = await supabase.from("capitulos").delete({ count: "exact" }).eq("id", id);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!count) return NextResponse.json({ erro: "Capítulo não encontrado ou você não é o autor do livro dele." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
