---
locale: en-AE
site: lenooai.com
url: "/blog/arabic-prompt-injection/"
slug: "arabic-prompt-injection"
title: "Arabic Prompt Injection: Why Bilingual UAE Chatbots Face an Attack English Safety Training Cannot See"
meta_title: "Arabic Prompt Injection: The Bilingual UAE Chatbot Gap"
meta_description: "Arabic prompt injection bypasses English-trained safety filters. What UAE businesses running bilingual chatbots need to know, and how to close the gap."
main_keyword: "arabic prompt injection"
cluster: "AI Security, Guardrails & Trust"
level: "Supporting"
intent: "MOFU"
batch: "B02"
plan_order: 71
author: "Shadi Hossam"
author_url: /about
published: 2026-08-22
source: lenoo-pipeline
run: "run 397"
serp: "serper"
qa:
  words: 1765
  faqs: 7
  dashes: 0
  issues:
    - "word count 1765 exceeds the 1748-word limit"
    - "main keyword density 1.7% is above the 1.5% target"
---

# Arabic Prompt Injection: Why Bilingual UAE Chatbots Face an Attack English Safety Training Cannot See

Your chatbot refuses when an English speaker asks it to break its own rules. Switch that request to Arabic, or mix Arabic and English the way your customers actually write, and the refusal often disappears. That gap is what arabic [prompt injection](/blog/prompt-injection/) exploits, and if you run a UAE customer bot, it lives in your main WhatsApp queue.

This is a business problem. Attackers only need to type in the same language your customers already use.

## Key Takeaways

- **English-trained safety filters miss Arabic instructions** — Most LLM safety training data is English, so the refusal that stops an English jailbreak attempt has far fewer trained examples to draw on when the same request arrives in Arabic script or Arabizi.
- **UAE customers code-switch, and that is the attack surface** — Mixing Arabic and English mid-sentence on WhatsApp, the primary UAE support channel, is normal customer behavior, but safety training rarely covers mixed-language input, so the same code-switching gives an attacker's payload less coherent context to be caught by.
- **A researcher earned $37,500 bypassing filters with Arabic** — Jenish Sojitra publicly reported switching prompt injection payloads to Arabic and Thai to bypass multiple LLM runtime safeguards, including Azure Content Filter, collecting bounties across programs.
- **Arabic detection models exist but aren't default** — Ara-Prompt-Guard_V1 is a 0.3B-parameter classifier fine-tuned from Llama-Prompt-Guard-2-86M to flag Arabic injection and jailbreak attempts, but off-the-shelf LLM APIs from major vendors don't enable Arabic-specific detection unless you add it yourself.
- **A data leak here triggers UAE PDPL exposure** — Customer data exposed through a successful injection can trigger an investigation under Federal Decree-Law No. 45 of 2021, handled by the UAE Data Office, with DIFC and ADGM entities carrying additional obligations on top of the federal law.
## What Arabic Prompt Injection Means for a Business, Not a Researcher

Arabic prompt injection is when a user hides instructions inside an Arabic or mixed-language message that make the chatbot ignore its own rules. Most safety filters were trained on English and do not recognise the same instruction in Arabic script or Arabizi.

This is not theoretical. Security researcher Jenish Sojitra publicly reported that by switching payloads to Arabic and Thai, he bypassed multiple LLM runtime safeguards including Azure Content Filter, collecting $37,500 in bounties across programs.

Azure Content Filter is one of the guardrails many production teams rely on out of the box. It failed against Arabic.

For a UAE business, an English-only guardrail leaves a door unlocked that any user with fifteen minutes and a translator can find.

## How UAE Customers Actually Write, and Why That Is the Attack Surface

Your customers do not send neat Arabic-only or English-only messages. They send "hi, ممكن أعرف حالة الطلب؟" and "شكراً، can you escalate this please". That mixing is normal, and it happens in the queue that matters most.

