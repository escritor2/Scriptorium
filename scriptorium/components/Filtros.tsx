"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Filtros({ generos }: { generos: string[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [genero, setGenero] = useState("");

  function aplicar(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (busca) p.set("busca", busca);
    if (genero) p.set("genero", genero);
    router.push("/livros?" + p.toString());
  }

  return (
    <form onSubmit={aplicar} className="mb-10 flex flex-col gap-3 rounded-lg border border-[#c9a86a]/30 bg-[#141b2e]/70 p-5">
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">BUSCA RÚNICA</label>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por título..."
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none focus:border-[#e6c98a]"
      />
      <label className="font-title text-[0.65rem] tracking-[0.25em] text-[#c9a86a]">FILTRAR POR GÊNERO</label>
      <select
        value={genero}
        onChange={(e) => setGenero(e.target.value)}
        className="rounded border border-[#c9a86a]/40 bg-[#0b1020] px-3 py-2 text-[#e8e3d8] outline-none"
      >
        <option value="">Todos</option>
        {generos.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <button className="placa mt-2" type="submit">APLICAR</button>
    </form>
  );
}