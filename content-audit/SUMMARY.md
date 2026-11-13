# تحليل محتوى موقع lenooai.com صفحة بصفحة

تاريخ التحليل: 13 نوفمبر 2026

## اللي اتقرا

| النوع | العدد |
|---|---|
| صفحات إنجليزي | 133 |
| صفحات عربي | 131 |
| مقالات إنجليزي (lenooai - Articles) | 200 |
| مقالات عربي | 202 |
| **المجموع** | **666** |

كل صف في `page-by-page-audit.csv` فيه: الرابط، عدد الكلمات، العنوان، H1، الكلمة الأساسية اللي المفروض الصفحة تظهر بيها، كلمات ثانوية، المشاكل، والتحسين.

ملاحظة: التحليل معمول من الكود والملفات. الموقع الحي ما كانش متاح من البيئة دي، والنصوص اللي جاية من قاعدة البيانات (تعديلات الأدمن على الصفحة الرئيسية وAbout وServices، والمقالات المنشورة في Supabase) اتقرت بالنسخة الافتراضية الموجودة في الكود.

---

## أهم 10 مشاكل على مستوى الموقع كله (بالترتيب)

### 1. الضمان مكتوب بطرق متناقضة (خطر قانوني وخطر ثقة)
- About و Services و Contact بيقولوا: "100% refund, No conditions, no fine print, no disputes".
- الصفحة الرئيسية بتقول: "لو حققنا المعايير وعايز ترجع فلوسك، هنتناقش".
- صفحة Terms (قسم 4) فيها شروط فعلية: معايير نجاح مكتوبة في SOW، مشاركة فعالة من العميل، والكود يفضل ملك Lenoo بعد الاسترداد.
- الاسم نفسه متغير: "100% refund guarantee" في 66 صفحة، "satisfaction guarantee" في 3، "full refund" في 3.

**الحل:** صيغة واحدة في كل مكان، زي: "If the system misses the success criteria we agree in writing, you get a full refund." وشيل "No conditions".

### 2. مفيش أي دليل اجتماعي في أي صفحة
مفيش عملاء، ولا دراسة حالة، ولا شهادات، ولا لوجوهات، ولا أسماء فريق. الأدمن فيه أقسام testimonials و case-studies و client-logos و team بس ولا صفحة عامة بتعرضهم.
كل الـ402 مقالة مكتوبة باسم "Shadi Hossam" ورابط الكاتب بيودي على /about، وصفحة About ما فيهاش اسمه أصلاً. صورة About من Unsplash ومكتوب في الـ alt إنها "Lenoo AI team".

**الحل:** صفحة About فيها المؤسس والفريق بصور حقيقية، وصفحة كاتب /author/shadi-hossam، وولو دراسة حالة واحدة حقيقية على الصفحة الرئيسية.

### 3. صفحات بتنافس بعضها على نفس الكلمة (Cannibalization)
| الكلمة | الصفحات اللي بتتنافس |
|---|---|
| ai agency dubai | `/` و `/blog/ai-agency-dubai` و `/services/ai-automation/dubai` |
| ai agents | `/services/ai-agents` و `/services/claude-agent-builds` و `/services/ai-agents/development` و `/services/ai-agents/dubai` |
| ai automation dubai | `/services/ai-automation/dubai` و `/services/ai-agents/dubai` (43% نص متطابق) |
| abu dhabi | `/abu-dhabi` و `/services/ai-automation/abu-dhabi` و `/services/ai-agents/abu-dhabi` و `/blog/ai-agency-abu-dhabi` |
| healthcare | `/industries/healthcare` و `/industries/healthcare-clinics` |
| retail / ecommerce | `/industries/retail` (عنوانها Retail & E-commerce) و `/industries/ecommerce` |
| marketing | `/industries/marketing` و `/industries/marketing-agencies` |
| logistics | `/industries/logistics` و `/industries/last-mile-delivery` |
| real estate | `/industries/real-estate` و `/services/ai-agents/for-real-estate` و `/services/ai-automation/real-estate` و `/blog/crm-automation-for-real-estate` |
| accounting | `/industries/accounting-firms` و `/services/ai-automation/accounting` و `/services/ai-automation/finance` |
| voice | `/services/ai-agents/voice-agents` و `/services/ai-agents/receptionist` و `/services/arabic-ai/voice-agents` |
| chatbot | `/services/ai-chatbot-development` و `/services/arabic-ai/chatbots` و `/services/custom-gpt-development` و `/blog/chatbot-development-dubai` |
| monitoring | `/services/agentops` و `/services/agentops/what-is-agentops` و `/services/ai-maintenance` |
| عربي: قطاعات | 16 مقالة `/ar/blog/ai-for-*` بتنافس صفحات `/ar/industries/*` بنفس الكلمة |

**الحل:** لكل كلمة صفحة واحدة "مالكة". الباقي يتغير عنوانه لزاوية مختلفة ويربط للصفحة المالكة، أو يتدمج فيها.

