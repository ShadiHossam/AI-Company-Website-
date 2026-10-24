import { describe, it, expect } from 'vitest';
import {
  getClientIp,
  createRateLimiter,
  safeHttpsUrl,
  normaliseWebUrl,
  safeHref,
  jsonLdString,
} from '../../lib/request-safety';

const req = (headers: Record<string, string>) => new Request('https://lenooai.com/', { headers });

describe('getClientIp', () => {
  it('prefers cf-connecting-ip', () => {
    expect(getClientIp(req({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '9.9.9.9' }))).toBe('1.1.1.1');
  });

  it('uses the last X-Forwarded-For entry, not the client-supplied first one', () => {
    expect(getClientIp(req({ 'x-forwarded-for': 'spoofed, 2.2.2.2' }))).toBe('2.2.2.2');
  });

  it('falls back to clientAddress, then "unknown"', () => {
    expect(getClientIp(req({}), '3.3.3.3')).toBe('3.3.3.3');
    expect(getClientIp(req({}))).toBe('unknown');
  });
});

describe('createRateLimiter', () => {
  it('allows up to the limit per key', () => {
    const allow = createRateLimiter(2, 60_000);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    expect(allow('b')).toBe(true);
  });
});

describe('safeHttpsUrl', () => {
  it('accepts https and rejects other schemes', () => {
    expect(safeHttpsUrl('https://x.supabase.co/a.pdf')).toBe('https://x.supabase.co/a.pdf');
    expect(safeHttpsUrl('http://x.com')).toBeNull();
    expect(safeHttpsUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpsUrl('java\tscript:alert(1)')).toBeNull();
    expect(safeHttpsUrl(42)).toBeNull();
  });
});

describe('normaliseWebUrl', () => {
  it('adds https:// to a bare host', () => {
    expect(normaliseWebUrl('linkedin.com/in/x')).toBe('https://linkedin.com/in/x');
  });

  it('keeps http(s) and rejects script schemes', () => {
    expect(normaliseWebUrl('http://site.com')).toBe('http://site.com/');
    expect(normaliseWebUrl('javascript:alert(1)')).toBeNull();
    expect(normaliseWebUrl('data:text/html,x')).toBeNull();
    expect(normaliseWebUrl('')).toBeNull();
  });

  it('never yields a javascript: URL from a tab-split scheme', () => {
    const out = normaliseWebUrl('java\tscript:alert(1)');
    expect(out === null || out.startsWith('https://')).toBe(true);
  });
});

describe('safeHref', () => {
  it('neutralises non-http(s) links', () => {
    expect(safeHref('javascript:alert(1)')).toBe('#');
    expect(safeHref('java\tscript:alert(1)')).toBe('#');
    expect(safeHref(null)).toBe('#');
    expect(safeHref('https://a.com/cv.pdf')).toBe('https://a.com/cv.pdf');
  });
});

describe('jsonLdString', () => {
  it('escapes < so DB text cannot close the script tag', () => {
    const out = jsonLdString({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });
});
