import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  let email: string, senha: string;
  try {
    const body = await req.json();
    email = (body.email ?? "").trim();
    senha = body.senha ?? "";
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  if (!email || !senha) {
    return NextResponse.json({ erro: "Preencha e-mail e senha." }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
