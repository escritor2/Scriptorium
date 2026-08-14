"use client";
import { useState } from "react";

const RUNAS = "ᚠᚢᚦᚱᚷᚺᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";

export default function AuroraBackground() {
  const [temArte, setTemArte] = useState(true);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b1020]">
      {/* Imagem principal da pasta public */}
      {temArte && (
        <img
          src="/hero-bg.jpg"
          alt=""
          onError={() => setTemArte(false)}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
      )}

      {/* Aurora animada por cima */}
      <div className="absolute -top-32 left-1/4 h-[45rem] w-[45rem] rounded-full opacity-25 blur-3xl animate-[flutuar_16s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #39d98a 0%, transparent 65%)" }} />
      <div className="absolute top-1/3 -right-40 h-[40rem] w-[40rem] rounded-full opacity-25 blur-3xl animate-[flutuar_20s_ease-in-out_infinite_reverse]" style={{ background: "radial-gradient(circle, #7b5cff 0%, transparent 65%)" }} />
      <div className="absolute -bottom-40 left-1/3 h-[38rem] w-[38rem] rounded-full opacity-20 blur-3xl animate-[flutuar_24s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, #ff6ec7 0%, transparent 65%)" }} />

      {/* Céu estrelado */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #ffffff88 0, transparent 100%), radial-gradient(1px 1px at 40% 70%, #ffffff66 0, transparent 100%), radial-gradient(1.5px 1.5px at 60% 20%, #ffffff99 0, transparent 100%), radial-gradient(1px 1px at 80% 50%, #ffffff55 0, transparent 100%), radial-gradient(1.5px 1.5px at 10% 80%, #ffffff77 0, transparent 100%), radial-gradient(1px 1px at 90% 10%, #ffffff66 0, transparent 100%), radial-gradient(1px 1px at 50% 50%, #ffffff44 0, transparent 100%), radial-gradient(1.5px 1.5px at 30% 10%, #ffffff88 0, transparent 100%)",
          backgroundSize: "700px 700px",
        }}
      />

      {/* Faixa de runas no topo */}
      <div
        className="absolute top-16 left-0 w-full overflow-hidden whitespace-nowrap text-center text-lg tracking-[0.6em] text-[#c9a86a]/25 select-none"
        style={{ fontFamily: '"Segoe UI Historic", "Noto Sans Runic", serif' }}
      >
        {(RUNAS + " ").repeat(6)}
      </div>

      {/* Círculo mágico girando no "chão" */}
      <div className="absolute left-1/2 -bottom-44 w-[54rem] -translate-x-1/2">
        <svg viewBox="0 0 200 200" className="w-full opacity-[0.14] animate-[girar_60s_linear_infinite]">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#c9a86a" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="#c9a86a" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="#e6c98a" strokeWidth="0.4" strokeDasharray="4 3" />
          <path d="M100 8 L178 152 L22 152 Z" fill="none" stroke="#c9a86a" strokeWidth="0.5" />
          <path d="M100 192 L22 48 L178 48 Z" fill="none" stroke="#c9a86a" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Vinheta pra manter o texto legível */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020]/70 via-transparent to-[#0b1020]" />
    </div>
  );
}