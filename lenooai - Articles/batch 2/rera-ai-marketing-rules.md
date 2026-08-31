---
locale: en-AE
site: lenooai.com
url: "/blog/rera-ai-marketing-rules/"
slug: "rera-ai-marketing-rules"
title: "RERA AI Marketing Rules: What Every Dubai Property Agent Bot Must Comply With"
meta_title: "RERA AI Marketing Rules: Dubai Property Bot Compliance"
meta_description: "RERA AI marketing rules apply to every bot that lists, calls or messages Dubai property leads. DLD's own AI now monitors compliance. Here is what to fix."
main_keyword: "rera ai marketing rules"
cluster: "UAE Compliance, PDPL & Data"
level: "Supporting"
intent: "MOFU"
batch: "B03"
plan_order: 120
author: "Shadi Hossam"
author_url: /about
published: 2026-08-24
source: lenoo-pipeline
run: "run 416"
serp: "serper"
qa:
  words: 1755
  faqs: 7
  dashes: 0
  issues:
    - "word count 1755 exceeds the 1748-word limit"
---

# RERA AI Marketing Rules: What Every Dubai Property Agent Bot Must Comply With

If your brokerage is running an AI tool that drafts listings, sends WhatsApp follow-ups, or answers buyer questions on your website, you are already inside RERA's regulatory perimeter. The RERA AI marketing rules do not sit in a separate rulebook for bots.

Every obligation that binds a human agent, from a Trakheesi permit to PDPL consent, binds the model that publishes on your behalf. And Dubai Land Department is now enforcing those rules with its own AI.

## Key Takeaways

- **DLD's AI now polices every listing automatically** — The Real Estate Advertising Governance Platform has monitored more than 279,000 property ads and automatically modified 29 percent of them, per DLD's April 2025 update. Bot-generated listings face the same automated scrutiny as human-written ones.
- **Trakheesi permit and Form A are non-negotiable** — Every listing an AI system publishes needs a valid Trakheesi permit and a completed Form A before it goes live. Publishing without one carries a fine of up to AED 10,000 per violation.
- **Outbound bots must follow TDRA telemarketing rules** — Cabinet Resolutions 56 and 57 of 2024 require TDRA approval for outbound calls and messages, respect for the Do Not Call Registry, and contact only between 09:00 and 18:00. Breaches cost AED 50,000, AED 75,000 and AED 150,000 for a first, second and third violation.
- **Chatbot data collection falls under PDPL law** — Federal Decree-Law No. 45 of 2021 covers any personal data your bot collects, including names, phone numbers and budgets. Auto-saving a lead to your CRM without disclosed consent is a PDPL gap, not a minor oversight.
- **AI ads still need a Media Council permit** — UAE Federal Law 5 of 2023 covers all digital and social media advertising, AI-generated content included. Fines for operating without a UAE Media Council Advertiser Permit range from AED 10,000 to AED 1,000,000, with the permit deadline reported as 31 January 2026.
## DLD Is Already Using AI to Watch Your Listings

