import {fetchAll,isAr,links,classify} from './lib.mjs';
const rows = await fetchAll('id,slug,title,ar_title,category,pub_date,body_markdown,ar_body_markdown');
const en = rows.filter(r=>!isAr(r.title));
const ar = rows.filter(r=>r.ar_title);
function stat(list, key){
  const dist={ext:{},int:{}}; const extDomains={}; let below_ext=0,below_int=0,totE=0,totI=0;
  for(const r of list){
    const L=links(r[key]);
    const e=L.filter(x=>classify(x.href)==='external');
    const i=L.filter(x=>classify(x.href)==='internal');
    totE+=e.length; totI+=i.length;
    dist.ext[Math.min(e.length,6)]=(dist.ext[Math.min(e.length,6)]||0)+1;
    dist.int[Math.min(i.length,6)]=(dist.int[Math.min(i.length,6)]||0)+1;
    if(e.length<5)below_ext++; if(i.length<5)below_int++;
    for(const x of e){try{const d=new URL(x.href).hostname.replace(/^www\./,'');extDomains[d]=(extDomains[d]||0)+1;}catch{}}
  }
  return {n:list.length,below_ext,below_int,totE,totI,dist,domains:Object.entries(extDomains).sort((a,b)=>b[1]-a[1])};
}
const E=stat(en,'body_markdown'), A=stat(ar,'ar_body_markdown');
for(const [name,s] of [['EN',E],['AR',A]]){
  console.log(`\n=== ${name} (${s.n} posts) ===`);
  console.log('external citations: total', s.totE, '| below 5:', s.below_ext);
  console.log('  dist (0..6+):', [0,1,2,3,4,5,6].map(k=>`${k}:${s.dist.ext[k]||0}`).join('  '));
  console.log('internal links: total', s.totI, '| below 5:', s.below_int);
  console.log('  dist (0..6+):', [0,1,2,3,4,5,6].map(k=>`${k}:${s.dist.int[k]||0}`).join('  '));
  console.log('  distinct external domains:', s.domains.length);
  console.log('  top domains:', s.domains.slice(0,12).map(d=>`${d[0]}(${d[1]})`).join(', '));
}
console.log('\ncategories:', [...new Set(rows.map(r=>r.category))].join(' | '));