### 4. صفحات القطاعات القديمة أضعف، والنافبار بيربطها هي بالذات
فيه جيلين من صفحات القطاعات:
- **القديم** (healthcare, real-estate, retail, logistics, finance-banking, insurance, legal, education, consulting, manufacturing, hospitality, hr-recruitment, marketing + 10 صفحات marketing/*): الوصف بيبدأ بنفس الجملة "Lenoo AI, a Dubai AI agency, builds..." (25 صفحة)، والأرقام أمريكية أو من غير مصدر ($150B U.S. healthcare، "MIT 9×"، HubSpot 40–60%).
- **الجديد** (dental-clinics, beauty-salons, car-dealerships, restaurants, ecommerce...): رحلة عميل كاملة، سياق إماراتي (COD، Ejari، SIRA، DHA)، وأرقام صريحة.

النافبار والفوتر بيربطوا الصفحات القديمة، والجديدة الأقوى مش في القائمة.

### 5. H1 شعارات من غير الكلمة المفتاحية في أهم صفحات الخدمات
| الصفحة | H1 الحالي | المقترح |
|---|---|---|
| /services/ai-agents | AI That Thinks, Decides, and Acts... | AI Agents for UAE Businesses |
| /services/ai-automation | Stop Doing It Manually... | AI Automation Services in the UAE |
| /services/ai-training | Your Team Needs to Use AI... | AI Training for Teams in Dubai and the UAE |
| /services/ai-strategy | Know Exactly Which AI to Build Before You Spend a Dollar | AI Strategy Consulting in the UAE |
| /services/custom-ai-development | AI Built Around Your Workflows... | Custom AI Development in the UAE |
| /services/ai-integration | Your Existing Software, Made Smarter... | AI Integration for Your CRM and ERP |
| /services/vibe-coding | Ship Your Product in Weeks... | Vibe Coding Agency in Dubai |
| /about | Most AI projects fail... | (مقبول، بس ضيف سطر تحته فيه "AI company in Dubai") |

ممكن تخلي الشعار كسطر فرعي تحت الـ H1.

### 6. صفحة الأسعار مستخبية
`/pricing/ai-automation-cost` من أقوى صفحات الموقع (أرقام حقيقية بالدرهم ومثال كامل لعيادة)، ومش موجودة في النافبار ولا الفوتر ولا الصفحة الرئيسية، ومربوطة من 3 صفحات بس. الصفحة الرئيسية كمان ما فيهاش أي لينك لـ WhatsApp automation رغم إنها أهم خدمة تجاريًا في السوق.

### 7. مشاكل في النسخة العربية
- 41 صفحة عربية الـ H1 بتاعها مقطوع بنقطتين في نص الجملة ("ذكاء اصطناعي: للصالونات ومراكز السبا في دبي").
- أخطاء في H1: `/ar/industries/restaurants` بيطلع "لـالمطاعم"، `/ar/services/ai-agents/dubai` "لـ شركات"، `/ar/services/ai-agents/abu-dhabi` "لـ منظمات".
- اسم الشركة "لينو إيه آي" في `/ar/services/ai-automation/dubai` و"Lenoo AI" في باقي الموقع.
- المصطلحات: الموقع بيستخدم "روبوتات المحادثة" و"هندسة الأوامر" و"البرمجة الحدسية". الناس في الخليج بتكتب "شات بوت" و"برومبت" و"vibe coding". استخدم الاتنين.
- `/ar/services` الـ H1 "اثنتا عشرة خدمة" والموقع فيه أكتر من 20.

### 8. مقالات عربية بكلمات مفتاحية مكسورة نحويًا (97 مقالة)
الكلمات المفتاحية اتعملت بقالب من غير حرف جر، واتكتبت حرفيًا جوه النص:
- "حجز المواعيد التجارة الإلكترونية"، "حجز المواعيد المقاولات"، "الذكاء الاصطناعي عيادات الأسنان".
- 83 مقالة فيها الجملة المكسورة دي جوه النص (في المتوسط مرتين). القارئ العربي هيحس إنها مكتوبة بآلة، وجوجل بيفهم العربي الطبيعي كويس من غير حشو.
- 5 مقالات نيتها مش منطقية: حجز مواعيد للتجارة الإلكترونية، والمقاولات، واللوجستيات، والتجزئة، ووسطاء التأمين.
- `voice-cost` و `voice-cost-2` نفس الموضوع تقريبًا.

**الحل:** اكتب الكلمة بالشكل اللي الناس بتدور بيه فعلاً ("حجز مواعيد عيادات الأسنان"، "الذكاء الاصطناعي في عيادات الأسنان")، واحذف المقالات اللي نيتها مش منطقية.

### 9. قواعد الكتابة في CLAUDE.md مش متطبقة على المقالات
- كل الـ402 مقالة فيها em dash (2,093 مرة). أغلبها من قالب Key Takeaways: `**Point** — explanation`. تصليح واحد في القالب (`—` تبقى `:`) يحل معظمها.
- 75 مقالة إنجليزي فيها الكلمة المفتاحية محشورة بحروف صغيرة: "the ai pilot to production jump"، "This is where the ai agent metrics to track question...".
- كلمات ممنوعة في المقالات الإنجليزي: enable (17)، leverage (15)، dynamic (14)، craft (9)، curate (8)، comprehensive (6).
- في الصفحات: arabic-ai فيها enable ×4، ai-chatbot-development enable ×3، ai-agents/development harness ×2، vibe-coding comprehensive وaccelerate، retail curate.
- 150 مقالة إنجليزي من 200 الكلمة الأساسية مش موجودة في أي H2، و61 مش في أول 100 كلمة.

### 10. أرقام من غير مصدر
- About: "70% of AI implementations fail"، "$4.4T"، "3–5× performance gap".
- logistics H1: "Your dispatchers spend 4 hours planning routes. AI does it in 4 minutes."
- real-estate: "40–60% improvement (HubSpot)"، "80% reduction (Deloitte)"، "MIT 9×" (الدراسة الأصلية مش من MIT).
- الصفحة الرئيسية: جدول بيقول إن الوكالات التانية "Rarely" بتقدم دعم.
- مقالات عربية: "40% من وقت المدراء وفق تقرير Deloitte 2025" وأمثالها.

**الحل:** كل رقم يا إما له رابط لمصدره، يا إما يتشال. صفحة healthcare-clinics بتعمل ده صح ("any specific number quoted without a real source should be treated with suspicion").

---

## مشاكل أصغر

- **Contact:** أوقات الرد متضاربة في نفس الصفحة ("within 24 hours" و"within 4h" و"Same business day"). الفورم فيه 9 قطاعات والموقع فيه 50 صفحة قطاع. الميزانية بتبدأ من AED 10,000 وصفحة الأسعار بتقول الشات بوت البسيط من 8,000.
- **"Dollar"** في /services و /services/ai-strategy والسوق بالدرهم.
- **/services/arabic-ai:** الـ meta description فيها علامات تنصيص escaped (`\"Most \"Arabic-enabled\"...`) هتظهر غلط في نتائج جوجل.
- **/services/custom-gpt-development:** الرابط custom-gpt، العنوان "Custom AI Assistant"، وصفحة Services بتوصفها "Custom language models trained on your products" (ده fine-tuning). ثلاث وعود مختلفة.
- **/services/claude-agent-builds:** الرابط claude والعنوان "Autonomous AI Agent Builds" والـ H1 "The Smartest AI Agents" (ادعاء من غير دليل).
- **/services/ai-automation/tools/n8n:** أضعف صفحة أداة (906 كلمة) رغم إن n8n أعلى أداة في البحث. النسخة العربية 1533 كلمة. نفس الكلام على Zapier و Make و Power Automate و UiPath (العربي أطول من الإنجليزي).
- **Vibe coding (6 صفحات):** beginners و game-development موجهين لأفراد (أهالي، طلبة، Roblox). بيجيبوا زيارات بس مش عملاء B2B. ممكن مكانهم الطبيعي يكون /blog.
- **لينكات داخلية في المقالات:** 228 لينك (162 عنوان مختلف) بيودوا لعناوين مش موجودة في الكود، زي `/blog/what-is-an-ai-agent` و `/blog/how-rag-works` و `/ar/blog/what-is-ai-agent`. ممكن يكون بعضها منشور من قاعدة البيانات؛ لازم يتراجع على الـ sitemap الحي.
- **الصفحة الرئيسية:** بتعرض 3 قطاعات بس من 50، ومفيش لينك لـ WhatsApp ولا Arabic AI ولا الأسعار.

---

## خطة الشغل المقترحة

**الأسبوع ده (سريع ومهم):**
1. وحّد صيغة الضمان في كل الصفحات بما يتطابق مع Terms.
2. صلّح الـ 3 أخطاء في H1 العربي، واسم الشركة، والـ meta description بتاعة arabic-ai.
3. ضيف صفحة الأسعار للنافبار والفوتر والصفحة الرئيسية.
4. غيّر `**...** —` لـ `**...**:` في قالب المقالات.

**الشهر ده:**
5. اختار صفحة "مالكة" لكل كلمة في جدول المنافسة فوق، وادمج أو غيّر زاوية الباقي.
6. غيّر H1 بتاع صفحات الخدمات الـ8 عشان يبقى فيه الكلمة.
7. أعد كتابة صفحات القطاعات القديمة الـ13 بالقالب الجديد، وشيل الأرقام اللي من غير مصدر.
8. حط فريق ومؤسس في About وصفحة كاتب.

**بعدها:**
9. صلّح الكلمات المفتاحية العربية المكسورة في 97 مقالة، واحذف أو ادمج المقالات اللي نيتها مش منطقية.
10. قوّي صفحات الأدوات الإنجليزي (n8n أولاً).
11. ضيف دراسة حالة حقيقية واحدة على الأقل، وشهادات عملاء.