Dubai Land Department is not waiting for complaints. Its [AI-powered Real Estate Advertising Governance Platform](https://dubailand.gov.ae/en/news-media/dubai-land-department-strengthens-transparency-with-ai-enabled-real-estate-advertising-governance/) has monitored more than 279,000 property ads and automatically modified 29 percent of them, per DLD's April 2025 update.

Read that number twice. Nearly one in three ads was rewritten or amended inside a regulator's automated pipeline.

RERA sits inside DLD, and RERA marketing enforcement is part of a broader move by UAE sector regulators to run compliance through AI rather than manual spot checks.

Here is what changes when your bot meets that platform. A human agent might publish twenty listings a week; a well-tuned AI workflow can push twenty in an hour.

If your prompt template omits the permit number, the missing field is not one violation. It is every listing the bot writes until the workflow is stopped. Enforcement is automated on both sides now, and under the RERA AI marketing rules the margin for error is effectively zero.

Four separate compliance frameworks apply to an AI marketing workflow, each triggered by a different action and carrying its own penalty.

| Compliance Area | Governing Rule | Penalty for Non-Compliance |
|---|---|---|
| Publishing property listings | Trakheesi permit and Form A | Up to AED 10,000 per violation |
| Outbound calls and messages | Cabinet Resolutions 56 and 57 of 2024 | AED 50,000 to AED 150,000 per breach |
| Buyer data collection | PDPL, Federal Decree-Law No. 45 of 2021 | Explicit consent and disclosed purpose required |
| AI-generated ads on any media | UAE Federal Law 5 of 2023 | AED 10,000 to AED 1,000,000 |

## Trakheesi Permits and Form A: The Rules Your Bot Inherits Before It Publishes Anything

Every property ad in Dubai needs a valid Trakheesi permit before it goes live, and Form A must be signed before any marketing begins. The rule applies whether a human broker or an AI workflow publishes the post.

The reach is wide. Social media posts, portal listings, your own website, WhatsApp broadcasts, sponsored carousels: any digital channel your AI tool touches is inside it. The regulation does not care whether a human or a model composed the caption.

The penalty for publishing without a permit is commonly quoted at up to AED 10,000 per violation. For a bot that publishes at machine speed, that is a compounding number, not a one-off risk.

The fix is architectural. Permit validation belongs inside the pipeline, not in a post-publish audit. Before the model calls the publish endpoint, the workflow should confirm that the Trakheesi permit ID exists, matches the property, and has not expired.

Same for Form A on the underlying mandate. If either check fails, the job halts. This is boring plumbing that saves you from a very unboring fine.

Prices, availability and property details need to be accurate at the moment of publication. DLD's monitoring platform flags stale data automatically, so a bot that pulls last week's price sheet from a CSV and posts it as current is walking straight into a modification, or worse.

## Outbound Bots and the Do Not Call Registry: TDRA Rules That Cover WhatsApp and Voice Agents

If your AI reaches out first, the rulebook widens. Cabinet Resolutions 56 and 57 of 2024, effective 27 August 2024, require TDRA prior approval for outbound telemarketing.

A voice agent that dials property leads and a WhatsApp bot that opens conversations with a buyer are both squarely inside that scope.

Fines for contacting numbers on the UAE Do Not Call Registry are AED 50,000 for a first breach, AED 75,000 for a second, and AED 150,000 for a third. Those are per-breach numbers, not per-campaign. A bot that ignores the DNCR for one afternoon can rack up several before anyone notices.

The permitted contact window is 09:00 to 18:00. An automated WhatsApp sequence that fires at 07:30 or 20:00 breaches the regulation whether it sends one message or one thousand.

Time zones matter too. If your automation server sits in Ireland or Virginia, the schedule the bot enforces has to be Gulf time, not server time.

## Buyer Data Your Bot Collects: PDPL Obligations in a Property Marketing Workflow

Any personal data your bot collects from a prospective buyer sits under Federal Decree-Law No. 45 of 2021, the UAE PDPL, in force since 2 January 2022. The property use case does not exempt anything.

A name, a phone number, a stated budget, a preferred community: all personal data. A qualifying question about family size is personal data too, and a WhatsApp message forwarded from a lead is personal data the second it lands in your inbox.

Your bot needs an explicit lawful basis, and in a marketing context that almost always means consent. Consent must be captured at the point of collection, and the purpose has to be disclosed. Anything softer is a PDPL gap.

Data minimisation applies too. If your qualifying flow only needs three fields to route a lead, do not collect eight because the model is capable of asking.

Every extra field is a data category you have to protect, justify and delete on request. Templates that scrape passport numbers or Emirates ID digits upfront are the clearest over-collection we see, and there is no marketing reason to hold that data before the deal is real.

If you are not sure whether your current stack meets the bar, a compliance review is faster than a fine. [Book a free 30-minute consultation with Lenoo AI](/contact) and we will walk through your active marketing automations against the RERA AI marketing rules on this page.

## UAE Federal Law 5 of 2023, the Media Council Permit and What AI-Generated Ads Still Cannot Skip

There is no exception in UAE Federal Law 5 of 2023 for content produced by a model. The law regulates all forms of media, and AI-generated property posts on any channel your agency uses fall inside it.

Operating without a UAE Media Council Advertiser Permit is commonly cited as exposing you to fines between AED 10,000 and AED 1,000,000, with the deadline for holding the permit reported as 31 January 2026. That is a wide band for a reason: the size of the fine tracks the scale and repetition of the breach. A bot that publishes daily is on the wrong end of that scale by default.

An AI tool cannot override any of this. Auto-generating a listing with a missing permit number, an outdated price, or a description a human would have caught is a violation regardless of who produced the text.

The generative advantage is speed and volume. Both work against you when the underlying compliance posture is weak.

## FAQ

### Does a RERA Trakheesi permit apply to property listings published automatically by an AI bot?

Yes. The Trakheesi permit requirement applies to the listing, not to the publisher. Whether a human broker or an AI workflow posts the ad, the permit must be valid at the moment of publication and Form A must be in place on the underlying mandate.

### What fine does DLD impose if an AI-generated property ad is published without a valid permit?

Publishing a property advertisement without a valid permit is commonly cited as carrying a fine of up to AED 10,000 per violation. For an automated pipeline, that number multiplies with every non-compliant post the bot pushes out before the workflow is stopped.

### Can an AI WhatsApp bot send property marketing messages to leads on the UAE Do Not Call Registry?

No. Cabinet Resolutions 56 and 57 of 2024 apply to outbound marketing across channels. Contacting a Do Not Call Registry number carries fines of AED 50,000, AED 75,000 and AED 150,000 for first, second and third breaches, and the bot must stay within the 09:00 to 18:00 window.

### Does Federal Decree-Law No. 45 of 2021 (PDPL) apply to buyer data collected by a property chatbot?

Yes. The PDPL, in force since 2 January 2022, covers any personal data the bot collects, including names, phone numbers, budgets and preferences. Consent must be explicit, the purpose disclosed, and only the data actually needed to qualify the lead should be gathered.

### Does UAE Federal Law 5 of 2023 cover AI-generated property ads on social media and websites?

Yes. Federal Law 5 of 2023 regulates all forms of media, including websites, social media, digital advertising and sponsored content. An AI-generated property post on Instagram, LinkedIn or your own website is in scope, and the UAE Media Council Advertiser Permit is required.

### What does DLD's AI advertising monitoring platform actually check for in a listing?

Per DLD's April 2025 update, the platform has monitored more than 279,000 property advertisements and automatically modified 29 percent of them. It screens listings for compliance with RERA advertising rules, including permit validity and accuracy of price, availability and property details.

### Can an AI system legally publish off-plan property listings in Dubai without a human review step?

The regulation does not mandate a human in the loop, but it does hold the brokerage responsible for every published ad. Off-plan listings carry extra disclosure requirements around escrow and project registration, and an unreviewed AI workflow that skips any of them will be flagged by DLD's monitoring platform.

If your agency is scaling AI into listings, chat or outbound and you are not certain every layer holds up, [talk to a Lenoo AI advisor about a RERA-aligned workflow for your brokerage](https://lenooai.com). The call is 30 minutes, free, and we will tell you if a change is not worth making.