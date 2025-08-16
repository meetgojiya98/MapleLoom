---
{
  "title": "How to stream runnables",
  "source_url": "https://python.langchain.com/docs/how_to/streaming/",
  "fetched_at": "2025-08-15T13:50:58.724383+00:00"
}
---

# How to stream runnables

This guide assumes familiarity with the following concepts:
Streaming is critical in making applications based on LLMs feel responsive to end-users.
Important LangChain primitives like
chat models
,
output parsers
,
prompts
,
retrievers
, and
agents
implement the LangChain
Runnable Interface
.
This interface provides two general approaches to stream content:
sync
stream
and async
astream
: a
default implementation
of streaming that streams the
final output
from the chain.
async
astream_events
and async
astream_log
: these provide a way to stream both
intermediate steps
and
final output
from the chain.
Let's take a look at both approaches, and try to understand how to use them.
Using Stream
​
All
Runnable
objects implement a sync method called
stream
and an async variant called
astream
.
These methods are designed to stream the final output in chunks, yielding each chunk as soon as it is available.
Streaming is only possible if all steps in the program know how to process an
input stream
; i.e., process an input chunk one at a time, and yield a corresponding output chunk.
The complexity of this processing can vary, from straightforward tasks like emitting tokens produced by an LLM, to more challenging ones like streaming parts of JSON results before the entire JSON is complete.
The best place to start exploring streaming is with the single most important components in LLMs apps-- the LLMs themselves!
LLMs and Chat Models
​
Large language models and their chat variants are the primary bottleneck in LLM based apps.
Large language models can take
several seconds
to generate a complete response to a query. This is far slower than the
~200-300 ms
threshold at which an application feels responsive to an end user.
The key strategy to make the application feel more responsive is to show intermediate progress; viz., to stream the output from the model
token by token
.
We will show examples of streaming using a chat model. Choose one from the options below:
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
Let's start with the sync
stream
API:
chunks
=
[
]
for
chunk
in
model
.
stream
(
"what color is the sky?"
)
:
chunks
.
append
(
chunk
)
print
(
chunk
.
content
,
end
=
"|"
,
flush
=
True
)
|The sky typically| appears blue during the day due to a phenomenon| called Rayleigh scattering, where| air molecules scatter sunlight, with| blue light being scattered more than other colors. However|, the sky's color can vary|:
- At sunrise/sunset:| Red, orange, pink, or purple
-| During storms: Gray or dark blue|
- At night: Dark| blue to black
- In certain| atmospheric conditions: White, yellow, or green| (rare)
The color we perceive depends| on weather conditions, time of day, pollution| levels, and our viewing angle.||
Alternatively, if you're working in an async environment, you may consider using the async
astream
API:
chunks
=
[
]
async
for
chunk
in
model
.
astream
(
"what color is the sky?"
)
:
chunks
.
append
(
chunk
)
print
(
chunk
.
content
,
end
=
"|"
,
flush
=
True
)
|The sky typically| appears blue during the day due to a phenomenon called Rayleigh| scattering, where air molecules scatter sunlight,| with blue light being scattered more than other colors. However|, the sky's color can vary - appearing re|d, orange, or pink during sunrise and sunset,| gray on cloudy days, and black at night.| The color you see depends on the time of| day, weather conditions, and your location.||
Let's inspect one of the chunks
AIMessageChunk(content='', additional_kwargs={}, response_metadata={'model_name': 'claude-3-7-sonnet-20250219'}, id='run--c4f01565-8bb4-4f07-9b23-acfe46cbeca3', usage_metadata={'input_tokens': 13, 'output_tokens': 0, 'total_tokens': 13, 'input_token_details': {'cache_creation': 0, 'cache_read': 0}})
We got back something called an
AIMessageChunk
. This chunk represents a part of an
AIMessage
.
Message chunks are additive by design -- one can simply add them up to get the state of the response so far!
chunks
[
0
]
+
chunks
[
1
]
+
chunks
[
2
]
+
chunks
[
3
]
+
chunks
[
4
]
AIMessageChunk(content='The sky typically appears blue during the day due to a phenomenon called Rayleigh scattering, where air molecules scatter sunlight, with blue light being scattered more than other colors. However', additional_kwargs={}, response_metadata={'model_name': 'claude-3-7-sonnet-20250219'}, id='run--c4f01565-8bb4-4f07-9b23-acfe46cbeca3', usage_metadata={'input_tokens': 13, 'output_tokens': 0, 'total_tokens': 13, 'input_token_details': {'cache_creation': 0, 'cache_read': 0}})
Chains
​
Virtually all LLM applications involve more steps than just a call to a language model.
Let's build a simple chain using
LangChain Expression Language
(
LCEL
) that combines a prompt, model and a parser and verify that streaming works.
We will use
StrOutputParser
to parse the output from the model. This is a simple parser that extracts the
content
field from an
AIMessageChunk
, giving us the
token
returned by the model.
LCEL is a
declarative
way to specify a "program" by chainining together different LangChain primitives. Chains created using LCEL benefit from an automatic implementation of
stream
and
astream
allowing streaming of the final output. In fact, chains created with LCEL implement the entire standard Runnable interface.
from
langchain_core
.
output_parsers
import
StrOutputParser
from
langchain_core
.
prompts
import
ChatPromptTemplate
prompt
=
ChatPromptTemplate
.
from_template
(
"tell me a joke about {topic}"
)
parser
=
StrOutputParser
(
)
chain
=
prompt
|
model
|
parser
async
for
chunk
in
chain
.
astream
(
{
"topic"
:
"parrot"
}
)
:
print
(
chunk
,
end
=
"|"
,
flush
=
True
)
|Why| don't parrots use the internet?
They|'re afraid of getting a virus from all the tweets|!||
Note that we're getting streaming output even though we're using
parser
at the end of the chain above. The
parser
operates on each streaming chunk individidually. Many of the
LCEL primitives
also support this kind of transform-style passthrough streaming, which can be very convenient when constructing apps.
Custom functions can be
designed to return generators
, which are able to operate on streams.
Certain runnables, like
prompt templates
and
chat models
, cannot process individual chunks and instead aggregate all previous steps. Such runnables can interrupt the streaming process.
The LangChain Expression language allows you to separate the construction of a chain from the mode in which it is used (e.g., sync/async, batch/streaming etc.). If this is not relevant to what you're building, you can also rely on a standard
imperative
programming approach by
caling
invoke
,
batch
or
stream
on each component individually, assigning the results to variables and then using them downstream as you see fit.
Working with Input Streams
​
What if you wanted to stream JSON from the output as it was being generated?
If you were to rely on
json.loads
to parse the partial json, the parsing would fail as the partial json wouldn't be valid json.
You'd likely be at a complete loss of what to do and claim that it wasn't possible to stream JSON.
Well, turns out there is a way to do it -- the parser needs to operate on the
input stream
, and attempt to "auto-complete" the partial json into a valid state.
Let's see such a parser in action to understand what this means.
from
langchain_core
.
output_parsers
import
JsonOutputParser
chain
=
(
model
|
JsonOutputParser
(
)
)
async
for
text
in
chain
.
astream
(
"output a list of the countries france, spain and japan and their populations in JSON format. "
'Use a dict with an outer key of "countries" which contains a list of countries. '
"Each country should have the key `name` and `population`"
)
:
print
(
text
,
flush
=
True
)
{'countries': []}
{'countries': [{'name': 'France'}]}
{'countries': [{'name': 'France', 'population': 67750}]}
{'countries': [{'name': 'France', 'population': 67750000}, {}]}
{'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain'}]}
{'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {}]}
{'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan'}]}
{'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan', 'population': 125700000}]}
Now, let's
break
streaming. We'll use the previous example and append an extraction function at the end that extracts the country names from the finalized JSON.
Any steps in the chain that operate on
finalized inputs
rather than on
input streams
can break streaming functionality via
stream
or
astream
.
Later, we will discuss the
astream_events
API which streams results from intermediate steps. This API will stream results from intermediate steps even if the chain contains steps that only operate on
finalized inputs
.
from
langchain_core
.
output_parsers
import
(
JsonOutputParser
,
)
def
_extract_country_names
(
inputs
)
:
"""A function that does not operates on input streams and breaks streaming."""
if
not
isinstance
(
inputs
,
dict
)
:
return
""
if
"countries"
not
in
inputs
:
return
""
countries
=
inputs
[
"countries"
]
if
not
isinstance
(
countries
,
list
)
:
return
""
country_names
=
[
country
.
get
(
"name"
)
for
country
in
countries
if
isinstance
(
country
,
dict
)
]
return
country_names
chain
=
model
|
JsonOutputParser
(
)
|
_extract_country_names
async
for
text
in
chain
.
astream
(
"output a list of the countries france, spain and japan and their populations in JSON format. "
'Use a dict with an outer key of "countries" which contains a list of countries. '
"Each country should have the key `name` and `population`"
)
:
print
(
text
,
end
=
"|"
,
flush
=
True
)
['France', 'Spain', 'Japan']|
Generator Functions
​
Let's fix the streaming using a generator function that can operate on the
input stream
.
A generator function (a function that uses
yield
) allows writing code that operates on
input streams
from
langchain_core
.
output_parsers
import
JsonOutputParser
async
def
_extract_country_names_streaming
(
input_stream
)
:
"""A function that operates on input streams."""
country_names_so_far
=
set
(
)
async
for
input
in
input_stream
:
if
not
isinstance
(
input
,
dict
)
:
continue
if
"countries"
not
in
input
:
continue
countries
=
input
[
"countries"
]
if
not
isinstance
(
countries
,
list
)
:
continue
for
country
in
countries
:
name
=
country
.
get
(
"name"
)
if
not
name
:
continue
if
name
not
in
country_names_so_far
:
yield
name
country_names_so_far
.
add
(
name
)
chain
=
model
|
JsonOutputParser
(
)
|
_extract_country_names_streaming
async
for
text
in
chain
.
astream
(
"output a list of the countries france, spain and japan and their populations in JSON format. "
'Use a dict with an outer key of "countries" which contains a list of countries. '
"Each country should have the key `name` and `population`"
,
)
:
print
(
text
,
end
=
"|"
,
flush
=
True
)
Because the code above is relying on JSON auto-completion, you may see partial names of countries (e.g.,
Sp
and
Spain
), which is not what one would want for an extraction result!
We're focusing on streaming concepts, not necessarily the results of the chains.
Non-streaming components
​
Some built-in components like Retrievers do not offer any
streaming
. What happens if we try to
stream
them? 🤨
from
langchain_community
.
vectorstores
import
FAISS
from
langchain_core
.
output_parsers
import
StrOutputParser
from
langchain_core
.
prompts
import
ChatPromptTemplate
from
langchain_core
.
runnables
import
RunnablePassthrough
from
langchain_openai
import
OpenAIEmbeddings
template
=
"""Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt
=
ChatPromptTemplate
.
from_template
(
template
)
vectorstore
=
FAISS
.
from_texts
(
[
"harrison worked at kensho"
,
"harrison likes spicy food"
]
,
embedding
=
OpenAIEmbeddings
(
)
,
)
retriever
=
vectorstore
.
as_retriever
(
)
chunks
=
[
chunk
for
chunk
in
retriever
.
stream
(
"where did harrison work?"
)
]
chunks
[[Document(id='2740a247-9738-48c4-8c8f-d879d4ed39f7', metadata={}, page_content='harrison worked at kensho'),
Document(id='1d3d012f-1cb0-4bee-928a-c8bf0f8b1b92', metadata={}, page_content='harrison likes spicy food')]]
Stream just yielded the final result from that component.
This is OK 🥹! Not all components have to implement streaming -- in some cases streaming is either unnecessary, difficult or just doesn't make sense.
An LCEL chain constructed using non-streaming components, will still be able to stream in a lot of cases, with streaming of partial output starting after the last non-streaming step in the chain.
retrieval_chain
=
(
{
"context"
:
retriever
.
with_config
(
run_name
=
"Docs"
)
,
"question"
:
RunnablePassthrough
(
)
,
}
|
prompt
|
model
|
StrOutputParser
(
)
)
for
chunk
in
retrieval_chain
.
stream
(
"Where did harrison work? Write 3 made up sentences about this place."
)
:
print
(
chunk
,
end
=
"|"
,
flush
=
True
)
|Base|d on the provided context, Harrison worked at Kens|ho.
Three made up sentences about Kens|ho:
1. Kensho is a| cutting-edge technology company that specializes in| AI and data analytics for financial institutions.
2|. The Kensho office features| an open floor plan with panoramic views of the city| skyline, creating an inspiring environment for its| employees.
3. At Kensho,| team members often collaborate in innovative brainstorming sessions while| enjoying complimentary gourmet coffee from| their in-house café.||
Now that we've seen how
stream
and
astream
work, let's venture into the world of streaming events. 🏞️
Using Stream Events
​
Event Streaming is a
beta
API. This API may change a bit based on feedback.
This guide demonstrates the
V2
API and requires langchain-core >= 0.2. For the
V1
API compatible with older versions of LangChain, see
here
.
import
langchain_core
langchain_core
.
__version__
For the
astream_events
API to work properly:
Use
async
throughout the code to the extent possible (e.g., async tools etc)
Propagate callbacks if defining custom functions / runnables
Whenever using runnables without LCEL, make sure to call
.astream()
on LLMs rather than
.ainvoke
to force the LLM to stream tokens.
Let us know if anything doesn't work as expected! :)
Event Reference
​
Below is a reference table that shows some events that might be emitted by the various Runnable objects.
When streaming is implemented properly, the inputs to a runnable will not be known until after the input stream has been entirely consumed. This means that
inputs
will often be included only for
end
events and rather than for
start
events.
event
name
chunk
input
output
on_chat_model_start
[model name]
{"messages": [[SystemMessage, HumanMessage]]}
on_chat_model_stream
[model name]
AIMessageChunk(content="hello")
on_chat_model_end
[model name]
{"messages": [[SystemMessage, HumanMessage]]}
AIMessageChunk(content="hello world")
on_llm_start
[model name]
{'input': 'hello'}
on_llm_stream
[model name]
'Hello'
on_llm_end
[model name]
'Hello human!'
on_chain_start
format_docs
on_chain_stream
format_docs
"hello world!, goodbye world!"
on_chain_end
format_docs
[Document(...)]
"hello world!, goodbye world!"
on_tool_start
some_tool
{"x": 1, "y": "2"}
on_tool_end
some_tool
{"x": 1, "y": "2"}
on_retriever_start
[retriever name]
{"query": "hello"}
on_retriever_end
[retriever name]
{"query": "hello"}
[Document(...), ..]
on_prompt_start
[template_name]
{"question": "hello"}
on_prompt_end
[template_name]
{"question": "hello"}
ChatPromptValue(messages: [SystemMessage, ...])
Chat Model
​
Let's start off by looking at the events produced by a chat model.
events
=
[
]
async
for
event
in
model
.
astream_events
(
"hello"
)
:
events
.
append
(
event
)
For
langchain-core<0.3.37
, set the
version
kwarg explicitly (e.g.,
model.astream_events("hello", version="v2")
).
Let's take a look at the few of the start event and a few of the end events.
[{'event': 'on_chat_model_start',
'data': {'input': 'hello'},
'name': 'ChatAnthropic',
'tags': [],
'run_id': 'c35a72be-a5af-4bd5-bd9b-206135c28ef6',
'metadata': {'ls_provider': 'anthropic',
'ls_model_name': 'claude-3-7-sonnet-20250219',
'ls_model_type': 'chat',
'ls_temperature': 0.0,
'ls_max_tokens': 1024},
'parent_ids': []},
{'event': 'on_chat_model_stream',
'run_id': 'c35a72be-a5af-4bd5-bd9b-206135c28ef6',
'name': 'ChatAnthropic',
'tags': [],
'metadata': {'ls_provider': 'anthropic',
'ls_model_name': 'claude-3-7-sonnet-20250219',
'ls_model_type': 'chat',
'ls_temperature': 0.0,
'ls_max_tokens': 1024},
'data': {'chunk': AIMessageChunk(content='', additional_kwargs={}, response_metadata={'model_name': 'claude-3-7-sonnet-20250219'}, id='run--c35a72be-a5af-4bd5-bd9b-206135c28ef6', usage_metadata={'input_tokens': 8, 'output_tokens': 0, 'total_tokens': 8, 'input_token_details': {'cache_creation': 0, 'cache_read': 0}})},
'parent_ids': []},
{'event': 'on_chat_model_stream',
'run_id': 'c35a72be-a5af-4bd5-bd9b-206135c28ef6',
'name': 'ChatAnthropic',
'tags': [],
'metadata': {'ls_provider': 'anthropic',
'ls_model_name': 'claude-3-7-sonnet-20250219',
'ls_model_type': 'chat',
'ls_temperature': 0.0,
'ls_max_tokens': 1024},
'data': {'chunk': AIMessageChunk(content='Hello! How', additional_kwargs={}, response_metadata={}, id='run--c35a72be-a5af-4bd5-bd9b-206135c28ef6')},
'parent_ids': []}]
[{'event': 'on_chat_model_stream',
'run_id': 'c35a72be-a5af-4bd5-bd9b-206135c28ef6',
'name': 'ChatAnthropic',
'tags': [],
'metadata': {'ls_provider': 'anthropic',
'ls_model_name': 'claude-3-7-sonnet-20250219',
'ls_model_type': 'chat',
'ls_temperature': 0.0,
'ls_max_tokens': 1024},
'data': {'chunk': AIMessageChunk(content='', additional_kwargs={}, response_metadata={'stop_reason': 'end_turn', 'stop_sequence': None}, id='run--c35a72be-a5af-4bd5-bd9b-206135c28ef6', usage_metadata={'input_tokens': 0, 'output_tokens': 40, 'total_tokens': 40})},
'parent_ids': []},
{'event': 'on_chat_model_end',
'data': {'output': AIMessageChunk(content="Hello! How can I assist you today? Whether you have questions, need information, or just want to chat, I'm here to help. What would you like to talk about?", additional_kwargs={}, response_metadata={'model_name': 'claude-3-7-sonnet-20250219', 'stop_reason': 'end_turn', 'stop_sequence': None}, id='run--c35a72be-a5af-4bd5-bd9b-206135c28ef6', usage_metadata={'input_tokens': 8, 'output_tokens': 40, 'total_tokens': 48, 'input_token_details': {'cache_creation': 0, 'cache_read': 0}})},
'run_id': 'c35a72be-a5af-4bd5-bd9b-206135c28ef6',
'name': 'ChatAnthropic',
'tags': [],
'metadata': {'ls_provider': 'anthropic',
'ls_model_name': 'claude-3-7-sonnet-20250219',
'ls_model_type': 'chat',
'ls_temperature': 0.0,
'ls_max_tokens': 1024},
'parent_ids': []}]
Chain
​
Let's revisit the example chain that parsed streaming JSON to explore the streaming events API.
chain
=
(
model
|
JsonOutputParser
(
)
)
events
=
[
event
async
for
event
in
chain
.
astream_events
(
"output a list of the countries france, spain and japan and their populations in JSON format. "
'Use a dict with an outer key of "countries" which contains a list of countries. '
"Each country should have the key `name` and `population`"
,
)
]
If you examine at the first few events, you'll notice that there are
3
different start events rather than
2
start events.
The three start events correspond to:
The chain (model + parser)
The model
The parser
[{'event': 'on_chain_start',
'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'},
'name': 'RunnableSequence',
'tags': [],
'run_id': 'f859e56f-a760-4670-a24e-040e11bcd7fc',
'metadata': {},
'parent_ids': []},
{'event': 'on_chat_model_start',
'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`', additional_kwargs={}, response_metadata={})]]}},
'name': 'ChatAnthropic',
'tags': ['seq:step:1'],
'run_id': '2aa8c9e6-a5cd-4e94-b994-cb0e9bd8ab21',
'metadata': {'ls_provider': 'anthropic',
'ls_model_name': 'claude-3-7-sonnet-20250219',
'ls_model_type': 'chat',
'ls_temperature': 0.0,
'ls_max_tokens': 1024},
'parent_ids': ['f859e56f-a760-4670-a24e-040e11bcd7fc']},
{'event': 'on_chat_model_stream',
'data': {'chunk': AIMessageChunk(content='', additional_kwargs={}, response_metadata={'model_name': 'claude-3-7-sonnet-20250219'}, id='run--2aa8c9e6-a5cd-4e94-b994-cb0e9bd8ab21', usage_metadata={'input_tokens': 56, 'output_tokens': 0, 'total_tokens': 56, 'input_token_details': {'cache_creation': 0, 'cache_read': 0}})},
'run_id': '2aa8c9e6-a5cd-4e94-b994-cb0e9bd8ab21',
'name': 'ChatAnthropic',
'tags': ['seq:step:1'],
'metadata': {'ls_provider': 'anthropic',
'ls_model_name': 'claude-3-7-sonnet-20250219',
'ls_model_type': 'chat',
'ls_temperature': 0.0,
'ls_max_tokens': 1024},
'parent_ids': ['f859e56f-a760-4670-a24e-040e11bcd7fc']}]
What do you think you'd see if you looked at the last 3 events? what about the middle?
Let's use this API to take output the stream events from the model and the parser. We're ignoring start events, end events and events from the chain.
num_events
=
0
async
for
event
in
chain
.
astream_events
(
"output a list of the countries france, spain and japan and their populations in JSON format. "
'Use a dict with an outer key of "countries" which contains a list of countries. '
"Each country should have the key `name` and `population`"
,
)
:
kind
=
event
[
"event"
]
if
kind
==
"on_chat_model_stream"
:
print
(
f"Chat model chunk:
{
repr
(
event
[
'data'
]
[
'chunk'
]
.
content
)
}
"
,
flush
=
True
,
)
if
kind
==
"on_parser_stream"
:
print
(
f"Parser chunk:
{
event
[
'data'
]
[
'chunk'
]
}
"
,
flush
=
True
)
num_events
+=
1
if
num_events
>
30
:
print
(
"..."
)
break
Chat model chunk: ''
Chat model chunk: '\`\`\`'
Chat model chunk: 'json\n{\n  "countries": ['
Parser chunk: {'countries': []}
Chat model chunk: '\n    {\n      "name": "France",'
Parser chunk: {'countries': [{'name': 'France'}]}
Chat model chunk: '\n      "population": 67750000\n    },'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}]}
Chat model chunk: '\n    {\n      "name": "Spain",'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain'}]}
Chat model chunk: '\n      "population": 47350'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350}]}
Chat model chunk: '000\n    },\n    {\n      "'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {}]}
Chat model chunk: 'name": "Japan",\n      "population":'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan'}]}
Chat model chunk: ' 125700000\n    }'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan', 'population': 125700000}]}
Chat model chunk: '\n  ]\n}\n\`\`\`'
Chat model chunk: ''
...
Because both the model and the parser support streaming, we see streaming events from both components in real time! Kind of cool isn't it? 🦜
Filtering Events
​
Because this API produces so many events, it is useful to be able to filter on events.
You can filter by either component
name
, component
tags
or component
type
.
By Name
​
chain
=
model
.
with_config
(
{
"run_name"
:
"model"
}
)
|
JsonOutputParser
(
)
.
with_config
(
{
"run_name"
:
"my_parser"
}
)
max_events
=
0
async
for
event
in
chain
.
astream_events
(
"output a list of the countries france, spain and japan and their populations in JSON format. "
'Use a dict with an outer key of "countries" which contains a list of countries. '
"Each country should have the key `name` and `population`"
,
include_names
=
[
"my_parser"
]
,
)
:
print
(
event
)
max_events
+=
1
if
max_events
>
10
:
print
(
"..."
)
break
{'event': 'on_parser_start', 'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}, 'name': 'my_parser', 'tags': ['seq:step:2'], 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'metadata': {}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_stream', 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': []}}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_stream', 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France'}]}}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_stream', 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67750}]}}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_stream', 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67750000}, {}]}}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_stream', 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain'}]}}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_stream', 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}]}}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_stream', 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan'}]}}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_stream', 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan', 'population': 125700000}]}}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
{'event': 'on_parser_end', 'data': {'output': {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan', 'population': 125700000}]}}, 'run_id': '781af9b6-31f8-47f2-ab79-52d17b000857', 'name': 'my_parser', 'tags': ['seq:step:2'], 'metadata': {}, 'parent_ids': ['82c918c6-d5f6-4d2d-b710-4668509fe2f0']}
By Type
​
chain
=
model
.
with_config
(
{
"run_name"
:
"model"
}
)
|
JsonOutputParser
(
)
.
with_config
(
{
"run_name"
:
"my_parser"
}
)
max_events
=
0
async
for
event
in
chain
.
astream_events
(
'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
,
include_types
=
[
"chat_model"
]
,
)
:
print
(
event
)
max_events
+=
1
if
max_events
>
10
:
print
(
"..."
)
break
{'event': 'on_chat_model_start', 'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}, 'name': 'model', 'tags': ['seq:step:1'], 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='', additional_kwargs={}, response_metadata={'model_name': 'claude-3-7-sonnet-20250219'}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5', usage_metadata={'input_tokens': 56, 'output_tokens': 0, 'total_tokens': 56, 'input_token_details': {'cache_creation': 0, 'cache_read': 0}})}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='\`\`\`', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='json\n{\n  "countries": [', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='\n    {\n      "name": "France",', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='\n      "population": 67750', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='000\n    },\n    {\n      "', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='name": "Spain",\n      "population":', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content=' 47350000\n    },', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='\n    {\n      "name": "Japan",', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='\n      "population": 125700', additional_kwargs={}, response_metadata={}, id='run--b7a08416-a629-4b42-b5d5-dbe48566e5d5')}, 'run_id': 'b7a08416-a629-4b42-b5d5-dbe48566e5d5', 'name': 'model', 'tags': ['seq:step:1'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['116a6506-5a19-4f60-a8c2-7b728d4b8248']}
...
Tags are inherited by child components of a given runnable.
If you're using tags to filter, make sure that this is what you want.
chain
=
(
model
|
JsonOutputParser
(
)
)
.
with_config
(
{
"tags"
:
[
"my_chain"
]
}
)
max_events
=
0
async
for
event
in
chain
.
astream_events
(
'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
,
include_tags
=
[
"my_chain"
]
,
)
:
print
(
event
)
max_events
+=
1
if
max_events
>
10
:
print
(
"..."
)
break
{'event': 'on_chain_start', 'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}, 'name': 'RunnableSequence', 'tags': ['my_chain'], 'run_id': '3e4f8c37-a44a-46b7-a7e5-75182d1cca31', 'metadata': {}, 'parent_ids': []}
{'event': 'on_chat_model_start', 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`', additional_kwargs={}, response_metadata={})]]}}, 'name': 'ChatAnthropic', 'tags': ['seq:step:1', 'my_chain'], 'run_id': '778846c9-acd3-43b7-b9c0-ac718761b2bc', 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['3e4f8c37-a44a-46b7-a7e5-75182d1cca31']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='', additional_kwargs={}, response_metadata={'model_name': 'claude-3-7-sonnet-20250219'}, id='run--778846c9-acd3-43b7-b9c0-ac718761b2bc', usage_metadata={'input_tokens': 56, 'output_tokens': 0, 'total_tokens': 56, 'input_token_details': {'cache_creation': 0, 'cache_read': 0}})}, 'run_id': '778846c9-acd3-43b7-b9c0-ac718761b2bc', 'name': 'ChatAnthropic', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['3e4f8c37-a44a-46b7-a7e5-75182d1cca31']}
{'event': 'on_parser_start', 'data': {}, 'name': 'JsonOutputParser', 'tags': ['seq:step:2', 'my_chain'], 'run_id': '2c46d24f-231c-4062-a7ab-b7954840986d', 'metadata': {}, 'parent_ids': ['3e4f8c37-a44a-46b7-a7e5-75182d1cca31']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='\`\`\`', additional_kwargs={}, response_metadata={}, id='run--778846c9-acd3-43b7-b9c0-ac718761b2bc')}, 'run_id': '778846c9-acd3-43b7-b9c0-ac718761b2bc', 'name': 'ChatAnthropic', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['3e4f8c37-a44a-46b7-a7e5-75182d1cca31']}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='json\n{\n  "countries": [', additional_kwargs={}, response_metadata={}, id='run--778846c9-acd3-43b7-b9c0-ac718761b2bc')}, 'run_id': '778846c9-acd3-43b7-b9c0-ac718761b2bc', 'name': 'ChatAnthropic', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['3e4f8c37-a44a-46b7-a7e5-75182d1cca31']}
{'event': 'on_parser_stream', 'run_id': '2c46d24f-231c-4062-a7ab-b7954840986d', 'name': 'JsonOutputParser', 'tags': ['seq:step:2', 'my_chain'], 'metadata': {}, 'data': {'chunk': {'countries': []}}, 'parent_ids': ['3e4f8c37-a44a-46b7-a7e5-75182d1cca31']}
{'event': 'on_chain_stream', 'run_id': '3e4f8c37-a44a-46b7-a7e5-75182d1cca31', 'name': 'RunnableSequence', 'tags': ['my_chain'], 'metadata': {}, 'data': {'chunk': {'countries': []}}, 'parent_ids': []}
{'event': 'on_chat_model_stream', 'data': {'chunk': AIMessageChunk(content='\n    {\n      "name": "France",', additional_kwargs={}, response_metadata={}, id='run--778846c9-acd3-43b7-b9c0-ac718761b2bc')}, 'run_id': '778846c9-acd3-43b7-b9c0-ac718761b2bc', 'name': 'ChatAnthropic', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-7-sonnet-20250219', 'ls_model_type': 'chat', 'ls_temperature': 0.0, 'ls_max_tokens': 1024}, 'parent_ids': ['3e4f8c37-a44a-46b7-a7e5-75182d1cca31']}
{'event': 'on_parser_stream', 'run_id': '2c46d24f-231c-4062-a7ab-b7954840986d', 'name': 'JsonOutputParser', 'tags': ['seq:step:2', 'my_chain'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France'}]}}, 'parent_ids': ['3e4f8c37-a44a-46b7-a7e5-75182d1cca31']}
{'event': 'on_chain_stream', 'run_id': '3e4f8c37-a44a-46b7-a7e5-75182d1cca31', 'name': 'RunnableSequence', 'tags': ['my_chain'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France'}]}}, 'parent_ids': []}
...
Non-streaming components
​
Remember how some components don't stream well because they don't operate on
input streams
?
While such components can break streaming of the final output when using
astream
,
astream_events
will still yield streaming events from intermediate steps that support streaming!
def
_extract_country_names
(
inputs
)
:
"""A function that does not operates on input streams and breaks streaming."""
if
not
isinstance
(
inputs
,
dict
)
:
return
""
if
"countries"
not
in
inputs
:
return
""
countries
=
inputs
[
"countries"
]
if
not
isinstance
(
countries
,
list
)
:
return
""
country_names
=
[
country
.
get
(
"name"
)
for
country
in
countries
if
isinstance
(
country
,
dict
)
]
return
country_names
chain
=
(
model
|
JsonOutputParser
(
)
|
_extract_country_names
)
As expected, the
astream
API doesn't work correctly because
_extract_country_names
doesn't operate on streams.
async
for
chunk
in
chain
.
astream
(
"output a list of the countries france, spain and japan and their populations in JSON format. "
'Use a dict with an outer key of "countries" which contains a list of countries. '
"Each country should have the key `name` and `population`"
,
)
:
print
(
chunk
,
flush
=
True
)
['France', 'Spain', 'Japan']
Now, let's confirm that with astream_events we're still seeing streaming output from the model and the parser.
num_events
=
0
async
for
event
in
chain
.
astream_events
(
"output a list of the countries france, spain and japan and their populations in JSON format. "
'Use a dict with an outer key of "countries" which contains a list of countries. '
"Each country should have the key `name` and `population`"
,
)
:
kind
=
event
[
"event"
]
if
kind
==
"on_chat_model_stream"
:
print
(
f"Chat model chunk:
{
repr
(
event
[
'data'
]
[
'chunk'
]
.
content
)
}
"
,
flush
=
True
,
)
if
kind
==
"on_parser_stream"
:
print
(
f"Parser chunk:
{
event
[
'data'
]
[
'chunk'
]
}
"
,
flush
=
True
)
num_events
+=
1
if
num_events
>
30
:
print
(
"..."
)
break
Chat model chunk: ''
Chat model chunk: '\`\`\`'
Chat model chunk: 'json\n{\n  "countries": ['
Parser chunk: {'countries': []}
Chat model chunk: '\n    {\n      "name": "France",'
Parser chunk: {'countries': [{'name': 'France'}]}
Chat model chunk: '\n      "population": 67750'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750}]}
Chat model chunk: '000\n    },\n    {\n      "'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {}]}
Chat model chunk: 'name": "Spain",\n      "population":'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain'}]}
Chat model chunk: ' 47350000\n    },'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}]}
Chat model chunk: '\n    {\n      "name": "Japan",'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan'}]}
Chat model chunk: '\n      "population": 125700'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan', 'population': 125700}]}
Chat model chunk: '000\n    }\n  ]\n}'
Parser chunk: {'countries': [{'name': 'France', 'population': 67750000}, {'name': 'Spain', 'population': 47350000}, {'name': 'Japan', 'population': 125700000}]}
Chat model chunk: '\n\`\`\`'
Chat model chunk: ''
...
Propagating Callbacks
​
If you're using invoking runnables inside your tools, you need to propagate callbacks to the runnable; otherwise, no stream events will be generated.
When using
RunnableLambdas
or
@chain
decorator, callbacks are propagated automatically behind the scenes.
from
langchain_core
.
runnables
import
RunnableLambda
from
langchain_core
.
tools
import
tool
def
reverse_word
(
word
:
str
)
:
return
word
[
:
:
-
1
]
reverse_word
=
RunnableLambda
(
reverse_word
)
@tool
def
bad_tool
(
word
:
str
)
:
"""Custom tool that doesn't propagate callbacks."""
return
reverse_word
.
invoke
(
word
)
async
for
event
in
bad_tool
.
astream_events
(
"hello"
)
:
print
(
event
)
{'event': 'on_tool_start', 'data': {'input': 'hello'}, 'name': 'bad_tool', 'tags': [], 'run_id': 'b1c6b79d-f94b-432f-a289-1ea68a7c3cea', 'metadata': {}, 'parent_ids': []}
{'event': 'on_chain_start', 'data': {'input': 'hello'}, 'name': 'reverse_word', 'tags': [], 'run_id': 'e661c1ec-e6d2-4f9a-9620-b50645f2b194', 'metadata': {}, 'parent_ids': ['b1c6b79d-f94b-432f-a289-1ea68a7c3cea']}
{'event': 'on_chain_end', 'data': {'output': 'olleh', 'input': 'hello'}, 'run_id': 'e661c1ec-e6d2-4f9a-9620-b50645f2b194', 'name': 'reverse_word', 'tags': [], 'metadata': {}, 'parent_ids': ['b1c6b79d-f94b-432f-a289-1ea68a7c3cea']}
{'event': 'on_tool_end', 'data': {'output': 'olleh'}, 'run_id': 'b1c6b79d-f94b-432f-a289-1ea68a7c3cea', 'name': 'bad_tool', 'tags': [], 'metadata': {}, 'parent_ids': []}
Here's a re-implementation that does propagate callbacks correctly. You'll notice that now we're getting events from the
reverse_word
runnable as well.
@tool
def
correct_tool
(
word
:
str
,
callbacks
)
:
"""A tool that correctly propagates callbacks."""
return
reverse_word
.
invoke
(
word
,
{
"callbacks"
:
callbacks
}
)
async
for
event
in
correct_tool
.
astream_events
(
"hello"
)
:
print
(
event
)
{'event': 'on_tool_start', 'data': {'input': 'hello'}, 'name': 'correct_tool', 'tags': [], 'run_id': '399c91f5-a40b-4173-943f-a9c583a04003', 'metadata': {}, 'parent_ids': []}
{'event': 'on_chain_start', 'data': {'input': 'hello'}, 'name': 'reverse_word', 'tags': [], 'run_id': 'e9cc7db1-4587-40af-9c35-2d787b3f0956', 'metadata': {}, 'parent_ids': ['399c91f5-a40b-4173-943f-a9c583a04003']}
{'event': 'on_chain_end', 'data': {'output': 'olleh', 'input': 'hello'}, 'run_id': 'e9cc7db1-4587-40af-9c35-2d787b3f0956', 'name': 'reverse_word', 'tags': [], 'metadata': {}, 'parent_ids': ['399c91f5-a40b-4173-943f-a9c583a04003']}
{'event': 'on_tool_end', 'data': {'output': 'olleh'}, 'run_id': '399c91f5-a40b-4173-943f-a9c583a04003', 'name': 'correct_tool', 'tags': [], 'metadata': {}, 'parent_ids': []}
If you're invoking runnables from within Runnable Lambdas or
@chains
, then callbacks will be passed automatically on your behalf.
from
langchain_core
.
runnables
import
RunnableLambda
async
def
reverse_and_double
(
word
:
str
)
:
return
await
reverse_word
.
ainvoke
(
word
)
*
2
reverse_and_double
=
RunnableLambda
(
reverse_and_double
)
await
reverse_and_double
.
ainvoke
(
"1234"
)
async
for
event
in
reverse_and_double
.
astream_events
(
"1234"
)
:
print
(
event
)
{'event': 'on_chain_start', 'data': {'input': '1234'}, 'name': 'reverse_and_double', 'tags': [], 'run_id': '04726e2e-f508-4f90-9d4f-f88e588f0b39', 'metadata': {}, 'parent_ids': []}
{'event': 'on_chain_stream', 'run_id': '04726e2e-f508-4f90-9d4f-f88e588f0b39', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'chunk': '43214321'}, 'parent_ids': []}
{'event': 'on_chain_end', 'data': {'output': '43214321'}, 'run_id': '04726e2e-f508-4f90-9d4f-f88e588f0b39', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'parent_ids': []}
And with the
@chain
decorator:
from
langchain_core
.
runnables
import
chain
@chain
async
def
reverse_and_double
(
word
:
str
)
:
return
await
reverse_word
.
ainvoke
(
word
)
*
2
await
reverse_and_double
.
ainvoke
(
"1234"
)
async
for
event
in
reverse_and_double
.
astream_events
(
"1234"
)
:
print
(
event
)
{'event': 'on_chain_start', 'data': {'input': '1234'}, 'name': 'reverse_and_double', 'tags': [], 'run_id': '25f72976-aa79-408d-bb42-6d0f038cde52', 'metadata': {}, 'parent_ids': []}
{'event': 'on_chain_stream', 'run_id': '25f72976-aa79-408d-bb42-6d0f038cde52', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'chunk': '43214321'}, 'parent_ids': []}
{'event': 'on_chain_end', 'data': {'output': '43214321'}, 'run_id': '25f72976-aa79-408d-bb42-6d0f038cde52', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'parent_ids': []}
Next steps
​
Now you've learned some ways to stream both final outputs and internal steps with LangChain.
To learn more, check out the other how-to guides in this section, or the
conceptual guide on Langchain Expression Language
.
