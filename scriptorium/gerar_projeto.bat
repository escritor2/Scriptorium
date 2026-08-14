@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Scriptorium - Gerador Completo
echo.
echo ============================================
echo   SCRIPTORIUM - Gerador Completo
echo ============================================
echo   So adiciona arquivos. Nunca substitui
echo   codigo que voce ja tenha escrito.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t = Get-Content -LiteralPath '%~f0' -Encoding UTF8; $i = [array]::IndexOf($t, '::POWERSHELL::'); Invoke-Expression (($t[($i+1)..($t.Count-1)]) -join [char]10)"
echo.
echo ============================================
echo   Concluido!
echo   1. npm install
echo   2. npm run dev
echo ============================================
pause
exit /b
::POWERSHELL::
$root = (Get-Location).Path
$criados = 0
$preservados = 0

function Escrever([string]$rel, [string]$conteudo) {
  $caminho = Join-Path $root $rel
  if (Test-Path -LiteralPath $caminho) {
    $atual = Get-Content -LiteralPath $caminho -Raw -ErrorAction SilentlyContinue
    $placeholder = ($atual -match '^\s*//\s*TODO') -or ($atual -match '^\s*$')
    if (-not $placeholder) { $script:preservados++; return }
  }
  $dir = Split-Path $caminho -Parent
  if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($caminho, $conteudo)
  $script:criados++
  Write-Host "  + $rel"
}

Write-Host "Gerando arquivos..."

Escrever "package.json" @'
{
  "name": "scriptorium",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "jose": "^5.6.3",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.5.3"
  }
}
'@

Escrever "tsconfig.json" @'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
'@

Escrever "next.config.mjs" @'
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
'@

Escrever "postcss.config.mjs" @'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
'@

Escrever "tailwind.config.js" @'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
'@

Escrever ".gitignore" @'
node_modules/
.next/
out/
.env*.local
*.tsbuildinfo
next-env.d.ts
'@

Escrever ".env.local" @'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SENHA_AUTOR=
JWT_SECRET=
'@

Escrever "middleware.ts" @'
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const segredo = new TextEncoder().encode(process.env.JWT_SECRET || "segredo-fallback");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("autor_session")?.value;
  const ehLogin = req.nextUrl.pathname === "/autor/login";

  if (!token) {
    if (ehLogin) return NextResponse.next();
    return NextResponse.redirect(new URL("/autor/login", req.url));
  }
  try {
    await jwtVerify(token, segredo);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/autor/login", req.url));
    res.cookies.delete("autor_session");
    return res;
  }
}

export const config = { matcher: "/autor/:path*" };
'@

Escrever "lib/types.ts" @'
export type Livro = {
  id: string;
  titulo: string;
  descricao: string;
  genero: string | null;
  capa_url: string | null;
  criado_em: string;
};

export type Capitulo = {
  id: string;
  livro_id: string;
  numero: number;
  titulo: string;
  conteudo: string;
};
'@

Escrever "lib/supabase.ts" @'
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error("Preencha o .env.local com as chaves do Supabase.");
}

export const supabase = createClient(url, anon);
'@

Escrever "lib/supabaseAdmin.ts" @'
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  throw new Error("Faltam chaves do Supabase no .env.local.");
}

export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false },
});
'@

Escrever "lib/auth.ts" @'
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function ehAutor(): Promise<boolean> {
  const token = cookies().get("autor_session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || ""));
    return true;
  } catch {
    return false;
  }
}
'@

Escrever "components/AuroraBackground.tsx" @'
export default function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b1020]">
      <div
        className="absolute -top-32 left-1/4 h-[45rem] w-[45rem] rounded-full opacity-25 blur-3xl animate-[flutuar_16s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, #39d98a 0%, transparent 65%)" }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[40rem] w-[40rem] rounded-full opacity-25 blur-3xl animate-[flutuar_20s_ease-in-out_infinite_reverse]"
        style={{ background: "radial-gradient(circle, #7b5cff 0%, transparent 65%)" }}
      />
      <div
        className="absolute -bottom-40 left-1/3 h-[38rem] w-[38rem] rounded-full opacity-20 blur-3xl animate-[flutuar_24s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, #ff6ec7 0%, transparent 65%)" }}
      />
    </div>
  );
}
'@

