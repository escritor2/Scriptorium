"use client";
import { useRouter } from "next/navigation";

export default function BackButton({ fallbackHref }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        // se o navegador tiver de onde voltar (veio de dentro do site), usa isso;
        // senão (ex: acessou o link direto), cai no fallback
        if (window.history.length > 1) router.back();
        else if (fallbackHref) router.push(fallbackHref);
      }}
      className="font-title mb-6 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-[#c9a86a] transition hover:text-[#e6c98a]"
    >
      ← VOLTAR
    </button>
  );
}
