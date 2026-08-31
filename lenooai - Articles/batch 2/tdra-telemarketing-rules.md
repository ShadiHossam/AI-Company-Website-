---
locale: en-AE
site: lenooai.com
url: "/blog/tdra-telemarketing-rules/"
slug: "tdra-telemarketing-rules"
title: "TDRA Telemarketing Rules and Automated Calls: What Voice Agents Must Get Right Before They Dial"
meta_title: "TDRA Telemarketing Rules: AI Voice Agent Compliance UAE"
meta_description: "TDRA telemarketing rules apply to AI voice agents. Prior approval, DNCR scrubs, calling windows, PDPL overlap and the fines that follow, explained."
main_keyword: "tdra telemarketing rules"
cluster: "UAE Compliance, PDPL & Data"
level: "Supporting"
intent: "MOFU"
batch: "B03"
plan_order: 122
author: "Shadi Hossam"
author_url: /about
published: 2026-08-24
source: lenoo-pipeline
run: "run 416"
serp: "serper"
qa:
  words: 2033
  faqs: 7
  dashes: 0
  issues:
    - "word count 2033 exceeds the 1748-word limit"
    - "2 paragraph(s) exceed 3 sentences"
---

# TDRA Telemarketing Rules and Automated Calls: What Voice Agents Must Get Right Before They Dial

An AI voice agent that dials a UAE mobile number to pitch a service is a telemarketer. The software does not change the legal category. If you are planning an outbound AI calling campaign in the UAE, the TDRA telemarketing rules under Cabinet Resolutions 56 and 57 of 2024 apply to your agent exactly as they apply to a human caller, and the penalties for getting it wrong hit the licensed company behind the campaign, not the vendor who built the bot.

This article reads those rules through the lens of an AI voice-agent deployment. What TDRA prior approval actually requires. How the Do Not Call Registry interacts with an automated dialler.

Why the 09:00 to 18:00 calling window has to live inside the dialler's logic, not the agent's script. And how Federal Decree-Law No. 45 of 2021, the UAE's PDPL, stacks a second penalty structure on top of every non-compliant call.

## Key Takeaways

- **AI voice agents are telemarketers under UAE law, not a special category** — Cabinet Resolutions 56 and 57 of 2024 regulate marketing telephone calls without distinguishing between a human caller and an AI voice agent, and the obligations attach to the licensed company running the campaign, not the software vendor.
- **TDRA approval and a UAE-registered number must exist before the first dial** — A second violation within 30 days brings AED 20,000 plus a 3-month suspension of registered numbers, and a further breach in the next 30 days raises it to AED 50,000 with a 12-month denial of licensed telecom services.
- **The Do Not Call Registry must be scrubbed before every campaign run** — Per-call DNCR fines climb from AED 50,000 on a first breach to AED 75,000 on a second and AED 150,000 on a third, and this track runs separately from the Resolution 56 per-call violations.
- **PDPL adds a second regulator and a second fine track on top of TDRA** — Federal Decree-Law No. 45 of 2021 requires a lawful basis for processing a phone number, so a single non-compliant automated call can trigger both a TDRA penalty and a separate PDPL enforcement action from the UAE Data Office.
- **Six checks belong in the dialler before a voice agent is allowed to call** — TDRA prior approval, a UAE-registered outbound number, a logged DNCR scrub, hard time-gate logic for the 09:00 to 18:00 window, an AI-disclosure opening line, and a documented PDPL lawful basis for every number on the list.
## What Cabinet Resolutions 56 and 57 of 2024 Actually Require

Cabinet Resolution No. 56 of 2024 regulates telephone marketing in the UAE and makes prior approval from the competent authority a mandatory step before any marketing call activity begins. Cabinet Resolution No. 57 of 2024 sets the administrative penalties that apply when someone breaches Resolution 56.

The two work as a pair: one defines the rules, the other prices the breach.

