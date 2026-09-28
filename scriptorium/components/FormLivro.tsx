"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Livro } from "@/lib/types";
import { GENEROS } from "@/lib/generos";

export default function FormLivro({ inicial }: { inicial?: Livro }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [preview, setPreview] = useState<string | null>(inicial?.capa_url ?? null);
  const [descricaoLen, setDescricaoLen] = useState(inicial?.descricao?.length ?? 0);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const form = new FormData(e.currentTarget);
    const url = inicial ? "/api/autor/livros/" + inicial.id : "/api/autor/livros";
    const res = await fetch(url, { method: inicial ? "PATCH" : "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErro(data?.erro ?? "Erro ao salvar o livro. Verifique os campos.");
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
      <select name="genero" defaultValue={inicial?.genero ?? ""}
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none">
        <option value="">Selecione...</option>
        {GENEROS.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">DESCRIÇÃO * (máx. 500 caracteres)</label>
      <textarea name="descricao" defaultValue={inicial?.descricao ?? ""} required rows={4} maxLength={500}
        onChange={(e) => setDescricaoLen(e.target.value.length)}
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]" />
      <p className="-mt-2 text-right text-xs text-[#c9a86a]/50">{descricaoLen}/500</p>
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">FOTO DA CAPA</label>
      {preview && (
        <img src={preview} alt="Prévia da capa" className="h-40 w-28 rounded object-cover border border-[#c9a86a]/40" />
      )}
      <input
        name="capa"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo) setPreview(URL.createObjectURL(arquivo));
        }}
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] file:mr-3 file:border-0 file:bg-[#c9a86a] file:px-3 file:py-1 file:font-serif file:text-[#0b1020]"
      />
      {inicial?.capa_url && <p className="text-xs text-[#c9a86a]/60">Deixe em branco pra manter a capa atual.</p>}
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      <button className="placa mt-2" disabled={salvando}>
        {salvando ? "SALVANDO..." : "SALVAR E PUBLICAR"}
      </button>
    </form>
  );
}