WhatsApp is the primary customer channel in the UAE. Customers expect a reply in minutes and write in whichever language reaches for the keyboard first. So the code-switching risk lives in your main support flow, not in a low-traffic web form.

Now overlay how LLM safety training works. The refusal behaviour that stops an English user from extracting your system prompt was learned mostly from English data. Send the same request in Arabic script, or mid-sentence between two English clauses, and the model has far fewer refusal examples to draw on.

It complies more often. The more permissions your bot carries, order lookup, refund, escalation, the more that compliance is worth to an attacker.

## Arabizi and Transliteration: The Encoding That Confuses Content Filters

Arabizi is Arabic written in Latin characters, often with numbers standing in for letters that have no English equivalent (3 for ع, 7 for ح). UAE users type it constantly on English keyboards.

For a content filter, Arabizi is a nightmare. It is not Arabic script, so an Arabic-script classifier misses it. It is not English words, so an English classifier does not understand it.

It sits in a gap that most off-the-shelf guardrails were never designed to cover.

Research published in 2024 demonstrated jailbreak attacks in multilingual settings, moving Arabic-language exploitation from theoretical concern to documented technique. The same work found that simply transliterating prompts into standardised Arabic did not affect LLM refusal results.

That distinction matters. Formal Arabic behaves one way; informal Arabizi and mid-sentence code-switching behave differently, and the latter two are what your customers actually use.

The problem also lives in places you do not think of as user input. An attack payload can hide inside a document or CRM note the bot reads. We cover that in direct vs [indirect prompt injection](/blog/indirect-prompt-injection/).

## What an Attacker Can Actually Extract From Your Chatbot

The damage is concrete. Here is what a successful arabic prompt injection buys the attacker.

**System-prompt extraction.** Your bot's internal instructions, pricing logic, and escalation rules become readable. That is competitive intelligence handed over at zero cost.

**Policy bypass.** A bot instructed never to offer discounts can be talked into offering one. A bot told not to comment on competitors can be steered into doing so.

For a walk-through, see how a customer tricked a chatbot into a discount.

**Data exfiltration through indirect injection.** Malicious instructions hidden in a customer document, CRM note, or database field get read by the bot and acted on. The customer never types the attack; they upload it.

This is where indirect prompt injection turns a helpful document-reading feature into a leak.

Risk scales with permissions. A static FAQ bot with no tools is a low-value target. A bot that can look up order history, issue refunds, or forward tickets with a customer's full record attached is worth attacking in whichever language slips past your filters.

## Detection Tools Built for Arabic: What Exists and What It Costs You

The good news: tooling exists. Ara-Prompt-Guard_V1 is a 0.3B-parameter model fine-tuned from meta-llama/Llama-Prompt-Guard-2-86M for Arabic prompt injection and jailbreak detection. It works as a binary classifier: it labels a prompt as 0 (safe) or 1 (unsafe), and you decide what to do with the flag.

Initial observations from the publisher suggest its performance supersedes models such as GemmaShield and IBM Granite in Arabic prompt injection detection. That is not peer-reviewed, so treat it as a starting point.

The honest caveats matter more than the model name. Running a separate classifier in front of your main LLM adds latency, engineering work, and one more component to monitor.

Off-the-shelf LLM APIs from major vendors do not enable Arabic-specific detection by default. If you want it, you add it. The default configuration you wired up last quarter almost certainly does not have it.

## Practical Defences a UAE Business Can Apply Without a Research Team

You do not need a security team to close most of this gap. Four moves cover the majority of the exposure.

Test your own bot before someone else does. Sit with a colleague who speaks Arabic and try to break the bot: ask it to ignore its rules, repeat its system prompt, mix Arabic and English mid-sentence. The five-minute self-test is a good way to find out what your bot does.

Apply least privilege to the bot's tools. If it does not need to issue refunds, do not connect it to the refund API. If it can look up any order by customer ID, restrict it to the order for the authenticated session.

