/**
 * Scheduled publishing for blog_posts.
 *
 * A post is queued by inserting it with status 'published' and a future
 * pub_date. Every public query also filters `pub_date <= todayInDubai()`, so
 * the post goes live by itself at midnight Dubai time, with no job to run.
 *
 * Why not a 'scheduled' status: blog_posts_status_check only allows draft,
 * published and archived, and the project has no pg_cron to flip rows over.
 * A date filter needs neither, and cannot silently stop the way a missed
 * cron run would.
 */

/** Today's date in Dubai as YYYY-MM-DD, the same shape as blog_posts.pub_date. */
export function todayInDubai(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** True when a published row's date has not arrived yet in Dubai. */
export function isScheduled(pubDate: string | null | undefined, now: Date = new Date()): boolean {
  return !!pubDate && pubDate.slice(0, 10) > todayInDubai(now);
}

/**
 * updated_at, but only when the row was edited after it went live. Queued rows
 * are inserted, and so stamped with updated_at, long before their pub_date;
 * reporting that would put dateModified before datePublished.
 */
export function updatedAfterPublish(updatedAt: string | null | undefined, pubDate: string | null | undefined): Date | undefined {
  if (!updatedAt) return undefined;
  const updated = new Date(updatedAt);
  return pubDate && updated <= new Date(pubDate) ? undefined : updated;
}

/** The date to advertise as sitemap lastmod: the later of the edit and the publish date. */
export function lastModified(updatedAt: string | null | undefined, pubDate: string | null | undefined): Date | undefined {
  return updatedAfterPublish(updatedAt, pubDate) ?? (pubDate ? new Date(pubDate) : undefined);
}
