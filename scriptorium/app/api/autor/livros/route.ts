import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ehAutor } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await ehAutor())) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const form = await req.formData();
  const titulo = String(form.get("titulo") || "").trim();
  const genero = String(form.get("genero") || "").trim();
  const descricao = String(form.get("descricao") || "").trim();

  if (!titulo || !descricao) {
    return NextResponse.json({ erro: "Título e descrição são obrigatórios." }, { status: 400 });
  }

  let capa_url: string | null = null;
  const capa = form.get("capa");
  if (capa && capa instanceof File && capa.size > 0) {
    const nome = Date.now() + "-" + capa.name.replace(/[^\w.\-]/g, "_");
    const bytes = await capa.arrayBuffer();
    const { error } = await supabaseAdmin.storage
      .from("capas")
      .upload(nome, Buffer.from(bytes), { contentType: capa.type });
    if (error) return NextResponse.json({ erro: "Falha no upload da capa." }, { status: 500 });
    capa_url = supabaseAdmin.storage.from("capas").getPublicUrl(nome).data.publicUrl;
  }

  const { data, error } = await supabaseAdmin
    .from("livros")
    .insert({ titulo, genero, descricao, capa_url })
    .select()
    .single();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json(data);
}