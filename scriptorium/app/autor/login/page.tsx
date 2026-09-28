"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const res = await fetch("/api/autor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      router.push("/autor/painel");
      router.refresh();
    } else {
      setErro(data?.erro ?? "Erro ao entrar. Tente de novo.");
      setCarregando(false);
    }
  }

  return (
    <section className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-title mb-8 text-center text-xl tracking-[0.3em] text-[#e6c98a]">ÁREA DO AUTOR</h1>
      <form onSubmit={entrar} className="flex flex-col gap-4 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-6">
        <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">E-MAIL</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
        />
        <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">SENHA</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
        />
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <button disabled={carregando} className="placa mt-2">
          {carregando ? "ENTRANDO..." : "ENTRAR NO SCRIPTORIUM"}
        </button>
        <p className="text-center text-sm text-[#c9a86a]/70">
          Ainda não tem conta?{" "}
          <Link href="/autor/cadastro" className="text-[#e6c98a] underline">
            Torne-se um autor
          </Link>
        </p>
      </form>
    </section>
  );
}
