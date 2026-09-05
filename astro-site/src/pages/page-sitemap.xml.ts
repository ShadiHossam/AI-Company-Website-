import type { APIRoute } from 'astro';

const BASE = 'https://lenooai.com';

// Routes are discovered from the filesystem rather than listed by hand. The
// previous hand-maintained array had drifted badly out of date: 123 live,
// indexable pages (the whole /ar/industries and /ar/services trees, the
// /services/ai-automation/tools tree, /privacy, /terms, and more) existed on
// disk but were absent from the sitemap, and only 21 of the 116 EN pages that
// actually have an Arabic twin declared one. Globbing removes both failure
// modes permanently: a new .astro page is in the sitemap the moment it lands.
const ROUTE_MODULES = import.meta.glob('./**/*.astro');

// Not indexable, so never emitted.
const EXCLUDE = new Set(['/404', '/maintenance']);

// Real last-edit date per route, taken from `git log -1 --format=%cI` on the
// page's source file and converted to UTC. Update a page's value when you
// change its content. Do not replace these with a build-time `new Date()`:
// that would make every URL claim it changed on every deploy, which trains
// Google to ignore lastmod for the whole site.
const LASTMOD: Record<string, string> = {
  '/':                                                    '2026-07-20T20:07:25+00:00',
  '/about':                                               '2026-07-19T12:51:47+00:00',
  '/ar':                                                  '2026-07-19T12:51:47+00:00',
  '/ar/about':                                            '2026-08-25T18:03:04+00:00',
  '/ar/blog':                                             '2026-07-19T11:36:43+00:00',
  '/ar/careers':                                          '2026-08-25T18:03:04+00:00',
  '/ar/contact':                                          '2026-08-25T18:03:04+00:00',
  '/ar/industries':                                       '2026-08-25T18:03:04+00:00',
  '/ar/industries/accounting-firms':                      '2026-08-23T07:42:51+00:00',
  '/ar/industries/aesthetic-clinics':                     '2026-08-25T18:03:04+00:00',
  '/ar/industries/auto-service':                          '2026-08-25T18:03:04+00:00',
  '/ar/industries/beauty-salons':                         '2026-08-25T18:03:04+00:00',
  '/ar/industries/car-dealerships':                       '2026-08-25T18:03:04+00:00',
  '/ar/industries/cleaning-services':                     '2026-08-25T18:03:04+00:00',
  '/ar/industries/construction':                          '2026-08-25T18:03:04+00:00',
  '/ar/industries/consulting':                            '2026-08-25T18:03:04+00:00',
  '/ar/industries/coworking-business-setup':              '2026-08-25T18:03:04+00:00',
  '/ar/industries/dental-clinics':                        '2026-08-25T18:03:04+00:00',
  '/ar/industries/ecommerce':                             '2026-08-25T18:03:04+00:00',
  '/ar/industries/education':                             '2026-08-25T18:03:04+00:00',
  '/ar/industries/engineering-consultancies':             '2026-08-25T18:03:04+00:00',
  '/ar/industries/event-management':                      '2026-08-25T18:03:04+00:00',
  '/ar/industries/facilities-management':                 '2026-08-25T18:03:04+00:00',
  '/ar/industries/finance-banking':                       '2026-08-25T18:03:04+00:00',
  '/ar/industries/fitness-gyms':                          '2026-08-25T18:03:04+00:00',
  '/ar/industries/healthcare':                            '2026-08-25T18:03:04+00:00',
  '/ar/industries/healthcare-clinics':                    '2026-08-25T18:03:04+00:00',
  '/ar/industries/hospitality':                           '2026-07-19T11:36:43+00:00',
  '/ar/industries/hr-recruitment':                        '2026-08-25T18:03:04+00:00',
  '/ar/industries/insurance':                             '2026-08-25T18:03:04+00:00',
  '/ar/industries/interior-fitout':                       '2026-08-25T18:03:04+00:00',
  '/ar/industries/it-msp':                                '2026-08-25T18:03:04+00:00',
  '/ar/industries/last-mile-delivery':                    '2026-08-25T18:03:04+00:00',
  '/ar/industries/legal':                                 '2026-08-25T18:03:04+00:00',
  '/ar/industries/logistics':                             '2026-08-25T18:03:04+00:00',
  '/ar/industries/manufacturing':                         '2026-08-25T18:03:04+00:00',
  '/ar/industries/marketing':                             '2026-08-25T18:03:04+00:00',
  '/ar/industries/marketing-agencies':                    '2026-08-25T18:03:04+00:00',
  '/ar/industries/pharmacies':                            '2026-08-25T18:03:04+00:00',
  '/ar/industries/property-management':                   '2026-08-25T18:03:04+00:00',
  '/ar/industries/real-estate':                           '2026-07-19T11:36:43+00:00',
  '/ar/industries/restaurants':                           '2026-08-25T18:03:04+00:00',
  '/ar/industries/retail':                                '2026-07-19T12:51:47+00:00',
  '/ar/industries/security-services':                     '2026-08-25T18:03:04+00:00',
  '/ar/industries/trading-distribution':                  '2026-08-25T18:03:04+00:00',
  '/ar/industries/training-institutes':                   '2026-08-25T18:03:04+00:00',
  '/ar/industries/travel-agencies':                       '2026-08-25T18:03:04+00:00',
  '/ar/privacy':                                          '2026-08-23T07:01:18+00:00',
  '/ar/services':                                         '2026-07-19T11:36:43+00:00',
  '/ar/services/agentops':                                '2026-08-25T18:03:04+00:00',
  '/ar/services/agentops/what-is-agentops':               '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agent-security':                       '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents':                               '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/abu-dhabi':                     '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/agencies':                      '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/architecture':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/customer-support':              '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/development':                   '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/dubai':                         '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/for-real-estate':               '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/receptionist':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/sales':                         '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/templates':                     '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/tools':                         '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/tools/gumloop':                 '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/tools/lindy':                   '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/tools/n8n-ai-agent':            '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/tools/pipedream':               '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/tools/salesforce-agentforce':   '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/use-cases':                     '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/voice-agents':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-agents/vs-agentic-ai':                 '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation':                           '2026-07-18T14:23:08+00:00',
  '/ar/services/ai-automation/abu-dhabi':                 '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/accounting':                '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/agencies':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/business':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/dubai':                     '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/finance':                   '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/free-zone':                 '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/operations':                '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/procurement':               '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/real-estate':               '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools':                     '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/automation-anywhere': '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/boomi':               '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/make':                '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/mulesoft':            '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/n8n':                 '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/power-automate':      '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/uipath':              '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/workato':             '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-automation/tools/zapier':              '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-chatbot-development':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-compliance-uae':                       '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-integration':                          '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-maintenance':                          '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-model-finetuning':                     '2026-07-18T14:23:08+00:00',
  '/ar/services/ai-strategy':                             '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-strategy/data-readiness':              '2026-08-25T18:03:04+00:00',
  '/ar/services/ai-training':                             '2026-08-25T18:03:04+00:00',
  '/ar/services/arabic-ai':                               '2026-08-25T18:03:04+00:00',
  '/ar/services/arabic-ai/chatbots':                      '2026-08-25T18:03:04+00:00',
  '/ar/services/arabic-ai/voice-agents':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/claude-agent-builds':                     '2026-08-25T18:03:04+00:00',
  '/ar/services/custom-ai-development':                   '2026-08-25T18:03:04+00:00',
  '/ar/services/custom-gpt-development':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/internal-ai-tools':                       '2026-08-25T18:03:04+00:00',
  '/ar/services/prompt-engineering':                      '2026-07-18T14:23:08+00:00',
  '/ar/services/vibe-coding':                             '2026-08-25T18:03:04+00:00',
  '/ar/services/vibe-coding/beginners':                   '2026-08-25T18:03:04+00:00',
  '/ar/services/vibe-coding/game-development':            '2026-08-25T18:03:04+00:00',
  '/ar/services/vibe-coding/risks-and-limitations':       '2026-08-25T18:03:04+00:00',
  '/ar/services/vibe-coding/tools':                       '2026-08-25T18:03:04+00:00',
  '/ar/services/vibe-coding/vs-traditional-coding':       '2026-08-25T18:03:04+00:00',
  '/ar/services/whatsapp-ai-automation':                  '2026-08-25T18:03:04+00:00',
  '/ar/services/whatsapp-ai-automation/business-api':     '2026-08-25T18:03:04+00:00',
  '/ar/terms':                                            '2026-08-23T07:01:18+00:00',
  '/blog':                                                '2026-07-19T06:21:05+00:00',
  '/careers':                                             '2026-07-19T12:51:47+00:00',
  '/contact':                                             '2026-07-21T19:48:27+00:00',
  '/industries':                                          '2026-08-31T18:33:27+00:00',
  '/industries/accounting-firms':                         '2026-08-21T18:24:41+00:00',
  '/industries/aesthetic-clinics':                        '2026-08-21T18:24:41+00:00',
  '/industries/auto-service':                             '2026-08-21T18:39:12+00:00',
  '/industries/beauty-salons':                            '2026-08-21T18:39:12+00:00',
  '/industries/car-dealerships':                          '2026-08-23T07:06:02+00:00',
  '/industries/cleaning-services':                        '2026-08-23T07:06:02+00:00',
  '/industries/construction':                             '2026-08-23T07:22:37+00:00',
  '/industries/consulting':                               '2026-08-15T12:46:09+00:00',
  '/industries/coworking-business-setup':                 '2026-08-23T07:22:37+00:00',
  '/industries/dental-clinics':                           '2026-08-25T18:06:02+00:00',
  '/industries/ecommerce':                                '2026-08-25T18:06:02+00:00',
  '/industries/education':                                '2026-08-03T04:11:17+00:00',
  '/industries/engineering-consultancies':                '2026-08-29T09:43:11+00:00',
  '/industries/event-management':                         '2026-08-29T09:43:11+00:00',
  '/industries/facilities-management':                    '2026-08-31T16:52:37+00:00',
  '/industries/finance-banking':                          '2026-08-15T12:46:09+00:00',
  '/industries/fitness-gyms':                             '2026-08-31T16:52:37+00:00',
  '/industries/healthcare':                               '2026-08-15T12:46:09+00:00',
  '/industries/healthcare-clinics':                       '2026-08-31T17:13:57+00:00',
  '/industries/hospitality':                              '2026-07-19T06:21:05+00:00',
  '/industries/hr-recruitment':                           '2026-08-15T12:46:09+00:00',
  '/industries/insurance':                                '2026-08-03T18:08:05+00:00',
  '/industries/interior-fitout':                          '2026-08-31T17:13:57+00:00',
  '/industries/it-msp':                                   '2026-08-31T17:20:03+00:00',
  '/industries/last-mile-delivery':                       '2026-08-31T17:20:03+00:00',
  '/industries/legal':                                    '2026-08-03T18:55:47+00:00',
  '/industries/logistics':                                '2026-07-19T06:21:05+00:00',
  '/industries/manufacturing':                            '2026-08-04T04:08:56+00:00',
  '/industries/marketing':                                '2026-08-04T04:22:01+00:00',
  '/industries/marketing-agencies':                       '2026-08-31T18:33:27+00:00',
  '/industries/marketing/analytics-attribution':          '2026-08-04T18:38:37+00:00',
  '/industries/marketing/content-writing':                '2026-08-15T12:46:09+00:00',
  '/industries/marketing/email-marketing':                '2026-08-08T09:34:38+00:00',
  '/industries/marketing/image-generation':               '2026-08-08T21:16:49+00:00',
  '/industries/marketing/influencer-marketing':           '2026-08-09T05:10:44+00:00',
  '/industries/marketing/paid-ads':                       '2026-08-09T05:19:41+00:00',
  '/industries/marketing/seo':                            '2026-08-09T05:54:35+00:00',
  '/industries/marketing/social-media':                   '2026-08-09T06:23:28+00:00',
  '/industries/marketing/video-generation':               '2026-08-09T12:03:15+00:00',
  '/industries/marketing/voice-generation':               '2026-08-09T12:23:42+00:00',
  '/industries/pharmacies':                               '2026-08-31T18:33:27+00:00',
  '/industries/property-management':                      '2026-08-31T18:33:27+00:00',
  '/industries/real-estate':                              '2026-07-19T06:21:05+00:00',
  '/industries/restaurants':                              '2026-08-31T18:33:27+00:00',
  '/industries/retail':                                   '2026-07-19T12:51:47+00:00',
  '/industries/security-services':                        '2026-08-31T18:33:27+00:00',
  '/industries/trading-distribution':                     '2026-08-31T18:33:27+00:00',
  '/industries/training-institutes':                      '2026-08-31T18:33:27+00:00',
  '/industries/travel-agencies':                          '2026-08-31T18:33:27+00:00',
  '/pricing/ai-automation-cost':                          '2026-08-31T18:33:27+00:00',
  '/privacy':                                             '2026-08-23T07:01:18+00:00',
  '/services':                                            '2026-07-19T06:21:05+00:00',
  '/services/agentops':                                   '2026-08-31T18:33:27+00:00',
  '/services/agentops/what-is-agentops':                  '2026-08-31T18:33:27+00:00',
  '/services/ai-agent-security':                          '2026-08-31T18:33:27+00:00',
  '/services/ai-agents':                                  '2026-08-02T13:53:23+00:00',
  '/services/ai-agents/abu-dhabi':                        '2026-08-02T13:39:32+00:00',
  '/services/ai-agents/agencies':                         '2026-08-02T14:15:55+00:00',
  '/services/ai-agents/architecture':                     '2026-08-02T13:52:02+00:00',
  '/services/ai-agents/customer-support':                 '2026-08-02T14:15:55+00:00',
  '/services/ai-agents/development':                      '2026-08-02T14:15:55+00:00',
  '/services/ai-agents/dubai':                            '2026-08-02T13:39:32+00:00',
  '/services/ai-agents/for-real-estate':                  '2026-08-02T14:15:55+00:00',
  '/services/ai-agents/receptionist':                     '2026-08-31T18:33:27+00:00',
  '/services/ai-agents/sales':                            '2026-08-02T14:15:55+00:00',
  '/services/ai-agents/templates':                        '2026-08-02T13:52:02+00:00',
  '/services/ai-agents/tools':                            '2026-08-02T13:36:29+00:00',
  '/services/ai-agents/tools/gumloop':                    '2026-08-29T11:11:13+00:00',
  '/services/ai-agents/tools/lindy':                      '2026-08-29T11:11:13+00:00',
  '/services/ai-agents/tools/n8n-ai-agent':               '2026-08-29T15:04:47+00:00',
  '/services/ai-agents/tools/pipedream':                  '2026-08-29T11:11:13+00:00',
  '/services/ai-agents/tools/salesforce-agentforce':      '2026-08-29T11:11:13+00:00',
  '/services/ai-agents/use-cases':                        '2026-08-02T14:15:55+00:00',
  '/services/ai-agents/voice-agents':                     '2026-08-02T14:15:55+00:00',
  '/services/ai-agents/vs-agentic-ai':                    '2026-08-02T14:15:55+00:00',
  '/services/ai-automation':                              '2026-07-19T12:51:47+00:00',
  '/services/ai-automation/abu-dhabi':                    '2026-08-09T12:44:11+00:00',
  '/services/ai-automation/accounting':                   '2026-08-09T13:59:57+00:00',
  '/services/ai-automation/agencies':                     '2026-08-09T18:21:45+00:00',
  '/services/ai-automation/business':                     '2026-08-10T16:44:11+00:00',
  '/services/ai-automation/dubai':                        '2026-08-10T17:14:12+00:00',
  '/services/ai-automation/finance':                      '2026-08-31T18:33:27+00:00',
  '/services/ai-automation/free-zone':                    '2026-08-31T18:33:27+00:00',
  '/services/ai-automation/operations':                   '2026-08-31T18:33:27+00:00',
  '/services/ai-automation/procurement':                  '2026-08-31T18:33:27+00:00',
  '/services/ai-automation/real-estate':                  '2026-08-10T18:04:07+00:00',
  '/services/ai-automation/tools':                        '2026-08-11T03:21:05+00:00',
  '/services/ai-automation/tools/automation-anywhere':    '2026-08-29T11:11:13+00:00',
  '/services/ai-automation/tools/boomi':                  '2026-08-29T11:11:13+00:00',
  '/services/ai-automation/tools/make':                   '2026-08-29T15:04:47+00:00',
  '/services/ai-automation/tools/mulesoft':               '2026-08-29T11:11:13+00:00',
  '/services/ai-automation/tools/n8n':                    '2026-08-29T15:04:47+00:00',
  '/services/ai-automation/tools/power-automate':         '2026-08-29T11:11:13+00:00',
  '/services/ai-automation/tools/uipath':                 '2026-08-29T15:04:47+00:00',
  '/services/ai-automation/tools/workato':                '2026-08-29T11:11:13+00:00',
  '/services/ai-automation/tools/zapier':                 '2026-08-29T15:04:47+00:00',
  '/services/ai-chatbot-development':                     '2026-08-31T18:33:27+00:00',
  '/services/ai-compliance-uae':                          '2026-08-31T18:33:27+00:00',
  '/services/ai-integration':                             '2026-07-19T12:51:47+00:00',
  '/services/ai-maintenance':                             '2026-08-31T18:33:27+00:00',
  '/services/ai-model-finetuning':                        '2026-07-19T12:51:47+00:00',
  '/services/ai-strategy':                                '2026-07-19T06:21:05+00:00',
  '/services/ai-strategy/data-readiness':                 '2026-08-31T18:33:27+00:00',
  '/services/ai-training':                                '2026-07-19T06:21:05+00:00',
  '/services/arabic-ai':                                  '2026-08-31T18:33:27+00:00',
  '/services/arabic-ai/chatbots':                         '2026-08-31T18:33:27+00:00',
  '/services/arabic-ai/voice-agents':                     '2026-08-31T18:33:27+00:00',
  '/services/claude-agent-builds':                        '2026-07-19T12:51:47+00:00',
  '/services/custom-ai-development':                      '2026-07-19T12:51:47+00:00',
  '/services/custom-gpt-development':                     '2026-07-19T12:51:47+00:00',
  '/services/internal-ai-tools':                          '2026-08-29T11:11:13+00:00',
  '/services/prompt-engineering':                         '2026-07-19T12:51:47+00:00',
  '/services/vibe-coding':                                '2026-08-29T11:11:13+00:00',
  '/services/vibe-coding/beginners':                      '2026-08-15T11:57:13+00:00',
  '/services/vibe-coding/game-development':               '2026-08-15T05:14:09+00:00',
  '/services/vibe-coding/risks-and-limitations':          '2026-08-15T05:22:26+00:00',
  '/services/vibe-coding/tools':                          '2026-08-02T21:35:53+00:00',
  '/services/vibe-coding/vs-traditional-coding':          '2026-08-15T10:59:32+00:00',
  '/services/whatsapp-ai-automation':                     '2026-08-31T18:33:27+00:00',
  '/services/whatsapp-ai-automation/business-api':        '2026-08-31T18:33:27+00:00',
  '/terms':                                               '2026-08-23T07:01:18+00:00',
};

