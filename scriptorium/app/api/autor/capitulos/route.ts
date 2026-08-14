import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ehAutor } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await ehAutor())) return NextResponse.json({ erro: "Sem sessão." }, { status: 401 });

  const { livro_id, titulo, conteudo } = await req.json();
  if (!livro_id || !titulo || !conteudo) {
    return NextResponse.json({ erro: "Preencha todos os campos." }, { status: 400 });
  }

  const { data: ultimo } = await supabaseAdmin
    .from("capitulos")
    .select("numero")
    .eq("livro_id", livro_id)
    .order("numero", { ascending: false })
    .limit(1);

  const numero = (ultimo?.[0]?.numero ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from("capitulos")
    .insert({ livro_id, numero, titulo, conteudo })
    .select()
    .single();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json(data);
}