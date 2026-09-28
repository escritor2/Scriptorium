"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Livro } from "@/lib/types";

function NovoCapituloForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const livroPreSelecionado = searchParams.get("livro") ?? "";
  const [livros, setLivros] = useState<Livro[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const supabase = supabaseBrowser();
    // só listamos os livros do próprio autor logado: só neles é
    // permitido criar capítulo (a RLS bloquearia o insert de qualquer forma)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("livros")
        .select("*")
        .eq("autor_id", user.id)
        .order("titulo")
        .then(({ data }) => setLivros(data ?? []));
    });
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
      const data = await res.json().catch(() => null);
      setErro(data?.erro ?? "Erro ao salvar o capítulo.");
      setSalvando(false);
      return;
    }
    router.push("/autor/livro/" + String(form.get("livro_id")) + "/editar");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-title mb-8 text-2xl tracking-[0.2em] text-[#e6c98a]">NOVO CAPÍTULO</h1>
      <form onSubmit={enviar} className="flex flex-col gap-4 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-6">
        <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">LIVRO</label>
        <select name="livro_id" required defaultValue={livroPreSelecionado}
          className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none">
          <option value="">Selecione...</option>
          {livros.map((l) => (
            <option key={l.id} value={l.id}>{l.titulo}</option>
          ))}
        </select>
        {livros.length === 0 && (
          <p className="text-xs text-[#c9a86a]/60">
            Você ainda não tem nenhum livro seu. Crie um livro primeiro.
          </p>
        )}
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

export default function NovoCapitulo() {
  return (
    <Suspense fallback={null}>
      <NovoCapituloForm />
    </Suspense>
  );
}
