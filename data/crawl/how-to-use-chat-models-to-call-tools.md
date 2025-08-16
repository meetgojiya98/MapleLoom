---
{
  "title": "How to use chat models to call tools",
  "source_url": "https://python.langchain.com/docs/how_to/tool_calling/",
  "fetched_at": "2025-08-15T13:51:02.570872+00:00"
}
---

# How to use chat models to call tools

How to use chat models to call tools
This guide assumes familiarity with the following concepts:
Tool calling
allows a chat model to respond to a given prompt by "calling a tool".
Remember, while the name "tool calling" implies that the model is directly performing some action, this is actually not the case! The model only generates the arguments to a tool, and actually running the tool (or not) is up to the user.
Tool calling is a general technique that generates structured output from a model, and you can use it even when you don't intend to invoke any tools. An example use-case of that is
extraction from unstructured text
.
If you want to see how to use the model-generated tool call to actually run a tool
check out this guide
.
LangChain implements standard interfaces for defining tools, passing them to LLMs, and representing tool calls.
This guide will cover how to bind tools to an LLM, then invoke the LLM to generate these arguments.
For a model to be able to call tools, we need to pass in tool schemas that describe what the tool does and what it's arguments are. Chat models that support tool calling features implement a
.bind_tools()
method for passing tool schemas to the model. Tool schemas can be passed in as Python functions (with typehints and docstrings), Pydantic models, TypedDict classes, or LangChain
Tool objects
. Subsequent invocations of the model will pass in these tool schemas along with the prompt.
Python functions
​
Our tool schemas can be Python functions:
def
add
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
"""Add two integers.
Args:
a: First integer
b: Second integer
"""
return
a
+
b
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
"""Multiply two integers.
Args:
a: First integer
b: Second integer
"""
return
a
*
b
LangChain also implements a
@tool
decorator that allows for further control of the tool schema, such as tool names and argument descriptions. See the how-to guide
here
for details.
Pydantic class
​
You can equivalently define the schemas without the accompanying functions using
Pydantic
.
Note that all fields are
required
unless provided a default value.
from
pydantic
import
BaseModel
,
Field
class
add
(
BaseModel
)
:
"""Add two integers."""
a
:
int
=
Field
(
.
.
.
,
description
=
"First integer"
)
b
:
int
=
Field
(
.
.
.
,
description
=
"Second integer"
)
class
multiply
(
BaseModel
)
:
"""Multiply two integers."""
a
:
int
=
Field
(
.
.
.
,
description
=
"First integer"
)
b
:
int
=
Field
(
.
.
.
,
description
=
"Second integer"
)
TypedDict class
​
Requires
langchain-core>=0.2.25
Or using TypedDicts and annotations:
from
typing_extensions
import
Annotated
,
TypedDict
class
add
(
TypedDict
)
:
"""Add two integers."""
a
:
Annotated
[
int
,
.
.
.
,
"First integer"
]
b
:
Annotated
[
int
,
.
.
.
,
"Second integer"
]
class
multiply
(
TypedDict
)
:
"""Multiply two integers."""
a
:
Annotated
[
int
,
.
.
.
,
"First integer"
]
b
:
Annotated
[
int
,
.
.
.
,
"Second integer"
]
tools
=
[
add
,
multiply
]
To actually bind those schemas to a chat model, we'll use the
.bind_tools()
method. This handles converting
the
add
and
multiply
schemas to the proper format for the model. The tool schema will then be passed it in each time the model is invoked.
pip install -qU "langchain[google-genai]"
import
getpass
import
os
if
not
os
.
environ
.
get
(
"GOOGLE_API_KEY"
)
:
os
.
environ
[
"GOOGLE_API_KEY"
]
=
getpass
.
getpass
(
"Enter API key for Google Gemini: "
)
from
langchain
.
chat_models
import
init_chat_model
llm
=
init_chat_model
(
"gemini-2.5-flash"
,
model_provider
=
"google_genai"
)
llm_with_tools
=
llm
.
bind_tools
(
tools
)
query
=
"What is 3 * 12?"
llm_with_tools
.
invoke
(
query
)
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_iXj4DiW1p7WLjTAQMRO0jxMs', 'function': {'arguments': '{"a":3,"b":12}', 'name': 'multiply'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 17, 'prompt_tokens': 80, 'total_tokens': 97}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_483d39d857', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-0b620986-3f62-4df7-9ba3-4595089f9ad4-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_iXj4DiW1p7WLjTAQMRO0jxMs', 'type': 'tool_call'}], usage_metadata={'input_tokens': 80, 'output_tokens': 17, 'total_tokens': 97})
As we can see our LLM generated arguments to a tool! You can look at the docs for
bind_tools()
to learn about all the ways to customize how your LLM selects tools, as well as
this guide on how to force the LLM to call a tool
rather than letting it decide.
If tool calls are included in a LLM response, they are attached to the corresponding
message
or
message chunk
as a list of
tool call
objects in the
.tool_calls
attribute.
Note that chat models can call multiple tools at once.
A
ToolCall
is a typed dict that includes a
tool name, dict of argument values, and (optionally) an identifier. Messages with no
tool calls default to an empty list for this attribute.
query
=
"What is 3 * 12? Also, what is 11 + 49?"
llm_with_tools
.
invoke
(
query
)
.
tool_calls
[{'name': 'multiply',
'args': {'a': 3, 'b': 12},
'id': 'call_1fyhJAbJHuKQe6n0PacubGsL',
'type': 'tool_call'},
{'name': 'add',
'args': {'a': 11, 'b': 49},
'id': 'call_fc2jVkKzwuPWyU7kS9qn1hyG',
'type': 'tool_call'}]
The
.tool_calls
attribute should contain valid tool calls. Note that on occasion,
model providers may output malformed tool calls (e.g., arguments that are not
valid JSON). When parsing fails in these cases, instances
of
InvalidToolCall
are populated in the
.invalid_tool_calls
attribute. An
InvalidToolCall
can have
a name, string arguments, identifier, and error message.
Parsing
​
If desired,
output parsers
can further process the output. For example, we can convert existing values populated on the
.tool_calls
to Pydantic objects using the
PydanticToolsParser
:
from
langchain_core
.
output_parsers
import
PydanticToolsParser
from
pydantic
import
BaseModel
,
Field
class
add
(
BaseModel
)
:
"""Add two integers."""
a
:
int
=
Field
(
.
.
.
,
description
=
"First integer"
)
b
:
int
=
Field
(
.
.
.
,
description
=
"Second integer"
)
class
multiply
(
BaseModel
)
:
"""Multiply two integers."""
a
:
int
=
Field
(
.
.
.
,
description
=
"First integer"
)
b
:
int
=
Field
(
.
.
.
,
description
=
"Second integer"
)
chain
=
llm_with_tools
|
PydanticToolsParser
(
tools
=
[
add
,
multiply
]
)
chain
.
invoke
(
query
)
[multiply(a=3, b=12), add(a=11, b=49)]
Next steps
​
Now you've learned how to bind tool schemas to a chat model and have the model call the tool.
Next, check out this guide on actually using the tool by invoking the function and passing the results back to the model:
You can also check out some more specific uses of tool calling:
