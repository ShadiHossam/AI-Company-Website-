import fs from 'fs'; import {fetchAll} from '../link-citations/lib.mjs';
const rows = await fetchAll('id,slug,body_markdown,ar_body_markdown');
fs.writeFileSync(process.argv[2], JSON.stringify(rows)); console.log(rows.length);
