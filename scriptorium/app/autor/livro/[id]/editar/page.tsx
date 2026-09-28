import { supabaseServer } from "@/lib/supabase/server";
import { autorLogado } from "@/lib/auth";
import FormLivro from "@/components/FormLivro";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import type { Livro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditarLivro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const autor = await autorLogado();
  const supabase = await supabaseServer();
  const { data: livro } = await supabase.from("livros").select("*").eq("id", id).single();

  if (!livro) return <p className="p-10 text-center text-[#c9a86a]">Livro não encontrado.</p>;

  // dupla checagem: além da RLS bloquear o PATCH no banco, escondemos
  // o formulário de edição na tela se o livro não for deste autor
  if (livro.autor_id !== autor?.id) {
    return (
      <p className="p-10 text-center text-[#c9a86a]">
        Este livro pertence a outro autor — você só pode editar os seus próprios livros.
      </p>
    );
  }

  const { data: capitulos } = await supabase
    .from("capitulos")
    .select("id, numero, titulo, conteudo")
    .eq("livro_id", id)
    .order("numero", { ascending: true });

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <BackButton fallbackHref="/autor/painel" />
      <h1 className="font-title mb-8 text-2xl tracking-[0.2em] text-[#e6c98a]">EDITAR LIVRO</h1>
      <FormLivro inicial={livro as Livro} />

      <div className="mt-12 flex items-center justify-between">
        <h2 className="font-title text-lg tracking-[0.2em] text-[#e6c98a]">CAPÍTULOS</h2>
        <Link href={"/autor/capitulo/novo?livro=" + id} className="placa">
          + NOVO CAPÍTULO
        </Link>
      </div>

      {(capitulos ?? []).length === 0 ? (
        <p className="mt-4 text-sm text-[#c9a86a]/70">Este livro ainda não tem nenhum capítulo.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {(capitulos ?? []).map((cap) => (
            <li
              key={cap.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#c9a86a]/30 bg-[#141b2e]/70 px-4 py-3"
            >
              <div>
                <p className="font-title text-sm tracking-widest text-[#e6c98a]">
                  Cap. {cap.numero} — {cap.titulo}
                </p>
                <p className="text-xs text-[#c9a86a]/50">
                  {cap.conteudo.length.toLocaleString("pt-BR")} caracteres
                </p>
              </div>
              <Link href={"/autor/capitulo/" + cap.id + "/editar"} className="placa placa-escura">
                EDITAR
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
