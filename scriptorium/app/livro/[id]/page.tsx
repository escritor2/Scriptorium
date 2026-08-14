import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PaginaLivro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: livro } = await supabase.from("livros").select("*").eq("id", id).single();
  if (!livro) return <p className="p-10 text-center text-[#c9a86a]">Livro não encontrado.</p>;

  const { data: capitulos } = await supabase
    .from("capitulos").select("*").eq("livro_id", id).order("numero");

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="grid gap-10 sm:grid-cols-[240px_1fr]">
        {livro.capa_url ? (
          <img src={livro.capa_url} alt={"Capa de " + livro.titulo} className="w-full rounded border border-[#c9a86a]/40 object-cover" />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center rounded border border-[#c9a86a]/50 bg-gradient-to-br from-[#233052] to-[#0d1428] p-4">
            <span className="font-title text-center text-xl text-[#e6c98a]">{livro.titulo}</span>
          </div>
        )}
        <div>
          <p className="font-title text-[0.65rem] tracking-[0.3em] text-[#c9a86a]">{livro.genero ?? "SEM GÊNERO"}</p>
          <h1 className="font-title mt-2 text-3xl tracking-widest text-[#e6c98a]">{livro.titulo}</h1>
          <p className="mt-6 text-lg leading-relaxed text-[#e8e3d8]/90">{livro.descricao}</p>
        </div>
      </div>
      <div className="mt-14">
        <h2 className="font-title mb-6 text-xl tracking-[0.25em] text-[#e6c98a]">CAPÍTULOS</h2>
        {(capitulos ?? []).length === 0 ? (
          <p className="text-[#c9a86a]/70">Nenhum capítulo publicado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(capitulos ?? []).map((cap) => (
              <li key={cap.id}>
                <Link href={"/livro/" + id + "/capitulo/" + cap.numero}
                  className="flex items-center justify-between rounded border border-[#c9a86a]/30 bg-[#141b2e]/70 px-5 py-3 text-[#e8e3d8] hover:border-[#e6c98a]">
                  <span>Capítulo {cap.numero} — {cap.titulo}</span>
                  <span className="text-[#c9a86a]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}