// Fallback for a page added since LASTMOD was last regenerated. It is
// deliberately a fixed date, not `now`, for the reason above.
const DEFAULT_LASTMOD = '2026-08-31T18:33:27+00:00';

/** './services/ai-agents.astro' -> '/services/ai-agents'; './index.astro' -> '/' */
function toRoute(file: string): string | null {
  if (file.includes('[')) return null; // dynamic route, handled elsewhere
  let r = file.replace(/^\./, '').replace(/\.astro$/, '');
  if (r.startsWith('/admin/') || r.startsWith('/api/')) return null;
  if (r.endsWith('/index')) r = r.slice(0, -6);
  return r === '' ? '/' : r;
}

const ROUTES: string[] = Object.keys(ROUTE_MODULES)
  .map(toRoute)
  .filter((r): r is string => r !== null && !EXCLUDE.has(r))
  .sort();

const ROUTE_SET = new Set(ROUTES);

const isArabic = (r: string) => r === '/ar' || r.startsWith('/ar/');
/** '/services' -> '/ar/services'; '/' -> '/ar' */
const arTwinOf = (r: string) => (r === '/' ? '/ar' : `/ar${r}`);
/** '/ar/services' -> '/services'; '/ar' -> '/' */
const enTwinOf = (r: string) => (r === '/ar' ? '/' : r.slice(3));

