---
{
  "title": "How-to guides | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/how_to/",
  "fetched_at": "2025-08-15T13:48:51.276713+00:00"
}
---

# How-to guides | 🦜️🔗 LangChain

Here you’ll find answers to “How do I….?” types of questions.
These guides are
goal-oriented
and
concrete
; they're meant to help you complete a specific task.
For conceptual explanations see the
Conceptual guide
.
For end-to-end walkthroughs see
Tutorials
.
For comprehensive descriptions of every class and function see the
API Reference
.
Installation
​
Key features
​
This highlights functionality that is core to using LangChain.
Components
​
These are the core building blocks you can use when building applications.
Chat models
​
Chat Models
are newer forms of language models that take messages in and output a message.
See
supported integrations
for details on getting started with chat models from a specific provider.
Messages
​
Messages
are the input and output of chat models. They have some
content
and a
role
, which describes the source of the message.
Prompt templates
​
Prompt Templates
are responsible for formatting user input into a format that can be passed to a language model.
Example selectors
​
Example Selectors
are responsible for selecting the correct few shot examples to pass to the prompt.
LLMs
​
What LangChain calls
LLMs
are older forms of language models that take a string in and output a string.
Output parsers
​
Output Parsers
are responsible for taking the output of an LLM and parsing into more structured format.
Document loaders
​
Document Loaders
are responsible for loading documents from a variety of sources.
Text splitters
​
Text Splitters
take a document and split into chunks that can be used for retrieval.
Embedding models
​
Embedding Models
take a piece of text and create a numerical representation of it.
See
supported integrations
for details on getting started with embedding models from a specific provider.
Vector stores
​
Vector stores
are databases that can efficiently store and retrieve embeddings.
See
supported integrations
for details on getting started with vector stores from a specific provider.
Retrievers
​
Retrievers
are responsible for taking a query and returning relevant documents.
Indexing
​
Indexing is the process of keeping your vectorstore in-sync with the underlying data source.
LangChain
Tools
contain a description of the tool (to pass to the language model) as well as the implementation of the function to call. Refer
here
for a list of pre-built tools.
Multimodal
​
Agents
​
For in depth how-to guides for agents, please check out
LangGraph
documentation.
Callbacks
​
Callbacks
allow you to hook into the various stages of your LLM application's execution.
Custom
​
All of LangChain components can easily be extended to support your own versions.
Serialization
​
Use cases
​
These guides cover use-case specific details.
Q&A with RAG
​
Retrieval Augmented Generation (RAG) is a way to connect LLMs to external sources of data.
For a high-level tutorial on RAG, check out
this guide
.
Extraction is when you use LLMs to extract structured information from unstructured text.
For a high level tutorial on extraction, check out
this guide
.
Chatbots
​
Chatbots involve using an LLM to have a conversation.
For a high-level tutorial on building chatbots, check out
this guide
.
Query analysis
​
Query Analysis is the task of using an LLM to generate a query to send to a retriever.
For a high-level tutorial on query analysis, check out
this guide
.
Q&A over SQL + CSV
​
You can use LLMs to do question answering over tabular data.
For a high-level tutorial, check out
this guide
.
Q&A over graph databases
​
You can use an LLM to do question answering over graph databases.
For a high-level tutorial, check out
this guide
.
Summarization
​
LLMs can summarize and otherwise distill desired information from text, including
large volumes of text. For a high-level tutorial, check out
this guide
.
LangChain Expression Language (LCEL)
​
LCEL is an orchestration solution. See our
concepts page
for recommendations on when to
use LCEL.
LangChain Expression Language
is a way to create arbitrary custom chains. It is built on the
Runnable
protocol.
LCEL cheatsheet
: For a quick overview of how to use the main LCEL primitives.
Migration guide
: For migrating legacy chain abstractions to LCEL.
LangGraph is an extension of LangChain aimed at
building robust and stateful multi-actor applications with LLMs by modeling steps as edges and nodes in a graph.
LangGraph documentation is currently hosted on a separate site.
You can peruse
LangGraph how-to guides here
.
LangSmith allows you to closely trace, monitor and evaluate your LLM application.
It seamlessly integrates with LangChain and LangGraph, and you can use it to inspect and debug individual steps of your chains and agents as you build.
LangSmith documentation is hosted on a separate site.
You can peruse
LangSmith how-to guides here
, but we'll highlight a few sections that are particularly
relevant to LangChain below:
Evaluation
​
Evaluating performance is a vital part of building LLM-powered applications.
LangSmith helps with every step of the process from creating a dataset to defining metrics to running evaluators.
To learn more, check out the
LangSmith evaluation how-to guides
.
Tracing
​
Tracing gives you observability inside your chains and agents, and is vital in diagnosing issues.
You can see general tracing-related how-tos
in this section of the LangSmith docs
.
