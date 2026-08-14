import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ehAutor } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await ehAutor())) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const form = await req.formData();
  const capa = form.get("capa");
  if (!capa || !(capa instanceof File) || capa.size === 0) {
    return NextResponse.json({ erro: "Envie uma imagem." }, { status: 400 });
  }

  const nome = Date.now() + "-" + capa.name.replace(/[^\w.\-]/g, "_");
  const bytes = await capa.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from("capas")
    .upload(nome, Buffer.from(bytes), { contentType: capa.type });

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ url: supabaseAdmin.storage.from("capas").getPublicUrl(nome).data.publicUrl });
}