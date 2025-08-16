---
{
  "title": "Callbacks | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/concepts/callbacks/",
  "fetched_at": "2025-08-15T13:51:21.556534+00:00"
}
---

# Callbacks | 🦜️🔗 LangChain

Any
RunnableLambda
, a
RunnableGenerator
, or
Tool
that invokes other runnables
and is running
async
in python<=3.10, will have to propagate callbacks to child
objects manually. This is because LangChain cannot automatically propagate
callbacks to child objects in this case.
This is a common reason why you may fail to see events being emitted from custom
runnables or tools.
