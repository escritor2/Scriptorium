// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-[#c9a86a]/30 bg-[#0d1428]/90 py-10 text-center">
      <nav className="font-title flex flex-wrap justify-center gap-6 text-[0.65rem] tracking-[0.2em] text-[#c9a86a]">
        <a href="#" className="hover:text-[#e6c98a]">DÚVIDAS FREQUENTES</a>
        <a href="#" className="hover:text-[#e6c98a]">TERMOS DE SERVIÇO</a>
        <a href="#" className="hover:text-[#e6c98a]">POLÍTICA DE PRIVACIDADE</a>
      </nav>
      <p className="mt-6 text-lg">🦉</p>
      <p className="font-title mt-2 text-xs tracking-[0.25em] text-[#c9a86a]">SIGA-NOS</p>
      <p className="mt-4 text-[0.65rem] text-[#cfd6e4]/50">Copyright © 2026 Scriptorium. All rights reserved.</p>
    </footer>
  );
}