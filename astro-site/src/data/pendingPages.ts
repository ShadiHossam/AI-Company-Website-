/**
 * Site-relative paths (e.g. "/services/vibe-coding/foo") that are committed
 * to the repo but NOT yet confirmed live on production. Any link this site
 * builds to one of these paths (via SafeLink.astro) renders as plain text
 * instead of a clickable <a href>, so a staged-rollout deploy gap can never
 * surface as a broken link to a visitor.
 *
 * Update this list every time a staged-rollout batch ships (see project
 * memory "Staged Rollout Status" for the current batch schedule): add a
 * path the moment it's referenced by a new cross-link before its own batch
 * has deployed, remove it once that batch's deploy is verified live.
 */
export const PENDING_PAGES: string[] = [
  // Industries hub + leaf pages that are local drafts only (untracked in
  // git) as of 2026-08-23 — verified via `git ls-files` + `curl -sI` against
  // production returning 404. Remove each path once you publish that page
  // through the normal one-or-two-at-a-time pipeline (see git log --grep=publish).
  '/industries',
  '/industries/pharmacies',
  '/industries/event-management',
  '/industries/trading-distribution',
  '/industries/fitness-gyms',
  '/industries/training-institutes',
  '/industries/marketing-agencies',
  '/industries/healthcare-clinics',
  '/industries/property-management',
  '/industries/interior-fitout',
  '/industries/it-msp',
  '/industries/travel-agencies',
  '/industries/restaurants',
  '/industries/engineering-consultancies',
  '/industries/facilities-management',
  '/industries/security-services',
  '/industries/dental-clinics',
  '/industries/ecommerce',
  '/industries/last-mile-delivery',
  '/ar/industries',
  // Service subpages that are local drafts only, same verification method.
  '/services/ai-compliance-uae',
  '/services/ai-automation/finance',
  '/services/ai-automation/free-zone',
  '/services/ai-automation/procurement',
  '/services/ai-automation/operations',
  '/services/ai-agents/receptionist',
];
