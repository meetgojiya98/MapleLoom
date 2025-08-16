---
{
  "title": "Runnable interface",
  "source_url": "https://python.langchain.com/docs/concepts/runnables/",
  "fetched_at": "2025-08-15T13:51:38.675766+00:00"
}
---

# Runnable interface

The Runnable interface is the foundation for working with LangChain components, and it's implemented across many of them, such as
language models
,
output parsers
,
retrievers
,
compiled LangGraph graphs
and more.
This guide covers the main concepts and methods of the Runnable interface, which allows developers to interact with various LangChain components in a consistent and predictable manner.
Overview of runnable interface
​
The Runnable way defines a standard interface that allows a Runnable component to be:
Invoked
: A single input is transformed into an output.
Batched
: Multiple inputs are efficiently transformed into outputs.
Streamed
: Outputs are streamed as they are produced.
Inspected: Schematic information about Runnable's input, output, and configuration can be accessed.
Composed: Multiple Runnables can be composed to work together using
the LangChain Expression Language (LCEL)
to create complex pipelines.
Please review the
LCEL Cheatsheet
for some common patterns that involve the Runnable interface and LCEL expressions.
Optimized parallel execution (batch)
​
LangChain Runnables offer a built-in
batch
(and
batch_as_completed
) API that allow you to process multiple inputs in parallel.
Using these methods can significantly improve performance when needing to process multiple independent inputs, as the
processing can be done in parallel instead of sequentially.
The two batching options are:
batch
: Process multiple inputs in parallel, returning results in the same order as the inputs.
batch_as_completed
: Process multiple inputs in parallel, returning results as they complete. Results may arrive out of order, but each includes the input index for matching.
The default implementation of
batch
and
batch_as_completed
use a thread pool executor to run the
invoke
method in parallel. This allows for efficient parallel execution without the need for users to manage threads, and speeds up code that is I/O-bound (e.g., making API requests, reading files, etc.). It will not be as effective for CPU-bound operations, as the GIL (Global Interpreter Lock) in Python will prevent true parallel execution.
Some Runnables may provide their own implementations of
batch
and
batch_as_completed
that are optimized for their specific use case (e.g.,
rely on a
batch
API provided by a model provider).
The async versions of
abatch
and
abatch_as_completed
relies on asyncio's
gather
and
as_completed
functions to run the
ainvoke
method in parallel.
When processing a large number of inputs using
batch
or
batch_as_completed
, users may want to control the maximum number of parallel calls. This can be done by setting the
max_concurrency
attribute in the
RunnableConfig
dictionary. See the
RunnableConfig
for more information.
Chat Models also have a built-in
rate limiter
that can be used to control the rate at which requests are made.
Asynchronous support
​
Runnables expose an asynchronous API, allowing them to be called using the
await
syntax in Python. Asynchronous methods can be identified by the "a" prefix (e.g.,
ainvoke
,
abatch
,
astream
,
abatch_as_completed
).
Please refer to the
Async Programming with LangChain
guide for more details.
Streaming APIs
​
Streaming is critical in making applications based on LLMs feel responsive to end-users.
Runnables expose the following three streaming APIs:
sync
stream
and async
astream
: yields the output a Runnable as it is generated.
The async
astream_events
: a more advanced streaming API that allows streaming intermediate steps and final output
The
legacy
async
astream_log
: a legacy streaming API that streams intermediate steps and final output
Please refer to the
Streaming Conceptual Guide
for more details on how to stream in LangChain.
Input and output types
​
Every
Runnable
is characterized by an input and output type. These input and output types can be any Python object, and are defined by the Runnable itself.
Runnable methods that result in the execution of the Runnable (e.g.,
invoke
,
batch
,
stream
,
astream_events
) work with these input and output types.
invoke: Accepts an input and returns an output.
batch: Accepts a list of inputs and returns a list of outputs.
stream: Accepts an input and returns a generator that yields outputs.
The
input type
and
output type
vary by component:
Component
Input Type
Output Type
Prompt
dictionary
PromptValue
ChatModel
a string, list of chat messages or a PromptValue
ChatMessage
LLM
a string, list of chat messages or a PromptValue
String
OutputParser
the output of an LLM or ChatModel
Depends on the parser
Retriever
a string
List of Documents
Tool
a string or dictionary, depending on the tool
Depends on the tool
Please refer to the individual component documentation for more information on the input and output types and how to use them.
Inspecting schemas
​
This is an advanced feature that is unnecessary for most users. You should probably
skip this section unless you have a specific need to inspect the schema of a Runnable.
In more advanced use cases, you may want to programmatically
inspect
the Runnable and determine what input and output types the Runnable expects and produces.
The Runnable interface provides methods to get the
JSON Schema
of the input and output types of a Runnable, as well as
Pydantic schemas
for the input and output types.
These APIs are mostly used internally for unit-testing and by
LangServe
which uses the APIs for input validation and generation of
OpenAPI documentation
.
In addition, to the input and output types, some Runnables have been set up with additional run time configuration options.
There are corresponding APIs to get the Pydantic Schema and JSON Schema of the configuration options for the Runnable.
Please see the
Configurable Runnables
section for more information.
Method
Description
get_input_schema
Gives the Pydantic Schema of the input schema for the Runnable.
get_output_schema
Gives the Pydantic Schema of the output schema for the Runnable.
config_schema
Gives the Pydantic Schema of the config schema for the Runnable.
get_input_jsonschema
Gives the JSONSchema of the input schema for the Runnable.
get_output_jsonschema
Gives the JSONSchema of the output schema for the Runnable.
get_config_jsonschema
Gives the JSONSchema of the config schema for the Runnable.
With_types
​
LangChain will automatically try to infer the input and output types of a Runnable based on available information.
Currently, this inference does not work well for more complex Runnables that are built using
LCEL
composition, and the inferred input and / or output types may be incorrect. In these cases, we recommend that users override the inferred input and output types using the
with_types
method (
API Reference
).
RunnableConfig
​
Any of the methods that are used to execute the runnable (e.g.,
invoke
,
batch
,
stream
,
astream_events
) accept a second argument called
RunnableConfig
(
API Reference
). This argument is a dictionary that contains configuration for the Runnable that will be used
at run time during the execution of the runnable.
A
RunnableConfig
can have any of the following properties defined:
Attribute
Description
run_name
Name used for the given Runnable (not inherited).
run_id
Unique identifier for this call. sub-calls will get their own unique run ids.
tags
Tags for this call and any sub-calls.
metadata
Metadata for this call and any sub-calls.
callbacks
Callbacks for this call and any sub-calls.
max_concurrency
Maximum number of parallel calls to make (e.g., used by batch).
recursion_limit
Maximum number of times a call can recurse (e.g., used by Runnables that return Runnables)
configurable
Runtime values for configurable attributes of the Runnable.
Passing
config
to the
invoke
method is done like so:
some_runnable
.
invoke
(
some_input
,
config
=
{
'run_name'
:
'my_run'
,
'tags'
:
[
'tag1'
,
'tag2'
]
,
'metadata'
:
{
'key'
:
'value'
}
}
)
Propagation of RunnableConfig
​
Many
Runnables
are composed of other Runnables, and it is important that the
RunnableConfig
is propagated to all sub-calls made by the Runnable. This allows providing run time configuration values to the parent Runnable that are inherited by all sub-calls.
If this were not the case, it would be impossible to set and propagate
callbacks
or other configuration values like
tags
and
metadata
which
are expected to be inherited by all sub-calls.
There are two main patterns by which new
Runnables
are created:
Declaratively using
LangChain Expression Language (LCEL)
:
chain
=
prompt
|
chat_model
|
output_parser
Using a
custom Runnable
(e.g.,
RunnableLambda
) or using the
@tool
decorator:
def
foo
(
input
)
:
return
bar_runnable
.
invoke
(
input
)
foo_runnable
=
RunnableLambda
(
foo
)
LangChain will try to propagate
RunnableConfig
automatically for both of the patterns.
For handling the second pattern, LangChain relies on Python's
contextvars
.
In Python 3.11 and above, this works out of the box, and you do not need to do anything special to propagate the
RunnableConfig
to the sub-calls.
In Python 3.9 and 3.10, if you are using
async code
, you need to manually pass the
RunnableConfig
through to the
Runnable
when invoking it.
This is due to a limitation in
asyncio's tasks
in Python 3.9 and 3.10 which did
not accept a
context
argument.
Propagating the
RunnableConfig
manually is done like so:
async
def
foo
(
input
,
config
)
:
return
await
bar_runnable
.
ainvoke
(
input
,
config
=
config
)
foo_runnable
=
RunnableLambda
(
foo
)
When using Python 3.10 or lower and writing async code,
RunnableConfig
cannot be propagated
automatically, and you will need to do it manually! This is a common pitfall when
attempting to stream data using
astream_events
and
astream_log
as these methods
rely on proper propagation of
callbacks
defined inside of
RunnableConfig
.
The
run_name
,
tags
, and
metadata
attributes of the
RunnableConfig
dictionary can be used to set custom values for the run name, tags, and metadata for a given Runnable.
The
run_name
is a string that can be used to set a custom name for the run. This name will be used in logs and other places to identify the run. It is not inherited by sub-calls.
The
tags
and
metadata
attributes are lists and dictionaries, respectively, that can be used to set custom tags and metadata for the run. These values are inherited by sub-calls.
Using these attributes can be useful for tracking and debugging runs, as they will be surfaced in
LangSmith
as trace attributes that you can
filter and search on.
The attributes will also be propagated to
callbacks
, and will appear in streaming APIs like
astream_events
as part of each event in the stream.
Setting run id
​
This is an advanced feature that is unnecessary for most users.
You may need to set a custom
run_id
for a given run, in case you want
to reference it later or correlate it with other systems.
The
run_id
MUST be a valid UUID string and
unique
for each run. It is used to identify
the parent run, sub-class will get their own unique run ids automatically.
To set a custom
run_id
, you can pass it as a key-value pair in the
config
dictionary when invoking the Runnable:
import
uuid
run_id
=
uuid
.
uuid4
(
)
some_runnable
.
invoke
(
some_input
,
config
=
{
'run_id'
:
run_id
}
)
Setting recursion limit
​
This is an advanced feature that is unnecessary for most users.
Some Runnables may return other Runnables, which can lead to infinite recursion if not handled properly. To prevent this, you can set a
recursion_limit
in the
RunnableConfig
dictionary. This will limit the number of times a Runnable can recurse.
Setting max concurrency
​
If using the
batch
or
batch_as_completed
methods, you can set the
max_concurrency
attribute in the
RunnableConfig
dictionary to control the maximum number of parallel calls to make. This can be useful when you want to limit the number of parallel calls to prevent overloading a server or API.
If you're trying to rate limit the number of requests made by a
Chat Model
, you can use the built-in
rate limiter
instead of setting
max_concurrency
, which will be more effective.
See the
How to handle rate limits
guide for more information.
Setting configurable
​
The
configurable
field is used to pass runtime values for configurable attributes of the Runnable.
It is used frequently in
LangGraph
with
LangGraph Persistence
and
memory
.
It is used for a similar purpose in
RunnableWithMessageHistory
to specify either
a
session_id
/
conversation_id
to keep track of conversation history.
In addition, you can use it to specify any custom configuration options to pass to any
Configurable Runnable
that they create.
Setting callbacks
​
Use this option to configure
callbacks
for the runnable at
runtime. The callbacks will be passed to all sub-calls made by the runnable.
some_runnable
.
invoke
(
some_input
,
{
"callbacks"
:
[
SomeCallbackHandler
(
)
,
AnotherCallbackHandler
(
)
,
]
}
)
Please read the
Callbacks Conceptual Guide
for more information on how to use callbacks in LangChain.
If you're using Python 3.9 or 3.10 in an async environment, you must propagate
the
RunnableConfig
manually to sub-calls in some cases. Please see the
Propagating RunnableConfig
section for more information.
Creating a runnable from a function
​
You may need to create a custom Runnable that runs arbitrary logic. This is especially
useful if using
LangChain Expression Language (LCEL)
to compose
multiple Runnables and you need to add custom processing logic in one of the steps.
There are two ways to create a custom Runnable from a function:
RunnableLambda
: Use this for simple transformations where streaming is not required.
RunnableGenerator
: use this for more complex transformations when streaming is needed.
See the
How to run custom functions
guide for more information on how to use
RunnableLambda
and
RunnableGenerator
.
Users should not try to subclass Runnables to create a new custom Runnable. It is
much more complex and error-prone than simply using
RunnableLambda
or
RunnableGenerator
.
Configurable runnables
​
Sometimes you may want to experiment with, or even expose to the end user, multiple different ways of doing things with your Runnable. This could involve adjusting parameters like the temperature in a chat model or even switching between different chat models.
To simplify this process, the Runnable interface provides two methods for creating configurable Runnables at runtime:
configurable_fields
: This method allows you to configure specific
attributes
in a Runnable. For example, the
temperature
attribute of a chat model.
configurable_alternatives
: This method enables you to specify
alternative
Runnables that can be run during runtime. For example, you could specify a list of different chat models that can be used.
See the
How to configure runtime chain internals
guide for more information on how to configure runtime chain internals.
