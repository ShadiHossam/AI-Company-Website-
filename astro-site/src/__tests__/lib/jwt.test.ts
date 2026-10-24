import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractRole } from '../../lib/jwt';
import type { JWTPayload } from '../../lib/jwt';

// Mock jose so we don't need a real JWT secret or real token
vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(() => vi.fn()),
}));

describe('extractRole', () => {
  it('returns super_admin from app_metadata.role', () => {
    const payload = { app_metadata: { role: 'super_admin' } } as JWTPayload;
    expect(extractRole(payload)).toBe('super_admin');
  });

  it('returns editor from app_metadata.role', () => {
    const payload = { app_metadata: { role: 'editor' } } as JWTPayload;
    expect(extractRole(payload)).toBe('editor');
  });

  it('ignores user_metadata.role, which users can set themselves', () => {
    const payload = { user_metadata: { role: 'super_admin' } } as unknown as JWTPayload;
    expect(extractRole(payload)).toBeNull();
  });

  it('prefers app_metadata.role over a self-set user_metadata.role', () => {
    const payload = {
      app_metadata: { role: 'sales' },
      user_metadata: { role: 'super_admin' },
    } as unknown as JWTPayload;
    expect(extractRole(payload)).toBe('sales');
  });

  it('ignores the top-level role claim', () => {
    const payload = { role: 'authenticated' } as JWTPayload;
    expect(extractRole(payload)).toBeNull();
  });

  it('returns null when app_metadata.role is empty string', () => {
    const payload = { app_metadata: { role: '' } } as JWTPayload;
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
    expect((jwtVerify as ReturnType<typeof vi.fn>).mock.calls[0][2]).toMatchObject({
      audience: 'authenticated',
    });
  });

  it('throws when jwtVerify rejects', async () => {
    const { jwtVerify } = await import('jose');
    (jwtVerify as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('JWTExpired'));

    const { verifyJWT } = await import('../../lib/jwt');
    await expect(verifyJWT('expired.token')).rejects.toThrow('JWTExpired');
  });
});
