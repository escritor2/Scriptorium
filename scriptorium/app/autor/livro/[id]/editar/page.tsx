import { supabase } from "@/lib/supabase";
import FormLivro from "@/components/FormLivro";
import type { Livro } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditarLivro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: livro } = await supabase.from("livros").select("*").eq("id", id).single();
  if (!livro) return <p className="p-10 text-center text-[#c9a86a]">Livro não encontrado.</p>;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-title mb-8 text-2xl tracking-[0.2em] text-[#e6c98a]">EDITAR LIVRO</h1>
      <FormLivro inicial={livro as Livro} />
    </section>
  );
}