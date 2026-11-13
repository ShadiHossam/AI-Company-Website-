# الصفحات والمقالات اللي بتنافس بعض

تاريخ: 13 نوفمبر 2026. اتراجع: 264 صفحة (إنجليزي وعربي) و402 مقالة.

## إزاي اتعمل التحليل

1. قريت قايمة كل صفحة ومقالة (الكلمة الأساسية، العنوان، H1، العناوين الفرعية) وجمعتهم يدويًا في مجموعات حسب **نية البحث**: يعني لو حد كتب الكلمة في جوجل، هل الصفحتين بيجاوبوا نفس السؤال؟
2. لكل مجموعة حسبت نسبتين: تشابه النص الكامل، وتشابه العنوان والـ H1 والكلمة الأساسية.
3. حددت لكل مجموعة صفحة "مالكة" للكلمة، والباقي يا إما يتدمج، يا إما يتغير لزاوية تانية ويربط للمالكة.

**ملاحظة مهمة:** المقالات مش منسوخة من بعض. أعلى تشابه نصي بين مقالتين 31%، ومعظم الأزواج تحت 20%. المشكلة إنها **بتستهدف نفس البحث**، مش إنها نفس الكلام. صفحات الخدمة فيها حالة تكرار نصي واحدة كبيرة (صفحتين دبي، 59%).

المجموعات اللي فيها نسخة عامة ونسخة لكل قطاع (زي "order status automation" و"order status automation for ecommerce") **مش منافسة**؛ دي بنية سليمة طالما بيربطوا ببعض. نفس الكلام على "booking automation" لكل قطاع.

## الأرقام

| | عالي | متوسط | منخفض |
|---|---|---|---|
| إنجليزي | 23 مجموعة | 18 | 3 |
| عربي | 31 مجموعة (منهم 14 قطاع) | 8 | 1 |

التفاصيل الكاملة لكل مجموعة في `cannibalization.csv`.

---

## الإنجليزي: أخطر الحالات

### صفحة ضد صفحة
| الصفحات | المشكلة |
|---|---|
| `/services/ai-automation/dubai` و `/services/ai-agents/dubai` | **59% نص متطابق**، أعلى رقم في الموقع |
| `/services/ai-automation/tools/n8n` و `/services/ai-agents/tools/n8n-ai-agent` | 37% نص و49% عنوان |
| `/industries/accounting-firms` و `/services/ai-automation/accounting` | H1 تقريبًا واحد ("AI for / AI Automation for Accounting Firms") |
| `/industries/healthcare` و `/industries/healthcare-clinics` | نفس الجمهور |
| `/industries/retail` و `/industries/ecommerce` | عنوان retail فيه "E-commerce" |
| `/industries/marketing` و `/industries/marketing-agencies` | عنوان marketing فيه "& Agencies" |
| `/services/ai-agents` و `/services/claude-agent-builds` و `/services/ai-agents/development` | 3 صفحات على "ai agents" |
| أبوظبي: `/services/ai-automation/abu-dhabi` و `/services/ai-agents/abu-dhabi` و `/abu-dhabi` | 3 صفحات + مقالة على نفس المدينة |

### صفحة ضد مقالة
| الصفحة | المقالة | ليه بيتنافسوا |
|---|---|---|
| `/` | `/blog/ai-agency-dubai` | نفس الكلمة "ai agency dubai" |
| `/services/ai-maintenance` | `/blog/what-does-ai-maintenance-include` | H1: "What a Real AI Maintenance Retainer Includes" ضد "What Does AI Maintenance Include? Inside a Monthly Retainer" |
| `/services/ai-compliance-uae` | `/blog/uae-pdpl` | "UAE AI Compliance: PDPL" ضد "UAE PDPL AI Compliance" |
| `/services/ai-chatbot-development` | `/blog/chatbot-development-dubai` و `/blog/chatbot-types` | نفس الكلمة، والاتنين بيقولوا "6 types" |
| `/services/ai-strategy/data-readiness` | `/blog/data-audit-before-ai` | نفس السؤال |
| `/services/internal-ai-tools` | `/blog/internal-ai-assistant` | نفس الكلمة |
| `/industries/real-estate` | `/blog/crm-automation-for-real-estate` | عنوان الصفحة فيه "CRM Automation" |
| `/industries/marketing/seo` | `/blog/aeo-geo-guide` | عنوان الصفحة فيه "Answer Engines" |

### مقالة ضد مقالة
| المقالات | الحل |
|---|---|
| `prompt-injection` و `prompt-injection-defense` | دمج |
| `arabic-llm-comparison` و `gpt-vs-jais-arabic` (و `arabic-llm-benchmarks`) | دمج gpt-vs-jais في المقارنة |
| `msa-vs-gulf-dialect-chatbot` و `gulf-dialect-differences-business` (31% نص) | دمج |
| `sovereign-llm-uae` و `host-arabic-llm-uae` | دمج |
| `ai-accounting-compliance-uae` و `compliance-automation-accounting-firms` | دمج |
| `business-process-audit-for-ai` و `process-mapping-before-automation` | دمج |