The smallest authorisation set limits the blast radius regardless of which language the attacker uses.

Add a language-aware input classifier as a pre-processing layer. Ara-Prompt-Guard or an equivalent Arabic-capable model catches a meaningful share of payloads a monolingual filter would miss. Latency cost is manageable.

Log and review Arabic and mixed-language conversations in a separate queue. A weekly ten-minute bilingual review finds patterns automated monitoring will not.

These four moves target the exact gap that lets Arabic and mixed-language attacks slip past English-tuned filters.

| Defence | What It Addresses |
|---|---|
| Self-test in Arabic with a colleague | Finds out what your bot does before an attacker does |
| Apply least privilege to bot tools | Limits the blast radius regardless of the attack's language |
| Add a language-aware input classifier | Catches payloads a monolingual filter would miss |
| Log and review Arabic and mixed-language chats separately | A weekly review finds patterns automated monitoring won't |

## UAE Compliance: The Regulatory Risk a Successful Attack Creates

The technical harm is only half the exposure. If a successful injection causes customer data to leak, you are looking at a potential breach under Federal Decree-Law No. 45 of 2021, the UAE Personal Data Protection Law.

The UAE Data Office, established under Federal Decree-Law No. 44 of 2021, is the federal regulator that would investigate.

If your entity sits inside DIFC or ADGM, layer their own data-protection regimes on top of the federal PDPL. A chatbot handling customer records inside either free zone has to satisfy both. That is more paperwork, more notification obligations, and more reputational risk.

The comparative maths is straightforward. A regulatory investigation, or a customer-data story in Gulf News, costs far more than adding an Arabic-aware classifier and rerunning tests.

Security investment here is proportionate due diligence. The question is not whether to close the Arabic injection gap; it is how quickly.

If you want a second pair of eyes on where your bilingual chatbot is exposed, [book a free 30-minute consultation with Lenoo AI](/contact). We will tell you where Arabic and mixed-language inputs create real risk and give an honest recommendation.

## FAQ

### Can Arabic text really bypass the content filters on mainstream AI chatbots?

Yes. A researcher publicly reported bypassing multiple LLM safeguards, including Azure Content Filter, by switching payloads to Arabic and Thai, and collected $37,500 in bounties.

### What is Arabizi and why does it make prompt injection harder to detect?

Arabizi is Arabic in Latin characters, often with digits for Arabic letters that lack English equivalents. Arabic-script classifiers miss it; English classifiers do not parse it. That gap is where injection payloads hide from off-the-shelf filters.

### Does mixing Arabic and English in the same message increase the risk of a successful injection attack?

It can. Code-switching mid-sentence gives filters less coherent context, and safety training rarely mixes languages the way UAE customers do.

### How do I know if my chatbot has already been manipulated through an Arabic prompt injection?

Review recent Arabic and mixed-language conversations for anomalies: unusual discount offers, revealed internal instructions, wrong escalations. If you have no logs, that is the first fix; if you never review them in Arabic, the second.

### Which tools are available specifically for detecting prompt injection in Arabic-language inputs?

Ara-Prompt-Guard_V1 is a 0.3B-parameter classifier fine-tuned for Arabic prompt injection and jailbreak detection. It runs before your main LLM and flags prompts as safe or unsafe.

### Does UAE law require businesses to secure their chatbots against prompt injection?

The UAE PDPL (Federal Decree-Law No. 45 of 2021) governs personal data, and the UAE Data Office is the federal regulator. A data leak caused by an injection attack is still a data leak; DIFC and ADGM entities carry additional obligations.

### How does Arabic prompt injection relate to indirect prompt injection in documents my bot reads?

Indirect injection puts the payload inside a document, CRM note, or database field the bot ingests, not in the user's typed message. Arabic and Arabizi make this harder to catch: a document scanner or DLP built around English keywords will miss the same instruction in Arabic script.