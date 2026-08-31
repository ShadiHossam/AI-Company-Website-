---
locale: en-AE
site: lenooai.com
url: "/blog/arabic-llm-benchmarks/"
slug: "arabic-llm-benchmarks"
title: "What Arabic LLM Benchmarks Do and Do Not Tell You"
meta_title: "Arabic LLM Benchmarks: What They Do and Don't Tell You"
meta_description: "A UAE buyer's guide to Arabic LLM benchmarks: what OALL, AlGhafa, ACVA and ABB actually measure, and where leaderboard rankings mislead."
main_keyword: "arabic llm benchmarks"
cluster: "Arabic & Bilingual AI (in English)"
level: "Supporting"
intent: "MOFU"
batch: "B05"
plan_order: 209
author: "Shadi Hossam"
author_url: /about
published: 2026-08-25
source: lenoo-pipeline
run: "run 427"
serp: "serper"
qa:
  words: 2154
  faqs: 7
  dashes: 0
  issues:
    - "word count 2154 exceeds the 1748-word limit"
    - "invented links (not in any candidate list): https://nanda.media.mit.edu/ai_report_2025.pdf"
    - "13 paragraph(s) exceed 3 sentences"
    - "repair pass failed: claude CLI timed out after 900s"
---

# What Arabic LLM Benchmarks Do and Do Not Tell You

Arabic LLM benchmarks are useful as a first filter and dangerous as a final answer. They can tell you which models cleared a floor on Modern Standard Arabic reading comprehension. They cannot tell you how a model will handle a Gulf-dialect WhatsApp message from a customer chasing a VAT invoice, mixing Arabic, English and the occasional Arabizi vowel. If you are picking a model for a UAE business, that gap is the whole game.

This piece reads the four dominant Arabic benchmark frameworks (OALL, AlGhafa, ACVA and ABB) from the buyer's seat, not the benchmark builder's. What are the scores actually measuring? What conditions produced them? And where do they stop being predictive of production performance?

## Key Takeaways

- **Leaderboards hide which skill a model actually has** — Benchmarks split into Knowledge and STEM, NLP Tasks, Culture and Dialects, and Target-Specific categories, but most headline rankings collapse all four into a single score that hides where a model excels or fails.
- **The four major benchmarks aren't interchangeable** — OALL aggregates several test suites with automated scoring, AlGhafa mixes 11 native Arabic datasets with 11 translated English ones, ACVA draws 58 datasets from the AceGPT paper, and ABB (SILMA.AI) scores 470 human-validated questions across 64 datasets in 22 categories using 20+ manual rules plus LLM-as-Judge — different origins and methods mean scores don't compare across leaderboards.
- **Scores default to formal Arabic, not Gulf dialect** — Most core evaluation tasks default to Modern Standard Arabic, and Culture and Dialects scores rarely feature in headline rankings, so no public benchmark models the Gulf-dialect, Arabic-English and Arabizi mix that dominates real UAE WhatsApp conversations.
- **No benchmark tests your documents or compliance context** — Trade licences, Emirates IDs, VAT invoices, PDPL (Federal Decree-Law No. 45 of 2021) obligations and DIFC or ADGM rules fall outside every public test set. Only an internal test on your own data can show how a model handles them.
- **Treat leaderboards as a filter, not a verdict** — Filter by the task category relevant to your use case, check which specific dataset produced the score, then confirm the choice with your own test set of real business documents and conversations before committing.
## What Arabic LLM Benchmarks Are Actually Testing

Before trusting a leaderboard number, you need to know which of four very different things it is measuring. The TII survey behind the current Arabic-LLM-Benchmarks taxonomy organises tests into four categories: Knowledge and STEM, NLP Tasks, Culture and Dialects, and Target-Specific evaluations. A single aggregate score collapses all four and hides where a model is strong or weak.

Knowledge benchmarks evaluate acquired knowledge and reasoning, plus domain-specific fields like law and medicine. NLP Tasks cover the classic building blocks: reading comprehension, sentiment analysis, question answering. Culture and Dialects assesses cultural knowledge and dialect understanding, which is the category most relevant to UAE deployments and, ironically, the one most underweighted when a leaderboard is boiled down to one number.

Target-Specific is where the properties a business operator actually cares about live: safety, hallucination detection, instruction-following and vision capabilities. Those matter directly for a customer-support bot, a document reader or a compliance assistant. They rarely surface in the top-line ranking a buyer skims first.

## OALL, AlGhafa, ACVA and ABB: What Each Benchmark Is

Four names dominate almost every Arabic-LLM ranking you will read. They are not interchangeable.

The Open Arabic LLM Leaderboard (OALL) was published by the Technology Innovation Institute on 14 May 2024, designed to address the growing need for specialised benchmarks serving over 380 million Arabic speakers worldwide. It is an aggregator: several underlying test suites, one leaderboard.

