---
{
  "title": "Tool calling | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/concepts/tool_calling/",
  "fetched_at": "2025-08-15T13:51:45.623762+00:00"
}
---

# Tool calling | 🦜️🔗 LangChain

Overview
​
Many AI applications interact directly with humans. In these cases, it is appropriate for models to respond in natural language.
But what about cases where we want a model to also interact
directly
with systems, such as databases or an API?
These systems often have a particular input schema; for example, APIs frequently have a required payload structure.
This need motivates the concept of
tool calling
. You can use
tool calling
to request model responses that match a particular schema.
You will sometimes hear the term
function calling
. We use this term interchangeably with
tool calling
.
Key concepts
​
Tool Creation:
Use the
@tool
decorator to create a
tool
. A tool is an association between a function and its schema.
Tool Binding:
The tool needs to be connected to a model that supports tool calling. This gives the model awareness of the tool and the associated input schema required by the tool.
Tool Calling:
When appropriate, the model can decide to call a tool and ensure its response conforms to the tool's input schema.
Tool Execution:
The tool can be executed using the arguments provided by the model.
Recommended usage
​
This pseudocode illustrates the recommended workflow for using tool calling.
Created tools are passed to
.bind_tools()
method as a list.
This model can be called, as usual. If a tool call is made, model's response will contain the tool call arguments.
The tool call arguments can be passed directly to the tool.
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
response
=
model_with_tools
.
invoke
(
user_input
)
The recommended way to create a tool is using the
@tool
decorator.
from
langchain_core
.
tools
import
tool
@tool
def
multiply
(
a
:
int
,
b
:
int
)
-
>
int
:
"""Multiply a and b."""
return
a
*
b
Many
model providers
support tool calling.
The central concept to understand is that LangChain provides a standardized interface for connecting tools to models.
The
.bind_tools()
method can be used to specify which tools are available for a model to call.
model_with_tools
=
model
.
bind_tools
(
tools_list
)
As a specific example, let's take a function
multiply
and bind it as a tool to a model that supports tool calling.
def
multiply
(
a
:
int
,
b
:
int
)
-
>
int
:
"""Multiply a and b.
Args:
a: first int
b: second int
"""
return
a
*
b
llm_with_tools
=
tool_calling_model
.
bind_tools
(
[
multiply
]
)
A key principle of tool calling is that the model decides when to use a tool based on the input's relevance. The model doesn't always need to call a tool.
For example, given an unrelated input, the model would not call the tool:
result
=
llm_with_tools
.
invoke
(
"Hello world!"
)
The result would be an
AIMessage
containing the model's response in natural language (e.g., "Hello!").
However, if we pass an input
relevant to the tool
, the model should choose to call it:
result
=
llm_with_tools
.
invoke
(
"What is 2 multiplied by 3?"
)
As before, the output
result
will be an
AIMessage
.
But, if the tool was called,
result
will have a
tool_calls
attribute
.
This attribute includes everything needed to execute the tool, including the tool name and input arguments:
result.tool_calls
[{'name': 'multiply', 'args': {'a': 2, 'b': 3}, 'id': 'xxx', 'type': 'tool_call'}]
For more details on usage, see our
how-to guides
!
Tools
implement the
Runnable
interface, which means that they can be invoked (e.g.,
tool.invoke(args)
) directly.
LangGraph
offers pre-built components (e.g.,
ToolNode
) that will often invoke the tool in behalf of the user.
By default, the model has the freedom to choose which tool to use based on the user's input. However, in certain scenarios, you might want to influence the model's decision-making process. LangChain allows you to enforce tool choice (using
tool_choice
), ensuring the model uses either a particular tool or
any
tool from a given list. This is useful for structuring the model's behavior and guiding it towards a desired outcome.
Best practices
​
When designing
tools
to be used by a model, it is important to keep in mind that:
Models that have explicit
tool-calling APIs
will be better at tool calling than non-fine-tuned models.
Models will perform better if the tools have well-chosen names and descriptions.
Simple, narrowly scoped tools are easier for models to use than complex tools.
Asking the model to select from a large list of tools poses challenges for the model.
