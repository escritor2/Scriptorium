import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ehAutor } from "@/lib/auth";

export async function PATCH(req: Request) {
  if (!(await ehAutor())) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const id = req.url.split("/api/autor/livros/")[1].split("?")[0];
  const form = await req.formData();
  const atualizacao: Record<string, string> = {};

  const titulo = String(form.get("titulo") || "").trim();
  const genero = String(form.get("genero") || "").trim();
  const descricao = String(form.get("descricao") || "").trim();
  if (titulo) atualizacao.titulo = titulo;
  if (genero) atualizacao.genero = genero;
  if (descricao) atualizacao.descricao = descricao;

  const capa = form.get("capa");
  if (capa && capa instanceof File && capa.size > 0) {
    const nome = Date.now() + "-" + capa.name.replace(/[^\w.\-]/g, "_");
    const bytes = await capa.arrayBuffer();
    const { error } = await supabaseAdmin.storage
      .from("capas")
      .upload(nome, Buffer.from(bytes), { contentType: capa.type });
    if (error) return NextResponse.json({ erro: "Falha no upload da capa." }, { status: 500 });
    atualizacao.capa_url = supabaseAdmin.storage.from("capas").getPublicUrl(nome).data.publicUrl;
  }

  const { data, error } = await supabaseAdmin
    .from("livros")
    .update(atualizacao)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  if (!(await ehAutor())) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });
  const id = req.url.split("/api/autor/livros/")[1].split("?")[0];
  const { error } = await supabaseAdmin.from("livros").delete().eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}