AlGhafa, created by the TII LLM team, was initially introduced with 11 native Arabic datasets covering reading comprehension, sentiment analysis and question answering. It was later extended with 11 more datasets that are translations of widely adopted English NLP benchmarks. The distinction matters: a strong AlGhafa score on the native half means something different from a strong score on the translated half.

ACVA features 58 datasets from the AceGPT paper ("AceGPT, Localizing Large Language Models in Arabic") and focuses on Arabic-specific cultural and linguistic tasks.

The Arabic Broad Benchmark (ABB), developed by SILMA.AI, features 470 high-quality, human-validated questions drawn from 64 datasets across 22 categories, evaluated using 20+ manual rules combined with a customised LLM-as-Judge method. That is a fundamentally different evaluation approach from OALL's automated scoring. Neither is universally more accurate; they measure different things in different ways.

Each benchmark comes from a different publisher and leans on its own mix of datasets and scoring method, which is why their scores don't translate directly into one another.

| Benchmark | Published By | Dataset Basis | Evaluation Method |
|---|---|---|---|
| OALL | Technology Innovation Institute | Aggregates several underlying test suites | Automated scoring |
| AlGhafa | TII LLM team | 11 native Arabic datasets plus 11 translated English datasets | Automated scoring |
| ACVA | AceGPT paper authors | 58 datasets on Arabic culture and language | Automated scoring |
| ABB | SILMA.AI | 470 human-validated questions from 64 datasets, 22 categories | 20+ manual rules plus LLM-as-Judge |

## Why Benchmark Hardware Makes Scores Harder to Compare Than They Look

Scores are tied to test conditions your production stack will almost never match. That alone should make you cautious about reading a leaderboard as a final verdict.

On ABB's leaderboard, all models on Hugging Face are benchmarked using the same hardware setup: an A100 GPU and a batch size of 1. Change the hardware, change the batching, and relative rankings shift. For models with over 15 billion parameters, multiple GPUs are used. So the biggest models, the ones you would most likely want to consider for a serious deployment, are not evaluated under conditions a typical UAE business would run them in. The infrastructure gap between benchmark conditions and real deployment is a separate problem in its own right; we cover it in [running Arabic models in the UAE: hosting, cost and latency](/blog/host-arabic-llm-uae/).

Then there is the translation issue. Several benchmarks include Arabic versions of English staples like MMLU. Translated benchmarks carry translation artefacts, and a model can score well by matching the shape of translated English rather than genuinely understanding Arabic. Two models with the same headline number can be doing very different things underneath.

## The MSA Problem: What Benchmarks Miss About Gulf Arabic

Culture and Dialects is a named category. In practice, most core evaluation tasks default to Modern Standard Arabic, and dialect scores rarely feature prominently in the headline rankings buyers actually see.

UAE customers do not write in MSA. They write in Arabic, English, and a mix of both in the same message, sometimes in Arabizi. No current public benchmark models this mixed-channel reality at any real volume. WhatsApp is the primary customer channel for UAE businesses, and a model evaluated only on formal MSA reading comprehension gives you no signal about how it will handle an informal Gulf-dialect message asking why a delivery is late.

This is why real-world testing on your own conversations is not optional. It is also why the picture on any given task is often more nuanced than the leaderboard suggests. A well-prompted global model can sometimes beat a regional one on the tasks you care about, and sometimes the reverse; we walk through where each wins in [when a global model with good prompting beats a regional one](/blog/gpt-vs-jais-arabic/).

## What a Top Leaderboard Rank Cannot Tell a UAE Business Operator

Assume for a moment that model X sits at the top of every Arabic leaderboard. Here is what that ranking still does not tell you.

It does not tell you how model X handles the documents your business actually deals with every day: trade licences, Emirates IDs, VAT invoices and Arabic-English mixed PDFs where both languages sit on the same page. No public benchmark tests that document mix at scale.

It does not tell you how model X behaves under UAE regulatory constraints. PDPL (Federal Decree-Law No. 45 of 2021), DIFC's regime and ADGM's rules govern what you can do with customer data. No leaderboard score covers whether the model quietly retains something it should not.

Target-Specific benchmarks include hallucination detection in principle. The test sets, though, are not drawn from Gulf business domains. A model can pass and still hallucinate on your contracts, your product catalogue, or the specific phrasing your industry uses. For a side-by-side view of how the major models actually behave on Arabic business tasks that matter in the UAE, see [Jais vs Falcon vs GPT vs Claude for Arabic business AI](/blog/arabic-llm-comparison/).

## How to Read Leaderboard Rankings Without Being Misled

Treat the leaderboard as a filter, not a verdict. A few disciplined habits change what you take away from it.

Filter results by the task category relevant to your use case. A customer-support bot needs strong NLP Tasks and Culture and Dialects scores, not top marks in STEM knowledge benchmarks. A legal research tool wants the opposite.

