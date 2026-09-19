// Resolved by path: this directory has no node_modules of its own, and the
// app's copy is not an ancestor of it.
import { createClient } from '../../astro-site/node_modules/@supabase/supabase-js/dist/index.mjs';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync(new URL('../../astro-site/.env.local', import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
export const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const ARABIC=/[؀-ۿ]/;
export function isAr(t){if(!t)return false;let L=0,a=0;for(const c of t){if(!/\p{L}/u.test(c))continue;L++;if(ARABIC.test(c))a++;}return L>0&&a/L>0.5;}
export async function fetchAll(cols='*'){let all=[],from=0;while(true){const{data,error}=await sb.from('blog_posts').select(cols).eq('status','published').is('deleted_at',null).order('slug').range(from,from+499);if(error)throw error;all=all.concat(data);if(data.length<500)break;from+=500;}return all;}
// markdown link extraction
export const MDLINK=/\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
export const HTMLLINK=/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
export function links(md){
  const out=[]; if(!md) return out;
  let m; MDLINK.lastIndex=0;
  while((m=MDLINK.exec(md))) out.push({text:m[1],href:m[2]});
  HTMLLINK.lastIndex=0;
  while((m=HTMLLINK.exec(md))) out.push({text:'',href:m[1]});
  return out;
}
export function classify(href){
  if(/^https?:\/\/(www\.)?lenooai\.com/i.test(href)) return 'internal';
  if(/^https?:\/\//i.test(href)) return 'external';
  if(href.startsWith('/')) return 'internal';
  return 'other';
}
