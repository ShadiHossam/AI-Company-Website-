---
locale: en-AE
site: lenooai.com
url: "/blog/ai-data-flow-mapping/"
slug: "ai-data-flow-mapping"
title: "AI Data Flow Mapping: Prompts, Transcripts, Embeddings and Logs Under UAE's PDPL"
meta_title: "AI Data Flow Mapping Under UAE PDPL: A Practical Guide"
meta_description: "How to map AI prompts, transcripts, embeddings and logs under UAE's Federal Decree-Law No. 45 of 2021, and what each row of your map has to prove."
main_keyword: "ai data flow mapping"
cluster: "UAE Compliance, PDPL & Data"
level: "Supporting"
intent: "MOFU"
batch: "B03"
plan_order: 116
author: "Shadi Hossam"
author_url: /about
published: 2026-08-24
source: lenoo-pipeline
run: "run 415"
serp: "serper"
qa:
  words: 1738
  faqs: 6
  dashes: 0
  issues: []
---

# AI Data Flow Mapping: Prompts, Transcripts, Embeddings and Logs Under UAE's PDPL

Every AI tool your team uses moves personal data somewhere. A chat prompt goes to a model provider. A transcript sits in a vector database.

An embedding lands in storage you may not own. A log persists in a monitoring system for months. If you cannot show a compliance reviewer where each asset lives and on what basis, you have a PDPL problem.

Ai data flow mapping closes that gap. Under Federal Decree-Law No. 45 of 2021, a UAE data controller must know what personal data flows where, why, and whether it crosses a border.

This article walks through what to map, how to treat the four asset types AI stacks create, and what the map has to prove.

## Key Takeaways

- **AI data splits into four distinct assets** — Prompts carry the highest PII density of any AI asset because users paste in raw data. Transcripts keep long retention for quality reviews. Embeddings aren't legally anonymised since source text can often be reconstructed from the vectors. Logs stay personal data through metadata like user IDs and timestamps, even when content is stripped.
- **Zero-retention agreements exclude training, not logs** — They typically exclude your inputs from training the provider's model, but inference logs, temporary caches and safety-monitoring records kept for abuse detection can still be retained and still need a row on the map.
- **Every data flow needs a documented legal basis** — Federal Decree-Law No. 45 of 2021 requires a ground such as consent, legitimate interest or contractual necessity for each flow, including API calls sending prompts to processors outside the UAE. "We use AI" is not one.
- **DIFC and ADGM add their own rules** — Free zone entities sit under DIFC or ADGM data protection regimes on top of the federal PDPL, so each row must note which perimeter — federal, DIFC or ADGM — the flow crosses.
- **Update the map before any change ships** — A new AI tool, model upgrade, integration or switched provider changes what data moves where. Update the map before that change goes live, not during a quarterly review.
## What AI Data Flow Mapping Actually Means for UAE Compliance

Ai data flow mapping, done properly, is a compliance document. It records, for every AI-related flow of personal data, the processing purpose, the legal basis, the storage location, the retention period and the processor involved.

That is a different artefact from an architecture diagram, which shows how components connect. The architecture diagram answers engineering questions. The compliance map answers regulatory ones.

The four asset types (prompts, transcripts, embeddings and logs) each carry a different personal data profile and trigger different obligations. Mapping them as one bucket hides the risk. Treated separately, each row forces a specific answer: what data, who processes it, where it sits, on what basis.