---

## العربي: أخطر الحالات

### 1. مقالات القطاعات بتنافس صفحات القطاعات (14 قطاع)
كل مقالة `/ar/blog/ai-for-<قطاع>` بتستهدف تقريبًا نفس بحث صفحة `/ar/industries/<قطاع>`. مثلاً "الذكاء الاصطناعي في مكاتب المحاسبة بالإمارات" (مقالة) ضد "الأتمتة بالذكاء الاصطناعي لمكاتب المحاسبة في الإمارات" (صفحة).

**والأسوأ إن المقالات دي مش بتربط لصفحة القطاع بتاعها، وساعات بتربط لقطاع غلط:**

| المقالة | بتربط لـ |
|---|---|
| ai-for-dental-clinics | /ar/industries/hospitality |
| ai-for-clinics | /ar/industries/hospitality |
| ai-for-gyms | /ar/industries/real-estate و /ar/services/ai-automation/accounting |
| ai-for-salons | /ar/services/ai-automation/accounting |
| ai-for-accounting-firms | /ar/industries/logistics |
| car-dealerships, construction, law-firms, restaurants, schools, insurance-brokers, training-institutes | ولا لينك لأي صفحة |

على مستوى كل المقالات العربية: **37 مقالة بس من 202 بتربط لأي صفحة خدمة أو قطاع أو أسعار عربية**. في الإنجليزي 119 من 200.

### 2. مقالات بتنافس صفحات خدمة عربية
| الصفحة | المقالة |
|---|---|
| `/ar/services/arabic-ai/chatbots` | `arabic-chatbot-guide` ("روبوت محادثة عربي: الدليل الكامل") |
| `/ar/services/whatsapp-ai-automation` | `whatsapp-business-bot-gulf` (الاتنين "الدليل الكامل") |
| `/ar/services/whatsapp-ai-automation/business-api` | `app-vs-api` |
| `/ar/services/ai-agents/receptionist` | `ai-receptionist` |
| `/ar/services/ai-agents/vs-agentic-ai` | `agentic-ai-explained` |
| `/ar/services/ai-compliance-uae` | `uae-pdpl` |
| `/ar/services/ai-agent-security` | `prompt-injection` |
| `/ar/services/ai-maintenance` | `maintenance-cost` |
| `/ar/services/ai-automation/free-zone` | `free-zones` |
| `/ar/pricing/ai-automation-cost` | `automation-cost` و `ai-chatbot-cost` |
| `/ar/industries` | `ai-by-industry` |
| `/ar/services/ai-automation/abu-dhabi` | `abu-dhabi` |

### 3. مقالات عربية بتنافس بعض
| المقالات | الحل |
|---|---|
| `voice-cost` و `voice-cost-2` | دمج (الرابط نفسه بيقول إنها نسخة تانية) |
| `choose-ai-company` و `vendor-red-flags` ("كيف أختار شركة ذكاء اصطناعي") | دمج |
| `gulf-markets` و `market-differences` (الاتنين "أسواق الخليج الست") | دمج |
| `saudi-pdpl-sdaia` و `saudi-pdpl-for-bots` و `sdaia-role` | دمج أول اتنين |
| `ksa-residency` و `cross-border-ksa` (31% نص) | دمج |
| `whatsapp-cost` و `24h-window-and-pricing` | فرّق أو ادمج |
| `ramadan` و `after-hours` (عنوانها فيه "الجمعة ورمضان") | شيل "رمضان" من عنوان after-hours |
| `chatbot-vs-ai-agent-2` | رقم 2 في الرابط؛ اتأكد إن مفيش نسخة أولى منشورة |

---

## الحل العام بالترتيب

1. **الربط الداخلي في العربي (الأسرع والأهم):** كل مقالة `ai-for-<قطاع>` تربط لصفحة القطاع الصح في أول فقرة، وشيل اللينكات للقطاعات الغلط. وكل مقالة في جدول 2 تربط للصفحة اللي بتنافسها.
2. **الدمج (16 حالة):** المقالات اللي مكتوب قدامها "دمج". الأضعف يتحول لـ 301 للأقوى، ومحتواه المفيد يتنقل.
3. **تغيير العناوين:** الصفحات اللي عنوانها بياخد كلمة مقالة (real-estate "CRM Automation"، seo "Answer Engines"، retail "E-commerce"، marketing "& Agencies"، ai-agent-security "Guardrails & Prompt Injection"، glossary "Copilots, Agents") تشيل الكلمة دي.
4. **إعادة كتابة:** `/services/ai-agents/dubai` (59% تكرار)، و `/services/ai-agents/tools` (38%)، وقرار بخصوص `claude-agent-builds` و `industries/healthcare`.

ملاحظة: قبل ما تدمج أو تحول أي رابط، شوف في Google Search Console أنهي صفحة فعلاً بتجيب ظهور على الكلمة. لو المقالة هي اللي بتظهر مش الصفحة، ممكن تخلي المقالة هي المالكة.
