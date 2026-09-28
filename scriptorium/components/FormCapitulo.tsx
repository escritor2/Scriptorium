"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { Capitulo } from "@/lib/types";

export default function FormCapitulo({ capitulo }: { capitulo: Capitulo }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(capitulo.titulo);
  const [conteudo, setConteudo] = useState(capitulo.conteudo);
  const [salvando, setSalvando] = useState(false);
  const [apagando, setApagando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const res = await fetch("/api/autor/capitulos/" + capitulo.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, conteudo }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(data?.erro ?? "Erro ao salvar o capítulo.");
      setSalvando(false);
      return;
    }
    router.push("/autor/livro/" + capitulo.livro_id + "/editar");
    router.refresh();
  }

  async function apagar() {
    if (!confirm("Tem certeza que quer apagar este capítulo? Essa ação não pode ser desfeita.")) return;
    setApagando(true);
    const res = await fetch("/api/autor/capitulos/" + capitulo.id, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(data?.erro ?? "Erro ao apagar o capítulo.");
      setApagando(false);
      return;
    }
    router.push("/autor/livro/" + capitulo.livro_id + "/editar");
    router.refresh();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-6">
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">TÍTULO DO CAPÍTULO *</label>
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
      />
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">TEXTO DO CAPÍTULO *</label>
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        required
        rows={16}
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
      />
      <p className="text-xs text-[#c9a86a]/50">{conteudo.length.toLocaleString("pt-BR")} caracteres</p>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      <div className="flex flex-wrap gap-3">
        <button className="placa" disabled={salvando || apagando}>
          {salvando ? "SALVANDO..." : "SALVAR CAPÍTULO"}
        </button>
        <button type="button" onClick={apagar} disabled={salvando || apagando}
          className="placa placa-escura !border-red-400/40 !text-red-400">
          {apagando ? "APAGANDO..." : "APAGAR CAPÍTULO"}
        </button>
        <Link href={"/autor/livro/" + capitulo.livro_id + "/editar"} className="placa placa-escura">
          CANCELAR
        </Link>
      </div>
    </form>
  );
}
