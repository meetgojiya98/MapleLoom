---
{
  "title": "How to add ad-hoc tool calling capability to LLMs and Chat Models",
  "source_url": "https://python.langchain.com/docs/how_to/tools_prompting/",
  "fetched_at": "2025-08-15T13:49:15.388385+00:00"
}
---

# How to add ad-hoc tool calling capability to LLMs and Chat Models

How to add ad-hoc tool calling capability to LLMs and Chat Models
Some models have been fine-tuned for tool calling and provide a dedicated API for tool calling. Generally, such models are better at tool calling than non-fine-tuned models, and are recommended for use cases that require tool calling. Please see the
how to use a chat model to call tools
guide for more information.
This guide assumes familiarity with the following concepts:
In this guide, we'll see how to add
ad-hoc
tool calling support to a chat model. This is an alternative method to invoke tools if you're using a model that does not natively support
tool calling
.
We'll do this by simply writing a prompt that will get the model to invoke the appropriate tools. Here's a diagram of the logic:
Setup
​
We'll need to install the following packages:
%
pip install
-
-
upgrade
-
-
quiet langchain langchain
-
community
If you'd like to use LangSmith, uncomment the below:
You can select any of the given models for this how-to guide. Keep in mind that most of these models already
support native tool calling
, so using the prompting strategy shown here doesn't make sense for these models, and instead you should follow the
how to use a chat model to call tools
guide.
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
model
=
init_chat_model
(
"gemini-2.5-flash"
,
model_provider
=
"google_genai"
)
To illustrate the idea, we'll use
phi3
via Ollama, which does
NOT
have native support for tool calling. If you'd like to use
Ollama
as well follow
these instructions
.
from
langchain_community
.
llms
import
Ollama
model
=
Ollama
(
model
=
"phi3"
)
First, let's create an
add
and
multiply
tools. For more information on creating custom tools, please see
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
x
:
float
,
y
:
float
)
-
>
float
:
"""Multiply two numbers together."""
return
x
*
y
@tool
def
add
(
x
:
int
,
y
:
int
)
-
>
int
:
"Add two numbers."
return
x
+
y
tools
=
[
multiply
,
add
]
for
t
in
tools
:
print
(
"--"
)
print
(
t
.
name
)
print
(
t
.
description
)
print
(
t
.
args
)
--
multiply
Multiply two numbers together.
{'x': {'title': 'X', 'type': 'number'}, 'y': {'title': 'Y', 'type': 'number'}}
--
add
Add two numbers.
{'x': {'title': 'X', 'type': 'integer'}, 'y': {'title': 'Y', 'type': 'integer'}}
multiply
.
invoke
(
{
"x"
:
4
,
"y"
:
5
}
)
Creating our prompt
​
We'll want to write a prompt that specifies the tools the model has access to, the arguments to those tools, and the desired output format of the model. In this case we'll instruct it to output a JSON blob of the form
{"name": "...", "arguments": {...}}
.
from
langchain_core
.
output_parsers
import
JsonOutputParser
from
langchain_core
.
prompts
import
ChatPromptTemplate
from
langchain_core
.
tools
import
render_text_description
rendered_tools
=
render_text_description
(
tools
)
print
(
rendered_tools
)
multiply(x: float, y: float) -> float - Multiply two numbers together.
add(x: int, y: int) -> int - Add two numbers.
system_prompt
=
f"""\
You are an assistant that has access to the following set of tools.
Here are the names and descriptions for each tool:
{
rendered_tools
}
Given the user input, return the name and input of the tool to use.
Return your response as a JSON blob with 'name' and 'arguments' keys.
The `arguments` should be a dictionary, with keys corresponding
to the argument names and the values corresponding to the requested values.
"""
prompt
=
ChatPromptTemplate
.
from_messages
(
[
(
"system"
,
system_prompt
)
,
(
"user"
,
"{input}"
)
]
)
chain
=
prompt
|
model
message
=
chain
.
invoke
(
{
"input"
:
"what's 3 plus 1132"
}
)
if
isinstance
(
message
,
str
)
:
print
(
message
)
else
:
print
(
message
.
content
)
{
"name": "add",
"arguments": {
"x": 3,
"y": 1132
}
}
Adding an output parser
​
We'll use the
JsonOutputParser
for parsing our models output to JSON.
from
langchain_core
.
output_parsers
import
JsonOutputParser
chain
=
prompt
|
model
|
JsonOutputParser
(
)
chain
.
invoke
(
{
"input"
:
"what's thirteen times 4"
}
)
{'name': 'multiply', 'arguments': {'x': 13.0, 'y': 4.0}}
🎉 Amazing! 🎉 We now instructed our model on how to
request
that a tool be invoked.
Now, let's create some logic to actually run the tool!
Now that the model can request that a tool be invoked, we need to write a function that can actually invoke
the tool.
The function will select the appropriate tool by name, and pass to it the arguments chosen by the model.
from
typing
import
Any
,
Dict
,
Optional
,
TypedDict
from
langchain_core
.
runnables
import
RunnableConfig
class
ToolCallRequest
(
TypedDict
)
:
"""A typed dict that shows the inputs into the invoke_tool function."""
name
:
str
arguments
:
Dict
[
str
,
Any
]
def
invoke_tool
(
tool_call_request
:
ToolCallRequest
,
config
:
Optional
[
RunnableConfig
]
=
None
)
:
"""A function that we can use the perform a tool invocation.
Args:
tool_call_request: a dict that contains the keys name and arguments.
The name must match the name of a tool that exists.
The arguments are the arguments to that tool.
config: This is configuration information that LangChain uses that contains
things like callbacks, metadata, etc.See LCEL documentation about RunnableConfig.
Returns:
output from the requested tool
"""
tool_name_to_tool
=
{
tool
.
name
:
tool
for
tool
in
tools
}
name
=
tool_call_request
[
"name"
]
requested_tool
=
tool_name_to_tool
[
name
]
return
requested_tool
.
invoke
(
tool_call_request
[
"arguments"
]
,
config
=
config
)
Let's test this out 🧪!
invoke_tool
(
{
"name"
:
"multiply"
,
"arguments"
:
{
"x"
:
3
,
"y"
:
5
}
}
)
Let's put it together
​
Let's put it together into a chain that creates a calculator with add and multiplication capabilities.
chain
=
prompt
|
model
|
JsonOutputParser
(
)
|
invoke_tool
chain
.
invoke
(
{
"input"
:
"what's thirteen times 4.14137281"
}
)
It can be helpful to return not only tool outputs but also tool inputs. We can easily do this with LCEL by
RunnablePassthrough.assign
-ing the tool output. This will take whatever the input is to the RunnablePassrthrough components (assumed to be a dictionary) and add a key to it while still passing through everything that's currently in the input:
from
langchain_core
.
runnables
import
RunnablePassthrough
chain
=
(
prompt
|
model
|
JsonOutputParser
(
)
|
RunnablePassthrough
.
assign
(
output
=
invoke_tool
)
)
chain
.
invoke
(
{
"input"
:
"what's thirteen times 4.14137281"
}
)
{'name': 'multiply',
'arguments': {'x': 13, 'y': 4.14137281},
'output': 53.83784653}
What's next?
​
This how-to guide shows the "happy path" when the model correctly outputs all the required tool information.
In reality, if you're using more complex tools, you will start encountering errors from the model, especially for models that have not been fine tuned for tool calling and for less capable models.
You will need to be prepared to add strategies to improve the output from the model; e.g.,
Provide few shot examples.
Add error handling (e.g., catch the exception and feed it back to the LLM to ask it to correct its previous output).
