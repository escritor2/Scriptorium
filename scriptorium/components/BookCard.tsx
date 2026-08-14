// components/BookCard.tsx
import Link from "next/link";
import type { Livro } from "@/lib/types";

export default function BookCard({ livro }: { livro: Livro }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-[#c9a86a]/40 bg-[#141b2e]/80 shadow-[0_0_25px_rgba(201,168,106,0.15)] backdrop-blur">
      <div className="aspect-[2/3] w-full p-6">
        {livro.capa_url ? (
          <img src={livro.capa_url} alt={`Capa de ${livro.titulo}`} className="h-full w-full rounded object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded border border-[#c9a86a]/50 bg-gradient-to-br from-[#233052] to-[#0d1428] p-4">
            <span className="font-title text-center text-lg tracking-widest text-[#e6c98a]">{livro.titulo}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 text-center">
        <h3 className="font-title text-sm uppercase tracking-[0.2em] text-[#e6c98a]">{livro.titulo}</h3>
        <p className="flex-1 text-sm leading-relaxed text-[#cfd6e4]/80">{livro.descricao}</p>
        <div className="flex flex-col items-center gap-2">
          <Link href={`/livro/${livro.id}`} className="placa">SAIBA MAIS</Link>
          <Link href={`/livro/${livro.id}`} className="placa placa-escura">LER RESENHA</Link>
        </div>
      </div>
    </article>
  );
}