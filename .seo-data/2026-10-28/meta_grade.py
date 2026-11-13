import json, re, collections as C
S = json.load(open("meta-audit.json"))
FAM = ["abu-dhabi/chatbot-","whatsapp-automation-for-","ai-automation-cost-","ai-automation-mistakes-","what-to-automate-first-","chatbot-vs-voice-agent-","email-triage-automation-","document-collection-automation-","automated-reporting-","compliance-automation-","complaint-handling-automation-","customer-reactivation-","internal-ai-assistant-","review-management-automation-","quote-automation-","quote-follow-up-automation-","invoice-follow-up-automation-","client-onboarding-automation-","ai-content-generation-","social-dm-automation-","reduce-no-shows-","renewal-automation-","dispatch-automation-","inventory-automation-","order-status-automation-","ai-lead-qualification-for-","crm-automation-for-","missed-call-automation-for-","customer-feedback-automation-","ai-automation-","chatbot-development-","ai-agency-","ai-voice-agent-","arabic-chatbot-"]
def fam(s):
    sl = s["slug"]
    if sl.endswith("-appointment-booking-automation"): return "appointment-booking-automation"
    if sl.endswith("-software-stack-uae"): return "software-stack-uae"
    if s["lang"] == "AR" and not sl.startswith("abu-dhabi/"):
        return next((p for p in ("whatsapp-automation-","ai-cost-","lead-qualification-","booking-automation-","arabic-support-bot-","ai-for-") if sl.startswith(p)), None)
    return next((p for p in FAM if sl.startswith(p)), None)
fc = C.Counter((s["lang"], fam(s)) for s in S if fam(s))

PREP = r"\b(in|for|on|at|to|vs|of|with|from|by)\b"
FAMILY_T = r"^(AI |Automated |Internal AI )?(Quote|Document Collection|Email Triage|Complaint Handling|Review Management|Customer Reactivation|Reporting|Renewal|Dispatch|Compliance|Social DM|Inventory|Order Status|Automation Cost|Content Generation|Assistant|Invoice Follow.Up|Client Onboarding|Customer Feedback|Quote Follow.Up)( Automation)? [A-Z]"
AR_BAD = re.compile(r"^(تكلفة )?الذكاء الاصطناعي (المدارس|العقارات|الفنادق|المقاولات|تأسيس|عيادات|وساطة|الأندية|الشحن|التجارة|مكاتب|معارض)|^أتمتة واتساب (ال(?!صالونات)\S+|مكاتب|معارض|معاهد|عيادات|وساطة)|^حجز المواعيد (ال\S+|مكاتب|معارض|عيادات|وساطة|تأسيس)|^تأهيل العملاء (ال(?!محتملين)\S+|مكاتب|معارض|معاهد|عيادات|تأسيس)|^روبوت خدمة عملاء (ال\S+|مكاتب|معارض|معاهد|عيادات|وساطة|تأسيس)|^تكلفة الذكاء الاصطناعي (ال(?!ل)\S+|مكاتب|معارض|عيادات|وساطة|تأسيس)")
AR_DIAL = re.compile(r"شنو|وش |وين|ليه |شلون|تسوّي|ولا موظف|ولا سحابية|تشيك ليست|بالعربي$|صح$")
CLAIM = re.compile(r"(cut|cuts|recover|recovers|close|grow|collection time|no-shows|WISMO|DSO|containment|تخفض|استعادة)[^.]{0,40}\d+\s?(%|percent|hours)|\d+\s?(%|percent)[^.]{0,30}(renewals|containment)|من \d+% إلى \d+%")
TIC = re.compile(r"\b(actually|honest|here's|here is|really)\b", re.I)
OUTSIDE = re.compile(r"^(arabic-chatbot-(saudi-arabia|qatar|kuwait|bahrain|oman)|(saudi-arabia|qatar|kuwait|bahrain|oman)-data-protection-ai|oman|kuwait|bahrain|qatar-market|kwt-bhr-omn|ksa-residency|saudi-pdpl-sdaia|saudi-dialects|cross-border-ksa)$")
FACT = re.compile(r"UAE AI Act", re.I)

