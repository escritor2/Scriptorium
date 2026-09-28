import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { autorLogado } from "@/lib/auth";

export async function PATCH(req: Request) {
  const autor = await autorLogado();
  if (!autor) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const id = req.url.split("/api/autor/livros/")[1].split("?")[0];
  const form = await req.formData();
  const atualizacao: Record<string, string> = {};

  const titulo = String(form.get("titulo") || "").trim();
  const genero = String(form.get("genero") || "").trim();
  const descricao = String(form.get("descricao") || "").trim();
  if (titulo) atualizacao.titulo = titulo;
  if (genero) atualizacao.genero = genero;
  if (descricao) {
    if (descricao.length > 500) {
      return NextResponse.json({ erro: "A descrição pode ter no máximo 500 caracteres." }, { status: 400 });
    }
    atualizacao.descricao = descricao;
  }

  const capa = form.get("capa");
  if (capa && capa instanceof File && capa.size > 0) {
    const nome = Date.now() + "-" + capa.name.replace(/[^\w.\-]/g, "_");
    const bytes = await capa.arrayBuffer();
    const { error } = await supabaseAdmin.storage
      .from("capas")
      .upload(nome, Buffer.from(bytes), { contentType: capa.type });
    if (error) return NextResponse.json({ erro: "Falha no upload da capa: " + error.message }, { status: 500 });
    atualizacao.capa_url = supabaseAdmin.storage.from("capas").getPublicUrl(nome).data.publicUrl;
  }

  // client autenticado: a policy "livros: autor edita o próprio" bloqueia
  // no banco qualquer tentativa de editar livro de outro autor, mesmo que
  // alguém chame essa rota direto com o id de um livro alheio.
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("livros")
    .update(atualizacao)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { erro: error?.message ?? "Livro não encontrado ou você não é o autor dele." },
      { status: error ? 500 : 403 }
    );
  }
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const autor = await autorLogado();
  if (!autor) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const id = req.url.split("/api/autor/livros/")[1].split("?")[0];
  const supabase = await supabaseServer();
  const { error, count } = await supabase.from("livros").delete({ count: "exact" }).eq("id", id);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!count) return NextResponse.json({ erro: "Livro não encontrado ou você não é o autor dele." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
