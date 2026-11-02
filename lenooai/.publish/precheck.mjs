import fs from 'fs';
import { sb } from '../../scripts/link-citations/lib.mjs';
const rows = JSON.parse(fs.readFileSync(new URL('./rows.json', import.meta.url), 'utf8'));
let all=[],from=0;
while(true){const{data,error}=await sb.from('blog_posts').select('slug,title,ar_title').order('slug').range(from,from+999);if(error)throw error;all.push(...data);if(data.length<1000)break;from+=1000}
const slugs=new Set(all.map(r=>r.slug)),t=new Set(all.flatMap(r=>[r.title,r.ar_title]).filter(Boolean));
console.log('existing',all.length,'slug clashes',rows.filter(r=>slugs.has(r.slug)).length);
console.log('title clashes',rows.filter(r=>t.has(r.title)||t.has(r.ar_title)).map(r=>r.slug));
const seen=new Set();console.log('dupe titles in batch',rows.filter(r=>{const d=seen.has(r.title);seen.add(r.title);return d}).map(r=>r.title));
const bad=[];await Promise.all(rows.map(async r=>{const s=await fetch(r.og_image,{method:'HEAD'});if(s.status!==200)bad.push(r.slug)}));console.log('feature image failures',bad.length,bad.slice(0,5));
