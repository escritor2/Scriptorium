import { supabaseServer } from "@/lib/supabase/server";
import { autorLogado } from "@/lib/auth";
import FormCapitulo from "@/components/FormCapitulo";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function EditarCapitulo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const autor = await autorLogado();
  const supabase = await supabaseServer();

  const { data: capitulo } = await supabase.from("capitulos").select("*").eq("id", id).single();
  if (!capitulo) return <p className="p-10 text-center text-[#c9a86a]">Capítulo não encontrado.</p>;

  const { data: livro } = await supabase
    .from("livros")
    .select("autor_id, titulo")
    .eq("id", capitulo.livro_id)
    .single();

  // dupla checagem: a RLS já bloqueia o PATCH/DELETE no banco, mas também
  // escondemos o formulário na tela se o capítulo não pertencer a um livro deste autor
  if (livro?.autor_id !== autor?.id) {
    return (
      <p className="p-10 text-center text-[#c9a86a]">
        Este capítulo pertence a um livro de outro autor — você só pode editar os seus próprios capítulos.
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <BackButton fallbackHref={"/autor/livro/" + capitulo.livro_id + "/editar"} />
      <h1 className="font-title mb-2 text-2xl tracking-[0.2em] text-[#e6c98a]">EDITAR CAPÍTULO</h1>
      <p className="mb-8 text-sm text-[#c9a86a]/70">Do livro: {livro?.titulo}</p>
      <FormCapitulo capitulo={capitulo} />
    </section>
  );
}
