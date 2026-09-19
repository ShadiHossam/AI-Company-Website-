import {fetchAll} from './lib.mjs'; import fs from 'fs';
const rows = await fetchAll('*');
const f = new URL('./backup-blog_posts-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json', import.meta.url);
fs.writeFileSync(f, JSON.stringify(rows,null,1));
console.log('backed up', rows.length, 'rows ->', f.pathname);
