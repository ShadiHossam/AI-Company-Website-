import { PENDING_PAGES } from '../data/pendingPages';

export function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function isPageLive(path: string): boolean {
  return !PENDING_PAGES.includes(normalizePath(path));
}
