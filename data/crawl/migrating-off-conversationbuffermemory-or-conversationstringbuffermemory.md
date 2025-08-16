---
{
  "title": "Migrating off ConversationBufferMemory or ConversationStringBufferMemory",
  "source_url": "https://python.langchain.com/docs/versions/migrating_memory/conversation_buffer_memory/",
  "fetched_at": "2025-08-15T13:52:07.740979+00:00"
}
---

# Migrating off ConversationBufferMemory or ConversationStringBufferMemory

Migrating off ConversationBufferMemory or ConversationStringBufferMemory
ConversationBufferMemory
and
ConversationStringBufferMemory
were used to keep track of a conversation between a human and an ai asstistant without any additional processing.
The
ConversationStringBufferMemory
is equivalent to
ConversationBufferMemory
but was targeting LLMs that were not chat models.
The methods for handling conversation history using existing modern primitives are:
Using
LangGraph persistence
along with appropriate processing of the message history
Using LCEL with
RunnableWithMessageHistory
combined with appropriate processing of the message history.
Most users will find
LangGraph persistence
both easier to use and configure than the equivalent LCEL, especially for more complex use cases.
Set up
​
%
%
capture
-
-
no
-
stderr
%
pip install
-
-
upgrade
-
-
quiet langchain
-
openai langchain
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
Usage with LLMChain / ConversationChain
​
This section shows how to migrate off
ConversationBufferMemory
or
ConversationStringBufferMemory
that's used together with either an
LLMChain
or a
ConversationChain
.
Legacy
​
Below is example usage of
ConversationBufferMemory
with an
LLMChain
or an equivalent
ConversationChain
.
Details
from
langchain
.
chains
import
LLMChain
from
langchain
.
memory
import
ConversationBufferMemory
from
langchain_core
.
messages
import
SystemMessage
from
langchain_core
.
prompts
import
ChatPromptTemplate
from
langchain_core
.
prompts
.
chat
import
(
ChatPromptTemplate
,
HumanMessagePromptTemplate
,
MessagesPlaceholder
,
)
from
langchain_openai
import
ChatOpenAI
prompt
=
ChatPromptTemplate
(
[
MessagesPlaceholder
(
variable_name
=
"chat_history"
)
,
HumanMessagePromptTemplate
.
from_template
(
"{text}"
)
,
]
)
memory
=
ConversationBufferMemory
(
memory_key
=
"chat_history"
,
return_messages
=
True
)
legacy_chain
=
LLMChain
(
llm
=
ChatOpenAI
(
)
,
prompt
=
prompt
,
memory
=
memory
,
)
legacy_result
=
legacy_chain
.
invoke
(
{
"text"
:
"my name is bob"
}
)
print
(
legacy_result
)
legacy_result
=
legacy_chain
.
invoke
(
{
"text"
:
"what was my name"
}
)
{'text': 'Hello Bob! How can I assist you today?', 'chat_history': [HumanMessage(content='my name is bob', additional_kwargs={}, response_metadata={}), AIMessage(content='Hello Bob! How can I assist you today?', additional_kwargs={}, response_metadata={})]}
'Your name is Bob. How can I assist you today, Bob?'
Note that there is no support for separating conversation threads in a single memory object
LangGraph
​
The example below shows how to use LangGraph to implement a
ConversationChain
or
LLMChain
with
ConversationBufferMemory
.
This example assumes that you're already somewhat familiar with
LangGraph
. If you're not, then please see the
LangGraph Quickstart Guide
for more details.
LangGraph
offers a lot of additional functionality (e.g., time-travel and interrupts) and will work well for other more complex (and realistic) architectures.
Details
import
uuid
from
IPython
.
display
import
Image
,
display
from
langchain_core
.
messages
import
HumanMessage
from
langgraph
.
checkpoint
.
memory
import
MemorySaver
from
langgraph
.
graph
import
START
,
MessagesState
,
StateGraph
workflow
=
StateGraph
(
state_schema
=
MessagesState
)
model
=
ChatOpenAI
(
)
def
call_model
(
state
:
MessagesState
)
:
response
=
model
.
invoke
(
state
[
"messages"
]
)
return
{
"messages"
:
response
}
workflow
.
add_edge
(
START
,
"model"
)
workflow
.
add_node
(
"model"
,
call_model
)
memory
=
MemorySaver
(
)
app
=
workflow
.
compile
(
checkpointer
=
memory
)
thread_id
=
uuid
.
uuid4
(
)
config
=
{
"configurable"
:
{
"thread_id"
:
thread_id
}
}
input_message
=
HumanMessage
(
content
=
"hi! I'm bob"
)
for
event
in
app
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
config
,
stream_mode
=
"values"
)
:
event
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
input_message
=
HumanMessage
(
content
=
"what was my name?"
)
for
event
in
app
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
config
,
stream_mode
=
"values"
)
:
event
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
hi! I'm bob
==================================[1m Ai Message [0m==================================
Hello Bob! How can I assist you today?
================================[1m Human Message [0m=================================
what was my name?
==================================[1m Ai Message [0m==================================
Your name is Bob. How can I help you today, Bob?
LCEL RunnableWithMessageHistory
​
Alternatively, if you have a simple chain, you can wrap the chat model of the chain within a
RunnableWithMessageHistory
.
Please refer to the following
migration guide
for more information.
Usage with a pre-built agent
​
This example shows usage of an Agent Executor with a pre-built agent constructed using the
create_tool_calling_agent
function.
If you are using one of the
old LangChain pre-built agents
, you should be able
to replace that code with the new
langgraph pre-built agent
which leverages
native tool calling capabilities of chat models and will likely work better out of the box.
Legacy Usage
​
Details
from
langchain
import
hub
from
langchain
.
agents
import
AgentExecutor
,
create_tool_calling_agent
from
langchain
.
memory
import
ConversationBufferMemory
from
langchain_core
.
tools
import
tool
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
@tool
def
get_user_age
(
name
:
str
)
-
>
str
:
"""Use this tool to find the user's age."""
if
"bob"
in
name
.
lower
(
)
:
return
"42 years old"
return
"41 years old"
tools
=
[
get_user_age
]
prompt
=
ChatPromptTemplate
.
from_messages
(
[
(
"placeholder"
,
"{chat_history}"
)
,
(
"human"
,
"{input}"
)
,
(
"placeholder"
,
"{agent_scratchpad}"
)
,
]
)
agent
=
create_tool_calling_agent
(
model
,
tools
,
prompt
)
memory
=
ConversationBufferMemory
(
memory_key
=
"chat_history"
,
return_messages
=
True
)
agent
=
create_tool_calling_agent
(
model
,
tools
,
prompt
)
agent_executor
=
AgentExecutor
(
agent
=
agent
,
tools
=
tools
,
memory
=
memory
,
)
print
(
agent_executor
.
invoke
(
{
"input"
:
"hi! my name is bob what is my age?"
}
)
)
print
(
)
print
(
agent_executor
.
invoke
(
{
"input"
:
"do you remember my name?"
}
)
)
{'input': 'hi! my name is bob what is my age?', 'chat_history': [HumanMessage(content='hi! my name is bob what is my age?', additional_kwargs={}, response_metadata={}), AIMessage(content='Bob, you are 42 years old.', additional_kwargs={}, response_metadata={})], 'output': 'Bob, you are 42 years old.'}
{'input': 'do you remember my name?', 'chat_history': [HumanMessage(content='hi! my name is bob what is my age?', additional_kwargs={}, response_metadata={}), AIMessage(content='Bob, you are 42 years old.', additional_kwargs={}, response_metadata={}), HumanMessage(content='do you remember my name?', additional_kwargs={}, response_metadata={}), AIMessage(content='Yes, your name is Bob.', additional_kwargs={}, response_metadata={})], 'output': 'Yes, your name is Bob.'}
LangGraph
​
You can follow the standard LangChain tutorial for
building an agent
an in depth explanation of how this works.
This example is shown here explicitly to make it easier for users to compare the legacy implementation vs. the corresponding langgraph implementation.
This example shows how to add memory to the
pre-built react agent
in langgraph.
For more details, please see the
how to add memory to the prebuilt ReAct agent
guide in langgraph.
Details
import
uuid
from
langchain_core
.
messages
import
HumanMessage
from
langchain_core
.
tools
import
tool
from
langchain_openai
import
ChatOpenAI
from
langgraph
.
checkpoint
.
memory
import
MemorySaver
from
langgraph
.
prebuilt
import
create_react_agent
@tool
def
get_user_age
(
name
:
str
)
-
>
str
:
"""Use this tool to find the user's age."""
if
"bob"
in
name
.
lower
(
)
:
return
"42 years old"
return
"41 years old"
memory
=
MemorySaver
(
)
model
=
ChatOpenAI
(
)
app
=
create_react_agent
(
model
,
tools
=
[
get_user_age
]
,
checkpointer
=
memory
,
)
thread_id
=
uuid
.
uuid4
(
)
config
=
{
"configurable"
:
{
"thread_id"
:
thread_id
}
}
input_message
=
HumanMessage
(
content
=
"hi! I'm bob. What is my age?"
)
for
event
in
app
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
config
,
stream_mode
=
"values"
)
:
event
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
input_message
=
HumanMessage
(
content
=
"do you remember my name?"
)
for
event
in
app
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
config
,
stream_mode
=
"values"
)
:
event
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
hi! I'm bob. What is my age?
==================================[1m Ai Message [0m==================================
Tool Calls:
get_user_age (call_oEDwEbIDNdokwqhAV6Azn47c)
Call ID: call_oEDwEbIDNdokwqhAV6Azn47c
Args:
name: bob
=================================[1m Tool Message [0m=================================
Name: get_user_age
42 years old
==================================[1m Ai Message [0m==================================
Bob, you are 42 years old! If you need any more assistance or information, feel free to ask.
================================[1m Human Message [0m=================================
do you remember my name?
==================================[1m Ai Message [0m==================================
Yes, your name is Bob. If you have any other questions or need assistance, feel free to ask!
If we use a different thread ID, it'll start a new conversation and the bot will not know our name!
config
=
{
"configurable"
:
{
"thread_id"
:
"123456789"
}
}
input_message
=
HumanMessage
(
content
=
"hi! do you remember my name?"
)
for
event
in
app
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
config
,
stream_mode
=
"values"
)
:
event
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
hi! do you remember my name?
==================================[1m Ai Message [0m==================================
Hello! Yes, I remember your name. It's great to see you again! How can I assist you today?
Next steps
​
Explore persistence with LangGraph:
Add persistence with simple LCEL (favor langgraph for more complex use cases):
Working with message history:
