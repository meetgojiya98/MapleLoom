---
{
  "title": "How to use tools in a chain",
  "source_url": "https://python.langchain.com/docs/how_to/tools_chain/",
  "fetched_at": "2025-08-15T13:48:52.307912+00:00"
}
---

# How to use tools in a chain

How to use tools in a chain
In this guide, we will go over the basic ways to create Chains and Agents that call
Tools
. Tools can be just about anything — APIs, functions, databases, etc. Tools allow us to extend the capabilities of a model beyond just outputting text/messages. The key to using models with tools is correctly prompting a model and parsing its response so that it chooses the right tools and provides the right inputs for them.
Setup
​
We'll need to install the following packages for this guide:
%
pip install
-
-
upgrade
-
-
quiet langchain
If you'd like to trace your runs in
LangSmith
uncomment and set the following environment variables:
First, we need to create a tool to call. For this example, we will create a custom tool from a function. For more information on creating custom tools, please see
this guide
.
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
first_int
:
int
,
second_int
:
int
)
-
>
int
:
"""Multiply two integers together."""
return
first_int
*
second_int
print
(
multiply
.
name
)
print
(
multiply
.
description
)
print
(
multiply
.
args
)
multiply
Multiply two integers together.
{'first_int': {'title': 'First Int', 'type': 'integer'}, 'second_int': {'title': 'Second Int', 'type': 'integer'}}
multiply
.
invoke
(
{
"first_int"
:
4
,
"second_int"
:
5
}
)
Chains
​
If we know that we only need to use a tool a fixed number of times, we can create a chain for doing so. Let's create a simple chain that just multiplies user-specified numbers.
One of the most reliable ways to use tools with LLMs is with
tool calling
APIs (also sometimes called function calling). This only works with models that explicitly support tool calling. You can see which models support tool calling
here
, and learn more about how to use tool calling in
this guide
.
First we'll define our model and tools. We'll start with just a single tool,
multiply
.
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
We'll use
bind_tools
to pass the definition of our tool in as part of each call to the model, so that the model can invoke the tool when appropriate:
llm_with_tools
=
llm
.
bind_tools
(
[
multiply
]
)
When the model invokes the tool, this will show up in the
AIMessage.tool_calls
attribute of the output:
msg
=
llm_with_tools
.
invoke
(
"whats 5 times forty two"
)
msg
.
tool_calls
[{'name': 'multiply',
'args': {'first_int': 5, 'second_int': 42},
'id': 'call_8QIg4QVFVAEeC1orWAgB2036',
'type': 'tool_call'}]
Check out the
LangSmith trace here
.
Great! We're able to generate tool invocations. But what if we want to actually call the tool? To do so we'll need to pass the generated tool args to our tool. As a simple example we'll just extract the arguments of the first tool_call:
from
operator
import
itemgetter
chain
=
llm_with_tools
|
(
lambda
x
:
x
.
tool_calls
[
0
]
[
"args"
]
)
|
multiply
chain
.
invoke
(
"What's four times 23"
)
Check out the
LangSmith trace here
.
Agents
​
Chains are great when we know the specific sequence of tool usage needed for any user input. But for certain use cases, how many times we use tools depends on the input. In these cases, we want to let the model itself decide how many times to use tools and in what order.
Agents
let us do just this.
We'll demonstrate a simple example using a LangGraph agent. See
this tutorial
for more detail.
!pip install
-
qU langgraph
from
langgraph
.
prebuilt
import
create_react_agent
Agents are also great because they make it easy to use multiple tools.
@tool
def
add
(
first_int
:
int
,
second_int
:
int
)
-
>
int
:
"Add two integers."
return
first_int
+
second_int
@tool
def
exponentiate
(
base
:
int
,
exponent
:
int
)
-
>
int
:
"Exponentiate the base to the exponent power."
return
base
**
exponent
tools
=
[
multiply
,
add
,
exponentiate
]
agent
=
create_react_agent
(
llm
,
tools
)
With an agent, we can ask questions that require arbitrarily-many uses of our tools:
query
=
(
"Take 3 to the fifth power and multiply that by the sum of twelve and "
"three, then square the whole result."
)
input_message
=
{
"role"
:
"user"
,
"content"
:
query
}
for
step
in
agent
.
stream
(
{
"messages"
:
[
input_message
]
}
,
stream_mode
=
"values"
)
:
step
[
"messages"
]
[
-
1
]
.
pretty_print
(
)
================================[1m Human Message [0m=================================
Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result.
==================================[1m Ai Message [0m==================================
Tool Calls:
exponentiate (call_EHGS8gnEVNCJQ9rVOk11KCQH)
Call ID: call_EHGS8gnEVNCJQ9rVOk11KCQH
Args:
base: 3
exponent: 5
add (call_s2cxOrXEKqI6z7LWbMUG6s8c)
Call ID: call_s2cxOrXEKqI6z7LWbMUG6s8c
Args:
first_int: 12
second_int: 3
=================================[1m Tool Message [0m=================================
Name: add
15
==================================[1m Ai Message [0m==================================
Tool Calls:
multiply (call_25v5JEfDWuKNgmVoGBan0d7J)
Call ID: call_25v5JEfDWuKNgmVoGBan0d7J
Args:
first_int: 243
second_int: 15
=================================[1m Tool Message [0m=================================
Name: multiply
3645
==================================[1m Ai Message [0m==================================
Tool Calls:
exponentiate (call_x1yKEeBPrFYmCp2z5Kn8705r)
Call ID: call_x1yKEeBPrFYmCp2z5Kn8705r
Args:
base: 3645
exponent: 2
=================================[1m Tool Message [0m=================================
Name: exponentiate
13286025
==================================[1m Ai Message [0m==================================
The final result of taking 3 to the fifth power, multiplying it by the sum of twelve and three, and then squaring the whole result is **13,286,025**.
Check out the
LangSmith trace here
.
