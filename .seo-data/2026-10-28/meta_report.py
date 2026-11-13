import json
F = "lenoo-seo-audit.html"
h = open(F, encoding="utf8").read()
rows = open("meta-rows.json", encoding="utf8").read().replace("</", "<\\/")

def sub(old, new):
    global h
    assert old in h, old[:50]
    h = h.replace(old, new)

# Corrections to what the 28 Oct version said.
sub('28 Oct 2026 · live crawl', 'Updated 2 Nov 2026 · live crawl')
sub('686 EN posts are queued, one a day until 13 Sep 2028.', '683 EN posts and 97 Arabic posts are queued. The main queue runs one a day until 13 Sep 2028, and the Abu Dhabi batch adds about 24 pages a day from 3 to 9 Nov.')
sub(' Only 13 Arabic posts are queued.', '')
sub('Rewrite the titles and descriptions to answer the searched question directly, and put a two-sentence answer at the top of each article.', 'The titles on these pages already match the search, and <code>/blog/system-prompt-security</code> is mostly found through one long exam-style question, so the answer may be shown on the results page. Rewrites are worth testing here, but expect a modest gain. The bigger title fixes are in the next section.')
sub('<li>CTR rewrites on the 5 zero-click articles</li>', '<li>Pause the Abu Dhabi batch until its titles are fixed</li>\n      <li>Stop the 4 duplicate Arabic posts</li>\n      <li>Repair the 171 live titles graded Fix or carrying grammar errors</li>')
sub('<section>\n  <h2>Smaller issues</h2>', '''<section id="meta">
  <h2>Article titles and descriptions</h2>
  <p class="lede">I reviewed 1,277 titles and descriptions: 418 live and 859 scheduled, across 1,194 database rows. Length is well controlled: 1,270 titles fit in search results and none are missing. The problem is the wording. Many titles are search phrases with the grammar taken out, and the same templates repeat hundreds of times.</p>
  <div class="tbl"><table>
    <thead><tr><th>Grade</th><th>Live</th><th>Scheduled</th><th>Total</th></tr></thead>
    <tbody>
      <tr><td><span class="pill p-crit">Fix</span></td><td class="num">129</td><td class="num">316</td><td class="num">445</td></tr>
      <tr><td><span class="pill p-med">Improve</span></td><td class="num">93</td><td class="num">319</td><td class="num">412</td></tr>
      <tr><td><span class="pill p-good">Good</span></td><td class="num">196</td><td class="num">224</td><td class="num">420</td></tr>
    </tbody>
  </table></div>

  <article class="finding">
    <div class="top"><span class="pill p-crit">Urgent</span><h3>The Abu Dhabi batch starts tomorrow with its weakest titles</h3></div>
    <dl>
      <dt>Evidence</dt><dd>170 pages (81 EN, 89 AR) go live from 3 to 9 Nov, which adds about 40% to the 418 live pages in one week. 144 pages graded Fix publish in that window. Examples: "Chatbot Bank Abu Dhabi", "Chatbot Museum Abu Dhabi", "Chatbot Hospital Abu Dhabi". 27 English titles start the same way, and 74 Arabic titles place أبوظبي straight after a noun. The descriptions repeat the error: "A practical guide to chatbot restaurant Abu Dhabi setups".</dd>
      <dt>Why it matters</dt><dd>City-plus-service pages at this speed and with this wording look like doorway pages, and they carry the scaled-content risk covered above.</dd>
      <dt>Fix</dt><dd>Move the batch dates back, correct the titles and descriptions, then release 1 to 2 pages a day.</dd>
    </dl>
  </article>

  <article class="finding">
    <div class="top"><span class="pill p-crit">Urgent</span><h3>Four scheduled Arabic posts duplicate live articles</h3></div>
    <dl>
      <dt>Evidence</dt><dd>Each has the same title and description as a live article, and 87 to 91% of the body text matches.
        <ul>
          <li><code>uae-data-protection-ai</code> (5 Nov) copies <code>/ar/blog/uae-pdpl</code></li>
          <li><code>ai-security-prompt-injection</code> (6 Nov) copies <code>/ar/blog/prompt-injection</code></li>
          <li><code>selling-on-whatsapp</code> (7 Nov) copies <code>/ar/blog/whatsapp-commerce</code></li>
          <li><code>choose-what-to-automate</code> (10 Nov) copies <code>/ar/blog/what-to-automate-first</code></li>
        </ul></dd>
      <dt>Fix</dt><dd>Cancel these four. If any new text is better, move it into the live article.</dd>
    </dl>
  </article>

  <article class="finding">
    <div class="top"><span class="pill p-high">High</span><h3>Titles written for a keyword tool, not a reader</h3></div>
    <dl>
      <dt>Evidence</dt><dd>267 English titles and 151 Arabic titles have grammar removed so the exact keyword fits, and 38 + 80 of them are live. Google matches meaning, so "AI Bias in Hiring" targets the same search as "AI Bias Hiring". The broken version only lowers trust at the moment someone decides to click. In 92 English descriptions the same phrase appears mid-sentence, for example "AI bias hiring UAE risks stack fast".</dd>
      <dt>Fix</dt><dd>Restore the prepositions. Sample rewrites are below.</dd>
    </dl>
  </article>

  <div class="tbl"><table>
    <thead><tr><th>Now</th><th>Better</th></tr></thead>
    <tbody>
      <tr><td>AI Bias Hiring UAE: Where Employers Are Exposed</td><td>AI Bias in Hiring: Where UAE Employers Are Exposed</td></tr>
      <tr><td>Consent AI Data Collection UAE: PDPL Rules for Agents</td><td>Consent for AI Data Collection: UAE PDPL Rules</td></tr>
      <tr><td>Cross Border Data Transfer UAE: AI Model Rules</td><td>Sending Data to Overseas AI Models: UAE Rules</td></tr>
      <tr><td>Quote Automation Construction Companies UAE Guide</td><td>Quote Automation for UAE Construction Companies</td></tr>
      <tr><td>Automating Legacy Systems No API: 3 Honest Options</td><td>Automating Legacy Systems With No API: 3 Options</td></tr>
      <tr><td>Chatbot Bank Abu Dhabi: Conduct Rules Before You Automate</td><td>Banking Chatbots in Abu Dhabi: Conduct Rules First</td></tr>
      <tr><td dir="rtl">تكلفة الذكاء الاصطناعي الفنادق: دليل شامل بالدرهم</td><td dir="rtl">تكلفة الذكاء الاصطناعي للفنادق في الإمارات بالدرهم</td></tr>
      <tr><td dir="rtl">أتمتة واتساب العيادات الطبية في الإمارات: دليل عملي</td><td dir="rtl">أتمتة واتساب للعيادات الطبية في الإمارات: دليل عملي</td></tr>
      <tr><td dir="rtl">روبوت محادثة توظيف أبوظبي: شنو يسوي وشنو ما يسويه</td><td dir="rtl">روبوت محادثة للتوظيف في أبوظبي: حدوده وفوائده</td></tr>
    </tbody>
  </table></div>

  <h3>Other patterns</h3>
  <ul>
    <li><strong>Template repetition:</strong> 629 articles belong to a family of 5 or more near-identical titles. The largest: Chatbot X Abu Dhabi (28 EN, 30 AR), WhatsApp Automation for X (28), What to Automate First (23), Chatbot vs Voice Agent (23), AI Automation Cost (22), AI Automation Mistakes (22).</li>
    <li><strong>Spelling errors:</strong> "Hallucinations" appears in the title and URL of <code>prevent-chatbot-hallucinations</code>, and "Multilingual" in the title and URL of <code>multilingual-chatbot-uae</code>.</li>
    <li><strong>Out-of-date years:</strong> 12 scheduled titles say 2026 but publish in 2027 or 2028, for example "Cheapest LLM for Chatbots in 2026" on 24 Jun 2028.</li>
    <li><strong>A legal claim to check:</strong> <code>/blog/sovereign-llm-uae</code> mentions "UAE AI Act tiers". Law-firm trackers say the UAE has no single AI act yet. I did not check the official gazette.</li>
    <li><strong>Results claims:</strong> 13 descriptions promise numbers, such as "cut no-shows from 25% to under 5%" and "close 85 percent of renewals". With no case studies on the site, each needs a source in the article or softer wording.</li>
    <li><strong>Off-target pages:</strong> 19 articles target Saudi Arabia, Qatar, Kuwait, Bahrain or Oman, which goes against the UAE-only rule.</li>
    <li><strong>Colloquial Arabic:</strong> 11 scheduled titles use dialect such as شنو يسوي, while the rest of the site uses formal Arabic.</li>
    <li><strong>Repetitive openings:</strong> 145 Arabic descriptions start with دليل, and 363 descriptions open by repeating their title.</li>
    <li><strong>Inconsistent branding:</strong> only 51 titles show Lenoo AI, because the brand is added only when it fits within 60 characters. Six articles have it typed in by hand. This is minor, and the short-title rule is reasonable.</li>
  </ul>
  <p class="muted">How this was checked: I read all 1,277 titles, plus the descriptions of the 211 live English articles and the top 60 live Arabic articles by impressions. The other descriptions went through rule checks only. Grades come from those rules, so treat them as a sorted worklist and expect a few misjudged titles. Ten random live pages rendered exactly the titles graded here.</p>

  <h3>Every article</h3>
  <div class="filters">
    <input id="m-q" type="search" placeholder="Search title or URL" aria-label="Search title or URL">
    <select id="m-g" aria-label="Grade"><option value="">All grades</option><option>Fix</option><option>Improve</option><option>Good</option></select>
    <select id="m-l" aria-label="Language"><option value="">EN and AR</option><option>EN</option><option>AR</option></select>
    <select id="m-s" aria-label="Status"><option value="">Live and scheduled</option><option value="Live">Live</option><option value="S">Scheduled</option></select>
  </div>
  <p class="meta" id="m-n" aria-live="polite"></p>
  <div id="m-list" class="mlist"></div>
  <div class="pager"><button id="m-p" type="button">Previous</button><span class="meta" id="m-pg"></span><button id="m-x" type="button">Next</button></div>
</section>

<section>
  <h2>Smaller issues</h2>''')