Check which specific benchmark dataset produced the score. A high AlGhafa result on translated datasets is a different claim from a high score on the 11 native Arabic datasets, even though both roll into the same headline number.

Know the methodology. ABB uses 20+ manual rules combined with an LLM-as-Judge method. OALL uses automated scoring. Neither is universally better. Knowing which produced a score is as important as the score itself.

Ask whether the benchmark data was created natively in Arabic or translated from English. Translation artefacts inflate some model scores in ways that do not reflect real language understanding. On paper, two models look equal. In production, one collapses on your first dialect query.

## Running Your Own Evaluation Before You Commit to a Model

Public benchmarks cannot answer the only question that matters: will this model work on our data, in our channels, for our customers? You have to answer that yourself.

Start from the sobering baseline. [95% of enterprise AI pilots produce no measurable P&L return](https://nanda.media.mit.edu/ai_report_2025.pdf). Trusting a leaderboard position without an internal test puts a deployment squarely in that majority. Build a test set from your own real business documents and conversations before committing to any model. A hundred well-chosen examples beat a thousand generic ones.

Test explicitly for dialect. Include Gulf Arabic inputs, mixed Arabic-English inputs and Arabizi, not just formal MSA text. This is the fastest way to see the gap between a benchmark score and production performance on your actual customer messages.

Remember that generation quality and retrieval quality are separate problems. Arabic search and embeddings break in different ways from generation, and a model that writes well can still retrieve badly. Evaluate the retrieval layer independently; we cover how in [Arabic embeddings and search: the layer everyone gets wrong](/blog/arabic-embeddings-search/).

Document your evaluation criteria before testing begins. Same questions, same format, same rubric for every candidate. Inconsistent internal testing produces misleading results just as public benchmarks can. Written criteria also give you a paper trail your compliance team will thank you for later.

## Talk to Someone Before You Pick a Model

If you would rather not run the whole evaluation cold, [book a free 30-minute consultation](/contact). We will tell you which Arabic models are worth testing for your specific use case, and honestly, whether any of them are the right fit yet or you are better off waiting a quarter.

## FAQ

### Which Arabic LLM benchmark is most reliable for choosing a model for a UAE business use case?

None of them is reliable on its own. OALL, AlGhafa, ACVA and ABB each measure different things with different methods, and none tests Gulf-dialect WhatsApp messages, UAE trade licences or PDPL-sensitive workflows. Use whichever benchmark best matches your task category as a shortlist, then run your own evaluation on real business data.

### What is the difference between OALL, AlGhafa, ACVA and ABB benchmarks?

OALL is an aggregate leaderboard published by TII that pulls in multiple test suites. AlGhafa contributes 11 native Arabic datasets plus 11 translated ones. ACVA adds 58 datasets from the AceGPT paper focused on Arabic-specific cultural and linguistic tasks. ABB, built by SILMA.AI, uses 470 human-validated questions from 64 datasets across 22 categories and evaluates with 20+ manual rules plus an LLM-as-Judge method, which is a different methodology from OALL's automated scoring.

### Do Arabic benchmark scores reflect how well a model handles Gulf dialect and mixed Arabic-English input?

Not really. Most benchmark tasks default to Modern Standard Arabic. Culture and Dialects exists as a category, but its scores rarely dominate headline rankings, and no widely used public benchmark models the Gulf-dialect, Arabic-English and Arabizi mix that characterises real UAE customer messages on WhatsApp.

### Why might a top-ranked Arabic LLM underperform on real business documents in the UAE?

Because benchmarks do not test on UAE documents. Trade licences, Emirates IDs, VAT invoices and Arabic-English mixed PDFs sit outside the public test sets. A model can top a leaderboard and still hallucinate on your contracts or misread the fields on a scanned invoice.

### Are benchmark scores affected by the hardware used during evaluation, and does that matter for my deployment?

Yes. ABB standardises on an A100 GPU with a batch size of 1, and for models over 15 billion parameters, multiple GPUs are used. That is rarely how you will run inference in production, and relative rankings can shift as hardware and batching change. Treat scores as directional, not absolute.

### How do I run my own Arabic LLM evaluation when public benchmarks do not cover my industry or use case?

Assemble a test set from your own real business documents and conversations, including Gulf-dialect, mixed-language and Arabizi inputs. Write down your evaluation criteria and rubric before testing, then score every candidate model against the same questions. Evaluate retrieval quality separately from generation quality.

### Should I use benchmark rankings to compare Jais, Falcon, and GPT for Arabic business tasks?

Use rankings to build a shortlist, not to pick a winner. Benchmarks tell you which models have cleared a floor on MSA tasks; they will not tell you which one handles your specific documents, dialect mix and compliance context best. That decision needs an internal test on your own data.