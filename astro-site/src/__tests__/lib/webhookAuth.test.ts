import { describe, it, expect } from 'vitest';
import { signWebhook, verifyWebhook } from '../../lib/webhookAuth';

const SECRET = 'test-secret';
const NOW = 1_792_900_000_000;
const body = '{"target":"en"}';

function signed(ts: number, b = body, secret = SECRET) {
  const t = String(Math.floor(ts / 1000));
  return new Request('https://lenooai.com/api/deploy/publish', {
    method: 'POST',
    headers: { 'x-timestamp': t, 'x-signature': signWebhook(secret, t, 'POST', '/api/deploy/publish', b) },
    body: b,
  });
}

describe('verifyWebhook', () => {
  it('accepts a fresh, correctly signed request once', () => {
    const req = signed(NOW);
    expect(verifyWebhook(req, body, SECRET, NOW)).toBe(true);
    expect(verifyWebhook(req, body, SECRET, NOW)).toBe(false); // replay
  });

  it('rejects stale timestamps', () => {
    expect(verifyWebhook(signed(NOW - 10 * 60_000), body, SECRET, NOW)).toBe(false);
  });

  it('rejects a tampered body or wrong secret', () => {
    expect(verifyWebhook(signed(NOW + 1000), '{"target":"ar"}', SECRET, NOW)).toBe(false);
    expect(verifyWebhook(signed(NOW + 2000, body, 'other'), body, SECRET, NOW)).toBe(false);
  });

  it('rejects the old bearer-token style and a missing secret', () => {
    const bearer = new Request('https://lenooai.com/api/deploy/publish', {
      method: 'POST', headers: { authorization: `Bearer ${SECRET}` },
    });
    expect(verifyWebhook(bearer, body, SECRET, NOW)).toBe(false);
    expect(verifyWebhook(signed(NOW + 3000), body, undefined, NOW)).toBe(false);
  });
});
