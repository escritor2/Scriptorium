import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  let nome: string, email: string, senha: string;
  try {
    const body = await req.json();
    nome = (body.nome ?? "").trim();
    email = (body.email ?? "").trim();
    senha = body.senha ?? "";
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Preencha todos os campos." }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json({ erro: "A senha precisa ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const supabase = await supabaseServer();

  // isso cria o usuário no Supabase Auth e, via trigger no banco
  // (on_auth_user_created), já cria a linha correspondente em perfis_autor
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } },
  });

  if (error) {
    const msg = error.message.includes("already registered")
      ? "Esse e-mail já tem cadastro."
      : "Não foi possível criar a conta. Tente de novo.";
    return NextResponse.json({ erro: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
