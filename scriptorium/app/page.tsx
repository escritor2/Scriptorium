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

  const livros = (data ?? []) as Livro[];

  const autorIds = Array.from(new Set(livros.map((l) => l.autor_id).filter(Boolean))) as string[];
  const [{ data: perfis }, { data: capsExistentes }] = await Promise.all([
    autorIds.length
      ? supabase.from("perfis_autor").select("id, nome").in("id", autorIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
    livros.length
      ? supabase.from("capitulos").select("livro_id").in("livro_id", livros.map((l) => l.id)).eq("numero", 1)
      : Promise.resolve({ data: [] as { livro_id: string }[] }),
  ]);
  const nomeAutorPorId = new Map((perfis ?? []).map((p) => [p.id, p.nome]));
  const livrosComCapitulo = new Set((capsExistentes ?? []).map((c) => c.livro_id));

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-10 text-center">
        <p className="font-title text-xs tracking-[0.5em] text-[#c9a86a]/70">✦ BEM-VINDO AO SALÃO DE ESCRITA ✦</p>
        <h1 className="font-title mt-6 text-5xl tracking-[0.3em] text-[#e6c98a] drop-shadow-[0_0_25px_rgba(201,168,106,0.35)] sm:text-6xl">
          SCRIPTORIUM
        </h1>
        <p className="mt-5 text-xl italic text-[#c9a86a]/90">Seus Livros, Sua História</p>
        <div className="mx-auto mt-8 h-px w-64 bg-gradient-to-r from-transparent via-[#c9a86a] to-transparent" />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-title mb-10 text-center text-2xl tracking-[0.25em] text-[#e6c98a]">Destaques</h2>
        {livros.length === 0 ? (
          <p className="text-center text-[#c9a86a]/70">
            Nenhum livro inscrito ainda. Entre na Área do Autor para publicar o primeiro. ✒️
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {livros.map((livro) => (
              <BookCard
                key={livro.id}
                livro={livro}
                autorNome={livro.autor_id ? nomeAutorPorId.get(livro.autor_id) : undefined}
                temCapitulos={livrosComCapitulo.has(livro.id)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