Escrever "components/Header.tsx" @'
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#c9a86a]/30 bg-[#0b1020]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-title text-lg tracking-[0.25em] text-[#e6c98a]">
          ✦ SCRIPTORIUM
          <span className="ml-3 hidden text-[0.6rem] tracking-[0.2em] text-[#c9a86a]/70 sm:inline">
            SEUS LIVROS, SUA HISTÓRIA
          </span>
        </Link>
        <nav className="font-title flex gap-5 text-[0.7rem] tracking-[0.2em] text-[#c9a86a]">
          <Link href="/" className="hover:text-[#e6c98a]">HOME</Link>
          <Link href="/livros" className="hover:text-[#e6c98a]">LIVROS</Link>
          <Link href="/autor/login" className="hover:text-[#e6c98a]">ÁREA DO AUTOR</Link>
        </nav>
      </div>
    </header>
  );
}
'@

Escrever "components/Footer.tsx" @'
export default function Footer() {
  return (
    <footer className="border-t border-[#c9a86a]/30 bg-[#0d1428]/90 py-10 text-center">
      <nav className="font-title flex flex-wrap justify-center gap-6 text-[0.65rem] tracking-[0.2em] text-[#c9a86a]">
        <a href="#" className="hover:text-[#e6c98a]">DÚVIDAS FREQUENTES</a>
        <a href="#" className="hover:text-[#e6c98a]">TERMOS DE SERVIÇO</a>
        <a href="#" className="hover:text-[#e6c98a]">POLÍTICA DE PRIVACIDADE</a>
      </nav>
      <p className="mt-6 text-lg">🦉</p>
      <p className="font-title mt-2 text-xs tracking-[0.25em] text-[#c9a86a]">SIGA-NOS</p>
      <p className="mt-4 text-[0.65rem] text-[#cfd6e4]/50">Copyright © 2026 Scriptorium. All rights reserved.</p>
    </footer>
  );
}
'@

Escrever "components/BookCard.tsx" @'
import Link from "next/link";
import type { Livro } from "@/lib/types";

export default function BookCard({ livro }: { livro: Livro }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-[#c9a86a]/40 bg-[#141b2e]/80 shadow-[0_0_25px_rgba(201,168,106,0.15)] backdrop-blur">
      <div className="aspect-[2/3] w-full p-6">
        {livro.capa_url ? (
          <img src={livro.capa_url} alt={"Capa de " + livro.titulo} className="h-full w-full rounded object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded border border-[#c9a86a]/50 bg-gradient-to-br from-[#233052] to-[#0d1428] p-4">
            <span className="font-title text-center text-lg tracking-widest text-[#e6c98a]">{livro.titulo}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 text-center">
        <h3 className="font-title text-sm uppercase tracking-[0.2em] text-[#e6c98a]">{livro.titulo}</h3>
        <p className="flex-1 text-sm leading-relaxed text-[#cfd6e4]/80">{livro.descricao}</p>
        <div className="flex flex-col items-center gap-2">
          <Link href={"/livro/" + livro.id} className="placa">SAIBA MAIS</Link>
          <Link href={"/livro/" + livro.id} className="placa placa-escura">LER RESENHA</Link>
        </div>
      </div>
    </article>
  );
}
'@

Escrever "components/Filtros.tsx" @'
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Filtros({ generos }: { generos: string[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [genero, setGenero] = useState("");

  function aplicar(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (busca) p.set("busca", busca);
    if (genero) p.set("genero", genero);
    router.push("/livros?" + p.toString());
  }

  return (
    <form onSubmit={aplicar} className="mb-10 flex flex-col gap-3 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-5">
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">BUSCA RÚNICA</label>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por título..."
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
      />
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">FILTRAR POR GÊNERO</label>
      <select
        value={genero}
        onChange={(e) => setGenero(e.target.value)}
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none"
      >
        <option value="">Todos</option>
        {generos.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <button className="placa mt-2" type="submit">APLICAR</button>
    </form>
  );
}
'@

Escrever "components/FormLivro.tsx" @'
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Livro } from "@/lib/types";

export default function FormLivro({ inicial }: { inicial?: Livro }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const form = new FormData(e.currentTarget);
    const url = inicial ? "/api/autor/livros/" + inicial.id : "/api/autor/livros";
    const res = await fetch(url, { method: inicial ? "PATCH" : "POST", body: form });
    if (!res.ok) {
      setErro("Erro ao salvar o livro. Verifique os campos.");
      setSalvando(false);
      return;
    }
    router.push("/autor/painel");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-6">
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">TÍTULO *</label>
      <input name="titulo" defaultValue={inicial?.titulo ?? ""} required
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]" />
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">GÊNERO</label>
      <input name="genero" defaultValue={inicial?.genero ?? ""}
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]" />
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">DESCRIÇÃO *</label>
      <textarea name="descricao" defaultValue={inicial?.descricao ?? ""} required rows={4}
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]" />
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">FOTO DA CAPA</label>
      <input name="capa" type="file" accept="image/*"
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] file:mr-3 file:border-0 file:bg-[#c9a86a] file:px-3 file:py-1 file:font-serif file:text-[#0b1020]" />
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      <button className="placa mt-2" disabled={salvando}>
        {salvando ? "SALVANDO..." : "SALVAR E PUBLICAR"}
      </button>
    </form>
  );
}
'@

