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
  // Empty as of 2026-10-21: all 26 previously listed paths verified live (200)
  // on lenooai.com, so links to them render normally again.
];