sub('a{color:var(--accent)}', '''a{color:var(--accent)}
h3{font-family:var(--f-body)}
.filters{display:flex;flex-wrap:wrap;gap:8px}
.filters input,.filters select{font:14px var(--f-body);padding:8px 10px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--fg);min-width:0}
.filters input{flex:1 1 220px}
.mlist{display:grid;gap:10px}
.mrow{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px;display:grid;gap:6px;min-width:0}
.mrow .h{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font:12px var(--f-mono);color:var(--muted)}
.mrow .t{font-weight:600;overflow-wrap:anywhere}
.mrow .d{font-size:14px;color:var(--muted);overflow-wrap:anywhere}
.mrow ul{font-size:14px}
.mrow .u{font:12px var(--f-mono);overflow-wrap:anywhere;color:var(--accent)}
.pager{display:flex;gap:12px;align-items:center;justify-content:center}
.pager button{font:14px var(--f-body);padding:8px 14px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--fg);cursor:pointer}
.pager button:disabled{opacity:.4;cursor:default}
button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}''')
h = h.rstrip() + '''
<script type="application/json" id="m-data">''' + rows + '''</script>
<script>
(function(){
  var R=JSON.parse(document.getElementById('m-data').textContent),P=50,pg=0,F=R;
  var $=function(i){return document.getElementById(i)},cls={Fix:'p-crit',Improve:'p-med',Good:'p-good'};
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  function draw(){
    var L=$('m-list');L.textContent='';
    F.slice(pg*P,pg*P+P).forEach(function(r){
      var c=el('div','mrow'),h=el('div','h');if(r[1]==='AR')c.dir='rtl';
      h.appendChild(el('span','pill '+cls[r[0]],r[0]));
      h.appendChild(el('span','',r[1]+' · '+(r[2]==='Live'?'Live':r[2])+' · title '+r[6]+' · description '+r[7]+(r[9]?' · '+r[9]+' impressions':'')));
      c.appendChild(h);c.appendChild(el('div','t',r[4]));c.appendChild(el('div','d',r[5]));
      var u=el('div','u',r[3]);u.dir='ltr';c.appendChild(u);
      if(r[8].length){var n=el('ul');n.dir='ltr';r[8].forEach(function(x){n.appendChild(el('li','',x))});c.appendChild(n)}
      L.appendChild(c)});
    var t=Math.max(1,Math.ceil(F.length/P));
    $('m-n').textContent=F.length.toLocaleString()+' of '+R.length.toLocaleString()+' articles';
    $('m-pg').textContent='Page '+(pg+1)+' of '+t;$('m-p').disabled=pg===0;$('m-x').disabled=pg>=t-1;
  }
  function run(){
    var q=$('m-q').value.toLowerCase(),g=$('m-g').value,l=$('m-l').value,s=$('m-s').value;
    F=R.filter(function(r){return(!g||r[0]===g)&&(!l||r[1]===l)&&(!s||(s==='Live'?r[2]==='Live':r[2]!=='Live'))&&(!q||(r[4]+' '+r[3]).toLowerCase().indexOf(q)>=0)});
    pg=0;draw();
  }
  ['m-q','m-g','m-l','m-s'].forEach(function(i){$(i).addEventListener('input',run)});
  $('m-p').addEventListener('click',function(){pg--;draw()});$('m-x').addEventListener('click',function(){pg++;draw()});
  draw();
})();
</script>
'''
open(F, "w", encoding="utf8").write(h)
print(len(h))
