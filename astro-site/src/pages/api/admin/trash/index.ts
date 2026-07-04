import type { APIRoute } from 'astro';
import { getSupabaseAdmin } from '../../../../lib/supabase';

export const prerender = false;

// Entity types that support soft-delete. Keep in sync with the DELETE handlers
// in their respective /api/admin/... routes and the deleted_at columns added
// by supabase/migrations/add_trash_soft_delete.sql.
export const TRASH_ENTITIES: Record<string, { table: string; titleField: string; label: string; adminPath: string }> = {
  blog_post:   { table: 'blog_posts',   titleField: 'title',        label: 'Blog Post',    adminPath: '/admin/blog' },
  job:         { table: 'jobs',         titleField: 'title',        label: 'Job Posting',  adminPath: '/admin/jobs' },
  case_study:  { table: 'case_studies', titleField: 'title',        label: 'Case Study',   adminPath: '/admin/content/case-studies' },
  client_logo: { table: 'client_logos', titleField: 'company_name', label: 'Client Logo',  adminPath: '/admin/content/client-logos' },
  team_member: { table: 'team_members', titleField: 'name',         label: 'Team Member',  adminPath: '/admin/content/team' },
  testimonial: { table: 'testimonials', titleField: 'client_name',  label: 'Testimonial',  adminPath: '/admin/content/testimonials' },
  product:     { table: 'products',     titleField: 'name',         label: 'Product',      adminPath: '/admin/content/products' },
};

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const supabase = getSupabaseAdmin();

  const results = await Promise.all(
    Object.entries(TRASH_ENTITIES).map(async ([entityType, cfg]) => {
      const { data, error } = await supabase
        .from(cfg.table)
        .select(`id, deleted_at, ${cfg.titleField}`)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error || !data) return [];
      return data.map((row: any) => ({
        entity_type: entityType,
        label: cfg.label,
        id: row.id,
        title: row[cfg.titleField] ?? '(untitled)',
        deleted_at: row.deleted_at,
      }));
    }),
  );

  const items = results.flat().sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

  return new Response(JSON.stringify({ data: items }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
