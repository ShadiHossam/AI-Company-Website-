---
locale: en-AE
site: lenooai.com
url: "/blog/ai-project-handover-checklist/"
slug: "ai-project-handover-checklist"
title: "AI Project Handover Checklist: What You Must Own Before the Agency Leaves"
meta_title: "AI Project Handover Checklist: What to Own Before Agency Leaves"
meta_description: "The AI project handover checklist UAE businesses need: prompts, credentials, PDPL records, baselines and the ongoing costs you now own."
main_keyword: "ai project handover checklist"
cluster: "AgentOps, Monitoring & Maintenance"
level: "Supporting"
intent: "BOFU"
batch: "B03"
plan_order: 104
author: "Shadi Hossam"
author_url: /about
published: 2026-08-24
source: lenoo-pipeline
run: "run 409"
serp: "serper"
qa:
  words: 1825
  faqs: 6
  dashes: 0
  issues:
    - "word count 1825 exceeds the 1748-word limit"
---

# AI Project Handover Checklist: What You Must Own Before the Agency Leaves

The last email from the agency lands in your inbox. Final invoice attached, files in a shared drive, a friendly "let us know if you need anything." Three weeks later the WhatsApp bot stops replying, and nobody at your company knows why.

An **ai project handover checklist** for an AI system is not the same document you used for your website build. AI systems drift.

They depend on API keys that expire, models that get deprecated, and prompts that need tuning as customer behaviour shifts. What you sign off is a snapshot. What you inherit is a moving target that keeps generating obligations under UAE law.

This guide walks through the assets you must demand before the agency closes the ticket, the UAE compliance records that transfer with the system, and what to do if you're reading this after the handover already happened.

## Key Takeaways

- **A complete AI handover has six required assets, not just files** — The checklist has six required rows — prompt library, model configuration, integration map, access credentials, data flow diagram and runbook — and the article says not to sign off if any row is missing.
- **You become the data controller the instant the agency leaves** — Under Federal Decree-Law No. 45 of 2021 (the UAE PDPL), the new owner must already hold records of lawful basis, processing purposes, retention periods and every sub-processor, or they are non-compliant from day one of ownership.
- **One vendor cancellation can take your entire AI system offline** — The fix is billing every vendor relationship — the LLM provider, vector database, CRM connector and WhatsApp Business account — directly to the company, with each monthly cost documented in AED before the agency exits.
- **Model drift is invisible without documented performance baselines** — The baselines to demand are accuracy on a defined test set, average and 95th percentile response latency, error rates, and cost per interaction; without them a system can answer correctly on handover day and be wrong within weeks with no way to prove it.
- **A handover captures a snapshot; a retainer keeps it working** — Small prompt drift compounds into wrong outputs, wrong outputs turn into complaints, and the resulting lost revenue usually outweighs the cost of an ongoing maintenance retainer.
## Why AI Handover Is Nothing Like Handing Over a Website

A website you shipped years ago still renders today. An AI agent shipped at the same time is almost certainly broken by month six. That is the difference nobody explains before the project kicks off.

AI systems degrade quietly. Your customers change how they phrase questions. The LLM provider ships a new model version and deprecates the old one.

A third-party API updates its response schema. None of these events touched your source code, yet the system now answers wrong. A static website does not have this problem.

Standard project handovers were designed for deliverables that sit still. They assume the client receives files, credentials and documentation, and that the artefact keeps working.

An AI handover has to do more. It must transfer prompt libraries, model configurations, training data provenance, integration maps and the operational duties that come with them: monitoring, key rotation, retraining schedules and compliance records.

## The AI Project Handover Checklist

Here is what your handover pack must contain. If any row is missing, do not sign off.

| Asset | What to demand | Why it matters |
|---|---|---|
| Prompt library | Every system prompt and few-shot example, version-controlled and labelled by use case | Prompts are the source code of the behaviour |
| Model configuration | Base model name and version, fine-tune checkpoints, hyperparameters, training data provenance | Needed to rebuild when the base model is deprecated |
| Integration map | Every third-party API, webhook, CRM connector and WhatsApp Business account | The bot dies when one silently changes |
| Access credentials | API keys and service accounts issued to accounts YOU control | Prevents a single cancellation from taking the system offline |
| Data flow diagram | Where customer data enters, where it goes, which sub-processors touch it | The PDPL evidence file starts here |
| Runbook | How to restart, redeploy, roll back a prompt change and rotate a key | The first time something breaks is not the time to figure this out |

Every asset should be dated, versioned and stored where your team can find it in six months, not on a shared drive the agency owns.

## Data Ownership and UAE Compliance

The moment the agency stops processing data on your behalf, you become the data controller for everything the system does. That is not a rhetorical point.

Under Federal Decree-Law No. 45 of 2021 (the UAE PDPL), you are required to hold records of lawful basis, processing purposes, retention periods and every sub-processor involved. If your handover pack does not include these records, you are non-compliant from day one of ownership.

The documentation must cover:

- The lawful basis for processing each category of customer data.
- A full list of sub-processors, including the LLM provider, vector database, hosting infrastructure and any voice or messaging APIs.
- Data retention and deletion schedules for chat logs, training data and any personal data.
- A data-flow diagram showing every point where customer data crosses a border or leaves a UAE-hosted service.

If your business operates in DIFC or ADGM, those free zones run their own data protection regimes on top of the federal PDPL, and the handover must include separate evidence packs.

