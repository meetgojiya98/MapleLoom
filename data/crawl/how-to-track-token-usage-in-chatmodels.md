---
{
  "title": "How to track token usage in ChatModels",
  "source_url": "https://python.langchain.com/docs/how_to/chat_token_usage_tracking/",
  "fetched_at": "2025-08-15T13:49:41.428064+00:00"
}
---

# How to track token usage in ChatModels

How to track token usage in ChatModels
This guide assumes familiarity with the following concepts:
Tracking
token
usage to calculate cost is an important part of putting your app in production. This guide goes over how to obtain this information from your LangChain model calls.
This guide requires
langchain-anthropic
and
langchain-openai >= 0.3.11
.
%
pip install
-
qU langchain
-
anthropic langchain
-
openai
A note on streaming with OpenAI
OpenAI's Chat Completions API does not stream token usage statistics by default (see API reference
here
).
To recover token counts when streaming with
ChatOpenAI
or
AzureChatOpenAI
, set
stream_usage=True
as
demonstrated in this guide.
Using LangSmith
​
You can use
LangSmith
to help track token usage in your LLM application. See the
LangSmith quick start guide
.
A number of model providers return token usage information as part of the chat generation response. When available, this information will be included on the
AIMessage
objects produced by the corresponding model.
LangChain
AIMessage
objects include a
usage_metadata
attribute. When populated, this attribute will be a
UsageMetadata
dictionary with standard keys (e.g.,
"input_tokens"
and
"output_tokens"
). They will also include information on cached token usage and tokens from multi-modal data.
Examples:
OpenAI
:
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
model
=
"gpt-4o-mini"
)
openai_response
=
llm
.
invoke
(
"hello"
)
openai_response
.
usage_metadata
{'input_tokens': 8, 'output_tokens': 9, 'total_tokens': 17}
Anthropic
:
from
langchain_anthropic
import
ChatAnthropic
llm
=
ChatAnthropic
(
model
=
"claude-3-haiku-20240307"
)
anthropic_response
=
llm
.
invoke
(
"hello"
)
anthropic_response
.
usage_metadata
{'input_tokens': 8, 'output_tokens': 12, 'total_tokens': 20}
Streaming
​
Some providers support token count metadata in a streaming context.
OpenAI
​
For example, OpenAI will return a message
chunk
at the end of a stream with token usage information. This behavior is supported by
langchain-openai >= 0.1.9
and can be enabled by setting
stream_usage=True
. This attribute can also be set when
ChatOpenAI
is instantiated.
By default, the last message chunk in a stream will include a
"finish_reason"
in the message's
response_metadata
attribute. If we include token usage in streaming mode, an additional chunk containing usage metadata will be added to the end of the stream, such that
"finish_reason"
appears on the second to last message chunk.
llm
=
init_chat_model
(
model
=
"gpt-4o-mini"
)
aggregate
=
None
for
chunk
in
llm
.
stream
(
"hello"
,
stream_usage
=
True
)
:
print
(
chunk
)
aggregate
=
chunk
if
aggregate
is
None
else
aggregate
+
chunk
content='' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='Hello' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='!' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' How' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' can' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' I' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' assist' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' you' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content=' today' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='?' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='' response_metadata={'finish_reason': 'stop', 'model_name': 'gpt-4o-mini'} id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623'
content='' id='run-adb20c31-60c7-43a2-99b2-d4a53ca5f623' usage_metadata={'input_tokens': 8, 'output_tokens': 9, 'total_tokens': 17}
Note that the usage metadata will be included in the sum of the individual message chunks:
print
(
aggregate
.
content
)
print
(
aggregate
.
usage_metadata
)
Hello! How can I assist you today?
{'input_tokens': 8, 'output_tokens': 9, 'total_tokens': 17}
To disable streaming token counts for OpenAI, set
stream_usage
to False, or omit it from the parameters:
aggregate
=
None
for
chunk
in
llm
.
stream
(
"hello"
)
:
print
(
chunk
)
content='' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content='Hello' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content='!' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' How' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' can' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' I' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' assist' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' you' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content=' today' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content='?' id='run-8e758550-94b0-4cca-a298-57482793c25d'
content='' response_metadata={'finish_reason': 'stop', 'model_name': 'gpt-4o-mini'} id='run-8e758550-94b0-4cca-a298-57482793c25d'
You can also enable streaming token usage by setting
stream_usage
when instantiating the chat model. This can be useful when incorporating chat models into LangChain
chains
: usage metadata can be monitored when
streaming intermediate steps
or using tracing software such as
LangSmith
.
See the below example, where we return output structured to a desired schema, but can still observe token usage streamed from intermediate steps.
from
pydantic
import
BaseModel
,
Field
class
Joke
(
BaseModel
)
:
"""Joke to tell user."""
setup
:
str
=
Field
(
description
=
"question to set up a joke"
)
punchline
:
str
=
Field
(
description
=
"answer to resolve the joke"
)
llm
=
init_chat_model
(
model
=
"gpt-4o-mini"
,
stream_usage
=
True
,
)
structured_llm
=
llm
.
with_structured_output
(
Joke
)
async
for
event
in
structured_llm
.
astream_events
(
"Tell me a joke"
)
:
if
event
[
"event"
]
==
"on_chat_model_end"
:
print
(
f"Token usage:
{
event
[
'data'
]
[
'output'
]
.
usage_metadata
}
\n"
)
elif
event
[
"event"
]
==
"on_chain_end"
and
event
[
"name"
]
==
"RunnableSequence"
:
print
(
event
[
"data"
]
[
"output"
]
)
else
:
pass
Token usage: {'input_tokens': 79, 'output_tokens': 23, 'total_tokens': 102}
setup='Why was the math book sad?' punchline='Because it had too many problems.'
Token usage is also visible in the corresponding
LangSmith trace
in the payload from the chat model.
Using callbacks
​
Requires
langchain-core>=0.3.49
LangChain implements a callback handler and context manager that will track token usage across calls of any chat model that returns
usage_metadata
.
There are also some API-specific callback context managers that maintain pricing for different models, allowing for cost estimation in real time. They are currently only implemented for the OpenAI API and Bedrock Anthropic API, and are available in
langchain-community
:
Below, we demonstrate the general-purpose usage metadata callback manager. We can track token usage through configuration or as a context manager.
Tracking token usage through configuration
​
To track token usage through configuration, instantiate a
UsageMetadataCallbackHandler
and pass it into the config:
from
langchain
.
chat_models
import
init_chat_model
from
langchain_core
.
callbacks
import
UsageMetadataCallbackHandler
llm_1
=
init_chat_model
(
model
=
"openai:gpt-4o-mini"
)
llm_2
=
init_chat_model
(
model
=
"anthropic:claude-3-5-haiku-latest"
)
callback
=
UsageMetadataCallbackHandler
(
)
result_1
=
llm_1
.
invoke
(
"Hello"
,
config
=
{
"callbacks"
:
[
callback
]
}
)
result_2
=
llm_2
.
invoke
(
"Hello"
,
config
=
{
"callbacks"
:
[
callback
]
}
)
callback
.
usage_metadata
{'gpt-4o-mini-2024-07-18': {'input_tokens': 8,
'output_tokens': 10,
'total_tokens': 18,
'input_token_details': {'audio': 0, 'cache_read': 0},
'output_token_details': {'audio': 0, 'reasoning': 0}},
'claude-3-5-haiku-20241022': {'input_tokens': 8,
'output_tokens': 21,
'total_tokens': 29,
'input_token_details': {'cache_read': 0, 'cache_creation': 0}}}
Tracking token usage using a context manager
​
You can also use
get_usage_metadata_callback
to create a context manager and aggregate usage metadata there:
from
langchain
.
chat_models
import
init_chat_model
from
langchain_core
.
callbacks
import
get_usage_metadata_callback
llm_1
=
init_chat_model
(
model
=
"openai:gpt-4o-mini"
)
llm_2
=
init_chat_model
(
model
=
"anthropic:claude-3-5-haiku-latest"
)
with
get_usage_metadata_callback
(
)
as
cb
:
llm_1
.
invoke
(
"Hello"
)
llm_2
.
invoke
(
"Hello"
)
print
(
cb
.
usage_metadata
)
{'gpt-4o-mini-2024-07-18': {'input_tokens': 8, 'output_tokens': 10, 'total_tokens': 18, 'input_token_details': {'audio': 0, 'cache_read': 0}, 'output_token_details': {'audio': 0, 'reasoning': 0}}, 'claude-3-5-haiku-20241022': {'input_tokens': 8, 'output_tokens': 21, 'total_tokens': 29, 'input_token_details': {'cache_read': 0, 'cache_creation': 0}}}
Either of these methods will aggregate token usage across multiple calls to each model. For example, you can use it in an
agent
to track token usage across repeated calls to one model:
%
pip install
-
qU langgraph
from
langgraph
.
prebuilt
import
create_react_agent
def
get_weather
(
location
:
str
)
-
>
str
:
"""Get the weather at a location."""
return
"It's sunny."
callback
=
UsageMetadataCallbackHandler
(
)
tools
=
[
get_weather
]
agent
=
create_react_agent
(
"openai:gpt-4o-mini"
,
tools
)
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
{
"role"
:
"user"
,
"content"
:
"What's the weather in Boston?"
}
]
}
,
stream_mode
=
"values"
,
config
=
{
"callbacks"
:
[
callback
]
}
,
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
print
(
f"\nTotal usage:
{
callback
.
usage_metadata
}
"
)
================================[1m Human Message [0m=================================
What's the weather in Boston?
==================================[1m Ai Message [0m==================================
Tool Calls:
get_weather (call_izMdhUYpp9Vhx7DTNAiybzGa)
Call ID: call_izMdhUYpp9Vhx7DTNAiybzGa
Args:
location: Boston
=================================[1m Tool Message [0m=================================
Name: get_weather
It's sunny.
==================================[1m Ai Message [0m==================================
The weather in Boston is sunny.
Total usage: {'gpt-4o-mini-2024-07-18': {'input_token_details': {'audio': 0, 'cache_read': 0}, 'input_tokens': 125, 'total_tokens': 149, 'output_tokens': 24, 'output_token_details': {'audio': 0, 'reasoning': 0}}}
Next steps
​
You've now seen a few examples of how to track token usage for supported providers.
Next, check out the other how-to guides chat models in this section, like
how to get a model to return structured output
or
how to add caching to your chat models
.
