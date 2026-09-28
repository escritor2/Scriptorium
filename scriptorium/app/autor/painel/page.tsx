import { supabaseServer } from "@/lib/supabase/server";
import { autorLogado } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Painel() {
  const autor = await autorLogado();
  const supabase = await supabaseServer();

  // painel mostra só os livros DESTE autor — livros de outros autores
  // ficam visíveis apenas em /livros (leitura) e não aparecem aqui
  const { data: livros } = await supabase
    .from("livros")
    .select("*")
    .eq("autor_id", autor?.id)
    .order("criado_em", { ascending: false });

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-title text-2xl tracking-[0.2em] text-[#e6c98a]">MEUS LIVROS</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/autor/livro/novo" className="placa">NOVO LIVRO</Link>
          <Link href="/autor/capitulo/novo" className="placa">NOVO CAPÍTULO</Link>
          <Link href="/livros" className="placa placa-escura">VER ACERVO COMPLETO</Link>
          <form action="/api/autor/logout" method="POST">
            <button className="placa placa-escura">SAIR</button>
          </form>
        </div>
      </div>
      {(livros ?? []).length === 0 ? (
        <p className="text-[#c9a86a]/70">Você ainda não escreveu nenhum livro. Inscreva o primeiro! ✒️</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {(livros ?? []).map((livro) => (
            <li key={livro.id} className="flex flex-wrap items-center justify-between gap-4 rounded border border-[#c9a86a]/30 bg-[#141b2e]/70 px-5 py-4">
              <div>
                <p className="font-title tracking-widest text-[#e6c98a]">{livro.titulo}</p>
                <p className="text-sm text-[#c9a86a]/70">{livro.genero ?? "Sem gênero"}</p>
              </div>
              <div className="flex gap-3">
                <Link className="placa" href={"/autor/livro/" + livro.id + "/editar"}>EDITAR</Link>
                <Link className="placa placa-escura" href={"/livro/" + livro.id}>VER</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
