import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function ehAutor(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("autor_session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || ""));
    return true;
  } catch {
    return false;
  }
}