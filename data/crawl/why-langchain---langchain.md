---
{
  "title": "Why LangChain? | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/concepts/why_langchain/",
  "fetched_at": "2025-08-15T13:51:49.619179+00:00"
}
---

# Why LangChain? | 🦜️🔗 LangChain

The goal of
langchain
the Python package and LangChain the company is to make it as easy as possible for developers to build applications that reason.
While LangChain originally started as a single open source package, it has evolved into a company and a whole ecosystem.
This page will talk about the LangChain ecosystem as a whole.
Most of the components within the LangChain ecosystem can be used by themselves - so if you feel particularly drawn to certain components but not others, that is totally fine! Pick and choose whichever components you like best for your own use case!
Features
​
There are several primary needs that LangChain aims to address:
Standardized component interfaces:
The growing number of
models
and
related components
for AI applications has resulted in a wide variety of different APIs that developers need to learn and use.
This diversity can make it challenging for developers to switch between providers or combine components when building applications.
LangChain exposes a standard interface for key components, making it easy to switch between providers.
Orchestration:
As applications become more complex, combining multiple components and models, there's
a growing need to efficiently connect these elements into control flows
that can
accomplish diverse tasks
.
Orchestration
is crucial for building such applications.
Observability and evaluation:
As applications become more complex, it becomes increasingly difficult to understand what is happening within them.
Furthermore, the pace of development can become rate-limited by the
paradox of choice
.
For example, developers often wonder how to engineer their prompt or which LLM best balances accuracy, latency, and cost.
Observability
and evaluations can help developers monitor their applications and rapidly answer these types of questions with confidence.
Standardized component interfaces
​
LangChain provides common interfaces for components that are central to many AI applications.
As an example, all
chat models
implement the
BaseChatModel
interface.
This provides a standard way to interact with chat models, supporting important but often provider-specific features like
tool calling
and
structured outputs
.
Example: chat models
​
Many
model providers
support
tool calling
, a critical feature for many applications (e.g.,
agents
), that allows a developer to request model responses that match a particular schema.
The APIs for each provider differ.
LangChain's
chat model
interface provides a common way to bind
tools
to a model in order to support
tool calling
:
tools
=
[
my_tool
]
model_with_tools
=
model
.
bind_tools
(
tools
)
Similarly, getting models to produce
structured outputs
is an extremely common use case.
Providers support different approaches for this, including
JSON mode or tool calling
, with different APIs.
LangChain's
chat model
interface provides a common way to produce structured outputs using the
with_structured_output()
method:
schema
=
.
.
.
model_with_structure
=
model
.
with_structured_output
(
schema
)
Example: retrievers
​
In the context of
RAG
and LLM application components, LangChain's
retriever
interface provides a standard way to connect to many different types of data services or databases (e.g.,
vector stores
or databases).
The underlying implementation of the retriever depends on the type of data store or database you are connecting to, but all retrievers implement the
runnable interface
, meaning they can be invoked in a common manner.
documents
=
my_retriever
.
invoke
(
"What is the meaning of life?"
)
Orchestration
​
While standardization for individual components is useful, we've increasingly seen that developers want to
combine
components into more complex applications.
This motivates the need for
orchestration
.
There are several common characteristics of LLM applications that this orchestration layer should support:
Complex control flow:
The application requires complex patterns such as cycles (e.g., a loop that reiterates until a condition is met).
Persistence
:
The application needs to maintain
short-term and / or long-term memory
.
Human-in-the-loop
:
The application needs human interaction, e.g., pausing, reviewing, editing, approving certain steps.
The recommended way to orchestrate components for complex applications is
LangGraph
.
LangGraph is a library that gives developers a high degree of control by expressing the flow of the application as a set of nodes and edges.
LangGraph comes with built-in support for
persistence
,
human-in-the-loop
,
memory
, and other features.
It's particularly well suited for building
agents
or
multi-agent
applications.
Importantly, individual LangChain components can be used as LangGraph nodes, but you can also use LangGraph
without
using LangChain components.
Have a look at our free course,
Introduction to LangGraph
, to learn more about how to use LangGraph to build complex applications.
Observability and evaluation
​
The pace of AI application development is often rate-limited by high-quality evaluations because there is a paradox of choice.
Developers often wonder how to engineer their prompt or which LLM best balances accuracy, latency, and cost.
High quality tracing and evaluations can help you rapidly answer these types of questions with confidence.
LangSmith
is our platform that supports observability and evaluation for AI applications.
See our conceptual guides on
evaluations
and
tracing
for more details.
Conclusion
​
LangChain offers standard interfaces for components that are central to many AI applications, which offers a few specific advantages:
Ease of swapping providers:
It allows you to swap out different component providers without having to change the underlying code.
Advanced features:
It provides common methods for more advanced features, such as
streaming
and
tool calling
.
LangGraph
makes it possible to orchestrate complex applications (e.g.,
agents
) and provide features like including
persistence
,
human-in-the-loop
, or
memory
.
LangSmith
makes it possible to iterate with confidence on your applications, by providing LLM-specific observability and framework for testing and evaluating your application.
