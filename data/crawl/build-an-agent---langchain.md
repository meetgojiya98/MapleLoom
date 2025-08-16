---
{
  "title": "Build an Agent | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/tutorials/agents/",
  "fetched_at": "2025-08-15T13:48:45.350045+00:00"
}
---

# Build an Agent | 🦜️🔗 LangChain

LangChain supports the creation of
agents
, or systems that use
LLMs
as reasoning engines to determine which actions to take and the inputs necessary to perform the action.
After executing actions, the results can be fed back into the LLM to determine whether more actions are needed, or whether it is okay to finish. This is often achieved via
tool-calling
.
In this tutorial we will build an agent that can interact with a search engine. You will be able to ask this agent questions, watch it call the search tool, and have conversations with it.
End-to-end agent
​
The code snippet below represents a fully functional agent that uses an LLM to decide which tools to use. It is equipped with a generic search tool. It has conversational memory - meaning that it can be used as a multi-turn chatbot.
In the rest of the guide, we will walk through the individual components and what each part does - but if you want to just grab some code and get started, feel free to use this!
from
langchain
.
chat_models
import
init_chat_model
from
langchain_tavily
import
TavilySearch
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
memory
=
MemorySaver
(
)
model
=
init_chat_model
(
"anthropic:claude-3-5-sonnet-latest"
)
search
=
TavilySearch
(
max_results
=
2
)
tools
=
[
search
]
agent_executor
=
create_react_agent
(
model
,
tools
,
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
"abc123"
}
}
input_message
=
{
"role"
:
"user"
,
"content"
:
"Hi, I'm Bob and I live in SF."
,
}
for
step
in
agent_executor
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
Hi, I'm Bob and I live in SF.
==================================[1m Ai Message [0m==================================
Hello Bob! I notice you've introduced yourself and mentioned you live in SF (San Francisco), but you haven't asked a specific question or made a request that requires the use of any tools. Is there something specific you'd like to know about San Francisco or any other topic? I'd be happy to help you find information using the available search tools.
input_message
=
{
"role"
:
"user"
,
"content"
:
"What's the weather where I live?"
,
}
for
step
in
agent_executor
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
What's the weather where I live?
==================================[1m Ai Message [0m==================================
[{'text': 'Let me search for current weather information in San Francisco.', 'type': 'text'}, {'id': 'toolu_011kSdheoJp8THURoLmeLtZo', 'input': {'query': 'current weather San Francisco CA'}, 'name': 'tavily_search', 'type': 'tool_use'}]
Tool Calls:
tavily_search (toolu_011kSdheoJp8THURoLmeLtZo)
Call ID: toolu_011kSdheoJp8THURoLmeLtZo
Args:
query: current weather San Francisco CA
=================================[1m Tool Message [0m=================================
Name: tavily_search
{"query": "current weather San Francisco CA", "follow_up_questions": null, "answer": null, "images": [], "results": [{"title": "Weather in San Francisco, CA", "url": "https://www.weatherapi.com/", "content": "{'location': {'name': 'San Francisco', 'region': 'California', 'country': 'United States of America', 'lat': 37.775, 'lon': -122.4183, 'tz_id': 'America/Los_Angeles', 'localtime_epoch': 1750168606, 'localtime': '2025-06-17 06:56'}, 'current': {'last_updated_epoch': 1750167900, 'last_updated': '2025-06-17 06:45', 'temp_c': 11.7, 'temp_f': 53.1, 'is_day': 1, 'condition': {'text': 'Fog', 'icon': '//cdn.weatherapi.com/weather/64x64/day/248.png', 'code': 1135}, 'wind_mph': 4.0, 'wind_kph': 6.5, 'wind_degree': 215, 'wind_dir': 'SW', 'pressure_mb': 1017.0, 'pressure_in': 30.02, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 86, 'cloud': 0, 'feelslike_c': 11.3, 'feelslike_f': 52.4, 'windchill_c': 8.7, 'windchill_f': 47.7, 'heatindex_c': 9.8, 'heatindex_f': 49.7, 'dewpoint_c': 9.6, 'dewpoint_f': 49.2, 'vis_km': 16.0, 'vis_miles': 9.0, 'uv': 0.0, 'gust_mph': 6.3, 'gust_kph': 10.2}}", "score": 0.944705, "raw_content": null}, {"title": "Weather in San Francisco in June 2025", "url": "https://world-weather.info/forecast/usa/san_francisco/june-2025/", "content": "Detailed ⚡ San Francisco Weather Forecast for June 2025 - day/night 🌡️ temperatures, precipitations - World-Weather.info. Add the current city. Search. Weather; Archive; Weather Widget °F. World; United States; California; Weather in San Francisco; ... 17 +64° +54° 18 +61° +54° 19", "score": 0.86441374, "raw_content": null}], "response_time": 2.34}
==================================[1m Ai Message [0m==================================
Based on the search results, here's the current weather in San Francisco:
- Temperature: 53.1°F (11.7°C)
- Condition: Foggy
- Wind: 4.0 mph from the Southwest
- Humidity: 86%
- Visibility: 9 miles
This is quite typical weather for San Francisco, with the characteristic fog that the city is known for. Would you like to know anything else about the weather or San Francisco in general?
Setup
​
Jupyter Notebook
​
This guide (and most of the other guides in the documentation) uses
Jupyter notebooks
and assumes the reader is as well. Jupyter notebooks are perfect interactive environments for learning how to work with LLM systems because oftentimes things can go wrong (unexpected output, API down, etc), and observing these cases is a great way to better understand building with LLMs.
This and other tutorials are perhaps most conveniently run in a Jupyter notebook. See
here
for instructions on how to install.
Installation
​
To install LangChain run:
%
pip install
-
U langgraph langchain
-
tavily langgraph
-
checkpoint
-
sqlite
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
After you sign up at the link above, make sure to set your environment variables to start logging traces:
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
Tavily
​
We will be using
Tavily
(a search engine) as a tool.
In order to use it, you will need to get and set an API key:
export TAVILY_API_KEY="..."
Or, if in a notebook, you can set it with:
import
getpass
import
os
os
.
environ
[
"TAVILY_API_KEY"
]
=
getpass
.
getpass
(
)
We first need to create the tools we want to use. Our main tool of choice will be
Tavily
- a search engine. We can use the dedicated
langchain-tavily
integration package
to easily use Tavily search engine as tool with LangChain.
from
langchain_tavily
import
TavilySearch
search
=
TavilySearch
(
max_results
=
2
)
search_results
=
search
.
invoke
(
"What is the weather in SF"
)
print
(
search_results
)
tools
=
[
search
]
{'query': 'What is the weather in SF', 'follow_up_questions': None, 'answer': None, 'images': [], 'results': [{'title': 'Weather in San Francisco, CA', 'url': 'https://www.weatherapi.com/', 'content': "{'location': {'name': 'San Francisco', 'region': 'California', 'country': 'United States of America', 'lat': 37.775, 'lon': -122.4183, 'tz_id': 'America/Los_Angeles', 'localtime_epoch': 1750168606, 'localtime': '2025-06-17 06:56'}, 'current': {'last_updated_epoch': 1750167900, 'last_updated': '2025-06-17 06:45', 'temp_c': 11.7, 'temp_f': 53.1, 'is_day': 1, 'condition': {'text': 'Fog', 'icon': '//cdn.weatherapi.com/weather/64x64/day/248.png', 'code': 1135}, 'wind_mph': 4.0, 'wind_kph': 6.5, 'wind_degree': 215, 'wind_dir': 'SW', 'pressure_mb': 1017.0, 'pressure_in': 30.02, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 86, 'cloud': 0, 'feelslike_c': 11.3, 'feelslike_f': 52.4, 'windchill_c': 8.7, 'windchill_f': 47.7, 'heatindex_c': 9.8, 'heatindex_f': 49.7, 'dewpoint_c': 9.6, 'dewpoint_f': 49.2, 'vis_km': 16.0, 'vis_miles': 9.0, 'uv': 0.0, 'gust_mph': 6.3, 'gust_kph': 10.2}}", 'score': 0.9185379, 'raw_content': None}, {'title': 'Weather in San Francisco in June 2025', 'url': 'https://world-weather.info/forecast/usa/san_francisco/june-2025/', 'content': "Weather in San Francisco in June 2025 (California) - Detailed Weather Forecast for a Month *   Weather in San Francisco Weather in San Francisco in June 2025 *   1 +63° +55° *   2 +66° +54° *   3 +66° +55° *   4 +66° +54° *   5 +66° +55° *   6 +66° +57° *   7 +64° +55° *   8 +63° +55° *   9 +63° +54° *   10 +59° +54° *   11 +59° +54° *   12 +61° +54° Weather in Washington, D.C.**+68°** Sacramento**+81°** Pleasanton**+72°** Redwood City**+68°** San Leandro**+61°** San Mateo**+64°** San Rafael**+70°** San Ramon**+64°** South San Francisco**+61°** Daly City**+59°** Wilder**+66°** Woodacre**+70°** world's temperature today Colchani day+50°F night+16°F Az Zubayr day+124°F night+93°F Weather forecast on your site Install _San Francisco_ +61° Temperature units", 'score': 0.7978881, 'raw_content': None}], 'response_time': 2.62}
In many applications, you may want to define custom tools. LangChain supports custom
tool creation via Python functions and other means. Refer to the
How to create tools
guide for details.
Using Language Models
​
Next, let's learn how to use a language model to call tools. LangChain supports many different language models that you can use interchangably - select the one you want to use below!
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
You can call the language model by passing in a list of messages. By default, the response is a
content
string.
query
=
"Hi!"
response
=
model
.
invoke
(
[
{
"role"
:
"user"
,
"content"
:
query
}
]
)
response
.
text
(
)
'Hello! How can I help you today?'
We can now see what it is like to enable this model to do tool calling. In order to enable that we use
.bind_tools
to give the language model knowledge of these tools
model_with_tools
=
model
.
bind_tools
(
tools
)
We can now call the model. Let's first call it with a normal message, and see how it responds. We can look at both the
content
field as well as the
tool_calls
field.
query
=
"Hi!"
response
=
model_with_tools
.
invoke
(
[
{
"role"
:
"user"
,
"content"
:
query
}
]
)
print
(
f"Message content:
{
response
.
text
(
)
}
\n"
)
print
(
f"Tool calls:
{
response
.
tool_calls
}
"
)
Message content: Hello! I'm here to help you. I have access to a powerful search tool that can help answer questions and find information about various topics. What would you like to know about?
Feel free to ask any question or request information, and I'll do my best to assist you using the available tools.
Tool calls: []
Now, let's try calling it with some input that would expect a tool to be called.
query
=
"Search for the weather in SF"
response
=
model_with_tools
.
invoke
(
[
{
"role"
:
"user"
,
"content"
:
query
}
]
)
print
(
f"Message content:
{
response
.
text
(
)
}
\n"
)
print
(
f"Tool calls:
{
response
.
tool_calls
}
"
)
Message content: I'll help you search for information about the weather in San Francisco.
Tool calls: [{'name': 'tavily_search', 'args': {'query': 'current weather San Francisco'}, 'id': 'toolu_015gdPn1jbB2Z21DmN2RAnti', 'type': 'tool_call'}]
We can see that there's now no text content, but there is a tool call! It wants us to call the Tavily Search tool.
This isn't calling that tool yet - it's just telling us to. In order to actually call it, we'll want to create our agent.
Create the agent
​
Now that we have defined the tools and the LLM, we can create the agent. We will be using
LangGraph
to construct the agent.
Currently, we are using a high level interface to construct the agent, but the nice thing about LangGraph is that this high-level interface is backed by a low-level, highly controllable API in case you want to modify the agent logic.
Now, we can initialize the agent with the LLM and the tools.
Note that we are passing in the
model
, not
model_with_tools
. That is because
create_react_agent
will call
.bind_tools
for us under the hood.
from
langgraph
.
prebuilt
import
create_react_agent
agent_executor
=
create_react_agent
(
model
,
tools
)
Run the agent
​
We can now run the agent with a few queries! Note that for now, these are all
stateless
queries (it won't remember previous interactions). Note that the agent will return the
final
state at the end of the interaction (which includes any inputs, we will see later on how to get only the outputs).
First up, let's see how it responds when there's no need to call a tool:
input_message
=
{
"role"
:
"user"
,
"content"
:
"Hi!"
}
response
=
agent_executor
.
invoke
(
{
"messages"
:
[
input_message
]
}
)
for
message
in
response
[
"messages"
]
:
message
.
pretty_print
(
)
================================[1m Human Message [0m=================================
Hi!
==================================[1m Ai Message [0m==================================
Hello! I'm here to help you with your questions using the available search tools. Please feel free to ask any question, and I'll do my best to find relevant and accurate information for you.
In order to see exactly what is happening under the hood (and to make sure it's not calling a tool) we can take a look at the
LangSmith trace
Let's now try it out on an example where it should be invoking the tool
input_message
=
{
"role"
:
"user"
,
"content"
:
"Search for the weather in SF"
}
response
=
agent_executor
.
invoke
(
{
"messages"
:
[
input_message
]
}
)
for
message
in
response
[
"messages"
]
:
message
.
pretty_print
(
)
================================[1m Human Message [0m=================================
Search for the weather in SF
==================================[1m Ai Message [0m==================================
[{'text': "I'll help you search for weather information in San Francisco. Let me use the search engine to find current weather conditions.", 'type': 'text'}, {'id': 'toolu_01WWcXGnArosybujpKzdmARZ', 'input': {'query': 'current weather San Francisco SF'}, 'name': 'tavily_search', 'type': 'tool_use'}]
Tool Calls:
tavily_search (toolu_01WWcXGnArosybujpKzdmARZ)
Call ID: toolu_01WWcXGnArosybujpKzdmARZ
Args:
query: current weather San Francisco SF
=================================[1m Tool Message [0m=================================
Name: tavily_search
{"query": "current weather San Francisco SF", "follow_up_questions": null, "answer": null, "images": [], "results": [{"title": "Weather in San Francisco, CA", "url": "https://www.weatherapi.com/", "content": "{'location': {'name': 'San Francisco', 'region': 'California', 'country': 'United States of America', 'lat': 37.775, 'lon': -122.4183, 'tz_id': 'America/Los_Angeles', 'localtime_epoch': 1750168606, 'localtime': '2025-06-17 06:56'}, 'current': {'last_updated_epoch': 1750167900, 'last_updated': '2025-06-17 06:45', 'temp_c': 11.7, 'temp_f': 53.1, 'is_day': 1, 'condition': {'text': 'Fog', 'icon': '//cdn.weatherapi.com/weather/64x64/day/248.png', 'code': 1135}, 'wind_mph': 4.0, 'wind_kph': 6.5, 'wind_degree': 215, 'wind_dir': 'SW', 'pressure_mb': 1017.0, 'pressure_in': 30.02, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 86, 'cloud': 0, 'feelslike_c': 11.3, 'feelslike_f': 52.4, 'windchill_c': 8.7, 'windchill_f': 47.7, 'heatindex_c': 9.8, 'heatindex_f': 49.7, 'dewpoint_c': 9.6, 'dewpoint_f': 49.2, 'vis_km': 16.0, 'vis_miles': 9.0, 'uv': 0.0, 'gust_mph': 6.3, 'gust_kph': 10.2}}", "score": 0.885373, "raw_content": null}, {"title": "Weather in San Francisco in June 2025", "url": "https://world-weather.info/forecast/usa/san_francisco/june-2025/", "content": "Detailed ⚡ San Francisco Weather Forecast for June 2025 - day/night 🌡️ temperatures, precipitations - World-Weather.info. Add the current city. Search. Weather; Archive; Weather Widget °F. World; United States; California; Weather in San Francisco; ... 17 +64° +54° 18 +61° +54° 19", "score": 0.8830044, "raw_content": null}], "response_time": 2.6}
==================================[1m Ai Message [0m==================================
Based on the search results, here's the current weather in San Francisco:
- Temperature: 53.1°F (11.7°C)
- Conditions: Foggy
- Wind: 4.0 mph from the SW
- Humidity: 86%
- Visibility: 9.0 miles
The weather appears to be typical for San Francisco, with morning fog and mild temperatures. The "feels like" temperature is 52.4°F (11.3°C).
We can check out the
LangSmith trace
to make sure it's calling the search tool effectively.
Streaming Messages
​
We've seen how the agent can be called with
.invoke
to get  a final response. If the agent executes multiple steps, this may take a while. To show intermediate progress, we can stream back messages as they occur.
for
step
in
agent_executor
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
Search for the weather in SF
==================================[1m Ai Message [0m==================================
[{'text': "I'll help you search for information about the weather in San Francisco.", 'type': 'text'}, {'id': 'toolu_01DCPnJES53Fcr7YWnZ47kDG', 'input': {'query': 'current weather San Francisco'}, 'name': 'tavily_search', 'type': 'tool_use'}]
Tool Calls:
tavily_search (toolu_01DCPnJES53Fcr7YWnZ47kDG)
Call ID: toolu_01DCPnJES53Fcr7YWnZ47kDG
Args:
query: current weather San Francisco
=================================[1m Tool Message [0m=================================
Name: tavily_search
{"query": "current weather San Francisco", "follow_up_questions": null, "answer": null, "images": [], "results": [{"title": "Weather in San Francisco", "url": "https://www.weatherapi.com/", "content": "{'location': {'name': 'San Francisco', 'region': 'California', 'country': 'United States of America', 'lat': 37.775, 'lon': -122.4183, 'tz_id': 'America/Los_Angeles', 'localtime_epoch': 1750168506, 'localtime': '2025-06-17 06:55'}, 'current': {'last_updated_epoch': 1750167900, 'last_updated': '2025-06-17 06:45', 'temp_c': 11.7, 'temp_f': 53.1, 'is_day': 1, 'condition': {'text': 'Fog', 'icon': '//cdn.weatherapi.com/weather/64x64/day/248.png', 'code': 1135}, 'wind_mph': 4.0, 'wind_kph': 6.5, 'wind_degree': 215, 'wind_dir': 'SW', 'pressure_mb': 1017.0, 'pressure_in': 30.02, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 86, 'cloud': 0, 'feelslike_c': 11.3, 'feelslike_f': 52.4, 'windchill_c': 8.7, 'windchill_f': 47.7, 'heatindex_c': 9.8, 'heatindex_f': 49.7, 'dewpoint_c': 9.6, 'dewpoint_f': 49.2, 'vis_km': 16.0, 'vis_miles': 9.0, 'uv': 0.0, 'gust_mph': 6.3, 'gust_kph': 10.2}}", "score": 0.9542825, "raw_content": null}, {"title": "Weather in San Francisco in June 2025", "url": "https://world-weather.info/forecast/usa/san_francisco/june-2025/", "content": "Detailed ⚡ San Francisco Weather Forecast for June 2025 - day/night 🌡️ temperatures, precipitations - World-Weather.info. Add the current city. Search. Weather; Archive; Weather Widget °F. World; United States; California; Weather in San Francisco; ... 17 +64° +54° 18 +61° +54° 19", "score": 0.8638634, "raw_content": null}], "response_time": 2.57}
==================================[1m Ai Message [0m==================================
Based on the search results, here's the current weather in San Francisco:
- Temperature: 53.1°F (11.7°C)
- Condition: Foggy
- Wind: 4.0 mph from the Southwest
- Humidity: 86%
- Visibility: 9.0 miles
- Feels like: 52.4°F (11.3°C)
This is quite typical weather for San Francisco, which is known for its fog, especially during the morning hours. The city's proximity to the ocean and unique geographical features often result in mild temperatures and foggy conditions.
Streaming tokens
​
In addition to streaming back messages, it is also useful to stream back tokens.
We can do this by specifying
stream_mode="messages"
.
::: note
Below we use
message.text()
, which requires
langchain-core>=0.3.37
.
:::
for
step
,
metadata
in
agent_executor
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
"messages"
)
:
if
metadata
[
"langgraph_node"
]
==
"agent"
and
(
text
:=
step
.
text
(
)
)
:
print
(
text
,
end
=
"|"
)
I|'ll help you search for information| about the weather in San Francisco.|Base|d on the search results, here|'s the current weather in| San Francisco:
-| Temperature: 53.1°F (|11.7°C)
-| Condition: Foggy
- Wind:| 4.0 mph from| the Southwest
- Humidity|: 86%|
- Visibility: 9|.0 miles
- Pressure: |30.02 in|Hg
The weather| is characteristic of San Francisco, with| foggy conditions and mild temperatures|. The "feels like" temperature is slightly| lower at 52.4|°F (11.|3°C)| due to the wind chill effect|.|
Adding in memory
​
As mentioned earlier, this agent is stateless. This means it does not remember previous interactions. To give it memory we need to pass in a checkpointer. When passing in a checkpointer, we also have to pass in a
thread_id
when invoking the agent (so it knows which thread/conversation to resume from).
from
langgraph
.
checkpoint
.
memory
import
MemorySaver
memory
=
MemorySaver
(
)
agent_executor
=
create_react_agent
(
model
,
tools
,
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
"abc123"
}
}
input_message
=
{
"role"
:
"user"
,
"content"
:
"Hi, I'm Bob!"
}
for
step
in
agent_executor
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
Hi, I'm Bob!
==================================[1m Ai Message [0m==================================
Hello Bob! I'm an AI assistant who can help you search for information using specialized search tools. Is there anything specific you'd like to know about or search for? I'm happy to help you find accurate and up-to-date information on various topics.
input_message
=
{
"role"
:
"user"
,
"content"
:
"What's my name?"
}
for
step
in
agent_executor
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
What's my name?
==================================[1m Ai Message [0m==================================
Your name is Bob, as you introduced yourself earlier. I can remember information shared within our conversation without needing to search for it.
Example
LangSmith trace
If you want to start a new conversation, all you have to do is change the
thread_id
used
config
=
{
"configurable"
:
{
"thread_id"
:
"xyz123"
}
}
input_message
=
{
"role"
:
"user"
,
"content"
:
"What's my name?"
}
for
step
in
agent_executor
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
What's my name?
==================================[1m Ai Message [0m==================================
I apologize, but I don't have access to any tools that would tell me your name. I can only assist you with searching for publicly available information using the tavily_search function. I don't have access to personal information about users. If you'd like to tell me your name, I'll be happy to address you by it.
Conclusion
​
That's a wrap! In this quick start we covered how to create a simple agent.
We've then shown how to stream back a response - not only with the intermediate steps, but also tokens!
We've also added in memory so you can have a conversation with them.
Agents are a complex topic with lots to learn!
For more information on Agents, please check out the
LangGraph
documentation. This has it's own set of concepts, tutorials, and how-to guides.