Per the [joint Ministry of Economy and TDRA regulatory review](https://www.moet.gov.ae/en/-/ministry-of-economy-and-telecommunications-and-digital-government-regulatory-authority-review-regulatory-legislations-in-organizing-operational-mechanisms-for-telemarketing-companies-in-the-uae-and-enhancing-consumer-protection-in-line-with-best-practices), Resolution 56 applies to licensed companies making marketing telephone calls in the country. Both resolutions reflect the UAE government's commitment to protecting consumer privacy and preventing business practices that harm community interests.

TDRA is the telecoms and digital government regulator, and telemarketing sits alongside the wider grid of UAE authorities described in our overview of [AI and the UAE sector regulators](/blog/sector-regulators-ai/). If your voice agent touches a regulated sector, you are reading two rulebooks at once: the sector regulator's, and TDRA's for the outbound call layer.

## Do Automated Voice Agents Fall Inside the Scope of These Rules?

Yes. Resolution 56 of 2024 regulates marketing through telephone calls. It does not carve out software.

If you deploy an AI voice agent to make marketing calls on behalf of your UAE-licensed company, the resolution's obligations attach to your company, not to the model.

A natural person or licensed company that uses an automated dialler or an AI voice agent to market products or services is subject to the same prior-approval, number-registration and disclosure requirements as any human caller. Government pages frame the rules around call-centre staff because that is what existed when the resolution was drafted.

The absence of AI-specific language in Resolution 56 does not mean AI is exempt. It means the existing rules apply by default, and there is no separate lighter regime waiting for voice bots.

Draw the line between inbound and outbound carefully. An inbound customer-service bot that answers a call the user placed sits in a different legal position.

What Resolution 56 targets is the outbound marketing call. The moment your system initiates the dial with a marketing purpose, you are inside the scope of the TDRA telemarketing rules.

## The Do Not Call Registry: How Compliance Works for Automated Diallers

TDRA maintains the Do Not Call Registry, and licensed companies must scrub their call lists against it before running any outbound campaign. That obligation applies equally to automated diallers. Per-call fines for reaching a DNCR-registered number are steep: [AED 50,000 for a first breach, AED 75,000 for a second and AED 150,000 for a third](https://uaelegislation.gov.ae/en/legislations/2519/).

The volume of AI voice campaigns is why the DNCR check must sit at the campaign-launch layer, not inside the agent's dialogue script. An automated system can burn through hundreds of registered numbers before a human notices, and the trail sits in the carrier's call detail records.

Build the scrub as a gated step. Log the scrub date, DNCR version, records removed and who authorised the campaign. If TDRA investigates, that record separates a defensible process from an expensive one.

## Calling Windows, Number Registration, and Disclosure Obligations

The permitted calling window under Resolution 56 of 2024 is 09:00 to 18:00. Outbound marketing calls outside those hours breach the rules, and no contract with the customer can override that time gate. Enforce it in the dialler, not in the agent's prompt, because prompts drift and time zones cause silent errors.

Marketing calls must originate from a fixed or mobile number licensed in the UAE in the name of the company or individual making the call. Routing an AI voice agent through a foreign SIP trunk or spoofing caller ID as a local number is non-compliant. If a call cannot be traced back to a UAE-registered number in your company's name, you are outside the resolution before you say hello.

Resolution 56 also requires callers to identify themselves and the purpose of the call. When the caller is an AI voice agent, transparency is the right position legally and reputationally. The [UAE AI Charter's transparency principles](/blog/uae-ai-charter-business/) push the same direction: users should know when they are talking to a machine, and disclosing the caller is automated meets both the TDRA rule and the charter's spirit.

## The Penalty Ladder: AED 20,000, AED 50,000 and Beyond

The penalties escalate quickly. Per the [Ministry of Economy and TDRA statement](https://www.moet.gov.ae/en/-/ministry-of-economy-and-telecommunications-and-digital-government-regulatory-authority-review-regulatory-legislations-in-organizing-operational-mechanisms-for-telemarketing-companies-in-the-uae-and-enhancing-consumer-protection-in-line-with-best-practices), a natural person who commits the same violation within 30 days faces a penalty of AED 20,000 plus suspension of all registered fixed and mobile numbers for three months. A further breach within the next 30 days pushes the penalty to AED 50,000 and denial of all services from UAE-licensed telecommunications companies for 12 months.

DNCR fines run as a separate track. You can trigger both at once. A single non-compliant automated campaign that dials outside the window and hits registered numbers can produce a per-call violation and a DNCR breach on the same call log.

For a business built on outbound dialling, losing access to licensed UAE telecom services for 12 months is not a financial hit. It is an operational shutdown.

Frame the risk at board level accordingly. This is not an IT ticket.

Two separate fine tracks run at once, and lining them up side by side shows how fast the numbers climb.

| Track | Breach | Penalty |
|---|---|---|
| Resolution 56 repeat violation | Second violation within 30 days | AED 20,000 plus 3-month number suspension |
| Resolution 56 repeat violation | Further breach in next 30 days | AED 50,000 plus 12-month denial of telecom services |
| DNCR breach | First | AED 50,000 |
| DNCR breach | Second | AED 75,000 |
| DNCR breach | Third | AED 150,000 |

## How PDPL Adds a Second Compliance Layer on Top of TDRA Rules

Federal Decree-Law No. 45 of 2021, the UAE's Personal Data Protection Law, has been in force since 2 January 2022. It requires a lawful basis for processing personal data, and a phone number attached to a natural person is personal data.

Loading a list into your dialler is processing.

An AI voice agent that calls a number without documented consent or another valid PDPL lawful basis creates dual exposure. TDRA can penalise the call under Resolution 57 of 2024. The UAE Data Office can act on the PDPL breach separately.

Two regulators, two fine structures, one call. This dual-regulator pattern shows up across UAE AI deployments, from [where AI must stop in tax and bookkeeping automation](/blog/ai-accounting-compliance-uae/) to [what a patient-facing bot may say in healthcare](/blog/ai-healthcare-regulation-uae/), and voice-agent campaigns are one of the cleanest examples.

DIFC and ADGM add their own data-protection regimes on top of the federal PDPL. If your outbound list targets professionals inside those free zones, treat the campaign as needing separate legal review before the first call is placed.

## A Pre-Launch Compliance Checklist Before Your Voice Agent Dials

Work through this in order. Skipping a step to hit a launch date is where the fines come from.

1. **Obtain TDRA prior approval for the marketing activity** before any campaign is built. Resolution 56 makes prior approval mandatory, not a post-launch formality.
2. **Register the outbound number in the company's UAE licence name.** Keep the paperwork retrievable if TDRA asks for evidence.
3. **Scrub the call list against the DNCR before every campaign run.** Log the scrub date, DNCR version and records removed. Re-scrub if time passes between list preparation and launch.
4. **Set hard time-gate logic in the dialler** to enforce the 09:00 to 18:00 window automatically. Do not rely on a scheduler or operator.
5. **Build the AI-disclosure statement into the agent's opening line.** It should say who the company is, that the call is for marketing, and that the caller is automated.
6. **Document a PDPL lawful basis for every number on the list.** If you cannot show one, the number does not belong on the list.

If you would like a second pair of eyes on your voice-agent setup before it goes live, [book a free 30-minute consultation with Lenoo AI](/contact). You will get an honest assessment of what needs to change.

## FAQ

### Does an AI voice agent making outbound marketing calls count as telemarketing under UAE law?

Yes. Resolution 56 of 2024 regulates marketing through telephone calls without distinguishing between human and software callers. If your AI voice agent initiates outbound marketing calls in the UAE, the resolution's obligations apply to your licensed company in full.

### What TDRA prior approval does a company need before running an automated calling campaign?

Resolution 56 of 2024 requires prior approval from the competent authority for the marketing activity itself, obtained before the campaign begins. This is a licensing precondition, not a filing to complete after launch, and it is required regardless of whether the caller is a person or an AI system.

### How does the Do Not Call Registry work and how often must a call list be scrubbed against it?

TDRA maintains the DNCR, and licensed companies must scrub every outbound call list against it before running a campaign. Scrub immediately before launch and log the scrub date and DNCR version, because a stale scrub does not protect you from a fine if the registry has updated.

### What are the fines for breaching TDRA telemarketing rules under Cabinet Resolution 57 of 2024?

For a natural person, a repeat of the same violation within 30 days raises the penalty to AED 20,000 with a three-month suspension of registered numbers, and a further breach within the next 30 days raises it to AED 50,000 with a 12-month denial of licensed telecom services. DNCR-specific fines run separately at AED 50,000, AED 75,000 and AED 150,000 for successive breaches.

### Can an AI voice agent legally make marketing calls outside the 09:00 to 18:00 window?

No. Resolution 56 of 2024 restricts outbound marketing calls to the 09:00 to 18:00 window, and that limit binds automated diallers the same way it binds human agents. Enforce the window in the dialler's launch logic so a scheduling error cannot push calls outside it.

### Must a voice agent disclose that it is automated when making outbound marketing calls in the UAE?

Resolution 56 requires callers to identify themselves and the purpose of the call, and the safest reading, reinforced by the UAE AI Charter's transparency principles, is that an automated caller should say it is automated in the opening line. Undisclosed AI callers invite both regulatory attention and reputational damage.

### How do PDPL obligations interact with TDRA telemarketing rules for outbound voice-agent campaigns?

They stack. TDRA governs the call itself, and Federal Decree-Law No. 45 of 2021 governs the processing of the phone number and any personal data captured during the call. A single non-compliant automated call can produce a TDRA penalty and a separate PDPL enforcement action at the same time.