Federal Decree-Law No. 45 of 2021 (the UAE's PDPL) requires controllers to know this. An AI stack without a documented map cannot demonstrate compliance with the accountability principle the law builds on.

The UAE Data Office, established by Federal Decree-Law No. 44 of 2021, is the federal enforcement body. Companies in DIFC or ADGM sit under those free zones' own regimes, so the perimeter question matters before you write the first row.

## The Four Asset Types and What Personal Data Each One Carries

**Prompts** are the text your users or systems send to a model. They carry the highest PII density of any AI asset because people paste in whatever they need help with: customer names, Emirates ID numbers, health details, contract terms, salary figures. Unless scrubbed, treat a prompt as personal data.

**Transcripts** are the full record of prompt and response together. Retention periods are often long because product teams keep them for quality reviews and fine-tuning. Every transcript captures both input and output, which compounds disclosure risk.

**Embeddings** are numerical vectors that encode source text for search and retrieval. They are not anonymised in any legally meaningful sense. Recent research shows the original text can often be reconstructed from vectors, so an embedding of a customer document is still, for PDPL purposes, that customer document.

**Logs** are the metadata trail: timestamps, user IDs, session identifiers, sometimes IP addresses. Even when logging systems strip prompt content, the metadata itself remains personal data under the PDPL. A user ID tied to a session tied to a timestamp is identifiable.

Setting the four asset types side by side makes the risk differences easier to track.

| Asset Type | What It Contains | Personal Data Risk |
|---|---|---|
| Prompts | Text sent to the model, often raw user input | Highest PII density of any AI asset |
| Transcripts | Full record of prompt and response together | Long retention for quality reviews and fine-tuning |
| Embeddings | Numerical vectors encoding source text | Not anonymised; original text can be reconstructed |
| Logs | Metadata trail: timestamps, user IDs, session identifiers | Metadata remains personal data even without content |

## What Federal Decree-Law No. 45 of 2021 Requires Each Row of Your Map to Show

For every flow, the law wants a legal basis: consent, legitimate interest, contractual necessity or another ground under the PDPL. "We use AI" is not one. Each asset needs its own answer, because the basis covering a transcript may not cover an embedding of the same content.

Data minimisation is the second question every row has to answer. Do you actually need the full prompt sent to the provider, or would a redacted version do the job?

Does the transcript need to persist for ninety days, or would seven be enough? PDPL expects controllers to justify the volume and duration of what they process.

Cross-border transfer is where most AI stacks trip. Any asset routed to infrastructure outside the UAE, including a routine API call to a US-hosted model, triggers the PDPL's international transfer rules.

Every such flow needs an explicit entry with the transfer mechanism. If your entity is in DIFC or ADGM, note which perimeter each flow crosses. Federal law, DIFC law and ADGM law can apply to different flows in the same company.

## Tracing Where Each Asset Actually Lands: Data Residency for UAE AI Workloads

An API call to a commercial model provider is not a black box on your map. It routes the prompt (and usually the response) to the provider's own infrastructure, which is typically hosted outside the UAE.

Write that flow down: source system, destination provider, region, retention. The map has to state what actually happens, not what your team assumes.

Residency questions look different for each asset type. Raw transcripts in your own database sit under your control. Embeddings in a third-party vector database sit under a processor's control.

Inference logs retained by a provider sit outside your infrastructure entirely and may have different retention terms than transcripts. Each needs its own row, location entry and transfer flag.

## Model Provider Agreements: What They Cover and What Still Shows on Your Map

A zero-retention agreement with a model provider is useful but narrower than the phrase suggests. It typically excludes your inputs from training the provider's models. It does not necessarily prevent short-term inference logs, temporary caches, or safety-monitoring records retained for abuse detection.

For each provider, pull the DPA and check four things: the sub-processor list, deletion timelines by data type, audit rights and confirmation of transfer mechanisms acceptable under UAE PDPL. If any is missing, the row stays flagged.

Annotate every asset with a clear "covered by DPA / not covered" flag. That single column is what a legal reviewer will read first. It makes the gap between contractual promise and reality visible.

## How to Build the Map: A Practical Starting Point for UAE Businesses

Start by listing every AI touchpoint in your stack. Input channels first: chat interfaces, WhatsApp integrations, email assistants, internal copilots, voice tools. Then processing, storage and outputs.

Assign each touchpoint to one of the four asset types. For each row, document six things: data type, legal basis, retention period, geographic storage location, processor name, and whether a signed DPA is in place. Do not accept "unknown" as a final answer.

Flag every cross-border flow for a transfer impact assessment before closing the map. A flow with no documented legal basis is a live PDPL exposure. For teams figuring out how AI fits their operations, [getting started with AI in Dubai](/blog/getting-started-with-ai-dubai) is a useful step back.

If any of this feels heavier than your team can carry on its own, [book a free 30-minute consultation](/contact) and walk through your current AI stack with us.

## Turning the Map Into Decisions: What to Do Once You Have It

Use the map to review vendor DPAs against actual flows. Gaps between contract wording and operational reality are where PDPL exposure concentrates. If a DPA lists sub-processors not on your map, or your map shows a flow to a region the DPA does not authorise, that is the first email of the week.

Update your privacy notice to reflect AI processing. Users must be told their data is processed by AI systems, who the processors are, and whether data leaves the UAE. The map provides that language.

Share the map with legal and compliance leads as the primary input for a PDPL gap analysis. Reconstructing flows from memory during an audit is slow and error-prone. A current map turns that review into an hour of reading.

Treat the map as a living document. Any new AI tool, model upgrade or integration triggers a map update before the tool goes live.

If you want a second pair of eyes on your current map, [talk to us about your AI stack](https://lenooai.com).

## FAQ

### Do prompts sent to an AI model count as personal data under the UAE PDPL?

Yes. Prompts commonly contain names, Emirates IDs, health details or financial figures pasted by users, which puts them inside the PDPL definition. Unless you have a scrubbing step, treat prompts as personal data.

### What is an AI embedding and does it fall within Federal Decree-Law No. 45 of 2021?

An embedding is a numerical vector encoding source text for search. Embeddings are not anonymised in any legally safe sense, since original content can often be reconstructed from the vector. If the source text was personal data, treat the embedding the same way.

### Is a formal AI data flow map a legal requirement under UAE law?

The PDPL does not use the phrase, but it requires controllers to demonstrate accountability and know the legal basis for every flow of personal data. A map makes those obligations demonstrable. Without one, an AI stack cannot show a regulator what it does.

### What are the PDPL implications if my AI model provider stores data on servers outside the UAE?

Any routing of personal data outside the UAE is a cross-border transfer under the PDPL and needs a documented transfer mechanism. That applies to every API call to an offshore model. The map must flag such flows.

### Does a zero-retention agreement mean I no longer need to map those data flows?

No. A zero-retention agreement excludes your inputs from training, but the provider may still hold inference logs, safety records or caches. Data still leaves the UAE at the API call, and the map must reflect that.

### How often should I update my AI data flow map?

Every time. A new tool, model, integration or switched provider changes what data moves where. Update the map before the change goes live, not in a quarterly review.