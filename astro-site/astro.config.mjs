import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';

const isO2switch = process.env.DEPLOY_TARGET === 'o2switch';

export default defineConfig({
  site: isO2switch ? 'https://aicompany.usine.site' : 'https://aegisai.ae',
  output: 'server',
  adapter: isO2switch ? node({ mode: 'standalone' }) : vercel(),
  trailingSlash: 'never',
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [],
  redirects: {
    '/pages/about':                             '/about',
    '/pages/about.html':                        '/about',
    '/pages/blog':                              '/blog',
    '/pages/blog.html':                         '/blog',
    '/pages/contact':                           '/contact',
    '/pages/contact.html':                      '/contact',
    '/pages/faq':                               '/faq',
    '/pages/faq.html':                          '/faq',
    '/pages/pricing':                           '/pricing',
    '/pages/pricing.html':                      '/pricing',
    '/pages/privacy':                           '/privacy',
    '/pages/privacy.html':                      '/privacy',
    '/pages/products':                          '/products',
    '/pages/products.html':                     '/products',
    '/pages/results':                           '/results',
    '/pages/results.html':                      '/results',
    '/pages/services':                          '/services',
    '/pages/services.html':                     '/services',
    '/pages/terms':                             '/terms',
    '/pages/terms.html':                        '/terms',
    '/services/custom-ai-development.html':     '/services/custom-ai-development',
    '/services/ai-training.html':               '/services/ai-training',
    '/services/ai-strategy.html':               '/services/ai-strategy',
    '/industries/real-estate.html':             '/industries/real-estate',
    '/industries/retail.html':                  '/industries/retail',
    '/industries/hospitality.html':             '/industries/hospitality',
    '/industries/logistics.html':               '/industries/logistics',
  },
});
