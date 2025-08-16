---
{
  "title": "Tools | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/concepts/tools/",
  "fetched_at": "2025-08-15T13:51:46.628964+00:00"
}
---

# Tools | 🦜️🔗 LangChain

Overview
​
The
tool
abstraction in LangChain associates a Python
function
with a
schema
that defines the function's
name
,
description
and
expected arguments
.
Tools
can be passed to
chat models
that support
tool calling
allowing the model to request the execution of a specific function with specific inputs.
Key concepts
​
Tools are a way to encapsulate a function and its schema in a way that can be passed to a chat model.
Create tools using the
@tool
decorator, which simplifies the process of tool creation, supporting the following:
Automatically infer the tool's
name
,
description
and
expected arguments
, while also supporting customization.
Defining tools that return
artifacts
(e.g. images, dataframes, etc.)
Hiding input arguments from the schema (and hence from the model) using
injected tool arguments
.
The tool interface is defined in the
BaseTool
class which is a subclass of the
Runnable Interface
.
The key attributes that correspond to the tool's
schema
:
name
: The name of the tool.
description
: A description of what the tool does.
args
: Property that returns the JSON schema for the tool's arguments.
The key methods to execute the function associated with the
tool
:
invoke
: Invokes the tool with the given arguments.
ainvoke
: Invokes the tool with the given arguments, asynchronously. Used for
async programming with LangChain
.
The recommended way to create tools is using the
@tool
decorator. This decorator is designed to simplify the process of tool creation and should be used in most cases. After defining a function, you can decorate it with
@tool
to create a tool that implements the
Tool Interface
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
"""Multiply two numbers."""
return
a
*
b
For more details on how to create tools, see the
how to create custom tools
guide.
LangChain has a few other ways to create tools; e.g., by sub-classing the
BaseTool
class or by using
StructuredTool
. These methods are shown in the
how to create custom tools guide
, but
we generally recommend using the
@tool
decorator for most cases.
Once you have defined a tool, you can use it directly by calling the function. For example, to use the
multiply
tool defined above:
multiply
.
invoke
(
{
"a"
:
2
,
"b"
:
3
}
)
Inspect
​
You can also inspect the tool's schema and other properties:
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
If you're using pre-built LangChain or LangGraph components like
create_react_agent
,you might not need to interact with tools directly. However, understanding how to use them can be valuable for debugging and testing. Additionally, when building custom LangGraph workflows, you may find it necessary to work with tools directly.
Configuring the schema
​
The
@tool
decorator offers additional options to configure the schema of the tool (e.g., modify name, description
or parse the function's doc-string to infer the schema).
Please see the
API reference for @tool
for more details and review the
how to create custom tools
guide for examples.
Tools
are utilities that can be called by a model, and whose outputs are designed to be fed back to a model. Sometimes, however, there are artifacts of a tool's execution that we want to make accessible to downstream components in our chain or agent, but that we don't want to expose to the model itself. For example if a tool returns a custom object, a dataframe or an image, we may want to pass some metadata about this output to the model without passing the actual output. At the same time, we may want to be able to access this full output elsewhere, for example in downstream tools.
@tool
(
response_format
=
"content_and_artifact"
)
def
some_tool
(
.
.
.
)
-
>
Tuple
[
str
,
Any
]
:
"""Tool that does something."""
.
.
.
return
'Message for chat model'
,
some_artifact
See
how to return artifacts from tools
for more details.
Special type annotations
​
There are a number of special type annotations that can be used in the tool's function signature to configure the run time behavior of the tool.
The following type annotations will end up
removing
the argument from the tool's schema. This can be useful for arguments that should not be exposed to the model and that the model should not be able to control.
InjectedToolArg
: Value should be injected manually at runtime using
.invoke
or
.ainvoke
.
RunnableConfig
: Pass in the RunnableConfig object to the tool.
InjectedState
: Pass in the overall state of the LangGraph graph to the tool.
InjectedStore
: Pass in the LangGraph store object to the tool.
You can also use the
Annotated
type with a string literal to provide a
description
for the corresponding argument that
WILL
be exposed in the tool's schema.
Annotated[..., "string literal"]
-- Adds a description to the argument that will be exposed in the tool's schema.
There are cases where certain arguments need to be passed to a tool at runtime but should not be generated by the model itself. For this, we use the
InjectedToolArg
annotation, which allows certain parameters to be hidden from the tool's schema.
For example, if a tool requires a
user_id
to be injected dynamically at runtime, it can be structured in this way:
from
langchain_core
.
tools
import
tool
,
InjectedToolArg
@tool
def
user_specific_tool
(
input_data
:
str
,
user_id
:
InjectedToolArg
)
-
>
str
:
"""Tool that processes input data."""
return
f"User
{
user_id
}
processed
{
input_data
}
"
Annotating the
user_id
argument with
InjectedToolArg
tells LangChain that this argument should not be exposed as part of the
tool's schema.
See
how to pass run time values to tools
for more details on how to use
InjectedToolArg
.
RunnableConfig
​
You can use the
RunnableConfig
object to pass custom run time values to tools.
If you need to access the
RunnableConfig
object from within a tool. This can be done by using the
RunnableConfig
annotation in the tool's function signature.
from
langchain_core
.
runnables
import
RunnableConfig
@tool
async
def
some_func
(
.
.
.
,
config
:
RunnableConfig
)
-
>
.
.
.
:
"""Tool that does something."""
.
.
.
await
some_func
.
ainvoke
(
.
.
.
,
config
=
{
"configurable"
:
{
"value"
:
"some_value"
}
}
)
The
config
will not be part of the tool's schema and will be injected at runtime with appropriate values.
You may need to access the
config
object to manually propagate it to subclass. This happens if you're working with python 3.9 / 3.10 in an
async
environment and need to manually propagate the
config
object to sub-calls.
Please read
Propagation RunnableConfig
for more details to learn how to propagate the
RunnableConfig
down the call chain manually (or upgrade to Python 3.11 where this is no longer an issue).
InjectedState
​
Please see the
InjectedState
documentation for more details.
InjectedStore
​
Please see the
InjectedStore
documentation for more details.
Although similar conceptually, tool artifacts in LangChain and
injected state in LangGraph
serve different purposes and operate at different levels of abstraction.
Tool Artifacts
Purpose:
Store and pass data between tool executions within a single chain/workflow
Scope:
Limited to tool-to-tool communication
Lifecycle:
Tied to individual tool calls and their immediate context
Usage:
Temporary storage for intermediate results that tools need to share
Injected State (LangGraph)
Purpose:
Maintain persistent state across the entire graph execution
Scope:
Global to the entire graph workflow
Lifecycle:
Persists throughout the entire graph execution and can be saved/restored
Usage:
Long-term state management, conversation memory, user context, workflow checkpointing
Tool artifacts are ephemeral data passed between tools, while injected state is persistent workflow-level state that survives across multiple steps, tool calls, and even execution sessions in LangGraph.
Best practices
​
When designing tools to be used by models, keep the following in mind:
Tools that are well-named, correctly-documented and properly type-hinted are easier for models to use.
Design simple and narrowly scoped tools, as they are easier for models to use correctly.
Use chat models that support
tool-calling
APIs to take advantage of tools.
LangChain has a concept of
toolkits
. This a very thin abstraction that groups tools together that
are designed to be used together for specific tasks.
Interface
​
All Toolkits expose a
get_tools
method which returns a list of tools. You can therefore do:
toolkit
=
ExampleToolkit
(
.
.
.
)
tools
=
toolkit
.
get_tools
(
)
See the following resources for more information:
