import { supabase } from "@/lib/supabase";
import BookCard from "@/components/BookCard";
import Filtros from "@/components/Filtros";
import type { Livro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Livros({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; genero?: string }>;
}) {
  const sp = await searchParams;

  let query = supabase.from("livros").select("*").order("criado_em", { ascending: false });
  if (sp.genero) query = query.eq("genero", sp.genero);
  if (sp.busca) query = query.ilike("titulo", "%" + sp.busca + "%");
  const { data } = await query;
  const livros = (data ?? []) as Livro[];

  const { data: todos } = await supabase.from("livros").select("genero");
  const generos = Array.from(
    new Set((todos ?? []).map((t) => t.genero).filter((g): g is string => Boolean(g)))
  );

  // busca nome dos autores e quais livros já têm pelo menos 1 capítulo,
  // em duas queries só (em vez de uma por livro)
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
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-title mb-10 text-center text-2xl tracking-[0.25em] text-[#e6c98a]">BIBLIOTECA</h1>
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <Filtros generos={generos} />
        <div>
          {livros.length === 0 ? (
            <p className="text-[#c9a86a]/70">Nenhum livro encontrado.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-3 xl:grid-cols-4">
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
        </div>
      </div>
    </section>
  );
}
