---
{
  "title": "LangGraph",
  "source_url": "https://langchain-ai.github.io/langgraphjs/",
  "fetched_at": "2025-08-15T13:52:32.887859+00:00"
}
---

# LangGraph

🦜🕸️LangGraph.js
LangGraph — used by Replit, Uber, LinkedIn, GitLab and more — is a low-level orchestration framework for building controllable agents. While langchain provides integrations and composable components to streamline LLM application development, the LangGraph library enables agent orchestration — offering customizable architectures, long-term memory, and human-in-the-loop to reliably handle complex tasks.
npm
install
@langchain/langgraph
@langchain/core
To learn more about how to use LangGraph, check out
the docs
. We show a simple example below of how to create a ReAct agent.
// npm install @langchain-anthropic
import
{
createReactAgent
}
from
"@langchain/langgraph/prebuilt"
;
import
{
ChatAnthropic
}
from
"@langchain/anthropic"
;
import
{
tool
}
from
"@langchain/core/tools"
;
import
{
z
}
from
"zod"
;
const
search
=
tool
(
async
({
query
})
=>
{
if
(
query
.
toLowerCase
().
includes
(
"sf"
)
||
query
.
toLowerCase
().
includes
(
"san francisco"
)
)
{
return
"It's 60 degrees and foggy."
;
}
return
"It's 90 degrees and sunny."
;
},
{
name
:
"search"
,
description
:
"Call to surf the web."
,
schema
:
z.object
({
query
:
z.string
().
describe
(
"The query to use in your search."
),
}),
}
);
const
model
=
new
ChatAnthropic
({
model
:
"claude-3-7-sonnet-latest"
,
});
const
agent
=
createReactAgent
({
llm
:
model
,
tools
:
[
search
],
});
const
result
=
await
agent
.
invoke
({
messages
:
[
{
role
:
"user"
,
content
:
"what is the weather in sf"
,
},
],
});
Full-stack Quickstart
Get started quickly by building a full-stack LangGraph application using the
create-agent-chat-app
CLI:
npx
create-agent-chat-app@latest
The CLI sets up a chat interface and helps you configure your application, including:
🧠 Choice of 4 prebuilt agents (ReAct, Memory, Research, Retrieval)
🌐 Frontend framework (Next.js or Vite)
📦 Package manager (
npm
,
yarn
, or
pnpm
)
Why use LangGraph?
LangGraph is built for developers who want to build powerful, adaptable AI agents. Developers choose LangGraph for:
Reliability and controllability.
Steer agent actions with moderation checks and human-in-the-loop approvals. LangGraph persists context for long-running workflows, keeping your agents on course.
Low-level and extensible.
Build custom agents with fully descriptive, low-level primitives – free from rigid abstractions that limit customization. Design scalable multi-agent systems, with each agent serving a specific role tailored to your use case.
First-class streaming support.
With token-by-token streaming and streaming of intermediate steps, LangGraph gives users clear visibility into agent reasoning and actions as they unfold in real time.
LangGraph is trusted in production and powering agents for companies like:
Klarna
: Customer support bot for 85 million active users
Elastic
: Security AI assistant for threat detection
Uber
: Automated unit test generation
Replit
: Code generation
And many more (
see list here
)
LangGraph’s ecosystem
While LangGraph can be used standalone, it also integrates seamlessly with any LangChain product, giving developers a full suite of tools for building agents. To improve your LLM application development, pair LangGraph with:
LangSmith
— Helpful for agent evals and observability. Debug poor-performing LLM app runs, evaluate agent trajectories, gain visibility in production, and improve performance over time.
LangGraph Platform
— Deploy and scale agents effortlessly with a purpose-built deployment platform for long running, stateful workflows. Discover, reuse, configure, and share agents across teams — and iterate quickly with visual prototyping in
LangGraph Studio
.
Pairing with LangGraph Platform
While LangGraph is our open-source agent orchestration framework, enterprises that need scalable agent deployment can benefit from
LangGraph Platform
.
LangGraph Platform can help engineering teams:
Accelerate agent development
: Quickly create agent UXs with configurable templates and
LangGraph Studio
for visualizing and debugging agent interactions.
Deploy seamlessly
: We handle the complexity of deploying your agent. LangGraph Platform includes robust APIs for memory, threads, and cron jobs plus auto-scaling task queues & servers.
Centralize agent management & reusability
: Discover, reuse, and manage agents across the organization. Business users can also modify agents without coding.
Additional resources
LangChain Forum
: Connect with the community and share all of your technical questions, ideas, and feedback.
LangChain Academy
: Learn the basics of LangGraph in our free, structured course.
Tutorials
: Simple walkthroughs with guided examples on getting started with LangGraph.
Templates
: Pre-built reference apps for common agentic workflows (e.g. ReAct agent, memory, retrieval etc.) that can be cloned and adapted.
How-to Guides
: Quick, actionable code snippets for topics such as streaming, adding memory & persistence, and design patterns (e.g. branching, subgraphs, etc.).
API Reference
: Detailed reference on core classes, methods, how to use the graph and checkpointing APIs, and higher-level prebuilt components.
Built with LangGraph
: Hear how industry leaders use LangGraph to ship powerful, production-ready AI applications.
Acknowledgements
LangGraph is inspired by
Pregel
and
Apache Beam
. The public interface draws inspiration from
NetworkX
. LangGraph is built by LangChain Inc, the creators of LangChain, but can be used without LangChain.
