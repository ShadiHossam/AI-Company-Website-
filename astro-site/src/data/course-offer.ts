// A/B TEST CONTROL: the course offer.
//
// This file is identical in both repos:
//   shadi-hossam-website  src/data/course-offer.ts   (variant B: Shadi, the mentor)
//   AI-Company-Website-   astro-site/src/data/course-offer.ts (variant A: Lenoo AI, the company)
//
// The landing pages at /lp/ai-course and /lp/marketing-course (Lenoo) and
// /en/uae/lp/ai-course and /en/uae/lp/marketing-course (Shadi) differ only in
// who is selling the course: the hero, the proof strip and the "who teaches
// this" section. Everything in this file (price, dates, curriculum, outcomes,
// what's included, FAQ, form fields, CTA label) must stay the same on both
// sides, or the test stops measuring the messenger. Change it here, then copy
// the file to the other repo.
//
// PLACEHOLDERS: price and nextCohort are "TBA" until confirmed. While they are
// TBA the pages sell a free seat reservation instead of a purchase.

export type OfferSlug = "ai" | "marketing";

export interface OfferModule {
  label: string;
  title: string;
  lessons: string[];
  deliverable: string;
}

export interface CourseOffer {
  slug: OfferSlug;
  title: string;
  /** Value the booking backends expect for this course. */
  formValue: string;
  duration: string;
  sessions: string;
  format: string;
  level: string;
  price: string;
  nextCohort: string;
  pains: { title: string; text: string }[];
  outcomes: string[];
  modules: OfferModule[];
  whoFor: string[];
  notFor: string[];
  faq: { question: string; answer: string }[];
}

export const CTA_LABEL = "Reserve my seat";
export const CTA_NOTE = "Free to reserve. You get the dates and price before they go public.";

export const OFFER_INCLUDED = [
  { title: "Two live sessions a week", text: "Ask questions and get answers on the spot." },
  { title: "Every session recorded", text: "Miss one or rewatch it whenever you want." },
  { title: "Templates and playbooks", text: "Prompt libraries, checklists and templates you keep." },
  { title: "Private cohort group", text: "A WhatsApp group to share wins and get unstuck." },
  { title: "Feedback on your project", text: "Personal feedback on your final project, applied to your own business." },
  { title: "Certificate of completion", text: "Something to add to your LinkedIn profile." },
];

const RESERVE_FAQ = {
  question: "When does it start and how much is it?",
  answer:
    "Dates and price go to people who reserved a seat first, before they are published. Reserving is free and doesn't commit you to anything. If the timing or price doesn't work for you, you just don't enroll.",
};

const LIVE_FAQ = {
  question: "What if I can't make a live session?",
  answer: "Every session is recorded and shared the same day, so you can catch up and still ask your questions in the group.",
};