function urlEntry(route: string): string {
  const enRoute = isArabic(route) ? enTwinOf(route) : route;
  const arRoute = isArabic(route) ? route : arTwinOf(route);

  // Both sides are looked up independently. Deriving one of them from "am I an
  // Arabic route" instead would make a page's own existence prove its twin's:
  // an /ar/ page published before its English version would declare an en-ae
  // alternate pointing at a 404, and Google drops a cluster that names a URL
  // it cannot fetch. Every page today has both halves, so this only shows up
  // the first time the two languages are published out of step.
  const hasEn = ROUTE_SET.has(enRoute);
  const hasAr = ROUTE_SET.has(arRoute);

  // x-default names the version to serve a searcher we have no better match
  // for, which is the English page wherever one exists. A page that is its own
  // only version names itself and claims no twin.
  const alternates = hasEn && hasAr
    ? `
    <xhtml:link rel="alternate" hreflang="en-ae" href="${BASE}${enRoute}"/>
    <xhtml:link rel="alternate" hreflang="ar-ae" href="${BASE}${arRoute}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${enRoute}"/>`
    : `
    <xhtml:link rel="alternate" hreflang="${isArabic(route) ? 'ar-ae' : 'en-ae'}" href="${BASE}${route}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${route}"/>`;

  return `  <url>
    <loc>${BASE}${route}</loc>
    <lastmod>${LASTMOD[route] ?? DEFAULT_LASTMOD}</lastmod>${alternates}
  </url>`;
}

export const GET: APIRoute = async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/main-sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${ROUTES.map(urlEntry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
