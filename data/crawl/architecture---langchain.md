---
{
  "title": "Architecture | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/concepts/architecture/",
  "fetched_at": "2025-08-15T13:51:19.557878+00:00"
}
---

# Architecture | 🦜️🔗 LangChain

LangChain is a framework that consists of a number of packages.
langchain-core
​
This package contains base abstractions for different components and ways to compose them together.
The interfaces for core components like chat models, vector stores, tools and more are defined here.
No third-party integrations are defined here.
The dependencies are kept purposefully very lightweight.
langchain
​
The main
langchain
package contains chains and retrieval strategies that make up an application's cognitive architecture.
These are NOT third-party integrations.
All chains, agents, and retrieval strategies here are NOT specific to any one integration, but rather generic across all integrations.
Integration packages
​
Popular integrations have their own packages (e.g.
langchain-openai
,
langchain-anthropic
, etc) so that they can be properly versioned and appropriately lightweight.
For more information see:
This package contains third-party integrations that are maintained by the LangChain community.
Key integration packages are separated out (see above).
This contains integrations for various components (chat models, vector stores, tools, etc).
All dependencies in this package are optional to keep the package as lightweight as possible.
langgraph
​
langgraph
is an extension of
langchain
aimed at building robust and stateful multi-actor applications with LLMs by modeling steps as edges and nodes in a graph.
LangGraph exposes high level interfaces for creating common types of agents, as well as a low-level API for composing custom flows.
See our LangGraph overview
here
.
See our LangGraph Academy Course
here
.
langserve
​
A package to deploy LangChain chains as REST APIs. Makes it easy to get a production ready API up and running.
LangServe is designed to primarily deploy simple Runnables and work with well-known primitives in langchain-core.
If you need a deployment option for LangGraph, you should instead be looking at LangGraph Platform (beta) which will be better suited for deploying LangGraph applications.
For more information, see the
LangServe documentation
.
LangSmith
​
A developer platform that lets you debug, test, evaluate, and monitor LLM applications.
For more information, see the
LangSmith documentation
