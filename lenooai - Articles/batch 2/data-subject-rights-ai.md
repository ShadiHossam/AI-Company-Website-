---
locale: en-AE
site: lenooai.com
url: "/blog/data-subject-rights-ai/"
slug: "data-subject-rights-ai"
title: "Data Subject Rights in AI Systems Under the UAE PDPL: How Companies Must Handle Access and Deletion"
meta_title: "Data Subject Rights AI: UAE PDPL Compliance Guide"
meta_description: "Data subject rights AI compliance under UAE PDPL: how to handle access and deletion requests across training data, model weights, and inference logs."
main_keyword: "data subject rights ai"
cluster: "UAE Compliance, PDPL & Data"
level: "Supporting"
intent: "MOFU"
batch: "B03"
plan_order: 108
author: "Shadi Hossam"
author_url: /about
published: 2026-08-24
source: lenoo-pipeline
run: "run 414"
serp: "serper"
qa:
  words: 1747
  faqs: 7
  dashes: 0
  issues:
    - "H1 does not contain the main keyword"
    - "main keyword absent from the first 100 words"
---

# Data Subject Rights in AI Systems Under the UAE PDPL: How Companies Must Handle Access and Deletion

Under the UAE PDPL, data subject rights in AI systems mean any resident can ask your company for a copy of their personal data, correct or delete it, or object to how it is used, whether that data sits in a spreadsheet or a machine learning model.

Federal Decree-Law No. 45 of 2021 does not carve out AI. If you run a chatbot, a scoring model, or a fine-tuned LLM on UAE customer data, these obligations already apply to you.

## Key Takeaways

- **PDPL rights apply fully to AI systems** — Federal Decree-Law No. 45 of 2021 grants UAE residents rights of access, correction, deletion, and objection. These apply the same way whether a human employee or an automated system handles the data, including chatbots, scoring models, and fine-tuned LLMs.
- **Personal data hides in three places** — Training datasets, model weights, and inference logs each hold personal data, and pre-processing usually leaves the original data upstream in the training store. A single deletion request can require a different technical response for each system component: dataset, weights, and logs.
- **Deleting the database row is not enough** — A model is not considered anonymous when personal data can be extracted from its weights through probing or membership inference. Deleting the database row does not satisfy an erasure request if the weights can still reproduce that person's data on the right prompt.
- **Requests arrive on WhatsApp, in Arabic** — UAE intake reality means requests come in Arabic, English, or mixed inside one message, often via WhatsApp. A workflow that routes only English email through a webform misses them while the response clock still runs, so log every submission by timestamp and channel and acknowledge within one business day in both languages.
- **Cross-border deletion is your responsibility** — If your model provider or hosting sits outside the UAE, you must route a matching deletion instruction to them under your data processing contract, and cross-border transfer rules also apply. Handle this in the contract before you sign, not after.
## What the PDPL Grants: Data Subject Rights That Apply to AI

The rights sit in Federal Decree-Law No. 45 of 2021 and cover access, correction, deletion, restriction of processing, and objection.

They apply the same way whether a human employee handles the file or an automated system does. If a UAE resident's data feeds your recommendation engine, that person can request a copy, ask you to fix an error, or demand erasure.

The federal enforcement body is the UAE Data Office, established by Federal Decree-Law No. 44 of 2021.

It receives complaints and can issue guidance on how the PDPL applies to specific processing patterns, including AI. Ignore a request and the complaint route ends at that office.

A common mistake: UAE teams copy-paste compliance workflows from ICO or CNIL guidance because those European regulators publish extensive AI material in English.

Those frameworks are built for GDPR, not the PDPL. They do not name the UAE Data Office, they do not reflect UAE consent mechanics, and they assume a regulatory culture the UAE does not share.

For the broader picture of what the PDPL asks of AI-deploying companies, see our PDPL guide for companies deploying AI.

## Where Personal Data Hides Inside an AI System

Personal data does not sit in one place inside an AI system. It sits in at least three.

The first is the raw training dataset: customer records, chat transcripts, images, whatever you fed the model to teach it. The second is the model itself, meaning the weights that training produced. The third is inference logs: prompts users typed, outputs the system returned, and any metadata captured at runtime.

Pre-processing complicates the picture. Before training, data is often transformed, for instance by rescaling numbers into values between zero and one, or by tokenising text. The transformed version is what touches the model, but the original personal data usually still sits upstream in the training store.

The larger complication is the model. A model that is not considered anonymous, where personal data can be extracted from the weights through probing or membership inference, contains personal data under law. Data subject rights attach to that model as much as to the dataset, so a single erasure request can touch the intake log, training file, weights, and inference logs, each needing a different technical response.

## Responding to Access Requests: What Data Your System Must Produce

An access request obliges you to hand the individual, free of charge, a copy of all personal data you process about them. That copy can include extracts from your training datasets where necessary to exercise their other rights, for example to see what the model was trained on before asking for deletion.

The split is between data you can pull from structured stores (databases, CRMs, ticket systems, inference logs with user IDs) and data embedded in model weights.

Structured stores are a query. Weights are not. You cannot dump a model and hand the person the rows about them, because the weights do not store rows.

What you can do is disclose which datasets the person's records were part of, what the model was trained to do, and whether it is used to make decisions about them.

