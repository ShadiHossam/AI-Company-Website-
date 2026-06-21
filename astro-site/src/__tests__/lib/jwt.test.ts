import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractRole } from '../../lib/jwt';
import type { JWTPayload } from '../../lib/jwt';

// Mock jose so we don't need a real JWT secret or real token
vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
}));

describe('extractRole', () => {
  it('returns super_admin from user_metadata.role', () => {
    const payload = { user_metadata: { role: 'super_admin' } } as JWTPayload;
    expect(extractRole(payload)).toBe('super_admin');
  });

  it('returns editor from user_metadata.role', () => {
    const payload = { user_metadata: { role: 'editor' } } as JWTPayload;
    expect(extractRole(payload)).toBe('editor');
  });

  it('returns sales from user_metadata.role', () => {
    const payload = { user_metadata: { role: 'sales' } } as JWTPayload;
    expect(extractRole(payload)).toBe('sales');
  });

  it('falls back to payload.role when user_metadata is absent', () => {
    const payload = { role: 'editor' } as JWTPayload;
    expect(extractRole(payload)).toBe('editor');
  });

  it('prefers user_metadata.role over payload.role', () => {
    const payload = { role: 'sales', user_metadata: { role: 'editor' } } as JWTPayload;
    expect(extractRole(payload)).toBe('editor');
  });

  it('passes through unrecognized role strings from payload.role', () => {
    const payload = { role: 'unknown_role' } as JWTPayload;
    expect(extractRole(payload)).toBe('unknown_role');
  });

  it('returns null when role is empty string', () => {
    const payload = { role: '' } as JWTPayload;
    expect(extractRole(payload)).toBeNull();
  });
});

describe('verifyJWT', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns payload on valid token', async () => {
    const { jwtVerify } = await import('jose');
    const fakePayload: JWTPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      role: 'super_admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    (jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ payload: fakePayload });

    const { verifyJWT } = await import('../../lib/jwt');
    const result = await verifyJWT('valid.jwt.token');

    expect(result).toEqual(fakePayload);
    expect(jwtVerify).toHaveBeenCalledOnce();
  });

  it('throws when jwtVerify rejects', async () => {
    const { jwtVerify } = await import('jose');
    (jwtVerify as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('JWTExpired'));

    const { verifyJWT } = await import('../../lib/jwt');
    await expect(verifyJWT('expired.token')).rejects.toThrow('JWTExpired');
  });
});
