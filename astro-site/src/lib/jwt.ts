import { jwtVerify, createRemoteJWKSet } from 'jose';

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  app_metadata?: { role?: string };
  exp: number;
}

// Supabase signs session tokens with a per-project asymmetric key (ES256) rather than
// a shared HMAC secret, so verification has to go through its published JWKS rather
// than a static secret — there is no shared secret to verify against anymore.
const JWKS = createRemoteJWKSet(
  new URL(`${import.meta.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${import.meta.env.SUPABASE_URL}/auth/v1`,
    audience: 'authenticated',
  });
  return payload as unknown as JWTPayload;
}

export type AppRole = string;

// The admin role lives in app_metadata, which only the service role can write.
// Never read user_metadata (any signed-in user can edit their own via
// auth.updateUser) or the top-level `role` claim (always "authenticated").
export function extractRole(payload: JWTPayload): AppRole | null {
  const role = payload.app_metadata?.role;
  return role && typeof role === 'string' ? role : null;
}