Escrever "app/globals.css" @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --gold: #c9a86a;
  --gold-claro: #e6c98a;
  --tinta: #0b1020;
}

body {
  background: var(--tinta);
  color: #e8e3d8;
  font-family: var(--font-cormorant), Georgia, serif;
}

.font-title {
  font-family: var(--font-cinzel), Georgia, serif;
}

@keyframes flutuar {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(3rem, -2rem, 0) scale(1.08); }
}

.placa {
  font-family: var(--font-cinzel), serif;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: #0b1020;
  padding: 0.5rem 1.75rem;
  background: linear-gradient(180deg, #e6c98a, #c9a86a);
  clip-path: polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%);
  transition: filter 0.2s;
}
.placa:hover { filter: brightness(1.15); }

.placa-escura {
  background: linear-gradient(180deg, #1b2440, #141b2e);
  color: #e6c98a;
}
'@

Escrever "app/layout.tsx" @'
import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuroraBackground from "@/components/AuroraBackground";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700", "900"], variable: "--font-cinzel" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: "Scriptorium — Seus Livros, Sua História",
  description: "O salão onde o autor inscreve suas histórias e você as lê capítulo a capítulo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={cinzel.variable + " " + cormorant.variable + " flex min-h-screen flex-col"}>
        <AuroraBackground />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
'@

Escrever "app/page.tsx" @'
import { supabase } from "@/lib/supabase";
import BookCard from "@/components/BookCard";
import type { Livro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data } = await supabase
    .from("livros")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(4);

  const livros: Livro[] = data ?? [];

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-8 text-center">
        <h1 className="font-title text-4xl tracking-[0.3em] text-[#e6c98a] sm:text-5xl">SCRIPTORIUM</h1>
        <p className="mt-4 text-lg italic text-[#c9a86a]/80">Seus Livros, Sua História</p>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-title mb-10 text-center text-2xl tracking-[0.25em] text-[#e6c98a]">Destaques</h2>
        {livros.length === 0 ? (
          <p className="text-center text-[#c9a86a]/70">
            Nenhum livro inscrito ainda. Entre na Área do Autor para publicar o primeiro. ✒️
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {livros.map((livro) => (
              <BookCard key={livro.id} livro={livro} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
'@

Escrever "app/livros/page.tsx" @'
import { supabase } from "@/lib/supabase";
import BookCard from "@/components/BookCard";
import Filtros from "@/components/Filtros";
import type { Livro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Livros({
  searchParams,
}: {
  searchParams: { busca?: string; genero?: string };
}) {
  let query = supabase.from("livros").select("*").order("criado_em", { ascending: false });
  if (searchParams.genero) query = query.eq("genero", searchParams.genero);
  if (searchParams.busca) query = query.ilike("titulo", "%" + searchParams.busca + "%");
  const { data } = await query;

  const { data: todos } = await supabase.from("livros").select("genero");
  const generos = Array.from(
    new Set((todos ?? []).map((t) => t.genero).filter((g): g is string => Boolean(g)))
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-title mb-10 text-center text-2xl tracking-[0.25em] text-[#e6c98a]">BIBLIOTECA</h1>
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <Filtros generos={generos} />
        <div>
          {(data ?? []).length === 0 ? (
            <p className="text-[#c9a86a]/70">Nenhum livro encontrado.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {(data ?? []).map((livro) => (
                <BookCard key={livro.id} livro={livro as Livro} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
'@

Escrever "app/livro/[id]/page.tsx" @'
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PaginaLivro({ params }: { params: { id: string } }) {
  const { data: livro } = await supabase.from("livros").select("*").eq("id", params.id).single();
  if (!livro) return <p className="p-10 text-center text-[#c9a86a]">Livro não encontrado.</p>;

  const { data: capitulos } = await supabase
    .from("capitulos")
    .select("*")
    .eq("livro_id", params.id)
    .order("numero");

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="grid gap-10 sm:grid-cols-[240px_1fr]">
        {livro.capa_url ? (
          <img src={livro.capa_url} alt={"Capa de " + livro.titulo} className="w-full rounded border border-[#c9a86a]/40 object-cover" />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center rounded border border-[#c9a86a]/50 bg-gradient-to-br from-[#233052] to-[#0d1428] p-4">
            <span className="font-title text-center text-xl text-[#e6c98a]">{livro.titulo}</span>
          </div>
        )}
        <div>
          <p className="font-title text-[0.65rem] tracking-[0.3em] text-[#c9a86a]">{livro.genero ?? "SEM GÊNERO"}</p>
          <h1 className="font-title mt-2 text-3xl tracking-widest text-[#e6c98a]">{livro.titulo}</h1>
          <p className="mt-6 text-lg leading-relaxed text-[#e8e3d8]/90">{livro.descricao}</p>
        </div>
      </div>
      <div className="mt-14">
        <h2 className="font-title mb-6 text-xl tracking-[0.25em] text-[#e6c98a]">CAPÍTULOS</h2>
        {(capitulos ?? []).length === 0 ? (
          <p className="text-[#c9a86a]/70">Nenhum capítulo publicado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(capitulos ?? []).map((cap) => (
              <li key={cap.id}>
                <Link
                  href={"/livro/" + params.id + "/capitulo/" + cap.numero}
                  className="flex items-center justify-between rounded border border-[#c9a86a]/30 bg-[#141b2e]/70 px-5 py-3 text-[#e8e3d8] hover:border-[#e6c98a]"
                >
                  <span>Capítulo {cap.numero} — {cap.titulo}</span>
                  <span className="text-[#c9a86a]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
'@

Escrever "app/livro/[id]/capitulo/[numero]/page.tsx" @'
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LerCapitulo({ params }: { params: { id: string; numero: string } }) {
  const numero = parseInt(params.numero, 10);
  const { data: cap } = await supabase
    .from("capitulos")
    .select("*")
    .eq("livro_id", params.id)
    .eq("numero", numero)
    .single();

  if (!cap) return <p className="p-10 text-center text-[#c9a86a]">Capítulo não encontrado.</p>;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-title text-xs tracking-[0.3em] text-[#c9a86a]">CAPÍTULO {numero}</p>
      <h1 className="font-title mt-3 text-3xl text-[#e6c98a]">{cap.titulo}</h1>
      <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-[#e8e3d8]/90">{cap.conteudo}</div>
      <nav className="mt-12 flex items-center justify-between gap-3">
        {numero > 1 ? (
          <Link className="placa" href={"/livro/" + params.id + "/capitulo/" + (numero - 1)}>ANTERIOR</Link>
        ) : (
          <span />
        )}
        <Link className="placa placa-escura" href={"/livro/" + params.id}>SUMÁRIO</Link>
        <Link className="placa" href={"/livro/" + params.id + "/capitulo/" + (numero + 1)}>PRÓXIMO</Link>
      </nav>
    </article>
  );
}
'@

Escrever "app/autor/login/page.tsx" @'
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/autor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    if (res.ok) router.push("/autor/painel");
    else setErro("Senha incorreta.");
  }

  return (
    <section className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-title mb-8 text-center text-xl tracking-[0.3em] text-[#e6c98a]">ÁREA DO AUTOR</h1>
      <form onSubmit={entrar} className="flex flex-col gap-4 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-6">
        <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">SENHA</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
        />
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <button className="placa mt-2">ENTRAR NO SCRIPTORIUM</button>
      </form>
    </section>
  );
}
'@

Escrever "app/autor/painel/page.tsx" @'
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Painel() {
  const { data: livros } = await supabase.from("livros").select("*").order("criado_em", { ascending: false });

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-title text-2xl tracking-[0.2em] text-[#e6c98a]">PAINEL DO AUTOR</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/autor/livro/novo" className="placa">NOVO LIVRO</Link>
          <Link href="/autor/capitulo/novo" className="placa">NOVO CAPÍTULO</Link>
          <form action="/api/autor/logout" method="POST">
            <button className="placa placa-escura">SAIR</button>
          </form>
        </div>
      </div>
      {(livros ?? []).length === 0 ? (
        <p className="text-[#c9a86a]/70">Nenhum livro ainda. Inscreva o primeiro! ✒️</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {(livros ?? []).map((livro) => (
            <li key={livro.id} className="flex flex-wrap items-center justify-between gap-4 rounded border border-[#c9a86a]/30 bg-[#141b2e]/70 px-5 py-4">
              <div>
                <p className="font-title tracking-widest text-[#e6c98a]">{livro.titulo}</p>
                <p className="text-sm text-[#c9a86a]/70">{livro.genero ?? "Sem gênero"}</p>
              </div>
              <div className="flex gap-3">
                <Link className="placa" href={"/autor/livro/" + livro.id + "/editar"}>EDITAR</Link>
                <Link className="placa placa-escura" href={"/livro/" + livro.id}>VER</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
'@

Escrever "app/autor/livro/novo/page.tsx" @'
import FormLivro from "@/components/FormLivro";

export default function NovoLivro() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-title mb-8 text-2xl tracking-[0.2em] text-[#e6c98a]">NOVO LIVRO</h1>
      <FormLivro />
    </section>
  );
}
'@

Escrever "app/autor/livro/[id]/editar/page.tsx" @'
import { supabase } from "@/lib/supabase";
import FormLivro from "@/components/FormLivro";
import type { Livro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditarLivro({ params }: { params: { id: string } }) {
  const { data: livro } = await supabase.from("livros").select("*").eq("id", params.id).single();
  if (!livro) return <p className="p-10 text-center text-[#c9a86a]">Livro não encontrado.</p>;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-title mb-8 text-2xl tracking-[0.2em] text-[#e6c98a]">EDITAR LIVRO</h1>
      <FormLivro inicial={livro as Livro} />
    </section>
  );
}
'@

Escrever "app/autor/capitulo/novo/page.tsx" @'
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Livro } from "@/lib/types";

export default function NovoCapitulo() {
  const router = useRouter();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    supabase.from("livros").select("*").order("titulo").then(({ data }) => setLivros(data ?? []));
  }, []);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/autor/capitulos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        livro_id: String(form.get("livro_id")),
        titulo: String(form.get("titulo")),
        conteudo: String(form.get("conteudo")),
      }),
    });
    if (!res.ok) {
      setErro("Erro ao salvar o capítulo.");
      setSalvando(false);
      return;
    }
    router.push("/autor/painel");
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-title mb-8 text-2xl tracking-[0.2em] text-[#e6c98a]">NOVO CAPÍTULO</h1>
      <form onSubmit={enviar} className="flex flex-col gap-4 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-6">
        <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">LIVRO</label>
        <select name="livro_id" required
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none">
          <option value="">Selecione...</option>
          {livros.map((l) => (
            <option key={l.id} value={l.id}>{l.titulo}</option>
          ))}
        </select>
        <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">TÍTULO DO CAPÍTULO *</label>
        <input name="titulo" required
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]" />
        <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">TEXTO DO CAPÍTULO *</label>
        <textarea name="conteudo" required rows={14}
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]" />
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <button className="placa mt-2" disabled={salvando}>
          {salvando ? "SALVANDO..." : "INSCREVER CAPÍTULO"}
        </button>
      </form>
    </section>
  );
}
'@

Escrever "app/api/autor/login/route.ts" @'
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { senha } = await req.json();

  if (!senha || senha !== process.env.SENHA_AUTOR) {
    return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
  }

  const token = await new SignJWT({ role: "autor" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET || "segredo-fallback"));

  cookies().set("autor_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
'@

Escrever "app/api/autor/logout/route.ts" @'
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  cookies().delete("autor_session");
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SUPABASE_URL ? undefined : undefined), { status: 303 });
}
'@

Escrever "app/api/autor/livros/route.ts" @'
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
'@

Escrever "app/api/autor/livros/[id]/route.ts" @'
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
'@

Escrever "app/api/autor/capitulos/route.ts" @'
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
'@

Escrever "app/api/autor/capas/route.ts" @'
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
'@

Write-Host ""
Write-Host "Arquivos criados: $criados"
Write-Host "Arquivos preservados (ja existiam): $preservados"