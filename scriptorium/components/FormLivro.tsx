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