UAE intake reality shapes the workflow. Requests arrive on WhatsApp, in Arabic, in English, or mixed inside one message.

If the workflow routes only English email through a webform, the request never reaches the right person, and the clock still runs. Document every response: what you provided, what you withheld, and on what legal ground. If the UAE Data Office asks later, the file is your answer.

Not sure your intake catches a bilingual WhatsApp request? [Talk to Lenoo AI](https://lenooai.com) about where the gaps are before one lands.

## Responding to Deletion Requests: The Erasure Challenge in AI Models

Deletion is the harder request. Data subjects must be able to exercise erasure on both the training datasets and on any AI model that is not considered anonymous. Deleting the row from the database does not satisfy the request if the weights can still reproduce the person's data on the right prompt.

Three technical responses exist, each with a different cost profile:

- **Output suppression.** Filter the individual's data out at inference time so the model refuses or redacts it. Cheap, fast, reversible, but does not touch the weights.
- **Machine unlearning.** Reduce the influence of a specific record on a trained model without a full retrain. Promising for some architectures, not a silver bullet across the board.
- **Retraining.** Rebuild the model from a training set that excludes the person's data. Most defensible legally, most expensive operationally.

Lawful derogations exist. If the processing is required or authorised by UAE law, you may be able to refuse or restrict the request.

When that applies, document the legal basis in the file: silent non-response is not a defensible position. For a realistic picture of what enforcement costs when you get this wrong, see our [PDPL penalties](/blog/pdpl-penalties-uae/) note.

The three technical responses trade cost against how completely they remove the data.

| Method | What it does | Touches the weights | Cost and defensibility |
|---|---|---|---|
| Output suppression | Filters the data out at inference time | No | Cheap, fast, reversible |
| Machine unlearning | Reduces one record's influence without a full retrain | Partially | Promising, not a silver bullet everywhere |
| Retraining | Rebuilds the model from a dataset excluding the person | Yes | Most defensible, most expensive operationally |

## Building a Compliant Request Workflow for UAE AI Deployments

A workflow that holds up has four stages: intake, triage, jurisdictional check, closure.

**Intake.** Publish a WhatsApp number and an email address dedicated to data subject requests.

Log every submission with a timestamp and channel. Acknowledge receipt in both Arabic and English within one business day. The acknowledgement is not the response; it is the audit trail proving the clock started when you say it did.

**Triage.** Identify the request type, trace which AI systems hold data about the individual, and assign ownership to the relevant controller or processor. If your model provider or hosting sits outside the UAE, a cross-border obligation is now also in play. What that means for a deletion request is covered in our piece on cross-border transfers.

**Jurisdictional check.** Companies inside the DIFC or ADGM operate under the free zone's own data protection regime on top of the federal PDPL. The free zone regulator gets involved before the UAE Data Office does. If that is you, see how the DIFC and ADGM regimes stack against the federal PDPL.

**Closure.** Send a substantive written response within the statutory deadline, in the language the person wrote to you in. Document what technical action you took on each system component (dataset, weights, logs). Retain the request record as part of your PDPL audit file.

[Book a free 30-minute call with Lenoo AI](/contact) to map where personal data sits across your AI systems and where your current request-handling process would break down. If a gap does not need fixing now, we will tell you.

## FAQ

### Does the UAE PDPL cover automated decision-making and AI profiling the same way GDPR does?
Not identically. The PDPL gives residents rights over how their data is used by AI, but it does not replicate GDPR's Article 22 word for word, so do not assume EU case law on profiling automatically maps onto how the UAE Data Office will interpret similar processing.

### How long does a UAE company have to respond to a data subject access request under the PDPL?
The PDPL sets its response window through implementing regulations, so confirm the operative period against the current text rather than borrowing from GDPR. Acknowledge every request within one business day and respond substantively as fast as you defensibly can.

### Can personal data embedded in AI model weights actually be erased, or is full retraining the only option?
Not always retraining. Output suppression can satisfy the request in some contexts, machine unlearning is still emerging, and retraining is the most defensible option but rarely proportionate for a single record.

### What should a UAE business do if it receives a deletion request but its AI model is hosted by a provider based abroad?
Route a matching deletion instruction to the provider under your data processing contract. If they process UAE personal data outside the UAE, cross-border rules also apply and shape what you can promise the requester. Handle this in the contract before you sign, not after.

### Does the PDPL apply if my AI system is deployed inside the DIFC or ADGM free zone?
The free zone regime applies first: DIFC Data Protection Law inside the DIFC, ADGM Data Protection Regulations inside the ADGM. Cross-jurisdictional flows can pull the federal PDPL in as well, so a single request may sit under two regimes at once.

### What identity verification is required before a UAE company hands over data in response to an access request?
Verify enough to be reasonably certain the requester is the person the data is about, and no more. Emirates ID is the standard identity document for UAE residents, and a signed authorisation is required when a lawyer or agent submits on someone else's behalf.

### What are the consequences for a UAE company that ignores or delays a data subject's deletion request?
Complaints go to the UAE Data Office, which can investigate, order compliance, and impose administrative fines. An ignored request rarely stays private in a market where reputation moves quickly through WhatsApp and social channels.