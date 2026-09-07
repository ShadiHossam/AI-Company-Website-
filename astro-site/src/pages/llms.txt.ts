import type { APIRoute } from 'astro';
import { ROUTES, isArabicRoute } from '../lib/routes';

export const prerender = false;

const BASE = 'https://lenooai.com';

// Staging must not advertise itself to AI crawlers any more than to search
// crawlers, so it serves the same "nothing here" answer robots.txt gives.
const isStaging = import.meta.env.IS_STAGING === 'true';

/** '/services/ai-agents/voice-agents' -> 'Voice Agents' */
function titleFromRoute(route: string): string {
  const last = route.split('/').filter(Boolean).pop() ?? 'Home';
  return last
    .split('-')
    .map((w) => (w.length <= 3 && w !== 'ai' ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bUae\b/g, 'UAE')
    .replace(/\bMsp\b/g, 'MSP')
    .replace(/\bHr\b/g, 'HR')
    .replace(/\bSeo\b/g, 'SEO')
    .replace(/\bGpt\b/g, 'GPT');
}

/** Groups routes under the section heading a reader would expect. */
function section(route: string): string {
  if (route === '/') return 'Main';
  if (route.startsWith('/services/')) return 'Services';
  if (route.startsWith('/industries/')) return 'Industries';
  if (route.startsWith('/pricing/')) return 'Pricing';
  return 'Main';
}

const ORDER = ['Main', 'Services', 'Industries', 'Pricing'];

export const GET: APIRoute = () => {
  if (isStaging) {
    return new Response('# Staging mirror. Not for indexing or training.\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const english = ROUTES.filter((r) => !isArabicRoute(r));
  const grouped = new Map<string, string[]>();
  for (const route of english) {
    const key = section(route);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(route);
  }

  const body = ORDER.filter((k) => grouped.has(k))
    .map((key) => {
      const lines = grouped
        .get(key)!
        .map((r) => `- [${r === '/' ? 'Lenoo AI' : titleFromRoute(r)}](${BASE}${r})`)
        .join('\n');
      return `## ${key}\n\n${lines}`;
    })
    .join('\n\n');

  const txt = `# Lenoo AI

> An AI agency in Dubai building custom AI systems, agents, automation, and
> internal tools for businesses across the UAE. Every project is backed by a
> 100% refund guarantee.

Lenoo AI works with UAE companies on AI strategy, agent and chatbot builds,
workflow automation, Arabic-language AI, and staff training. The site is
published in English at lenooai.com and in Arabic under /ar.

Contact: hello@lenooai.com

${body}

## Arabic

The full site is mirrored in Arabic. Any English URL below has an Arabic
counterpart at the same path under /ar, where one is published.

- [Arabic homepage](${BASE}/ar)

## Optional

- [Blog](${BASE}/blog): guides and case studies on applying AI in the UAE
- [Arabic blog](${BASE}/ar/blog)
- [Sitemap index](${BASE}/sitemap_index.xml): every indexable URL with alternates
`;

  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
