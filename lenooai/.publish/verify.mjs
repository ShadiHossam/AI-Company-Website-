import { sb } from '../../scripts/link-citations/lib.mjs';
const { data, error } = await sb.from('blog_posts').select('slug,pub_date,status,lang,ar_title,og_image,noindex').like('slug', 'abu-dhabi/%');
if (error) throw error;
const days = {}; data.forEach(r => { const k = r.pub_date.slice(0, 10); days[k] = (days[k] || 0) + 1; });
console.log(data.length, 'rows', Object.keys(days).sort().map(k => `${k}:${days[k]}`).join(' '));
console.log('status', [...new Set(data.map(r => r.status))], 'en', data.filter(r => r.lang === 'en').length, 'ar', data.filter(r => r.lang === 'ar').length, 'with AR', data.filter(r => r.ar_title).length, 'no image', data.filter(r => !r.og_image).length);
const { count } = await sb.from('blog_posts').select('slug', { count: 'exact', head: true });
const { data: q } = await sb.from('blog_posts').select('pub_date').gt('pub_date', '2026-11-02').not('slug', 'like', 'abu-dhabi/%').order('pub_date', { ascending: false }).limit(1);
console.log('total', count, 'existing queue ends', q[0].pub_date);
