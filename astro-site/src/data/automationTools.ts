export interface AutomationToolUseCase {
  title: string;
  description: string;
}

export interface AutomationToolFaq {
  question: string;
  answer: string;
}

export interface AutomationTool {
  slug: string;
  name: string;
  category: 'no-code' | 'enterprise';
  logoSlug: string;
  logoColor: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtext: string;
  whatIs: string;
  whatIsExtra: string;
  integrationAngle: string;
  integrationAngleExtra: string;
  whoItsFor: string;
  useCases: AutomationToolUseCase[];
  faqFallback: AutomationToolFaq[];
}

export const AUTOMATION_TOOLS: AutomationTool[] = [
  {
    slug: 'zapier',
    name: 'Zapier',
    category: 'no-code',
    logoSlug: 'zapier',
    logoColor: 'FF4A00',
    h1: 'Zapier Automation Agency in the UAE',
    metaTitle: 'Zapier Automation Agency in the UAE | Lenoo AI',
    metaDescription: 'Lenoo AI designs and builds Zapier automations for UAE businesses, connecting your existing tools and adding an AI layer where simple triggers fall short.',
    heroSubtext: 'Zapier connects your apps. We design the workflows, wire up the AI where a plain trigger cannot handle the judgment calls, and maintain everything after launch.',
    whatIs: 'Zapier is a no-code automation platform that connects thousands of apps through triggers and actions: when something happens in one tool, it does something in another. It is the most widely used automation platform in the world, and most businesses in the UAE already have a few Zaps running somewhere, often built by whoever on the team had the time to figure it out.',
    whatIsExtra: 'The appeal is speed. A Zap can go from idea to live in an afternoon, with no developer involved, because Zapier handles the authentication, the polling or webhook triggers, and the error retries behind the scenes. That same simplicity is also its limit: a Zap follows a fixed path from trigger to action, with a handful of built-in filters and formatters for basic conditional logic. The moment a workflow needs to read a paragraph of text and decide what it means, Zapier on its own runs out of road.',
    integrationAngle: "We're an implementation partner, not Zapier's reseller. Most teams that come to us already tried building Zaps themselves and hit a wall: the workflow needs to read an unstructured email, judge whether an invoice looks right, or decide which of ten possible outcomes applies. That's where we come in, designing the underlying logic, adding an AI step where Zapier's native triggers cannot handle it, and building the parts that need custom code through Zapier's webhooks and API actions.",
    integrationAngleExtra: "A typical engagement starts with us auditing whatever Zaps already exist, since most businesses that reach out have at least a handful running with no documentation and no one quite sure what happens if one breaks. We map what each one actually does, flag the fragile ones, and then design the new automation around your real workflow rather than forcing your process to fit Zapier's defaults. Where a step needs judgment, an AI action reads the input, makes the call, and hands a clean result back into the Zap so the rest of the automation runs the same as any other step. You end up with a system your team can see and understand in the Zapier dashboard, not a black box.",
    whoItsFor: 'Zapier is usually the right starting point for small and mid-sized UAE businesses that need a workflow live quickly, don\'t have in-house developers, and are automating a handful of clear, repeatable processes rather than dozens of interconnected systems.',
    useCases: [
      { title: 'Lead Routing Zaps', description: 'New leads from your website, ads, or WhatsApp get scored and routed to the right rep automatically, with AI reading the message content to judge intent before Zapier moves the data.' },
      { title: 'Multi-Step Approval Chains', description: 'Expense reports, purchase orders, and contract requests move through approval automatically, with reminders and escalations built on top of your existing Zapier account.' },
      { title: 'CRM & Data Sync', description: 'Keep your CRM, invoicing tool, and support desk in sync without manual re-entry, with an AI step cleaning and validating data before it lands in the destination app.' },
      { title: 'Inbox Triage & Drafting', description: 'Incoming support and sales emails get categorized, prioritized, and drafted with a suggested reply, so your team reviews and sends instead of writing from scratch.' },
    ],
    faqFallback: [
      { question: 'Do we need a Zapier subscription before working with you?', answer: 'Either way works. If you already have a Zapier account, we build inside it. If not, we help you pick the right plan tier based on the number of Zaps and tasks your workflows need, then build from there.' },
      { question: 'What can you do that a Zap alone cannot?', answer: 'Zapier moves data between apps when a trigger fires. It struggles the moment a task needs judgment: reading an email to figure out intent, deciding which of several categories a document falls into, or handling a format that varies case to case. We add an AI step inside the Zap that handles exactly that reasoning, then lets Zapier finish the job.' },
      { question: 'Can you fix or take over Zaps we already built?', answer: 'Yes. We regularly audit existing Zaps, fix ones that break on edge cases, and consolidate scattered automations into a more reliable setup with monitoring and alerts.' },
      { question: 'How long does a typical Zapier automation project take?', answer: 'Simple multi-step Zaps can go live within a week. Projects that involve AI steps, multiple approval stages, or several connected systems are scoped individually after a discovery call.' },
      { question: 'What happens when Zapier changes how an app\'s integration works?', answer: 'App integrations do sometimes change on Zapier\'s end, which is one of the reasons we build in monitoring from day one rather than leaving you to discover a break on your own. Every project we deliver includes a post-launch monitoring window, and we offer maintenance retainers for ongoing coverage after that.' },
      { question: 'Is our data safe going through Zapier and an AI step?', answer: 'We only pass the data each step actually needs, and we walk you through exactly what leaves your systems and where it goes before anything goes live. If your workflow touches sensitive data, we can also scope a version that keeps the AI reasoning self-hosted instead of relying on Zapier\'s AI actions.' },
    ],
  },
  {
    slug: 'n8n',
    name: 'n8n',
    category: 'no-code',
    logoSlug: 'n8n',
    logoColor: 'EA4B71',
    h1: 'n8n Automation Agency & Consultants in Dubai',
    metaTitle: 'n8n Automation Agency & Consultants in Dubai | Lenoo AI',
    metaDescription: 'Lenoo AI builds and hosts n8n automation workflows for Dubai and UAE businesses, including AI agent automation where a workflow needs to reason, not just move data.',
    heroSubtext: 'n8n gives us a self-hosted, fully customizable automation engine. We use it to build workflows that plain no-code tools cannot: complex branching logic, custom code steps, and AI agents that make decisions mid-pipeline.',
    whatIs: 'n8n is an open-source, self-hostable workflow automation tool built for technical teams that need more control than Zapier or Make allow. It supports custom JavaScript and Python code inside workflows, self-hosting for data residency, and native nodes for building AI agent pipelines.',
    whatIsExtra: 'What sets n8n apart from most no-code tools is that it doesn\'t force you to stay no-code. A workflow can be built entirely visually, then drop into a code node the moment the logic gets too specific for a drag-and-drop block, without switching platforms. Because it can run on your own server, n8n is also the tool of choice when a business needs to keep sensitive data inside its own infrastructure rather than routing it through a third-party cloud, something that comes up often for finance, healthcare, and government-adjacent clients in the UAE.',
    integrationAngle: "We're an n8n implementation partner: we design, build, host, and maintain n8n workflows for your business, we don't sell n8n itself. Most of our n8n projects fall into one of two buckets: businesses that need self-hosted automation for data residency or compliance reasons, and businesses that have outgrown Zapier or Make and need custom code steps or AI agent logic n8n's node system handles better.",
    integrationAngleExtra: "When we take on an n8n project, the first decision is infrastructure: do we deploy on your own server, on a cloud instance we manage for you, or use n8n's own hosted offering. That decision usually comes down to compliance requirements and how much you want to own versus hand off. From there we build the workflow the same way regardless: visually where possible, with code nodes where the logic genuinely needs them, and with the same monitoring and error handling we put into every project we deliver. Because n8n workflows are portable JSON under the hood, you're never locked into us as the only people who can touch it.",
    whoItsFor: 'n8n fits UAE businesses that have already outgrown a simple Zapier setup, need to keep data on infrastructure they control, or want a workflow that includes an AI agent making decisions mid-pipeline rather than a fixed set of steps.',
    useCases: [
      { title: 'Self-Hosted Data Workflows', description: 'For businesses with data residency requirements, we deploy n8n on your own infrastructure so sensitive customer or financial data never leaves your environment.' },
      { title: 'Custom Code & Logic Branching', description: "When a workflow needs conditional logic too complex for a visual builder alone, we add custom JavaScript steps directly inside the n8n workflow." },
      { title: 'AI Agent Pipelines', description: 'n8n is also how we build ai agent automation: workflows where an LLM agent reads context, makes a decision, and takes the next action, instead of simply moving data from A to B. See our dedicated n8n AI agent builds below.' },
      { title: 'Multi-System Orchestration', description: 'Coordinate a process that touches five or six different tools in sequence, with n8n acting as the control layer that decides what happens next at each step.' },
    ],
    faqFallback: [
      { question: 'Why choose n8n over Zapier or Make?', answer: 'n8n makes sense when you need self-hosting for data residency or compliance, custom code inside a workflow step, or AI agent logic where the workflow needs to reason rather than just trigger an action. If your workflows are simpler, Zapier or Make is usually the faster, cheaper route, and we will tell you that honestly during the discovery call.' },
      { question: 'Do you host the n8n instance for us, or do we need our own server?', answer: "Either. We can deploy and manage a self-hosted n8n instance on infrastructure you control, or build on n8n's cloud offering if self-hosting is not a requirement for you." },
      { question: 'What is "AI agent automation" in n8n, specifically?', answer: 'It means the workflow includes an AI agent step that reasons about the input and decides what to do next, rather than following a fixed if-this-then-that path. For example, an agent that reads an incoming support ticket, decides whether it needs escalation, drafts a response, and only pings a human when it is genuinely unsure.' },
      { question: 'Can you migrate our existing Zapier or Make workflows to n8n?', answer: 'Yes. We audit your current automations, rebuild the ones worth keeping in n8n, and use the migration as a chance to fix anything that was fragile in the original setup.' },
      { question: 'Who maintains the n8n instance after launch?', answer: 'We include a post-launch monitoring window with every build, and offer ongoing maintenance retainers after that for updates, new workflow additions, and keeping the instance itself patched and secure if we\'re hosting it for you.' },
      { question: 'Do we need developers on our team to work with n8n long term?', answer: 'Not necessarily. Most workflows we build are visual enough that a non-technical team member can read what it does and make small changes like adjusting a schedule or an email address. Anything involving the code nodes or AI agent logic is where having us on a retainer, or a technical hire, becomes worth it.' },
    ],
  },
  {
    slug: 'make',
    name: 'Make',
    category: 'no-code',
    logoSlug: 'make',
    logoColor: '6D00CC',
    h1: 'Make (Integromat) Automation Consultants in the UAE',
    metaTitle: 'Make Automation Consultants in the UAE | Lenoo AI',
    metaDescription: 'Lenoo AI designs and builds Make (formerly Integromat) automation scenarios for UAE businesses, with visual branching logic and AI steps built in.',
    heroSubtext: 'Make gives visual control over complex, branching automations. We design the scenarios, build the modules your workflow needs, and add AI where a decision requires more than a simple filter.',
    whatIs: 'Make (formerly Integromat) is a visual automation platform built around scenarios: flowcharts of modules that move and transform data between apps. It handles more complex branching logic and data transformation natively than most no-code tools, which is why many operations and finance teams prefer it.',
    whatIsExtra: 'The scenario builder shows the entire automation as a flowchart on screen, with each module doing one specific job: fetching data, transforming it, checking a condition, routing it down one of several paths. That visual layout makes it easier to reason about a workflow that has five or six branches than scrolling through a linear list of steps, which is where Zapier tends to get unwieldy. Make also ships with more built-in data transformation tools out of the box, so reformatting a date, restructuring a JSON object, or parsing a spreadsheet often needs no custom code at all.',
    integrationAngle: "We're an implementation partner: we build and maintain Make scenarios for your business rather than sell the platform itself. Most Make projects we take on involve multi-branch logic (route this data five different ways depending on conditions), heavier data transformation between systems, or an AI module added mid-scenario to handle judgment calls the built-in filters cannot.",
    integrationAngleExtra: "We usually start a Make project by sketching the scenario as a flowchart before touching the platform, since a scenario that isn't planned tends to sprawl once you're inside the builder. Once the logic is agreed, we build it module by module, testing each branch against real data rather than assuming the happy path will always hold. Where a decision genuinely needs judgment rather than a rule, we drop in an AI module that reads the input and returns a clean value the rest of the scenario can branch on, so the flowchart stays readable even where the underlying logic is smart.",
    whoItsFor: 'Make fits operations and finance teams in the UAE whose workflows branch in several directions depending on conditions, or who need heavier data transformation between systems than a simple linear Zap can handle.',
    useCases: [
      { title: 'Multi-Branch Data Routing', description: 'Incoming data gets evaluated against several conditions and routed down the correct one of many possible paths, built visually in a single scenario.' },
      { title: 'Document & Data Transformation', description: 'Convert, reformat, and validate data moving between systems with different formats, so nothing needs manual reformatting before it reaches its destination.' },
      { title: 'AI-Assisted Decision Modules', description: 'We add an AI module inside the scenario to read unstructured content and decide how it should be handled, before Make continues the automated flow.' },
      { title: 'Scheduled Batch Processing', description: 'Run a scenario on a recurring schedule to process a batch of records, such as end-of-day reconciliation or weekly report generation, without anyone triggering it manually.' },
    ],
    faqFallback: [
      { question: 'How is Make different from Zapier?', answer: "Make's visual scenario builder handles complex branching and data transformation more natively than Zapier's linear Zap structure. If your workflow needs to split into many paths based on conditions, or transform data heavily between steps, Make is usually the better fit. For simple linear automations, either works." },
      { question: 'Can Make handle high-volume workflows?', answer: "Yes, Make scales well for high-operation-count workflows. We size the plan and design the scenario structure around your actual volume so you are not paying for capacity you do not need." },
      { question: 'Do you provide ongoing support after the scenario goes live?', answer: 'Every Make project includes 90 days of post-launch monitoring. We watch for failed runs, fix edge cases as they surface, and offer ongoing maintenance retainers beyond that window.' },
      { question: 'Can you build a Make scenario that also uses AI to read documents or emails?', answer: 'Yes, this is one of the more common requests we get. We add an AI module inside the scenario that reads the unstructured input, extracts or classifies what it needs, and passes a clean result back so the rest of the scenario can act on it like any other data.' },
      { question: 'What if our scenario needs to talk to an app that Make doesn\'t support natively?', answer: 'Make has a generic HTTP module that can call almost any API directly, so a missing native integration rarely stops a project. We build a custom module for the specific endpoint your app exposes and wire it into the scenario the same as a native one.' },
    ],
  },
  {
    slug: 'power-automate',
    name: 'Power Automate',
    category: 'no-code',
    logoSlug: 'microsoftpowerautomate',
    logoColor: '0066FF',
    h1: 'Power Automate Implementation for UAE Businesses',
    metaTitle: 'Power Automate Implementation for UAE Businesses | Lenoo AI',
    metaDescription: 'Lenoo AI implements Microsoft Power Automate flows for UAE businesses already running on Microsoft 365, connecting Outlook, SharePoint, Teams, and 900+ connectors.',
    heroSubtext: 'If your business already runs on Microsoft 365, Power Automate is usually the fastest path to automation, since it is already licensed and already connected to your data. We design and build the flows.',
    whatIs: 'Power Automate is Microsoft\'s workflow automation tool, built into the Microsoft 365 ecosystem and connected natively to Outlook, SharePoint, Teams, Excel, and Dynamics 365, plus over 900 third-party connectors.',
    whatIsExtra: 'Because it sits inside the same tenant as the rest of Microsoft 365, Power Automate skips a step most other automation tools need: authenticating separately into each app. A flow that moves a file from an email attachment into SharePoint, then posts a notification in Teams, is already working with data your organization has secured and permissioned correctly, since it runs under the same identity and access rules as everything else in your Microsoft environment. That makes it a natural fit for approval workflows and document routing inside organizations that already standardized on Microsoft.',
    integrationAngle: "We're a Power Automate implementation partner for UAE businesses already invested in the Microsoft ecosystem. Because most of our clients running Microsoft 365 already have Power Automate licensed, the fastest win is usually building on what they already pay for rather than introducing a separate automation tool. We design the flows, wire up approvals across SharePoint and Teams, and add AI Builder or custom AI steps where a flow needs to read and interpret content.",
    integrationAngleExtra: "Before we design a single flow, we check what's already licensed, since Power Automate's premium connectors and AI Builder credits sit behind different license tiers and it's wasteful to design around capability you don't actually have. From there, we map the approval chains, document flows, or reporting tasks you want automated against Microsoft's native connectors first, and only reach for a custom API call or an external AI step when a native option genuinely can't do the job. The result is a flow your IT team recognizes and can administer through the same Power Platform admin center they already use.",
    whoItsFor: 'Power Automate is the right call for UAE organizations already standardized on Microsoft 365, especially where SharePoint, Teams, and Outlook are already the backbone of how the business communicates and stores documents.',
    useCases: [
      { title: 'SharePoint & Teams Approvals', description: 'Document approvals, leave requests, and internal sign-offs move through Teams and SharePoint automatically, with status visible to everyone involved.' },
      { title: 'Outlook & Email Automation', description: 'Incoming emails get categorized, routed, and actioned automatically, reducing the manual triage that piles up in shared inboxes.' },
      { title: 'AI Builder Document Processing', description: 'Extract data from invoices, forms, and contracts using AI Builder, validated and pushed directly into Dynamics 365 or Excel without manual entry.' },
      { title: 'Automated Reporting to Teams & Excel', description: 'Pull data from across your Microsoft 365 tenant into a scheduled report that lands in Teams or a shared Excel file, formatted and ready to read.' },
    ],
    faqFallback: [
      { question: 'Do we need a specific Microsoft 365 license for Power Automate?', answer: 'Basic flows are included in most Microsoft 365 business plans. Premium connectors, AI Builder credits, and higher run volumes require a Power Automate premium license, which we help you evaluate based on what your flows actually need.' },
      { question: 'Is Power Automate a good fit if we are not fully on Microsoft 365?', answer: "It's strongest when your core tools (email, files, CRM) already run on Microsoft. If your stack is mixed or mostly non-Microsoft, we usually recommend Zapier, Make, or n8n instead, and will tell you that directly during the discovery call." },
      { question: 'Can Power Automate flows read and process documents intelligently?', answer: "Yes, through AI Builder and custom AI steps we add. We've built flows that extract data from invoices, validate it against purchase orders, and post it directly into Dynamics 365 or Excel with no manual entry." },
      { question: 'Does Power Automate work with our existing Microsoft 365 security and compliance policies?', answer: 'Yes, that\'s one of its advantages: flows run under your existing Microsoft 365 identity and data loss prevention policies rather than a separate set of permissions. We design flows to respect whatever governance rules your IT team already has in place.' },
      { question: 'Who manages the flows after you build them?', answer: 'We hand over documentation and a walkthrough so your IT or operations team can make small adjustments themselves, and we offer maintenance retainers for anything more involved, like adding a new step or connecting an additional system.' },
    ],
  },
  {
    slug: 'uipath',
    name: 'UiPath',
    category: 'enterprise',
    logoSlug: 'uipath',
    logoColor: 'FA4616',
    h1: 'UiPath RPA Implementation Partner in the UAE',
    metaTitle: 'UiPath RPA Implementation Partner in the UAE | Lenoo AI',
    metaDescription: 'Lenoo AI implements UiPath robotic process automation for UAE enterprises, building and maintaining bots for high-volume, rules-based back-office processes.',
    heroSubtext: 'UiPath handles the high-volume, rules-based work that legacy systems make hard to automate any other way. We design, build, and maintain the bots.',
    whatIs: 'UiPath is the market-leading robotic process automation (RPA) platform, used by enterprises to automate high-volume, repetitive processes by having software robots interact with existing applications the same way a human would: clicking, typing, reading screens.',
    whatIsExtra: 'The reason RPA exists at all is that a huge amount of enterprise software, especially in banking, government, and large legacy back offices, has no modern API to connect to. UiPath bots work around that by operating the application\'s own interface, the same buttons and fields a human employee would use, which means a bot can be built to automate almost any desktop or web application regardless of how old it is or whether its vendor ever built integration hooks. That flexibility comes with a tradeoff: bots are sensitive to interface changes, which is why maintenance matters as much as the initial build.',
    integrationAngle: "We're a UiPath implementation partner, working with UAE enterprises to design, build, and maintain automation bots, not selling UiPath licenses ourselves. RPA earns its place when a process is high-volume, rules-based, and touches systems that have no modern API, often legacy or on-premise software common in banking, government, and large enterprise back offices across the UAE.",
    integrationAngleExtra: "Before recommending UiPath at all, we look honestly at whether RPA is the right tool, since bots make sense for stable, rules-based processes and struggle with anything that requires judgment or that changes format often. Where it fits, we map the process step by step exactly as a human performs it today, build the bot against a test environment first, and run it in parallel with the manual process before full cutover so nothing breaks quietly. Every bot we deliver comes with monitoring and a clear escalation path for when an application's interface changes, which is the single most common cause of RPA failures long after launch.",
    whoItsFor: 'UiPath fits UAE enterprises, particularly in banking, government-adjacent, and large back-office operations, with high-volume, rules-based processes running on legacy systems that have no API to connect to any other way.',
    useCases: [
      { title: 'Legacy System Data Entry', description: 'Bots read data from one legacy application and enter it into another, exactly the way a human operator would, for systems with no API to connect through.' },
      { title: 'High-Volume Back-Office Processing', description: 'Reconciliations, batch reporting, and repetitive back-office tasks that ran manually for years now run on scheduled bots with full audit trails.' },
      { title: 'Attended & Unattended Bot Design', description: 'We design bots that either run fully unattended on a schedule, or sit alongside an employee to speed up a task they still need to review.' },
    ],
    faqFallback: [
      { question: 'When does RPA make more sense than AI automation?', answer: 'RPA fits high-volume, rules-based processes on systems with no API, typically legacy or on-premise software. If your process involves judgment calls, unstructured data, or varies case to case, an AI automation layer usually delivers more value than a UiPath bot alone. We assess this honestly during the discovery call, and often recommend combining both.' },
      { question: 'How do you handle bot maintenance when the underlying application changes?', answer: 'Any UI-based automation is sensitive to interface changes in the target application. Every UiPath project we deliver includes monitoring and a maintenance plan so bots get updated quickly when a screen changes, rather than failing silently.' },
      { question: 'Is UiPath suitable for government or banking-grade compliance requirements?', answer: 'Yes, UiPath is widely deployed in regulated sectors. We design bots with full audit logs, role-based access, and documentation that satisfies internal compliance review, tailored to UAE regulatory requirements.' },
      { question: 'How long does a UiPath bot take to build and deploy?', answer: 'A single well-defined process can go from discovery to a bot in production within three to six weeks. Larger programs automating many processes across a department are scoped and rolled out in phases so value lands incrementally rather than all at once.' },
    ],
  },
  {
    slug: 'automation-anywhere',
    name: 'Automation Anywhere',
    category: 'enterprise',
    logoSlug: 'automationanywhere',
    logoColor: 'D22630',
    h1: 'Automation Anywhere Implementation in the UAE',
    metaTitle: 'Automation Anywhere Implementation in the UAE | Lenoo AI',
    metaDescription: 'Lenoo AI implements Automation Anywhere RPA bots for UAE enterprises already standardized on the platform, or evaluating it against UiPath.',
    heroSubtext: 'Automation Anywhere is a cloud-native alternative to UiPath, built for enterprises that want RPA delivered and managed through the cloud from day one.',
    whatIs: 'Automation Anywhere is an enterprise RPA platform, positioned as a cloud-native alternative to UiPath, with its Bot Store and Automation 360 architecture built for centrally managed, cloud-deployed bots rather than on-premise-first deployments.',
    whatIsExtra: 'The cloud-native design means bots are built, orchestrated, and monitored from a central web console rather than requiring a locally installed control room, which tends to simplify rollout across multiple offices or departments compared to older, on-premise-first RPA architectures. Its Bot Store also ships with a library of pre-built automation components for common enterprise tasks, which can shorten build time for standard processes like invoice extraction or data migration, though most real deployments still need custom logic layered on top.',
    integrationAngle: "We're an implementation partner for enterprises already standardized on Automation Anywhere, or evaluating it head-to-head against UiPath. Our role is designing the bot logic, integrating it with your existing systems, and maintaining it after go-live, we don't sell Automation Anywhere licenses.",
    integrationAngleExtra: "For clients already on Automation Anywhere, we slot into whatever governance model IT already has in place, building bots that follow existing naming conventions, access controls, and change management processes rather than introducing our own standards. For clients still deciding between platforms, we run a short evaluation against your actual process requirements, since the right answer depends more on your existing infrastructure and team skill set than any general claim about which platform is better.",
    whoItsFor: 'Automation Anywhere suits UAE enterprises that want RPA managed centrally through the cloud from the start, or organizations already standardized on the platform who need an implementation partner rather than a license reseller.',
    useCases: [
      { title: 'Cloud-Native Bot Deployment', description: 'Bots are built, deployed, and managed centrally through Automation 360, without needing on-premise infrastructure to run them.' },
      { title: 'Cross-Department Process Standardization', description: 'We help enterprises roll out consistent, governed automation across multiple departments using a shared bot framework.' },
      { title: 'UiPath vs. Automation Anywhere Migration', description: 'For businesses switching platforms, we rebuild existing automation logic in Automation Anywhere and validate it against the original before cutover.' },
    ],
    faqFallback: [
      { question: 'Should we choose Automation Anywhere or UiPath?', answer: "Both are capable enterprise RPA platforms; the right choice usually comes down to your existing infrastructure, licensing relationships, and whether you want cloud-native or on-premise-first deployment. We give an honest comparison specific to your environment during the discovery call rather than pushing one platform." },
      { question: 'Can you migrate our existing UiPath bots to Automation Anywhere?', answer: 'Yes. We rebuild the automation logic natively in Automation Anywhere, test it against the original bot behavior, and manage the cutover so nothing breaks mid-process.' },
      { question: 'Does Automation Anywhere work well for multi-office UAE operations?', answer: 'Its cloud-native, centrally managed architecture tends to fit multi-office rollouts well, since bots are deployed and monitored from one console rather than needing separate on-premise infrastructure at each location.' },
    ],
  },
  {
    slug: 'workato',
    name: 'Workato',
    category: 'enterprise',
    logoSlug: 'workato',
    logoColor: '5A2D81',
    h1: 'Workato Integration Consultants in the UAE',
    metaTitle: 'Workato Integration Consultants in the UAE | Lenoo AI',
    metaDescription: 'Lenoo AI implements Workato enterprise integration recipes for UAE businesses that need governed, IT-approved automation across many departments.',
    heroSubtext: 'Workato sits between no-code simplicity and enterprise governance. We design recipes that IT can trust and business teams can actually use.',
    whatIs: 'Workato is an enterprise integration and automation platform built around governed, recipe-based workflows, positioned for organizations that need the ease of no-code automation but with the access controls, audit trails, and IT oversight enterprise environments require.',
    whatIsExtra: 'The platform is built around the idea that both IT and individual business teams need a role in automation: IT sets guardrails around what data can move where and who can publish a recipe to production, while department teams still get a visual, no-code builder to create their own automations within those limits. That governance layer is what separates Workato from a purely self-serve tool like Zapier, and it is also why Workato tends to show up once an organization has outgrown ad-hoc automation sprawling across departments with no oversight.',
    integrationAngle: "We're a Workato implementation partner: we design and build recipes for your business, not sell Workato licenses. Workato earns its place when an organization has outgrown ad-hoc Zapier or Make usage across departments and needs centralized governance over who can build and change automations, without losing the speed of a no-code builder.",
    integrationAngleExtra: "Our engagements typically start by working with your IT or platform team to define the governance model: who can publish, what data classes require approval, and how changes get reviewed before going live. From there we build the recipes to match whatever integration standards your enterprise already has, and hand off documentation so your internal team can maintain and extend what we build rather than being dependent on us for every small change.",
    whoItsFor: 'Workato fits mid-market and enterprise UAE organizations that need centralized governance over automation across multiple departments, without slowing every team down to a single IT-only build queue.',
    useCases: [
      { title: 'Governed Cross-Department Recipes', description: 'IT retains oversight and approval over what gets automated, while individual departments still get self-service recipe building within guardrails.' },
      { title: 'Enterprise System Integration', description: 'Connect CRM, ERP, HR, and finance systems with recipes built to Workato\'s enterprise security and compliance standards.' },
      { title: 'Automation Consolidation', description: 'We help enterprises that have automation sprawling across five different tools consolidate onto a single governed Workato instance.' },
    ],
    faqFallback: [
      { question: 'Is Workato only for large enterprises?', answer: 'It is priced and built for mid-market and enterprise use cases specifically, where governance and centralized oversight matter more than raw simplicity. For smaller teams, Zapier or Make is usually a better cost fit, and we say so directly during scoping.' },
      { question: 'Can Workato replace multiple existing automation tools?', answer: 'Yes, that is one of the most common projects we run: consolidating automations scattered across Zapier, Make, and custom scripts into a single governed Workato instance with proper access controls.' },
      { question: 'How does Workato\'s governance model actually work day to day?', answer: 'IT defines what data categories and connections require review, and department teams build within those limits using the same visual recipe editor. Anything touching a restricted data class or system routes through an approval step before it can go live, so oversight happens without every automation request going through a central queue.' },
    ],
  },
  {
    slug: 'boomi',
    name: 'Dell Boomi',
    category: 'enterprise',
    logoSlug: 'boomi',
    logoColor: 'CB333B',
    h1: 'Dell Boomi Integration Partner in the UAE',
    metaTitle: 'Dell Boomi Integration Partner in the UAE | Lenoo AI',
    metaDescription: 'Lenoo AI implements Dell Boomi integrations for UAE enterprises connecting legacy on-premise systems with modern cloud applications.',
    heroSubtext: 'Boomi specializes in bridging legacy, on-premise systems with modern cloud applications. We design and build the integrations that make old and new systems talk to each other.',
    whatIs: 'Dell Boomi is an integration platform-as-a-service (iPaaS) built with strong roots in hybrid and legacy system connectivity, commonly used by enterprises that need to bridge older on-premise ERPs or databases with newer cloud applications.',
    whatIsExtra: 'Boomi\'s local Atom runtime is the piece that makes hybrid integration practical: it runs inside your own network as a lightweight agent, so an integration process can read from an on-premise database or legacy ERP without that system ever needing to be exposed directly to the internet. That matters for a lot of UAE enterprises still running core systems on infrastructure that was never designed to be internet-facing, and it lets those systems connect to modern cloud tools without a full replacement project.',
    integrationAngle: "We're a Boomi implementation partner for UAE enterprises with hybrid environments, legacy ERPs or on-premise databases that need to connect reliably to modern cloud tools. Our role is designing and building the integration processes, not selling Boomi licenses.",
    integrationAngleExtra: "A Boomi project usually starts with mapping exactly what data lives where and which systems are the source of truth for each piece of it, since hybrid environments tend to have accumulated inconsistencies over the years that a straightforward integration would just copy forward. We design the integration processes to resolve those inconsistencies as data moves, build with the local Atom runtime where an on-premise system needs to stay inside your network, and put validation and error handling at every step so a bad record gets flagged rather than silently corrupting data on the other side.",
    whoItsFor: 'Boomi suits UAE enterprises running an on-premise ERP or legacy database that needs to connect to modern cloud tools, without exposing that legacy system directly to the internet or replacing it outright.',
    useCases: [
      { title: 'Legacy ERP to Cloud Integration', description: 'Connect an on-premise ERP or database that has run for years to modern cloud CRM, finance, or reporting tools without a full system replacement.' },
      { title: 'Hybrid Data Synchronization', description: 'Keep on-premise and cloud systems synchronized in near real time, with validation and error handling built into every integration process.' },
      { title: 'API Management for Legacy Systems', description: 'Wrap legacy systems with managed APIs through Boomi so newer applications can connect to them safely and consistently.' },
    ],
    faqFallback: [
      { question: 'Is Boomi the right choice if we have a modern, all-cloud stack?', answer: "Boomi's strength is specifically in hybrid and legacy connectivity. If your stack is already fully cloud-native, a lighter iPaaS like Make or Workato is usually a better fit, and we will recommend that honestly rather than push Boomi where it is not the best tool." },
      { question: 'Can Boomi connect to our on-premise ERP without exposing it to the internet?', answer: "Yes, through Boomi's local Atom runtime, integrations can run within your own network, connecting to on-premise systems without requiring direct external exposure." },
      { question: 'How long does a typical Boomi integration project take?', answer: 'A single integration between two systems can be live in a few weeks. Larger programs connecting several legacy and cloud systems together are scoped in phases, so the highest-value connection goes live first while the rest continues in parallel.' },
    ],
  },
  {
    slug: 'mulesoft',
    name: 'MuleSoft',
    category: 'enterprise',
    logoSlug: 'mulesoft',
    logoColor: '00A0DF',
    h1: 'MuleSoft Integration Consultants in the UAE',
    metaTitle: 'MuleSoft Integration Consultants in the UAE | Lenoo AI',
    metaDescription: 'Lenoo AI implements MuleSoft Anypoint Platform integrations for UAE enterprises in regulated industries needing API-led connectivity at scale.',
    heroSubtext: 'MuleSoft is built for enterprises that need API-led connectivity across dozens of systems, with the governance regulated industries require.',
    whatIs: "MuleSoft's Anypoint Platform is an enterprise integration platform built around API-led connectivity: instead of point-to-point integrations, systems connect through a managed layer of reusable APIs, which scales better as the number of connected systems grows.",
    whatIsExtra: 'The API-led approach organizes integrations into three layers: system APIs that expose each underlying system\'s data in a standard way, process APIs that combine and orchestrate that data for a specific business process, and experience APIs that shape the result for a particular consumer, like a mobile app or a partner integration. That layering is what prevents the tangled web of point-to-point connections that tends to build up in large enterprises over the years, since a new integration reuses the existing system APIs instead of building a fresh connection from scratch every time.',
    integrationAngle: "We're a MuleSoft implementation partner for UAE enterprises, most often in banking, insurance, and other regulated industries where API governance, security, and auditability are non-negotiable. Our role is designing the API-led architecture and building the integrations, not selling MuleSoft licenses.",
    integrationAngleExtra: "Because MuleSoft projects tend to involve regulated data, we start by understanding your compliance requirements before designing a single API, since audit logging, access control, and data handling rules need to be built into the architecture from the start rather than bolted on afterward. From there we design the system, process, and experience API layers around your actual integration roadmap, prioritizing the connections that unblock the most immediate business need while building the reusable foundation that makes the next five integrations faster than the first.",
    whoItsFor: 'MuleSoft fits large UAE enterprises, particularly in banking and insurance, connecting dozens of systems over a multi-year integration roadmap where API governance and auditability are a hard requirement, not a nice-to-have.',
    useCases: [
      { title: 'API-Led Connectivity Architecture', description: 'We design a layered API architecture (system, process, experience) so new integrations reuse existing APIs instead of building point-to-point connections from scratch each time.' },
      { title: 'Regulated Industry Integration', description: 'Banking and insurance integrations built with the audit trails, security controls, and governance that regulators expect in the UAE.' },
      { title: 'Legacy-to-Cloud Modernization', description: 'Expose core banking or legacy systems through managed APIs so cloud applications and partner integrations can connect without touching the core system directly.' },
    ],
    faqFallback: [
      { question: 'Is MuleSoft overkill for a mid-sized business?', answer: "Often, yes. MuleSoft's API-led architecture pays off when you're connecting dozens of systems over years, typically large enterprises in regulated industries. For a smaller number of integrations, Boomi, Workato, or even Make usually gets you there faster and cheaper, and we will tell you that directly." },
      { question: 'Do you work with MuleSoft in regulated industries like banking?', answer: "Yes, this is one of our core MuleSoft use cases in the UAE: building integrations with the audit logging, security controls, and governance that banking and insurance regulators require." },
      { question: 'How does the API-led approach pay off over time?', answer: 'The first integration under an API-led architecture usually takes longer than a quick point-to-point connection would, because you\'re building reusable system APIs rather than a one-off link. Every integration after that gets faster, since it reuses those existing APIs instead of starting over, which is where the model earns its cost back on a multi-integration roadmap.' },
    ],
  },
];

export function getAutomationTool(slug: string): AutomationTool {
  const tool = AUTOMATION_TOOLS.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown automation tool slug: ${slug}`);
  return tool;
}
