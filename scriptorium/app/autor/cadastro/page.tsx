"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Cadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const res = await fetch("/api/autor/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setSucesso(true);
      setTimeout(() => router.push("/autor/login"), 1800);
    } else {
      setErro(data?.erro ?? "Erro ao cadastrar. Tente de novo.");
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <section className="mx-auto max-w-sm px-6 py-24 text-center">
        <h1 className="font-title mb-4 text-xl tracking-[0.3em] text-[#e6c98a]">BEM-VINDO(A)!</h1>
        <p className="text-[#c9a86a]/80">
          Sua conta de autor foi criada. Se pedirmos confirmação de e-mail, verifique sua caixa
          de entrada — senão, já vamos te levar para o login.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-title mb-8 text-center text-xl tracking-[0.3em] text-[#e6c98a]">TORNE-SE UM AUTOR</h1>
      <form onSubmit={cadastrar} className="flex flex-col gap-4 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-6">
        <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">NOME DE AUTOR</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
        />
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
          minLength={6}
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
        />
        <p className="text-xs text-[#c9a86a]/60">Mínimo de 6 caracteres.</p>
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <button disabled={carregando} className="placa mt-2">
          {carregando ? "CRIANDO CONTA..." : "CRIAR MINHA CONTA DE AUTOR"}
        </button>
        <p className="text-center text-sm text-[#c9a86a]/70">
          Já tem conta?{" "}
          <Link href="/autor/login" className="text-[#e6c98a] underline">
            Entrar
          </Link>
        </p>
      </form>
    </section>
  );
}