for s in S:
    t, d = (s["t"] or "").strip(), (s["d"] or "").strip(); ar = s["lang"] == "AR"; f = set(s["f"]); fx, im, lo = [], [], []
    pubyr = int(s["pub"][:4]); fam_ = fam(s); head = t.split(":")[0]
    if {"T_DUP"} & f: fx.append("Same title and description as another article. Body text overlaps 87 to 91%, so these compete with each other.")
    if re.search(r"hallucination|multilingual", t + d + s["slug"], re.I): fx.append("Spelling mistake in the title or URL.")
    if FACT.search(t + d): fx.append("Mentions a UAE AI Act. Law-firm trackers say the UAE has no single AI act yet, so check this wording.")
    yrs = [int(y) for y in re.findall(r"\b(20[12]\d)\b", t) if int(y) >= 2025]
    if not s["live"] and yrs and max(yrs) < pubyr: fx.append(f"Says {max(yrs)} but publishes in {pubyr}, so it looks out of date on day one.")
    if not ar:
        pasted = False
        if s["slug"].startswith("abu-dhabi/") and re.search(r"\S Abu Dhabi\b", head) and not re.search(r"\b(in|for|from|to) Abu Dhabi\b", head): pasted = True
        if re.search(r"\bUAE$", head) and not re.search(r"\b(in|for|to|across) (the )?UAE$", head) and not re.search(r"\bfor UAE$", head): pasted = True
        if re.match(FAMILY_T, t) and not re.search(PREP, head): pasted = True
        if re.search(r"^(Data Subject Rights AI|Consent AI Data|AI Bias Hiring|Reduce No Shows [A-Z]|Hire AI Engineer|Migrate Agent Platform|Arabic SEO Gulf|Arabic OCR Business|Train Team to|Send Time Optimization Gulf|Deploy AI Assistant to|Build Custom AI|Block AI Crawlers|Replit Supabase|Code Switching AI|Language Detection Voice|Automating Legacy Systems No API|AI Rollout Multicultural|AI Training Programme Company|Programmatic Content SEO Safe|Train Chatbot on|Local SEO AI Search)", t): pasted = True
        if pasted: fx.append("Title is a raw search phrase with the grammar removed. It reads as written for a machine.")
    else:
        if AR_BAD.search(t): fx.append("Arabic title drops the preposition (ل or في), so the phrase is ungrammatical.")
        elif s["slug"].startswith("abu-dhabi/") and re.search(r"\S أبوظبي", head) and not re.search(r"(في|ب|ل) ?أبوظبي", head): fx.append("Arabic title sets أبوظبي directly after a noun with no في, so it reads as a keyword string.")
        if AR_DIAL.search(t): fx.append("Colloquial Gulf wording in the title clashes with the formal Arabic used across the site.")
    if "T_LONG" in f: fx.append(f"Title is {s['tlen']} characters and will be cut off in search results.")
    if "D_LONG" in f: im.append(f"Description is {s['dlen']} characters, so the end gets cut off.")
    if "D_SHORT" in f: im.append(f"Description is only {s['dlen']} characters, so there is room for one more concrete detail.")
    fk = s.get("fk") or ""
    if not ar and fk in d.lower() and re.search(r"(uae|abu dhabi|dubai)$", fk) and not re.search(PREP, fk): im.append("Description repeats the same grammar-free keyword phrase.")
    if re.search(r"\b(ai|whatsapp|crm|arabizi)\b", d) and not ar: im.append("Lowercase brand or acronym in the description.")
    if CLAIM.search(d): im.append("Makes a results claim. Confirm the article cites a source, because the site has no case studies to back it.")
    if OUTSIDE.match(s["slug"]): im.append("Targets a market outside the UAE, which goes against the UAE-only rule.")
    elif "NO_GEO" in f: im.append("No UAE signal in the title or description.")
    if "T_MANUAL" in f or re.search(r"Lenoo", t): im.append("Brand typed into the stored title, unlike the other articles.")
    if fam_ and fc[(s["lang"], fam_)] >= 5: im.append(f"One of {fc[(s['lang'], fam_)]} near-identical titles built from the same template.")
    if "T_NEAR_DUP" in f: im.append("Nearly the same title as another article.")
    if "T_NO_KW" in f and not ar: lo.append("Focus keyword is missing from the title.")
    if "D_REPEATS_TITLE" in f: lo.append("Description opens by repeating the title, which wastes the first line.")
    if "D_NO_KW" in f and not ar: lo.append("Focus keyword is missing from the description.")
    if re.search(r"\(UAE( Guide)?\)$|UAE Guide$", t): lo.append("Ends with the stock (UAE) or UAE Guide tag.")
    if TIC.search(d): lo.append("Stock phrase in the description (actually, honest, here's).")
    if ar and d.startswith("دليل"): lo.append("Description opens with the stock word دليل.")
    if "EM_DASH" in f: lo.append("Contains an em dash.")
    s["grade"] = "Fix" if fx else "Improve" if im else "Good"; s["notes"] = fx + im + lo
    s["fam"] = fam_

G = C.Counter((s["lang"], "live" if s["live"] else "sched", s["grade"]) for s in S); print(sorted(G.items()))
print("overall", C.Counter(s["grade"] for s in S))
N = C.Counter(n[:60] if not re.search(r"\d", n) else re.sub(r"\d+", "N", n)[:60] for s in S for n in s["notes"])
for k, v in N.most_common(): print(v, k, "| live", sum(1 for s in S if s["live"] and any((n[:60] if not re.search(r"\d", n) else re.sub(r"\d+", "N", n)[:60]) == k for n in s["notes"])))
print("Template families", [(k, v) for k, v in fc.most_common(40)])
print("stale year sample", [(s["pub"], s["t"]) for s in S if any("looks out of date" in n for n in s["notes"])][:12])
print("fact", [(s["url"], s["d"][:110]) for s in S if FACT.search((s["t"] or "") + (s["d"] or ""))])
print("next 7 days Fix", C.Counter(s["pub"] for s in S if not s["live"] and s["pub"] <= "2026-11-09" and s["grade"] == "Fix"))
print("avg", sum(len(s["notes"]) for s in S) / len(S))
row = [[s["grade"], s["lang"], "Live" if s["live"] else s["pub"], s["url"], s["rendered"], s["d"] or "", s["tlen"], s["dlen"], s["notes"], (s["gsc"] or [0, 0])[1]] for s in S]
row.sort(key=lambda r: ({"Fix": 0, "Improve": 1, "Good": 2}[r[0]], 0 if r[2] == "Live" else 1, -r[9], r[2]))
json.dump(row, open("meta-rows.json", "w"), ensure_ascii=False, separators=(",", ":"))
