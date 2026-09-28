import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LeituraBackground from "@/components/LeituraBackground";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function LerCapitulo({ params }: { params: Promise<{ id: string; numero: string }> }) {
  const { id, numero: numeroStr } = await params;
  const numero = parseInt(numeroStr, 10);
  const { data: cap } = await supabase
    .from("capitulos").select("*").eq("livro_id", id).eq("numero", numero).single();

  if (!cap) return <p className="p-10 text-center text-[#c9a86a]">Capítulo não encontrado.</p>;

  // verifica se existe um PRÓXIMO capítulo de verdade, em vez de assumir numero+1
  const { data: proximoCap } = await supabase
    .from("capitulos").select("numero").eq("livro_id", id).eq("numero", numero + 1).maybeSingle();

  const paragrafos = String(cap.conteudo).split(/\n+/).map((p: string) => p.trim()).filter(Boolean);

  return (
    <>
      <LeituraBackground />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackButton fallbackHref={"/livro/" + id} />
        <div className="rounded-lg border border-[#c9a86a]/25 bg-[#0d1428]/85 p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-12">
          <p className="font-title text-xs tracking-[0.35em] text-[#c9a86a]">CAPÍTULO {numero}</p>
          <h1 className="font-title mt-3 text-3xl text-[#e6c98a] sm:text-4xl">{cap.titulo}</h1>
          <div className="mt-4 h-px w-40 bg-gradient-to-r from-[#c9a86a] to-transparent" />

          <div className="mt-10">
            {paragrafos.map((p: string, i: number) => (
              <p
                key={i}
                className={
                  "mb-6 text-justify text-lg leading-8 text-[#e8e3d8]/95 [hyphens:auto] sm:text-xl sm:leading-9 " +
                  (i === 0
                    ? "first-letter:font-title first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-[#e6c98a] "
                    : "") +
                  (p.startsWith("—") ? "italic pl-6 text-[#e8e3d8]/90 " : "")
                }
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        <nav className="mt-8 flex items-center justify-between gap-3">
          {numero > 1 ? (
            <Link className="placa" href={"/livro/" + id + "/capitulo/" + (numero - 1)}>ANTERIOR</Link>
          ) : (
            <span />
          )}
          <Link className="placa placa-escura" href={"/livro/" + id}>SUMÁRIO</Link>
          {proximoCap ? (
            <Link className="placa" href={"/livro/" + id + "/capitulo/" + (numero + 1)}>PRÓXIMO</Link>
          ) : (
            <Link className="placa" href={"/livro/" + id}>FINALIZAR LEITURA</Link>
          )}
        </nav>
      </article>
    </>
  );
}
