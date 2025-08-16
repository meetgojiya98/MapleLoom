---
{
  "title": "Start with a prebuilt agent",
  "source_url": "https://langchain-ai.github.io/langgraph/agents/agents/",
  "fetched_at": "2025-08-15T13:52:18.851862+00:00"
}
---

# Start with a prebuilt agent

agent
LangGraph quickstart
This guide shows you how to set up and use LangGraph's
prebuilt
,
reusable
components, which are designed to help you construct agentic systems quickly and reliably.
Prerequisites
Before you start this tutorial, ensure you have the following:
1. Install dependencies
If you haven't already, install LangGraph and LangChain:
pip install -U langgraph "langchain[anthropic]"
Info
langchain[anthropic]
is installed so the agent can call the
model
.
2. Create an agent
To create an agent, use
create_react_agent
:
API Reference:
create_react_agent
from
langgraph.prebuilt
import
create_react_agent
def
get_weather
(
city
:
str
)
->
str
:
# (1)!
"""Get weather for a given city."""
return
f
"It's always sunny in
{
city
}
!"
agent
=
create_react_agent
(
model
=
"anthropic:claude-3-7-sonnet-latest"
,
# (2)!
tools
=
[
get_weather
],
# (3)!
prompt
=
"You are a helpful assistant"
# (4)!
)
# Run the agent
agent
.
invoke
(
{
"messages"
:
[{
"role"
:
"user"
,
"content"
:
"what is the weather in sf"
}]}
)
Define a tool for the agent to use. Tools can be defined as vanilla Python functions. For more advanced tool usage and customization, check the
tools
page.
Provide a language model for the agent to use. To learn more about configuring language models for the agents, check the
models
page.
Provide a list of tools for the model to use.
Provide a system prompt (instructions) to the language model used by the agent.
3. Configure an LLM
To configure an LLM with specific parameters, such as temperature, use
init_chat_model
:
API Reference:
init_chat_model
|
create_react_agent
from
langchain.chat_models
import
init_chat_model
from
langgraph.prebuilt
import
create_react_agent
model
=
init_chat_model
(
"anthropic:claude-3-7-sonnet-latest"
,
temperature
=
0
)
agent
=
create_react_agent
(
model
=
model
,
tools
=
[
get_weather
],
)
For more information on how to configure LLMs, see
Models
.
4. Add a custom prompt
Prompts instruct the LLM how to behave. Add one of the following types of prompts:
Static
: A string is interpreted as a
system message
.
Dynamic
: A list of messages generated at
runtime
, based on input or configuration.
Static prompt
Dynamic prompt
Define a fixed prompt string or list of messages:
from
langgraph.prebuilt
import
create_react_agent
agent
=
create_react_agent
(
model
=
"anthropic:claude-3-7-sonnet-latest"
,
tools
=
[
get_weather
],
# A static prompt that never changes
prompt
=
"Never answer questions about the weather."
)
agent
.
invoke
(
{
"messages"
:
[{
"role"
:
"user"
,
"content"
:
"what is the weather in sf"
}]}
)
Define a function that returns a message list based on the agent's state and configuration:
from
langchain_core.messages
import
AnyMessage
from
langchain_core.runnables
import
RunnableConfig
from
langgraph.prebuilt.chat_agent_executor
import
AgentState
from
langgraph.prebuilt
import
create_react_agent
def
prompt
(
state
:
AgentState
,
config
:
RunnableConfig
)
->
list
[
AnyMessage
]:
# (1)!
user_name
=
config
[
"configurable"
]
.
get
(
"user_name"
)
system_msg
=
f
"You are a helpful assistant. Address the user as
{
user_name
}
."
return
[{
"role"
:
"system"
,
"content"
:
system_msg
}]
+
state
[
"messages"
]
agent
=
create_react_agent
(
model
=
"anthropic:claude-3-7-sonnet-latest"
,
tools
=
[
get_weather
],
prompt
=
prompt
)
agent
.
invoke
(
{
"messages"
:
[{
"role"
:
"user"
,
"content"
:
"what is the weather in sf"
}]},
config
=
{
"configurable"
:
{
"user_name"
:
"John Smith"
}}
)
Dynamic prompts allow including non-message
context
when constructing an input to the LLM, such as:
Information passed at runtime, like a
user_id
or API credentials (using
config
).
Internal agent state updated during a multi-step reasoning process (using
state
).
Dynamic prompts can be defined as functions that take
state
and
config
and return a list of messages to send to the LLM.
For more information, see
Context
.
5. Add memory
To allow multi-turn conversations with an agent, you need to enable
persistence
by providing a checkpointer when creating an agent. At runtime, you need to provide a config containing
thread_id
— a unique identifier for the conversation (session):
API Reference:
create_react_agent
|
InMemorySaver
from
langgraph.prebuilt
import
create_react_agent
from
langgraph.checkpoint.memory
import
InMemorySaver
checkpointer
=
InMemorySaver
()
agent
=
create_react_agent
(
model
=
"anthropic:claude-3-7-sonnet-latest"
,
tools
=
[
get_weather
],
checkpointer
=
checkpointer
# (1)!
)
# Run the agent
config
=
{
"configurable"
:
{
"thread_id"
:
"1"
}}
sf_response
=
agent
.
invoke
(
{
"messages"
:
[{
"role"
:
"user"
,
"content"
:
"what is the weather in sf"
}]},
config
# (2)!
)
ny_response
=
agent
.
invoke
(
{
"messages"
:
[{
"role"
:
"user"
,
"content"
:
"what about new york?"
}]},
config
)
checkpointer
allows the agent to store its state at every step in the tool calling loop. This enables
short-term memory
and
human-in-the-loop
capabilities.
Pass configuration with
thread_id
to be able to resume the same conversation on future agent invocations.
When you enable the checkpointer, it stores agent state at every step in the provided checkpointer database (or in memory, if using
InMemorySaver
).
Note that in the above example, when the agent is invoked the second time with the same
thread_id
, the original message history from the first conversation is automatically included, together with the new user input.
For more information, see
Memory
.
6. Configure structured output
To produce structured responses conforming to a schema, use the
response_format
parameter. The schema can be defined with a
Pydantic
model or
TypedDict
. The result will be accessible via the
structured_response
field.
API Reference:
create_react_agent
from
pydantic
import
BaseModel
from
langgraph.prebuilt
import
create_react_agent
class
WeatherResponse
(
BaseModel
):
conditions
:
str
agent
=
create_react_agent
(
model
=
"anthropic:claude-3-7-sonnet-latest"
,
tools
=
[
get_weather
],
response_format
=
WeatherResponse
# (1)!
)
response
=
agent
.
invoke
(
{
"messages"
:
[{
"role"
:
"user"
,
"content"
:
"what is the weather in sf"
}]}
)
response
[
"structured_response"
]
When
response_format
is provided, a separate step is added at the end of the agent loop: agent message history is passed to an LLM with structured output to generate a structured response.
To provide a system prompt to this LLM, use a tuple `(prompt, schema)`, e.g., `response_format=(prompt, WeatherResponse)`.
LLM post-processing
Structured output requires an additional call to the LLM to format the response according to the schema.
Next steps
