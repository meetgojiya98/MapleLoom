---
{
  "title": "Ragas",
  "source_url": "https://docs.ragas.io/en/stable/",
  "fetched_at": "2025-08-15T13:48:30.141763+00:00"
}
---

# Ragas

✨ Introduction
Ragas is a library that provides tools to supercharge the evaluation of Large Language Model (LLM) applications. It is designed to help you evaluate your LLM applications with ease and confidence.
🚀
Get Started
Install with
pip
and get started with Ragas with these tutorials.
Get Started
📚
Core Concepts
In depth explanation and discussion of the concepts and working of different features available in Ragas.
Core Concepts
🛠️
How-to Guides
Practical guides to help you achieve a specific goals. Take a look at these
guides to learn how to use Ragas to solve real-world problems.
How-to Guides
📖
References
Technical descriptions of how Ragas classes and methods work.
References
Frequently Asked Questions
→
What is the best open-source model to use?
There isn't a single correct answer to this question. With the rapid pace of AI model development, new open-source models are released every week, often claiming to outperform previous versions. The best model for your needs depends largely on your GPU capacity and the type of data you're working with.
It's a good idea to explore newer, widely accepted models with strong general capabilities. You can refer to
this list
for available open-source models, their release dates, and fine-tuned variants.
→
Why do NaN values appear in evaluation results?
NaN stands for "Not a Number." In ragas evaluation results, NaN can appear for two main reasons:
JSON Parsing Issue:
The model's output is not JSON-parsable. ragas requires models to output JSON-compatible responses because all prompts are structured using Pydantic. This ensures efficient parsing of LLM outputs.
Non-Ideal Cases for Scoring:
Certain cases in the sample may not be ideal for scoring. For example, scoring the faithfulness of a response like "I don't know" might not be appropriate.
→
How can I make evaluation results more explainable?
The best way is to trace and log your evaluation, then inspect the results using LLM traces. You can follow a detailed example of this process
here
.
July 2, 2025
March 23, 2025
GitHub
+2
