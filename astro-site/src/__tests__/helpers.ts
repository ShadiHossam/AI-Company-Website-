import { vi } from 'vitest';

/**
 * Builds a chainable Supabase query mock that resolves to `result` when awaited
 * at any point in the chain (direct await, .single(), .range(), .limit(), etc.).
 */
export function makeChain(result: Record<string, unknown> = { data: null, error: null, count: null }) {
  const resolved = Promise.resolve(result);
  const chain: Record<string, unknown> = {};

  const methods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'not', 'in', 'is', 'gte', 'lte', 'lt', 'or',
    'order', 'range', 'limit', 'single',
  ];

  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }

  // Make the chain itself thenable so `await chain` resolves to `result`
  chain['then'] = resolved.then.bind(resolved);
  chain['catch'] = resolved.catch.bind(resolved);
  chain['finally'] = resolved.finally.bind(resolved);

  return chain;
}

/** Builds a minimal Astro locals object with an authenticated user. */
export function makeLocals(overrides: Partial<{ id: string; email: string; role: string }> = {}) {
  return {
    user: {
      id: 'user-1',
      email: 'admin@lenooai.com',
      role: 'super_admin',
      ...overrides,
    },
  };
}

/** Builds a POST/PATCH Request with JSON body and correct origin by default. */
export function makeRequest(
  body: unknown,
  method = 'POST',
  origin = 'https://lenooai.com',
): Request {
  return new Request('https://lenooai.com/api/admin/test', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { origin } : {}),
    },
    body: JSON.stringify(body),
  });
}

/** Parses a Response body as JSON. */
export async function json(res: Response) {
  return res.json();
}
