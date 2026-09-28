"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error("Preencha o .env.local com as chaves do Supabase antes de rodar.");
}

export function supabaseBrowser() {
  return createBrowserClient(url!, anon!);
}
