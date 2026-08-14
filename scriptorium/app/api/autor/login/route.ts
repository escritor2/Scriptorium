import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let senha: string;
  try {
    senha = (await req.json()).senha ?? "";
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const senhaCorreta = process.env.SENHA_AUTOR;

  if (!senhaCorreta) {
    return NextResponse.json(
      { erro: "SENHA_AUTOR não está definida no .env.local." },
      { status: 500 }
    );
  }

  if (senha !== senhaCorreta) {
    return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
  }

  const token = await new SignJWT({ role: "autor" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET || "segredo-fallback"));

  const cookieStore = await cookies(); 
  cookieStore.set("autor_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}