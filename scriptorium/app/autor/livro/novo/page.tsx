import FormLivro from "@/components/FormLivro";

export default function NovoLivro() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-title mb-8 text-2xl tracking-[0.2em] text-[#e6c98a]">NOVO LIVRO</h1>
      <FormLivro />
    </section>
  );
}