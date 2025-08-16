---
{
  "title": "Template applications",
  "source_url": "https://langchain-ai.github.io/langgraph/concepts/template_applications/",
  "fetched_at": "2025-08-15T13:52:34.868984+00:00"
}
---

# Template applications

Template Applications
Templates are open source reference applications designed to help you get started quickly when building with LangGraph. They provide working examples of common agentic workflows that can be customized to your needs.
You can create an application from a template using the LangGraph CLI.
Requirements
Python >= 3.11
LangGraph CLI
: Requires langchain-cli[inmem] >= 0.1.58
Install the LangGraph CLI
pip
install
"langgraph-cli[inmem]"
--upgrade
Or via
uv
(recommended):
uvx
--from
"langgraph-cli[inmem]"
langgraph
dev
--help
Available Templates
Template
Description
Link
New LangGraph Project
A simple, minimal chatbot with memory.
Repo
ReAct Agent
A simple agent that can be flexibly extended to many tools.
Repo
Memory Agent
A ReAct-style agent with an additional tool to store memories for use across threads.
Repo
Retrieval Agent
An agent that includes a retrieval-based question-answering system.
Repo
Data-Enrichment Agent
An agent that performs web searches and organizes its findings into a structured format.
Repo
🌱 Create a LangGraph App
To create a new app from a template, use the
langgraph new
command.
Or via
uv
(recommended):
uvx
--from
"langgraph-cli[inmem]"
langgraph
new
Next Steps
Review the
README.md
file in the root of your new LangGraph app for more information about the template and how to customize it.
After configuring the app properly and adding your API keys, you can start the app using the LangGraph CLI:
Or via
uv
(recommended):
uvx
--from
"langgraph-cli[inmem]"
--with-editable
.
langgraph
dev
Missing Local Package?
If you are not using
uv
and run into a "
ModuleNotFoundError
" or "
ImportError
", even after installing the local package (
pip install -e .
), it is likely the case that you need to install the CLI into your local virtual environment to make the CLI "aware" of the local package. You can do this by running
python -m pip install "langgraph-cli[inmem]"
and re-activating your virtual environment before running
langgraph dev
.
See the following guides for more information on how to deploy your app:
