// components/BookCard.tsx
import Link from "next/link";
import type { Livro } from "@/lib/types";

export default function BookCard({ livro, autorNome, temCapitulos }: { livro: Livro; autorNome?: string; temCapitulos?: boolean }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-[#c9a86a]/40 bg-[#141b2e]/80 shadow-[0_0_18px_rgba(201,168,106,0.12)] backdrop-blur">
      <div className="aspect-[2/3] w-full p-3">
        {livro.capa_url ? (
          <img src={livro.capa_url} alt={`Capa de ${livro.titulo}`} className="h-full w-full rounded object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded border border-[#c9a86a]/50 bg-gradient-to-br from-[#233052] to-[#0d1428] p-3">
            <span className="font-title text-center text-sm tracking-widest text-[#e6c98a]">{livro.titulo}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 text-center">
        <h3 className="font-title text-xs uppercase tracking-[0.15em] text-[#e6c98a]">{livro.titulo}</h3>
        {autorNome && <p className="text-[0.7rem] text-[#c9a86a]/70">por {autorNome}</p>}
        <p className="flex-1 text-xs leading-relaxed text-[#cfd6e4]/80 line-clamp-3">{livro.descricao}</p>
        <div className="flex flex-col items-center gap-2 pt-1">
          <Link href={`/livro/${livro.id}`} className="placa w-full text-center !py-1.5 !text-[0.65rem]">DETALHES</Link>
          {temCapitulos && (
            <Link href={`/livro/${livro.id}/capitulo/1`} className="placa placa-escura w-full text-center !py-1.5 !text-[0.65rem]">
              LER AGORA
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
