"use client";
import { useState } from "react";

export default function LeituraBackground() {
  const [temArte, setTemArte] = useState(true);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
      {temArte && (
        <img
          src="/leitura-bg.jpg"
          alt=""
          onError={() => setTemArte(false)}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}
      {/* Escurece tudo pra acalmar a leitura */}
      <div className="absolute inset-0 bg-[#0b1020]/85" />
      {/* Luz de vela sutil no topo */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,106,0.08), transparent 60%)" }}
      />
    </div>
  );
}