export const OFFERS: Record<OfferSlug, CourseOffer> = {
  ai: {
    slug: "ai",
    title: "AI for Marketing & Business",
    formValue: "ai",
    duration: "6 weeks",
    sessions: "12 live sessions",
    format: "Live online + in person in Dubai",
    level: "Beginner to intermediate",
    price: "TBA",
    nextCohort: "TBA",
    pains: [
      {
        title: "The output sounds like everyone else's",
        text: "You've tried ChatGPT. What comes back is generic, so you rewrite most of it and wonder why you bothered.",
      },
      {
        title: "No system, so you still do it by hand",
        text: "You know AI could save you hours a week. Without a repeatable way to use it, the work stays manual.",
      },
      {
        title: "Too many tools, no way to choose",
        text: "There's a new AI tool every week. You can't tell which ones are worth your time or your money.",
      },
    ],
    outcomes: [
      "Write prompts that get usable output on the first or second try",
      "Build a prompt library for your brand voice, offers and audience",
      "Produce a month of social content and ad variations in one afternoon",
      "Connect Claude to tools like Google Drive, Instagram and your CRM",
      "Automate repetitive tasks with no-code AI workflows",
      "Know which AI tools are worth paying for and which to skip",
    ],
    modules: [
      {
        label: "Week 1",
        title: "AI foundations that matter",
        lessons: [
          "How large language models work, in plain language",
          "ChatGPT vs Claude vs Gemini: what each is best at",
          "Setting up your workspace, projects and custom instructions",
        ],
        deliverable: "Your AI workspace, set up and ready",
      },
      {
        label: "Week 2",
        title: "Prompting systems",
        lessons: [
          "The prompt structure behind consistent results",
          "Feeding AI your brand voice, offers and customer research",
          "Building a reusable prompt library for your team",
        ],
        deliverable: "A prompt library tuned to your brand voice",
      },
      {
        label: "Week 3",
        title: "AI for content and social media",
        lessons: [
          "Content calendars, hooks and scripts in minutes",
          "Turning one idea into ten formats",
          "Auditing your social accounts with AI",
        ],
        deliverable: "A 30-day content calendar with hooks and scripts",
      },
      {
        label: "Week 4",
        title: "AI for ads and creative",
        lessons: [
          "Ad copy variations for Meta, Google and TikTok",
          "AI image and video tools for ad creative",
          "Testing more creative angles, faster",
        ],
        deliverable: "A pack of ad variations ready to test",
      },
      {
        label: "Week 5",
        title: "Automation and AI agents",
        lessons: [
          "Connecting AI to the tools you already use",
          "No-code automations for leads, reports and follow-ups",
          "What AI agents can do for a small team today",
        ],
        deliverable: "A working automation that saves you hours every week",
      },
      {
        label: "Week 6",
        title: "Research, data and your AI playbook",
        lessons: [
          "Competitor and market research with AI",
          "Turning spreadsheets and reports into decisions",
          "Final project: your AI playbook for your business",
        ],
        deliverable: "Your own AI playbook, reviewed with feedback",
      },
    ],
    whoFor: [
      "Marketers who want to ship more content and campaigns without hiring",
      "Founders and business owners who don't know where to start with AI",
      "Agency teams who want repeatable AI workflows for client work",
      "Anyone who has tried ChatGPT and got generic results",
    ],
    notFor: [
      "Developers looking for a coding or machine learning course",
      "People who want theory and won't practice between sessions",
    ],
    faq: [
      RESERVE_FAQ,
      {
        question: "Do I need a technical background?",
        answer: "No. If you can use email and a browser, you can take this course. Everything is shown step by step.",
      },
      {
        question: "Which AI tools do I need to pay for?",
        answer: "Free versions of ChatGPT and Claude are enough to start. We cover when a paid plan is worth it, so you only pay for what you use.",
      },
      LIVE_FAQ,
      {
        question: "Can my company book this for the whole team?",
        answer: "Yes. Private team versions are available, built around your industry and tools. Mention it in the form and we'll follow up.",
      },
    ],
  },
  marketing: {
    slug: "marketing",
    title: "Growth Marketing",
    formValue: "marketing",
    duration: "8 weeks",
    sessions: "16 live sessions",
    format: "Live online + in person in Dubai",
    level: "Beginner to intermediate",
    price: "TBA",
    nextCohort: "TBA",
    pains: [
      {
        title: "You spend on ads and can't say what's working",
        text: "Money goes out every month. Leads come in, sometimes. Nobody can tell you which part is paying for itself.",
      },
      {
        title: "You learned marketing in pieces",
        text: "A video on Meta ads, a thread on SEO, a course on content. None of it connects into a plan you can run.",
      },
      {
        title: "Search changed and your playbook didn't",
        text: "People now ask ChatGPT and Google's AI answers before they click anything. Most marketing plans still ignore that.",
      },
    ],
    outcomes: [
      "Build a marketing strategy and channel plan from scratch",
      "Do keyword research and on-page SEO, and get cited in AI search (GEO)",
      "Launch and optimize campaigns on Meta, Google and TikTok",
      "Plan content that brings leads, not just likes",
      "Find and fix the leaks in your funnel and landing pages",
      "Set up GA4 tracking and read the numbers that matter",
    ],
    modules: [
      {
        label: "Week 1",
        title: "Strategy and positioning",
        lessons: [
          "Audience research and customer personas",
          "Positioning and offers that convert",
          "Choosing channels and setting a budget",
        ],
        deliverable: "A one-page marketing strategy for your business",
      },
      {
        label: "Week 2",
        title: "SEO and GEO",
        lessons: [
          "Keyword research for real search demand",
          "On-page SEO and technical basics",
          "Getting your brand cited by ChatGPT, Gemini and AI Overviews",
        ],
        deliverable: "A keyword map and an on-page SEO checklist",
      },
      {
        label: "Weeks 3 & 4",
        title: "Paid advertising",
        lessons: [
          "Meta ads: campaign structure, audiences and pixels",
          "Google Search and Performance Max campaigns",
          "TikTok ads and creator-style content",
          "Budgets, bidding, scaling winners and cutting losers",
        ],
        deliverable: "A live ad campaign, set up the right way",
      },
      {
        label: "Week 5",
        title: "Content and social media",
        lessons: [
          "A content strategy tied to business goals",
          "Hooks, formats and posting rhythm",
          "Turning followers into leads",
        ],
        deliverable: "A content plan tied to your sales goals",
      },
      {
        label: "Week 6",
        title: "Funnels and conversion",
        lessons: [
          "Landing pages that convert",
          "Lead magnets, email and WhatsApp follow-up",
          "Simple A/B testing",
        ],
        deliverable: "A landing page and follow-up flow",
      },
      {
        label: "Week 7",
        title: "Growth experiments and AI",
        lessons: [
          "Growth loops and quick experiments",
          "Using AI to speed up research, copy and creative",
          "Picking the experiments worth running",
        ],
        deliverable: "A backlog of growth experiments to run",
      },
      {
        label: "Week 8",
        title: "Analytics and reporting",
        lessons: [
          "GA4, conversions and UTM tracking",
          "The metrics that matter, and the ones that don't",
          "Final project: a full growth plan for a real business",
        ],
        deliverable: "A GA4 dashboard and a 90-day growth plan",
      },
    ],
    whoFor: [
      "Junior marketers who want a complete, structured skill set",
      "Business owners who want to run or properly manage their own marketing",
      "Social, design or sales specialists moving into a full marketing role",
      "Anyone spending on ads without knowing what's working",
    ],
    notFor: [
      "Senior marketers who already run multi-channel budgets every day",
      "People looking for a shortcut that skips the practical work",
    ],
    faq: [
      RESERVE_FAQ,
      {
        question: "Do I need marketing experience?",
        answer: "No. The course starts from the foundations and builds up, with practical work every week.",
      },
      {
        question: "Will I need an ad budget?",
        answer: "Not to take the course. For the paid media weeks a small test budget helps, and we show you how to start with very little.",
      },
      LIVE_FAQ,
      {
        question: "Can my company book this for the whole team?",
        answer: "Yes. Private team versions are available, built around your industry and goals. Mention it in the form and we'll follow up.",
      },
    ],
  },
};

export function isTba(value: string): boolean {
  return value.trim().toUpperCase() === "TBA";
}
