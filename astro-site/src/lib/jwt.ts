import { jwtVerify } from 'jose';

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  user_metadata?: { role?: string };
  exp: number;
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const secret = new TextEncoder().encode(import.meta.env.SUPABASE_JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JWTPayload;
}

export type AppRole = 'super_admin' | 'editor' | 'sales';

export function extractRole(payload: JWTPayload): AppRole | null {
  const role = payload.user_metadata?.role ?? payload.role;
  if (role === 'super_admin' || role === 'editor' || role === 'sales') return role;
  return null;
}
