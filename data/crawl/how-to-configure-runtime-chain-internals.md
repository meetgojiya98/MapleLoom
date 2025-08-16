---
{
  "title": "How to configure runtime chain internals",
  "source_url": "https://python.langchain.com/docs/how_to/configure/",
  "fetched_at": "2025-08-15T13:49:26.427155+00:00"
}
---

# How to configure runtime chain internals

How to configure runtime chain internals
This guide assumes familiarity with the following concepts:
Sometimes you may want to experiment with, or even expose to the end user, multiple different ways of doing things within your chains.
This can include tweaking parameters such as temperature or even swapping out one model for another.
In order to make this experience as easy as possible, we have defined two methods.
A
configurable_fields
method. This lets you configure particular fields of a runnable.
This is related to the
.bind
method on runnables, but allows you to specify parameters for a given step in a chain at runtime rather than specifying them beforehand.
A
configurable_alternatives
method. With this method, you can list out alternatives for any particular runnable that can be set during runtime, and swap them for those specified alternatives.
Configurable Fields
​
Let's walk through an example that configures chat model fields like temperature at runtime:
%
pip install
-
-
upgrade
-
-
quiet langchain langchain
-
openai
import
os
from
getpass
import
getpass
if
"OPENAI_API_KEY"
not
in
os
.
environ
:
os
.
environ
[
"OPENAI_API_KEY"
]
=
getpass
(
)
Configuring fields on a chat model
​
If using
init_chat_model
to create a chat model, you can specify configurable fields in the constructor:
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
"openai:gpt-4o-mini"
,
configurable_fields
=
(
"temperature"
,
)
,
)
You can then set the parameter at runtime using
.with_config
:
response
=
llm
.
with_config
(
{
"temperature"
:
0
}
)
.
invoke
(
"Hello"
)
print
(
response
.
content
)
Hello! How can I assist you today?
In addition to invocation parameters like temperature, configuring fields this way extends to clients and other attributes.
This method is applicable when
binding tools
as well:
from
langchain_core
.
tools
import
tool
@tool
def
get_weather
(
location
:
str
)
:
"""Get the weather."""
return
"It's sunny."
llm_with_tools
=
llm
.
bind_tools
(
[
get_weather
]
)
response
=
llm_with_tools
.
with_config
(
{
"temperature"
:
0
}
)
.
invoke
(
"What's the weather in SF?"
)
response
.
tool_calls
[{'name': 'get_weather',
'args': {'location': 'San Francisco'},
'id': 'call_B93EttzlGyYUhzbIIiMcl3bE',
'type': 'tool_call'}]
In addition to
.with_config
, we can now include the parameter when passing a configuration directly. See example below, where we allow the underlying model temperature to be configurable inside of a
langgraph agent
:
! pip install
-
-
upgrade langgraph
from
langgraph
.
prebuilt
import
create_react_agent
agent
=
create_react_agent
(
llm
,
[
get_weather
]
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
"What's the weather in Boston?"
}
,
{
"configurable"
:
{
"temperature"
:
0
}
}
,
)
Configuring fields on arbitrary Runnables
​
You can also use the
.configurable_fields
method on arbitrary
Runnables
, as shown below:
from
langchain_core
.
prompts
import
PromptTemplate
from
langchain_core
.
runnables
import
ConfigurableField
from
langchain_openai
import
ChatOpenAI
model
=
ChatOpenAI
(
temperature
=
0
)
.
configurable_fields
(
temperature
=
ConfigurableField
(
id
=
"llm_temperature"
,
name
=
"LLM Temperature"
,
description
=
"The temperature of the LLM"
,
)
)
model
.
invoke
(
"pick a random number"
)
AIMessage(content='17', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 11, 'total_tokens': 12}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-ba26a0da-0a69-4533-ab7f-21178a73d303-0')
Above, we defined
temperature
as a
ConfigurableField
that we can set at runtime. To do so, we use the
with_config
method like this:
model
.
with_config
(
configurable
=
{
"llm_temperature"
:
0.9
}
)
.
invoke
(
"pick a random number"
)
AIMessage(content='12', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 11, 'total_tokens': 12}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-ba8422ad-be77-4cb1-ac45-ad0aae74e3d9-0')
Note that the passed
llm_temperature
entry in the dict has the same key as the
id
of the
ConfigurableField
.
We can also do this to affect just one step that's part of a chain:
prompt
=
PromptTemplate
.
from_template
(
"Pick a random number above {x}"
)
chain
=
prompt
|
model
chain
.
invoke
(
{
"x"
:
0
}
)
AIMessage(content='27', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 14, 'total_tokens': 15}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-ecd4cadd-1b72-4f92-b9a0-15e08091f537-0')
chain
.
with_config
(
configurable
=
{
"llm_temperature"
:
0.9
}
)
.
invoke
(
{
"x"
:
0
}
)
AIMessage(content='35', response_metadata={'token_usage': {'completion_tokens': 1, 'prompt_tokens': 14, 'total_tokens': 15}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-a916602b-3460-46d3-a4a8-7c926ec747c0-0')
Configurable Alternatives
​
The
configurable_alternatives()
method allows us to swap out steps in a chain with an alternative. Below, we swap out one chat model for another:
%
pip install
-
-
upgrade
-
-
quiet langchain
-
anthropic
import
os
from
getpass
import
getpass
if
"ANTHROPIC_API_KEY"
not
in
os
.
environ
:
os
.
environ
[
"ANTHROPIC_API_KEY"
]
=
getpass
(
)
[33mWARNING: You are using pip version 22.0.4; however, version 24.0 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
from
langchain_anthropic
import
ChatAnthropic
from
langchain_core
.
prompts
import
PromptTemplate
from
langchain_core
.
runnables
import
ConfigurableField
from
langchain_openai
import
ChatOpenAI
llm
=
ChatAnthropic
(
model
=
"claude-3-haiku-20240307"
,
temperature
=
0
)
.
configurable_alternatives
(
ConfigurableField
(
id
=
"llm"
)
,
default_key
=
"anthropic"
,
openai
=
ChatOpenAI
(
)
,
gpt4
=
ChatOpenAI
(
model
=
"gpt-4"
)
,
)
prompt
=
PromptTemplate
.
from_template
(
"Tell me a joke about {topic}"
)
chain
=
prompt
|
llm
chain
.
invoke
(
{
"topic"
:
"bears"
}
)
AIMessage(content="Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!\n\nHow's that? I tried to come up with a simple, silly pun-based joke about bears. Puns and wordplay are a common way to create humorous bear jokes. Let me know if you'd like to hear another one!", response_metadata={'id': 'msg_018edUHh5fUbWdiimhrC3dZD', 'model': 'claude-3-haiku-20240307', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 13, 'output_tokens': 80}}, id='run-775bc58c-28d7-4e6b-a268-48fa6661f02f-0')
chain
.
with_config
(
configurable
=
{
"llm"
:
"openai"
}
)
.
invoke
(
{
"topic"
:
"bears"
}
)
AIMessage(content="Why don't bears like fast food?\n\nBecause they can't catch it!", response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 13, 'total_tokens': 28}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-7bdaa992-19c9-4f0d-9a0c-1f326bc992d4-0')
chain
.
with_config
(
configurable
=
{
"llm"
:
"anthropic"
}
)
.
invoke
(
{
"topic"
:
"bears"
}
)
AIMessage(content="Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!\n\nHow's that? I tried to come up with a simple, silly pun-based joke about bears. Puns and wordplay are a common way to create humorous bear jokes. Let me know if you'd like to hear another one!", response_metadata={'id': 'msg_01BZvbmnEPGBtcxRWETCHkct', 'model': 'claude-3-haiku-20240307', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 13, 'output_tokens': 80}}, id='run-59b6ee44-a1cd-41b8-a026-28ee67cdd718-0')
With Prompts
​
We can do a similar thing, but alternate between prompts
llm
=
ChatAnthropic
(
model
=
"claude-3-haiku-20240307"
,
temperature
=
0
)
prompt
=
PromptTemplate
.
from_template
(
"Tell me a joke about {topic}"
)
.
configurable_alternatives
(
ConfigurableField
(
id
=
"prompt"
)
,
default_key
=
"joke"
,
poem
=
PromptTemplate
.
from_template
(
"Write a short poem about {topic}"
)
,
)
chain
=
prompt
|
llm
chain
.
invoke
(
{
"topic"
:
"bears"
}
)
AIMessage(content="Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!", response_metadata={'id': 'msg_01DtM1cssjNFZYgeS3gMZ49H', 'model': 'claude-3-haiku-20240307', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 13, 'output_tokens': 28}}, id='run-8199af7d-ea31-443d-b064-483693f2e0a1-0')
chain
.
with_config
(
configurable
=
{
"prompt"
:
"poem"
}
)
.
invoke
(
{
"topic"
:
"bears"
}
)
AIMessage(content="Here is a short poem about bears:\n\nMajestic bears, strong and true,\nRoaming the forests, wild and free.\nPowerful paws, fur soft and brown,\nCommanding respect, nature's crown.\n\nForaging for berries, fishing streams,\nProtecting their young, fierce and keen.\nMighty bears, a sight to behold,\nGuardians of the wilderness, untold.\n\nIn the wild they reign supreme,\nEmbodying nature's grand theme.\nBears, a symbol of strength and grace,\nCaptivating all who see their face.", response_metadata={'id': 'msg_01Wck3qPxrjURtutvtodaJFn', 'model': 'claude-3-haiku-20240307', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'input_tokens': 13, 'output_tokens': 134}}, id='run-69414a1e-51d7-4bec-a307-b34b7d61025e-0')
With Prompts and LLMs
​
We can also have multiple things configurable!
Here's an example doing that with both prompts and LLMs.
llm
=
ChatAnthropic
(
model
=
"claude-3-haiku-20240307"
,
temperature
=
0
)
.
configurable_alternatives
(
ConfigurableField
(
id
=
"llm"
)
,
default_key
=
"anthropic"
,
openai
=
ChatOpenAI
(
)
,
gpt4
=
ChatOpenAI
(
model
=
"gpt-4"
)
,
)
prompt
=
PromptTemplate
.
from_template
(
"Tell me a joke about {topic}"
)
.
configurable_alternatives
(
ConfigurableField
(
id
=
"prompt"
)
,
default_key
=
"joke"
,
poem
=
PromptTemplate
.
from_template
(
"Write a short poem about {topic}"
)
,
)
chain
=
prompt
|
llm
chain
.
with_config
(
configurable
=
{
"prompt"
:
"poem"
,
"llm"
:
"openai"
}
)
.
invoke
(
{
"topic"
:
"bears"
}
)
AIMessage(content="In the forest deep and wide,\nBears roam with grace and pride.\nWith fur as dark as night,\nThey rule the land with all their might.\n\nIn winter's chill, they hibernate,\nIn spring they emerge, hungry and great.\nWith claws sharp and eyes so keen,\nThey hunt for food, fierce and lean.\n\nBut beneath their tough exterior,\nLies a gentle heart, warm and superior.\nThey love their cubs with all their might,\nProtecting them through day and night.\n\nSo let us admire these majestic creatures,\nIn awe of their strength and features.\nFor in the wild, they reign supreme,\nThe mighty bears, a timeless dream.", response_metadata={'token_usage': {'completion_tokens': 133, 'prompt_tokens': 13, 'total_tokens': 146}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-5eec0b96-d580-49fd-ac4e-e32a0803b49b-0')
chain
.
with_config
(
configurable
=
{
"llm"
:
"openai"
}
)
.
invoke
(
{
"topic"
:
"bears"
}
)
AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!", response_metadata={'token_usage': {'completion_tokens': 13, 'prompt_tokens': 13, 'total_tokens': 26}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-c1b14c9c-4988-49b8-9363-15bfd479973a-0')
Saving configurations
​
We can also easily save configured chains as their own objects
openai_joke
=
chain
.
with_config
(
configurable
=
{
"llm"
:
"openai"
}
)
openai_joke
.
invoke
(
{
"topic"
:
"bears"
}
)
AIMessage(content="Why did the bear break up with his girlfriend? \nBecause he couldn't bear the relationship anymore!", response_metadata={'token_usage': {'completion_tokens': 20, 'prompt_tokens': 13, 'total_tokens': 33}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_c2295e73ad', 'finish_reason': 'stop', 'logprobs': None}, id='run-391ebd55-9137-458b-9a11-97acaff6a892-0')
Next steps
​
You now know how to configure a chain's internal steps at runtime.
To learn more, see the other how-to guides on runnables in this section, including:
Using
.bind()
as a simpler way to set a runnable's runtime parameters
