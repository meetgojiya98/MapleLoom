---
{
  "title": "How to pass runtime secrets to runnables",
  "source_url": "https://python.langchain.com/docs/how_to/runnable_runtime_secrets/",
  "fetched_at": "2025-08-15T13:50:47.493953+00:00"
}
---

# How to pass runtime secrets to runnables

from
langchain_core
.
runnables
import
RunnableConfig
from
langchain_core
.
tools
import
tool
@tool
def
foo
(
x
:
int
,
config
:
RunnableConfig
)
-
>
int
:
"""Sum x and a secret int"""
return
x
+
config
[
"configurable"
]
[
"__top_secret_int"
]
foo
.
invoke
(
{
"x"
:
5
}
,
{
"configurable"
:
{
"__top_secret_int"
:
2
,
"traced_key"
:
"bar"
}
}
)
