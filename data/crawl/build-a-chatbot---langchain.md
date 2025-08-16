---
{
  "title": "Build a Chatbot | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/tutorials/chatbot/",
  "fetched_at": "2025-08-15T13:48:42.379703+00:00"
}
---

# Build a Chatbot | 🦜️🔗 LangChain

This tutorial previously used the
RunnableWithMessageHistory
abstraction. You can access that version of the documentation in the
v0.2 docs
.
As of the v0.3 release of LangChain, we recommend that LangChain users take advantage of
LangGraph persistence
to incorporate
memory
into new LangChain applications.
If your code is already relying on
RunnableWithMessageHistory
or
BaseChatMessageHistory
, you do
not
need to make any changes. We do not plan on deprecating this functionality in the near future as it works for simple chat applications and any code that uses
RunnableWithMessageHistory
will continue to work as expected.
Please see
How to migrate to LangGraph Memory
for more details.
Overview
​
We'll go over an example of how to design and implement an LLM-powered chatbot.
This chatbot will be able to have a conversation and remember previous interactions with a
chat model
.
Note that this chatbot that we build will only use the language model to have a conversation.
There are several other related concepts that you may be looking for:
Conversational RAG
: Enable a chatbot experience over an external source of data
Agents
: Build a chatbot that can take actions
This tutorial will cover the basics which will be helpful for those two more advanced topics, but feel free to skip directly to there should you choose.
Setup
​
Jupyter Notebook
​
This guide (and most of the other guides in the documentation) uses
Jupyter notebooks
and assumes the reader is as well. Jupyter notebooks are perfect for learning how to work with LLM systems because oftentimes things can go wrong (unexpected output, API down, etc) and going through guides in an interactive environment is a great way to better understand them.
This and other tutorials are perhaps most conveniently run in a Jupyter notebook. See
here
for instructions on how to install.
Installation
​
For this tutorial we will need
langchain-core
and
langgraph
. This guide requires
langgraph >= 0.2.28
.
pip install langchain-core langgraph>0.2.27
conda install langchain-core langgraph>0.2.27 -c conda-forge
For more details, see our
Installation guide
.
LangSmith
​
Many of the applications you build with LangChain will contain multiple steps with multiple invocations of LLM calls.
As these applications get more and more complex, it becomes crucial to be able to inspect what exactly is going on inside your chain or agent.
The best way to do this is with
LangSmith
.
After you sign up at the link above,
(you'll need to create an API key from the Settings -> API Keys page on the LangSmith website)
, make sure to set your environment variables to start logging traces:
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
Or, if in a notebook, you can set them with:
import
getpass
import
os
os
.
environ
[
"LANGSMITH_TRACING"
]
=
"true"
os
.
environ
[
"LANGSMITH_API_KEY"
]
=
getpass
.
getpass
(
)
Quickstart
​
First up, let's learn how to use a language model by itself. LangChain supports many different language models that you can use interchangeably - select the one you want to use below!
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
Let's first use the model directly.
ChatModel
s are instances of LangChain "Runnables", which means they expose a standard interface for interacting with them. To just simply call the model, we can pass in a list of messages to the
.invoke
method.
from
langchain_core
.
messages
import
HumanMessage
model
.
invoke
(
[
HumanMessage
(
content
=
"Hi! I'm Bob"
)
]
)
AIMessage(content='Hi Bob! How can I assist you today?', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 10, 'prompt_tokens': 11, 'total_tokens': 21, 'completion_tokens_details': {'accepted_prediction_tokens': 0, 'audio_tokens': 0, 'reasoning_tokens': 0, 'rejected_prediction_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': 0, 'cached_tokens': 0}}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_0705bf87c0', 'finish_reason': 'stop', 'logprobs': None}, id='run-5211544f-da9f-4325-8b8e-b3d92b2fc71a-0', usage_metadata={'input_tokens': 11, 'output_tokens': 10, 'total_tokens': 21, 'input_token_details': {'audio': 0, 'cache_read': 0}, 'output_token_details': {'audio': 0, 'reasoning': 0}})
The model on its own does not have any concept of state. For example, if you ask a followup question:
model
.
invoke
(
[
HumanMessage
(
content
=
"What's my name?"
)
]
)
AIMessage(content="I'm sorry, but I don't have access to personal information about users unless it has been shared with me in the course of our conversation. How can I assist you today?", additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 34, 'prompt_tokens': 11, 'total_tokens': 45, 'completion_tokens_details': {'accepted_prediction_tokens': 0, 'audio_tokens': 0, 'reasoning_tokens': 0, 'rejected_prediction_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': 0, 'cached_tokens': 0}}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_0705bf87c0', 'finish_reason': 'stop', 'logprobs': None}, id='run-a2d13a18-7022-4784-b54f-f85c097d1075-0', usage_metadata={'input_tokens': 11, 'output_tokens': 34, 'total_tokens': 45, 'input_token_details': {'audio': 0, 'cache_read': 0}, 'output_token_details': {'audio': 0, 'reasoning': 0}})
Let's take a look at the example
LangSmith trace
We can see that it doesn't take the previous conversation turn into context, and cannot answer the question.
This makes for a terrible chatbot experience!
To get around this, we need to pass the entire
conversation history
into the model. Let's see what happens when we do that:
from
langchain_core
.
messages
import
AIMessage
model
.
invoke
(
[
HumanMessage
(
content
=
"Hi! I'm Bob"
)
,
AIMessage
(
content
=
"Hello Bob! How can I assist you today?"
)
,
HumanMessage
(
content
=
"What's my name?"
)
,
]
)
AIMessage(content='Your name is Bob! How can I help you today, Bob?', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 33, 'total_tokens': 47, 'completion_tokens_details': {'accepted_prediction_tokens': 0, 'audio_tokens': 0, 'reasoning_tokens': 0, 'rejected_prediction_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': 0, 'cached_tokens': 0}}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_0705bf87c0', 'finish_reason': 'stop', 'logprobs': None}, id='run-34bcccb3-446e-42f2-b1de-52c09936c02c-0', usage_metadata={'input_tokens': 33, 'output_tokens': 14, 'total_tokens': 47, 'input_token_details': {'audio': 0, 'cache_read': 0}, 'output_token_details': {'audio': 0, 'reasoning': 0}})
And now we can see that we get a good response!
This is the basic idea underpinning a chatbot's ability to interact conversationally.
So how do we best implement this?
Message persistence
​
LangGraph
implements a built-in persistence layer, making it ideal for chat applications that support multiple conversational turns.
Wrapping our chat model in a minimal LangGraph application allows us to automatically persist the message history, simplifying the development of multi-turn applications.
LangGraph comes with a simple in-memory checkpointer, which we use below. See its
documentation
for more detail, including how to use different persistence backends (e.g., SQLite or Postgres).
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
We now need to create a
config
that we pass into the runnable every time. This config contains information that is not part of the input directly, but is still useful. In this case, we want to include a
thread_id
. This should look like:
config
=
{
"configurable"
:
{
"thread_id"
:
"abc123"
}
}
This enables us to support multiple conversation threads with a single application, a common requirement when your application has multiple users.
We can then invoke the application:
query
=
"Hi! I'm Bob."
input_messages
=
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
}
,
config
)
output
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
==================================[1m Ai Message [0m==================================
Hi Bob! How can I assist you today?
query
=
"What's my name?"
input_messages
=
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
}
,
config
)
output
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
==================================[1m Ai Message [0m==================================
Your name is Bob! How can I help you today, Bob?
Great! Our chatbot now remembers things about us. If we change the config to reference a different
thread_id
, we can see that it starts the conversation fresh.
config
=
{
"configurable"
:
{
"thread_id"
:
"abc234"
}
}
input_messages
=
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
}
,
config
)
output
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
==================================[1m Ai Message [0m==================================
I'm sorry, but I don't have access to personal information about you unless you've shared it in this conversation. How can I assist you today?
However, we can always go back to the original conversation (since we are persisting it in a database)
config
=
{
"configurable"
:
{
"thread_id"
:
"abc123"
}
}
input_messages
=
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
}
,
config
)
output
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
==================================[1m Ai Message [0m==================================
Your name is Bob. What would you like to discuss today?
This is how we can support a chatbot having conversations with many users!
For async support, update the
call_model
node to be an async function and use
.ainvoke
when invoking the application:
async
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
await
model
.
ainvoke
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
=
StateGraph
(
state_schema
=
MessagesState
)
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
app
=
workflow
.
compile
(
checkpointer
=
MemorySaver
(
)
)
output
=
await
app
.
ainvoke
(
{
"messages"
:
input_messages
}
,
config
)
output
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
Right now, all we've done is add a simple persistence layer around the model. We can start to make the chatbot more complicated and personalized by adding in a prompt template.
Prompt templates
​
Prompt Templates
help to turn raw user information into a format that the LLM can work with. In this case, the raw user input is just a message, which we are passing to the LLM. Let's now make that a bit more complicated. First, let's add in a system message with some custom instructions (but still taking messages as input). Next, we'll add in more input besides just the messages.
To add in a system message, we will create a
ChatPromptTemplate
. We will utilize
MessagesPlaceholder
to pass all the messages in.
from
langchain_core
.
prompts
import
ChatPromptTemplate
,
MessagesPlaceholder
prompt_template
=
ChatPromptTemplate
.
from_messages
(
[
(
"system"
,
"You talk like a pirate. Answer all questions to the best of your ability."
,
)
,
MessagesPlaceholder
(
variable_name
=
"messages"
)
,
]
)
We can now update our application to incorporate this template:
workflow
=
StateGraph
(
state_schema
=
MessagesState
)
def
call_model
(
state
:
MessagesState
)
:
prompt
=
prompt_template
.
invoke
(
state
)
response
=
model
.
invoke
(
prompt
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
We invoke the application in the same way:
config
=
{
"configurable"
:
{
"thread_id"
:
"abc345"
}
}
query
=
"Hi! I'm Jim."
input_messages
=
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
}
,
config
)
output
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
==================================[1m Ai Message [0m==================================
Ahoy there, Jim! What brings ye to these waters today? Be ye seekin' treasure, knowledge, or perhaps a good tale from the high seas? Arrr!
query
=
"What is my name?"
input_messages
=
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
}
,
config
)
output
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
==================================[1m Ai Message [0m==================================
Ye be called Jim, matey! A fine name fer a swashbuckler such as yerself! What else can I do fer ye? Arrr!
Awesome! Let's now make our prompt a little bit more complicated. Let's assume that the prompt template now looks something like this:
prompt_template
=
ChatPromptTemplate
.
from_messages
(
[
(
"system"
,
"You are a helpful assistant. Answer all questions to the best of your ability in {language}."
,
)
,
MessagesPlaceholder
(
variable_name
=
"messages"
)
,
]
)
Note that we have added a new
language
input to the prompt. Our application now has two parameters-- the input
messages
and
language
. We should update our application's state to reflect this:
from
typing
import
Sequence
from
langchain_core
.
messages
import
BaseMessage
from
langgraph
.
graph
.
message
import
add_messages
from
typing_extensions
import
Annotated
,
TypedDict
class
State
(
TypedDict
)
:
messages
:
Annotated
[
Sequence
[
BaseMessage
]
,
add_messages
]
language
:
str
workflow
=
StateGraph
(
state_schema
=
State
)
def
call_model
(
state
:
State
)
:
prompt
=
prompt_template
.
invoke
(
state
)
response
=
model
.
invoke
(
prompt
)
return
{
"messages"
:
[
response
]
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
config
=
{
"configurable"
:
{
"thread_id"
:
"abc456"
}
}
query
=
"Hi! I'm Bob."
language
=
"Spanish"
input_messages
=
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
,
"language"
:
language
}
,
config
,
)
output
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
==================================[1m Ai Message [0m==================================
¡Hola, Bob! ¿Cómo puedo ayudarte hoy?
Note that the entire state is persisted, so we can omit parameters like
language
if no changes are desired:
query
=
"What is my name?"
input_messages
=
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
}
,
config
,
)
output
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
==================================[1m Ai Message [0m==================================
Tu nombre es Bob. ¿Hay algo más en lo que pueda ayudarte?
To help you understand what's happening internally, check out
this LangSmith trace
.
Managing Conversation History
​
One important concept to understand when building chatbots is how to manage conversation history. If left unmanaged, the list of messages will grow unbounded and potentially overflow the context window of the LLM. Therefore, it is important to add a step that limits the size of the messages you are passing in.
Importantly, you will want to do this BEFORE the prompt template but AFTER you load previous messages from Message History.
We can do this by adding a simple step in front of the prompt that modifies the
messages
key appropriately, and then wrap that new chain in the Message History class.
LangChain comes with a few built-in helpers for
managing a list of messages
. In this case we'll use the
trim_messages
helper to reduce how many messages we're sending to the model. The trimmer allows us to specify how many tokens we want to keep, along with other parameters like if we want to always keep the system message and whether to allow partial messages:
from
langchain_core
.
messages
import
SystemMessage
,
trim_messages
trimmer
=
trim_messages
(
max_tokens
=
65
,
strategy
=
"last"
,
token_counter
=
model
,
include_system
=
True
,
allow_partial
=
False
,
start_on
=
"human"
,
)
messages
=
[
SystemMessage
(
content
=
"you're a good assistant"
)
,
HumanMessage
(
content
=
"hi! I'm bob"
)
,
AIMessage
(
content
=
"hi!"
)
,
HumanMessage
(
content
=
"I like vanilla ice cream"
)
,
AIMessage
(
content
=
"nice"
)
,
HumanMessage
(
content
=
"whats 2 + 2"
)
,
AIMessage
(
content
=
"4"
)
,
HumanMessage
(
content
=
"thanks"
)
,
AIMessage
(
content
=
"no problem!"
)
,
HumanMessage
(
content
=
"having fun?"
)
,
AIMessage
(
content
=
"yes!"
)
,
]
trimmer
.
invoke
(
messages
)
[SystemMessage(content="you're a good assistant", additional_kwargs={}, response_metadata={}),
HumanMessage(content='whats 2 + 2', additional_kwargs={}, response_metadata={}),
AIMessage(content='4', additional_kwargs={}, response_metadata={}),
HumanMessage(content='thanks', additional_kwargs={}, response_metadata={}),
AIMessage(content='no problem!', additional_kwargs={}, response_metadata={}),
HumanMessage(content='having fun?', additional_kwargs={}, response_metadata={}),
AIMessage(content='yes!', additional_kwargs={}, response_metadata={})]
To  use it in our chain, we just need to run the trimmer before we pass the
messages
input to our prompt.
workflow
=
StateGraph
(
state_schema
=
State
)
def
call_model
(
state
:
State
)
:
trimmed_messages
=
trimmer
.
invoke
(
state
[
"messages"
]
)
prompt
=
prompt_template
.
invoke
(
{
"messages"
:
trimmed_messages
,
"language"
:
state
[
"language"
]
}
)
response
=
model
.
invoke
(
prompt
)
return
{
"messages"
:
[
response
]
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
Now if we try asking the model our name, it won't know it since we trimmed that part of the chat history:
config
=
{
"configurable"
:
{
"thread_id"
:
"abc567"
}
}
query
=
"What is my name?"
language
=
"English"
input_messages
=
messages
+
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
,
"language"
:
language
}
,
config
,
)
output
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
==================================[1m Ai Message [0m==================================
I don't know your name. You haven't told me yet!
But if we ask about information that is within the last few messages, it remembers:
config
=
{
"configurable"
:
{
"thread_id"
:
"abc678"
}
}
query
=
"What math problem did I ask?"
language
=
"English"
input_messages
=
messages
+
[
HumanMessage
(
query
)
]
output
=
app
.
invoke
(
{
"messages"
:
input_messages
,
"language"
:
language
}
,
config
,
)
output
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
==================================[1m Ai Message [0m==================================
You asked what 2 + 2 equals.
If you take a look at LangSmith, you can see exactly what is happening under the hood in the
LangSmith trace
.
Streaming
​
Now we've got a functioning chatbot. However, one
really
important UX consideration for chatbot applications is streaming. LLMs can sometimes take a while to respond, and so in order to improve the user experience one thing that most applications do is stream back each token as it is generated. This allows the user to see progress.
It's actually super easy to do this!
By default,
.stream
in our LangGraph application streams application steps-- in this case, the single step of the model response. Setting
stream_mode="messages"
allows us to stream output tokens instead:
config
=
{
"configurable"
:
{
"thread_id"
:
"abc789"
}
}
query
=
"Hi I'm Todd, please tell me a joke."
language
=
"English"
input_messages
=
[
HumanMessage
(
query
)
]
for
chunk
,
metadata
in
app
.
stream
(
{
"messages"
:
input_messages
,
"language"
:
language
}
,
config
,
stream_mode
=
"messages"
,
)
:
if
isinstance
(
chunk
,
AIMessage
)
:
print
(
chunk
.
content
,
end
=
"|"
)
|Hi| Todd|!| Here|’s| a| joke| for| you|:
|Why| don|’t| skeleton|s| fight| each| other|?
|Because| they| don|’t| have| the| guts|!||
Next Steps
​
Now that you understand the basics of how to create a chatbot in LangChain, some more advanced tutorials you may be interested in are:
Conversational RAG
: Enable a chatbot experience over an external source of data
Agents
: Build a chatbot that can take actions
If you want to dive deeper on specifics, some things worth checking out are:
