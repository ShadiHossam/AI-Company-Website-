// Entity -> source. The anchor is whatever text the article already uses, so
// anchor text varies naturally instead of repeating one phrase site-wide.
// Order matters: the most specific pattern for a source is tried first.
export const MATCHERS_EN = [
  ['pdpl',        /Federal Decree[- ]Law No\.? ?45 of 2021|UAE Personal Data Protection Law|Personal Data Protection Law \(PDPL\)|\bPDPL\b/],
  ['tdra',        /Telecommunications and Digital Government Regulatory Authority|\bTDRA\b/],
  ['dncr',        /Do Not Call Registry|\bDNCR\b/],
  ['moec',        /Ministry of Economy and Tourism|consumer protection law|consumer protection rules/i],
  ['adgm',        /Abu Dhabi Global Market|\bADGM\b/],
  ['cbuae',       /Central Bank of the UAE|\bCBUAE\b/],
  ['mohre',       /Ministry of Human Resources and Emiratisation|\bMoHRE\b|Emiratisation/],
  ['dha',         /Dubai Health Authority|\bDHA\b/],
  ['doh',         /Department of Health Abu Dhabi|\bDoH\b/],
  ['dld',         /Dubai Land Department|\bDLD\b|\bRERA\b/],
  ['khda',        /\bKHDA\b|Knowledge and Human Development Authority/],
  ['fta',         /Federal Tax Authority|\bVAT\b/],
  ['ai2031',      /National Strategy for Artificial Intelligence|UAE AI Strategy|AI Strategy 2031/],
  ['nist',        /NIST AI Risk Management Framework|AI Risk Management Framework|\bNIST\b|\bAI RMF\b/],
  ['owasp',       /OWASP Top 10 for LLM|\bOWASP\b/],
  ['iso42001',    /ISO\/IEC ?42001|ISO ?42001/],
  ['iso27001',    /ISO\/IEC ?27001|ISO ?27001/],
  ['hai',         /Stanford HAI|Stanford's AI Index|\bAI Index\b/],
  ['rag',         /retrieval[- ]augmented generation/i],
  ['cot',         /chain[- ]of[- ]thought/i],
  ['transformer', /transformer architecture/i],
  ['nanda',       /Project NANDA|MIT Media Lab|\bNANDA\b/],
  ['falcon',      /Falcon 3|Falcon models?|\bTII\b|Technology Innovation Institute/],
  ['mbzuai',      /\bMBZUAI\b/],
  ['verizon',     /Verizon/],
  ['msdiffusion', /Microsoft AI Economy Institute|AI Economy Institute/],
  ['deloitte',    /Deloitte/],
  ['pwc',         /\bPwC\b/],
  ['who',         /World Health Organization|\bWHO\b/],
  ['oecd',        /\bOECD\b/],
  ['itu',         /International Telecommunication Union|\bITU\b/],
  ['pew',         /Pew Research/],
];

export const MATCHERS_AR = [
  ['pdpl',        /المرسوم بقانون اتحادي رقم ?45|القانون الاتحادي رقم ?45 لعام ?2021|القانون الاتحادي رقم ?45 لسنة ?2021|قانون حماية البيانات الشخصية|\bPDPL\b/],
  ['tdra',        /هيئة تنظيم الاتصالات والحكومة الرقمية|هيئة تنظيم الاتصالات|\bTDRA\b/],
  ['dncr',        /سجل عدم الاتصال/],
  ['moec',        /وزارة الاقتصاد والسياحة|قواعد حماية المستهلك|قانون حماية المستهلك/],
  ['adgm',        /سوق أبوظبي العالمي|\bADGM\b/],
  ['cbuae',       /مصرف الإمارات المركزي|المصرف المركزي|\bCBUAE\b/],
  ['mohre',       /وزارة الموارد البشرية والتوطين|وزارة الموارد البشرية|\bMoHRE\b|التوطين/],
  ['dha',         /هيئة الصحة بدبي|هيئة الصحة في دبي|\bDHA\b/],
  ['doh',         /دائرة الصحة/],
  ['dld',         /دائرة الأراضي والأملاك|\bRERA\b|مؤسسة التنظيم العقاري/],
  ['khda',        /هيئة المعرفة والتنمية البشرية|\bKHDA\b/],
  ['fta',         /الهيئة الاتحادية للضرائب|ضريبة القيمة المضافة|\bVAT\b/],
  ['ai2031',      /استراتيجية الإمارات للذكاء الاصطناعي|استراتيجية الذكاء الاصطناعي 2031/],
  ['nist',        /إطار إدارة مخاطر الذكاء الاصطناعي|\bNIST\b/],
  ['owasp',       /\bOWASP\b/],
  ['iso42001',    /ISO\/IEC ?42001|ISO ?42001|آيزو ?42001/],
  ['iso27001',    /ISO\/IEC ?27001|ISO ?27001|آيزو ?27001/],
  ['hai',         /مؤشر الذكاء الاصطناعي|ستانفورد|Stanford/],
  ['rag',         /التوليد المعزز بالاسترجاع|التوليد المعزَّز بالاسترجاع|\bRAG\b/],
  ['cot',         /التفكير المتسلسل|سلسلة التفكير/],
  ['nanda',       /Project NANDA|MIT Media Lab|\bNANDA\b/],
  ['falcon',      /معهد الابتكار التكنولوجي|\bFalcon\b|\bTII\b/],
  ['mbzuai',      /\bMBZUAI\b|جامعة محمد بن زايد للذكاء الاصطناعي/],
  ['msdiffusion', /Microsoft AI Economy Institute|معهد مايكروسوفت لاقتصاد الذكاء الاصطناعي|مايكروسوفت/],
  ['deloitte',    /ديلويت|Deloitte/],
  ['pwc',         /\bPwC\b|بي دبليو سي/],
  ['who',         /منظمة الصحة العالمية/],
  ['oecd',        /منظمة التعاون الاقتصادي والتنمية|\bOECD\b/],
  ['itu',         /الاتحاد الدولي للاتصالات|\bITU\b/],
  ['verizon',     /Verizon|فيرايزون/],
];

// hub: cluster pillar. money: commercial page. pool: sources drawn on when an
// article needs citations it has no existing anchor for.
export const CLUSTERS = {
  // ---- English clusters ----
  'AI Agents & Automation Foundations':   { lang:'en', hub:'first-90-days-ai-automation', money:'/services/ai-agents',                    pool:['hai','nanda','cot','oecd','deloitte','pdpl','msdiffusion','nist','pwc'] },
  'AI Security, Guardrails & Trust':      { lang:'en', hub:'prompt-injection',            money:'/services/ai-agent-security',            pool:['owasp','nist','iso42001','iso27001','verizon','pdpl','oecd','hai'] },
  'UAE Compliance, PDPL & Data':          { lang:'en', hub:'uae-pdpl',                    money:'/services/ai-compliance-uae',            pool:['pdpl','pdpl_overview','adgm','cbuae','tdra','nist','oecd','moec','fta'] },
  'AgentOps, Monitoring & Maintenance':   { lang:'en', hub:'ai-service-level-agreement',  money:'/services/agentops',                     pool:['nist','iso42001','owasp','hai','nanda','oecd','verizon','pwc'] },
  'Chatbots & Conversational AI':         { lang:'en', hub:'chatbot-training',            money:'/services/ai-chatbot-development',       pool:['hai','tdra','moec','pew','deloitte','owasp','pdpl','rag'] },
  'Voice AI & Phone Automation':          { lang:'en', hub:'outbound-voice-ai',           money:'/services/ai-agents/voice-agents',       pool:['tdra','dncr','moec','pdpl','itu','hai','pew'] },
  'Arabic & Bilingual AI (in English)':   { lang:'en', hub:'arabic-llm-comparison',       money:'/services/arabic-ai',                    pool:['falcon','mbzuai','transformer','hai','pdpl_overview','oecd','itu','rag'] },
  'Data, RAG & Knowledge Systems':        { lang:'en', hub:'graph-rag-business',          money:'/services/custom-ai-development',        pool:['rag','transformer','hai','nist','iso27001','pdpl','oecd'] },
  'Industry Verticals':                   { lang:'en', hub:'ai-appointment-booking',      money:'/industries',                            pool:['dha','doh','dld','mohre','dsc','moec','fta','deloitte','khda','who','pdpl'] },
  'Department & Function Workflows':      { lang:'en', hub:'ai-appointment-booking',      money:'/services/ai-automation',                pool:['mohre','moec','fta','deloitte','pwc','hai','nanda','oecd'] },
  'Emirates, Cities & Free Zones':        { lang:'en', hub:'ai-agency-abu-dhabi',         money:'/services/ai-agents/dubai',              pool:['dsc','dld','adgm','moec','pdpl_overview','ai2031','deloitte'] },
  'WhatsApp & Messaging Automation':      { lang:'en', hub:'whatsapp-commerce',           money:'/services/whatsapp-ai-automation',       pool:['tdra','dncr','moec','pdpl','pew','itu','deloitte','hai'] },
  'Tools, Platforms & Comparisons':       { lang:'en', hub:'chatbot-platform-comparison', money:'/services/ai-agents/tools',              pool:['hai','nist','oecd','iso42001','nanda','owasp','transformer'] },
  'Cost, Pricing, ROI & Hiring':          { lang:'en', hub:'build-vs-buy',                money:'/services/ai-strategy',                  pool:['nanda','hai','deloitte','pwc','mohre','oecd','msdiffusion'] },
  'Adoption, Training & Change':          { lang:'en', hub:'ai-change-management',        money:'/services/ai-training',                  pool:['nanda','hai','deloitte','pwc','mohre','msdiffusion','oecd'] },
  'Workflow Automation & Integrations':   { lang:'en', hub:'document-automation',         money:'/services/ai-integration',               pool:['fta','moec','mohre','nist','iso27001','hai','deloitte'] },
  'AI Search Visibility (AEO / GEO)':     { lang:'en', hub:'aeo-geo-guide',               money:'/services/ai-strategy',                  pool:['hai','oecd','pew','deloitte','nanda','msdiffusion','itu'] },
  // ---- Arabic clusters ----
  'قطاعات الأعمال في الخليج':                       { lang:'ar', hub:'ai-by-industry',            money:'/ar/industries',                         pool:['dha','doh','dld','mohre','dsc','moec','fta','deloitte','khda','who','pdpl'] },
  'أساسيات أتمتة الأعمال بالذكاء الاصطناعي':          { lang:'ar', hub:'generative-ai-business',    money:'/ar/services/ai-agents',                 pool:['hai','nanda','cot','oecd','deloitte','msdiffusion','transformer','nist'] },
  'روبوتات المحادثة العربية':                        { lang:'ar', hub:'arabic-chatbot-guide',      money:'/ar/services/arabic-ai/chatbots',        pool:['falcon','mbzuai','hai','pew','moec','rag','transformer','deloitte'] },
  'التكاليف والأسعار وعائد الاستثمار':                { lang:'ar', hub:'choose-ai-company',         money:'/ar/services/ai-strategy',               pool:['nanda','hai','deloitte','pwc','mohre','oecd','msdiffusion'] },
  'الذكاء الاصطناعي الصوتي باللهجات الخليجية':        { lang:'ar', hub:'gulf-dialect-voice-ai',     money:'/ar/services/arabic-ai/voice-agents',    pool:['tdra','dncr','moec','pdpl','itu','falcon','hai','pew'] },
  'الامتثال وحماية البيانات في الخليج':               { lang:'ar', hub:'gulf-ai-data-protection',   money:'/ar/services/ai-compliance-uae',         pool:['pdpl','pdpl_overview','adgm','cbuae','tdra','nist','oecd','iso27001'] },
  'واتساب للأعمال والأتمتة':                        { lang:'ar', hub:'whatsapp-business-bot-gulf', money:'/ar/services/whatsapp-ai-automation',    pool:['tdra','dncr','moec','pdpl','pew','itu','deloitte','hai'] },
  'الأسواق الخليجية':                              { lang:'ar', hub:'gulf-markets',              money:'/ar/services/ai-agents',                 pool:['dsc','adgm','moec','pdpl_overview','ai2031','deloitte','pwc','oecd'] },
};

// Cross-cluster bridge. PDPL is the theme every UAE buyer shares.
export const BRIDGE = { en: 'uae-pdpl', ar: 'uae-pdpl' };
export const BRIDGE_ALT = { en: 'sector-regulators-ai', ar: 'gulf-ai-data-protection' };
// Arabic bodies on rows filed under an English cluster fall back to this.
export const AR_FALLBACK = {
  'AI Security, Guardrails & Trust': 'الامتثال وحماية البيانات في الخليج',
  'UAE Compliance, PDPL & Data':     'الامتثال وحماية البيانات في الخليج',
  'AI Agents & Automation Foundations': 'أساسيات أتمتة الأعمال بالذكاء الاصطناعي',
  'WhatsApp & Messaging Automation': 'واتساب للأعمال والأتمتة',
};
