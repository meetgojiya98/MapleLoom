---
{
  "title": "How to access the RunnableConfig from a tool",
  "source_url": "https://python.langchain.com/docs/how_to/tool_configure/",
  "fetched_at": "2025-08-15T13:51:05.540439+00:00"
}
---

# How to access the RunnableConfig from a tool

How to access the RunnableConfig from a tool
This guide assumes familiarity with the following concepts:
If you have a
tool
that calls
chat models
,
retrievers
, or other
runnables
, you may want to access internal events from those runnables or configure them with additional properties. This guide shows you how to manually pass parameters properly so that you can do this using the
astream_events()
method.
Tools are
runnables
, and you can treat them the same way as any other runnable at the interface level - you can call
invoke()
,
batch()
, and
stream()
on them as normal. However, when writing custom tools, you may want to invoke other runnables like chat models or retrievers. In order to properly trace and configure those sub-invocations, you'll need to manually access and pass in the tool's current
RunnableConfig
object. This guide show you some examples of how to do that.
This guide requires
langchain-core>=0.2.16
.
Inferring by parameter type
​
To access reference the active config object from your custom tool, you'll need to add a parameter to your tool's signature typed as
RunnableConfig
. When you invoke your tool, LangChain will inspect your tool's signature, look for a parameter typed as
RunnableConfig
, and if it exists, populate that parameter with the correct value.
Note:
The actual name of the parameter doesn't matter, only the typing.
To illustrate this, define a custom tool that takes a two parameters - one typed as a string, the other typed as
RunnableConfig
:
%
pip install
-
qU langchain_core
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
async
def
reverse_tool
(
text
:
str
,
special_config_param
:
RunnableConfig
)
-
>
str
:
"""A test tool that combines input text with a configurable parameter."""
return
(
text
+
special_config_param
[
"configurable"
]
[
"additional_field"
]
)
[
:
:
-
1
]
Then, if we invoke the tool with a
config
containing a
configurable
field, we can see that
additional_field
is passed through correctly:
await
reverse_tool
.
ainvoke
(
{
"text"
:
"abc"
}
,
config
=
{
"configurable"
:
{
"additional_field"
:
"123"
}
}
)
Next steps
​
You've now seen how to configure and stream events from within a tool. Next, check out the following guides for more on using tools:
You can also check out some more specific uses of tool calling:
