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