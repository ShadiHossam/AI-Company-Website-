import { PENDING_PAGES } from '../data/pendingPages';
import type { IndustryServiceRelation, RelatedLink } from '../data/pageRelations';

export function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function isPageLive(path: string): boolean {
  return !PENDING_PAGES.includes(normalizePath(path));
}

export interface RelatedLinksResult {
  heading: 'Related Services' | 'Related Industries';
  links: RelatedLink[];
}

export function getRelatedLinks(
  path: string,
  relations: IndustryServiceRelation[]
): RelatedLinksResult | null {
  const normalized = normalizePath(path);

  const forward = relations.find((r) => r.industry.path === normalized);
  if (forward && forward.services.length > 0) {
    return { heading: 'Related Services', links: forward.services };
  }

  const industries = relations
    .filter((r) => r.services.some((s) => s.path === normalized))
    .map((r) => r.industry);
  if (industries.length > 0) {
    return { heading: 'Related Industries', links: industries };
  }

  return null;
}
