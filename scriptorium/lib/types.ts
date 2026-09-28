export type Livro = {
  id: string;
  titulo: string;
  descricao: string;
  genero: string | null;
  capa_url: string | null;
  criado_em: string;
  autor_id: string | null;
};

export type PerfilAutor = {
  id: string;
  nome: string;
  bio: string | null;
  criado_em: string;
};

export type Capitulo = {
  id: string;
  livro_id: string;
  numero: number;
  titulo: string;
  conteudo: string;
};