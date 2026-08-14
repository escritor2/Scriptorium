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

  const { data: todos } = await supabase.from("livros").select("genero");
  const generos = Array.from(
    new Set((todos ?? []).map((t) => t.genero).filter((g): g is string => Boolean(g)))
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-title mb-10 text-center text-2xl tracking-[0.25em] text-[#e6c98a]">BIBLIOTECA</h1>
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <Filtros generos={generos} />
        <div>
          {(data ?? []).length === 0 ? (
            <p className="text-[#c9a86a]/70">Nenhum livro encontrado.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {(data ?? []).map((livro) => (
                <BookCard key={livro.id} livro={livro as Livro} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}