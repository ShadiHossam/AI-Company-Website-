// Author headshots shown next to the byline on article pages. Keyed by the
// author_name stored on blog_posts; authors without an entry keep initials.
const AUTHOR_PHOTOS: Record<string, string> = {
  'Shadi Hossam': '/images/authors/shadi-hossam.webp',
};

export function authorPhoto(name: string | null | undefined): string | undefined {
  return name ? AUTHOR_PHOTOS[name] : undefined;
}
