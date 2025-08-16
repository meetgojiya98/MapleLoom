---
{
  "title": "Introduction | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/tutorials/",
  "fetched_at": "2025-08-15T13:48:38.411095+00:00"
}
---

# Introduction | 🦜️🔗 LangChain

Introduction
LangChain
is a framework for developing applications powered by large language models (LLMs).
LangChain simplifies every stage of the LLM application lifecycle:
Concretely, the framework consists of the following open-source libraries:
langchain-core
: Base abstractions and LangChain Expression Language.
langchain-community
: Third party integrations.
Partner packages (e.g.
langchain-openai
,
langchain-anthropic
, etc.): Some integrations have been further split into their own lightweight packages that only depend on
langchain-core
.
langchain
: Chains, agents, and retrieval strategies that make up an application's cognitive architecture.
langgraph
: Build robust and stateful multi-actor applications with LLMs by modeling steps as edges and nodes in a graph.
langserve
: Deploy LangChain chains as REST APIs.
The broader ecosystem includes:
LangSmith
: A developer platform that lets you debug, test, evaluate, and monitor LLM applications and seamlessly integrates with LangChain.
Get started
​
We recommend following our
Quickstart
guide to familiarize yourself with the framework by building your first LangChain application.
See here
for instructions on how to install LangChain, set up your environment, and start building.
These docs focus on the Python LangChain library.
Head here
for docs on the JavaScript LangChain library.
Use cases
​
If you're looking to build something specific or are more of a hands-on learner, check out our
use-cases
.
They're walkthroughs and techniques for common end-to-end tasks, such as:
Expression Language
​
LangChain Expression Language (LCEL) is the foundation of many of LangChain's components, and is a declarative way to compose chains. LCEL was designed from day 1 to support putting prototypes in production, with no code changes, from the simplest “prompt + LLM” chain to the most complex chains.
Ecosystem
​
Trace and evaluate your language model applications and intelligent agents to help you move from prototype to production.
Build stateful, multi-actor applications with LLMs, built on top of (and intended to be used with) LangChain primitives.
Deploy LangChain runnables and chains as REST APIs.
Read up on our
Security
best practices to make sure you're developing safely with LangChain.
Additional resources
​
LangChain provides standard, extendable interfaces and integrations for many different components, including:
LangChain is part of a rich ecosystem of tools that integrate with our framework and build on top of it. Check out our growing list of
integrations
.
Best practices for developing with LangChain.
Head to the reference section for full documentation of all classes and methods in the LangChain and LangChain Experimental Python packages.
Check out the developer's guide for guidelines on contributing and help getting your dev environment set up.