If the AI handles outbound calling or messaging, UAE telemarketing rules under Cabinet Resolutions 56 and 57 of 2024, effective 27 August 2024, set TDRA registration requirements, calling windows of 09:00 to 18:00 and a Do Not Call Registry, with fines of AED 50,000, AED 75,000 and AED 150,000 for a first, second and third breach.

Because UAE regulators can request evidence in either language, the handover pack should carry key documentation in both Arabic and English.

## Credentials, API Keys, and Vendor Access

This section separates a professional handover from a time bomb. Every API key the system uses needs to move to an account you control, billed to your card, in your company name.

The LLM provider key. The vector database credentials. The CRM connector token.

The WhatsApp Business API account. The cloud console. The container registry, the domain DNS records, and the n8n instance if you're self-hosting.

The failure mode is boring and predictable. The agency was paying the LLM provider on their corporate card because it was faster during the build.

Three months after handover, they close the account or the card expires. Your bot stops responding, and nobody on your team even knows which provider was being used.

Two rules make this clean:

1. Every vendor relationship must be billed to your company directly.
2. Every vendor's monthly cost must be documented in AED before the agency walks out the door.

Ask for a single-page cost sheet: vendor name, service, monthly cost, contract terms, cancellation notice. If the agency cannot produce this in a day, they never tracked it.

## Performance Baselines and Monitoring

If you cannot measure the system, you cannot know when it breaks.

The agency must hand over documented baselines captured before exit: accuracy on a defined test set, average and 95th percentile response latency, error rates, and cost per interaction. Without these, "the bot feels slower" is a conversation you cannot resolve.

Monitoring dashboards and alert thresholds should transfer with the system. If no monitoring exists, that is a gap the handover must close before sign-off.

When you set up ongoing support, formalise these baselines in writing. Fuller guidance on response times, uptime and accuracy commitments is in [our breakdown of SLAs for AI agents](/blog/ai-service-level-agreement/).

Model drift is silent. A system that answered correctly on handover day can be answering incorrectly within weeks, and you will not know until a customer complaint reaches a manager.

## The Ongoing Cost of What You Now Own

Congratulations, you own an AI system. Now you own the bill for it.

Recurring costs after handover include LLM API usage, hosting, monitoring tooling, vector database subscriptions, and human time to update prompts, retrain and respond to incidents.

For how those costs behave over year one versus year two, [the real cost of owning an AI agent](/blog/ai-agent-maintenance-cost/) walks through the pattern. For what a maintenance scope should include month-to-month, [what a monthly AI maintenance retainer covers](/blog/what-does-ai-maintenance-include/) is the sister piece.

The failure pattern for owners who do not budget for this is predictable. Small prompt drift compounds into wrong outputs, and wrong outputs turn into customer complaints.

Customer complaints turn into lost revenue that dwarfs the cost of a retainer. The maths almost always favours the retainer once you count the churn a broken bot creates.

## What to Do When the Handover Pack Is Incomplete

If you are reading this after the handover and counting the gaps, you have options. None require going back to the original agency.

Start with an audit against the checklist above. Write down what you have and what is missing.

For access gaps, go direct to the vendors. LLM providers, cloud platforms and CRM vendors all run formal account ownership transfer processes. You will need proof that the account was created for your business.

For documentation gaps, a third-party AI team can reverse-engineer the running system to reconstruct what was not handed over. The output is documentation you actually own.

For compliance gaps, the priority is the PDPL evidence pack. Get that in place first, because that is the exposure that generates fines.

A one-time reconstruction fixes the snapshot; it does not fix drift. That is the case for an ongoing retainer, and [what an AI maintenance retainer includes and costs](/services/ai-maintenance/) covers the shape of that arrangement.

If any of this feels familiar, [book a free 30-minute consultation](/contact). We will walk through what your handover pack should contain and give you an honest read on whether ongoing maintenance makes business sense.

## FAQ

### What should an AI project handover checklist include that a standard project checklist does not?

Prompt libraries, model configuration records, training data provenance, integration dependency maps, monitoring dashboards, performance baselines and PDPL compliance records. Standard checklists cover files and status updates; AI checklists cover the living components that change after handover day.

### Who legally owns the AI model, training data, and prompts after the agency finishes?

Ownership is whatever your contract says. Specify assignment of prompts, custom fine-tunes and training data, plus a licence to any underlying tooling the agency retains.

### What UAE data compliance records must be transferred at AI project handover?

At minimum: the lawful basis for processing, a sub-processor list, retention and deletion schedules, and a data-flow diagram, all consistent with Federal Decree-Law No. 45 of 2021. If you operate in DIFC or ADGM, add the free-zone-specific records.

If the system does outbound messaging or calling, add TDRA and Do Not Call Registry evidence.

### How do I know whether my AI handover documentation is complete?

Run it against the checklist in this article. If any row is missing, the pack is incomplete.

### What happens to an AI agent with no maintenance plan after the agency leaves?

It degrades. Prompts drift, APIs update, models get deprecated, keys expire. It slowly gives worse answers until customer complaints force a reaction.

### Do I need a retainer with a new provider once my original AI agency closes the project?

Not always. If the system is small, stable and internal-only, an on-call arrangement may be fine. If it faces customers, handles regulated data or runs outbound messaging, a retainer is usually the right call.