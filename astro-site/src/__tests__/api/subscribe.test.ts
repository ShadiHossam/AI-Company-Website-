import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../helpers';

const { createContact, getContact } = vi.hoisted(() => ({ createContact: vi.fn(), getContact: vi.fn() }));
vi.mock('resend', () => ({
  Resend: class {
    contacts = { create: createContact, get: getContact };
  },
}));
vi.mock('../../lib/supabase', () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock('../../lib/resend', () => ({
  sendSubscriberNotification: vi.fn(),
  sendNewsletterWelcome: vi.fn(),
}));

import { getSupabaseAdmin } from '../../lib/supabase';
import { sendSubscriberNotification, sendNewsletterWelcome } from '../../lib/resend';
import { POST } from '../../pages/api/subscribe';

let ipCounter = 0;
function request(body: unknown, origin = 'https://lenooai.com') {
  return new Request('https://lenooai.com/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // A fresh IP per request keeps the rate limiter out of the way
      'x-forwarded-for': `10.0.0.${++ipCounter}`,
      referer: 'https://lenooai.com/blog/chatbot-types',
      ...(origin ? { origin } : {}),
    },
    body: JSON.stringify(body),
  });
}

const call = (body: unknown, origin?: string) => POST({ request: request(body, origin) } as any);

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createContact.mockResolvedValue({ data: { id: 'c1' }, error: null });
    getContact.mockResolvedValue({ data: null, error: { name: 'not_found', message: 'Contact not found' } });
    const chain = makeChain({ data: { value: 'owner@example.com' }, error: null });
    (getSupabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({ from: vi.fn().mockReturnValue(chain) });
  });

  it('saves a new subscriber, welcomes them and notifies the owner', async () => {
    const res = await call({ email: '  Reader@Example.com ' });
    expect(res.status).toBe(200);
    expect(createContact).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'reader@example.com', segments: [{ id: expect.any(String) }] }),
    );
    expect(sendNewsletterWelcome).toHaveBeenCalledWith('reader@example.com', 'info@lenooai.com');
    expect(sendSubscriberNotification).toHaveBeenCalledWith(
      'reader@example.com',
      'https://lenooai.com/blog/chatbot-types',
      'owner@example.com',
    );
  });

  it('treats a repeat signup as success without sending the emails again', async () => {
    getContact.mockResolvedValue({ data: { id: 'c1', email: 'reader@example.com' }, error: null });
    const res = await call({ email: 'reader@example.com' });
    expect(res.status).toBe(200);
    expect(createContact).not.toHaveBeenCalled();
    expect(sendNewsletterWelcome).not.toHaveBeenCalled();
    expect(sendSubscriberNotification).not.toHaveBeenCalled();
  });

  it('still succeeds when an email fails to send, since the contact is saved', async () => {
    (sendNewsletterWelcome as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('smtp down'));
    const res = await call({ email: 'reader@example.com' });
    expect(res.status).toBe(200);
    expect(sendSubscriberNotification).toHaveBeenCalled();
  });

  it('returns 502 when Resend cannot save the contact', async () => {
    createContact.mockResolvedValue({ data: null, error: { message: 'API key invalid' } });
    const res = await call({ email: 'reader@example.com' });
    expect(res.status).toBe(502);
    expect(sendNewsletterWelcome).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    const res = await call({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(createContact).not.toHaveBeenCalled();
  });

  it('rejects requests from other origins', async () => {
    const res = await call({ email: 'reader@example.com' }, 'https://evil.example');
    expect(res.status).toBe(403);
    expect(createContact).not.toHaveBeenCalled();
  });

  it('silently accepts bots that fill the honeypot, without saving them', async () => {
    const res = await call({ email: 'bot@example.com', website: 'spam' });
    expect(res.status).toBe(200);
    expect(createContact).not.toHaveBeenCalled();
  });
});
