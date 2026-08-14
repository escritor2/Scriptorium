// components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[#c9a86a]/30 bg-[#0b1020]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-title text-xl tracking-[0.25em] text-[#e6c98a]">
          ✦ SCRIPTORIUM
          <span className="ml-3 hidden text-xs tracking-widest text-[#c9a86a]/70 sm:inline">
            Seus Livros, Sua História
          </span>
        </Link>
        <nav className="font-title flex gap-6 text-xs tracking-[0.2em] text-[#c9a86a]">
          <Link href="/" className="transition hover:text-[#e6c98a]">HOME</Link>
          <Link href="/livros" className="transition hover:text-[#e6c98a]">LIVROS</Link>
          <Link href="/autor/login" className="transition hover:text-[#e6c98a]">ÁREA DO AUTOR</Link>
        </nav>
      </div>
    </header>
  );
}