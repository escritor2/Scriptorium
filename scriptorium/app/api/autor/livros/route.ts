import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { autorLogado } from "@/lib/auth";

export async function POST(req: Request) {
  const autor = await autorLogado();
  if (!autor) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const form = await req.formData();
  const titulo = String(form.get("titulo") || "").trim();
  const genero = String(form.get("genero") || "").trim();
  const descricao = String(form.get("descricao") || "").trim();

  if (!titulo || !descricao) {
    return NextResponse.json({ erro: "Título e descrição são obrigatórios." }, { status: 400 });
  }
  if (descricao.length > 500) {
    return NextResponse.json({ erro: "A descrição pode ter no máximo 500 caracteres." }, { status: 400 });
  }

  let capa_url: string | null = null;
  const capa = form.get("capa");
  if (capa && capa instanceof File && capa.size > 0) {
    // upload de arquivo usa o client admin (storage não tem RLS por linha de dono)
    const nome = Date.now() + "-" + capa.name.replace(/[^\w.\-]/g, "_");
    const bytes = await capa.arrayBuffer();
    const { error } = await supabaseAdmin.storage
      .from("capas")
      .upload(nome, Buffer.from(bytes), { contentType: capa.type });
    if (error) return NextResponse.json({ erro: "Falha no upload da capa: " + error.message }, { status: 500 });
    capa_url = supabaseAdmin.storage.from("capas").getPublicUrl(nome).data.publicUrl;
  }

  // client autenticado do próprio autor: a policy "livros: autor cria o próprio"
  // só deixa inserir se autor_id = auth.uid(), então nem precisamos confiar
  // em nada vindo do front-end para decidir o dono.
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("livros")
    .insert({ titulo, genero, descricao, capa_url, autor_id: autor.id })
    .select()
    .single();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json(data);
}
