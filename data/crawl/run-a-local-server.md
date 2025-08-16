---
{
  "title": "Run a local server",
  "source_url": "https://langchain-ai.github.io/langgraph/tutorials/langgraph-platform/local-server/",
  "fetched_at": "2025-08-15T13:52:20.878700+00:00"
}
---

# Run a local server

Run a local server
This guide shows you how to run a LangGraph application locally.
Prerequisites
Before you begin, ensure you have the following:
1. Install the LangGraph CLI
# Python >= 3.11 is required.
pip
install
--upgrade
"langgraph-cli[inmem]"
2. Create a LangGraph app 🌱
Create a new app from the
new-langgraph-project-python
template
. This template demonstrates a single-node application you can extend with your own logic.
langgraph
new
path/to/your/app
--template
new-langgraph-project-python
Additional templates
If you use
langgraph new
without specifying a template, you will be presented with an interactive menu that will allow you to choose from a list of available templates.
3. Install dependencies
In the root of your new LangGraph app, install the dependencies in
edit
mode so your local changes are used by the server:
cd
path/to/your/app
pip
install
-e
.
4. Create a
.env
file
You will find a
.env.example
in the root of your new LangGraph app. Create a
.env
file in the root of your new LangGraph app and copy the contents of the
.env.example
file into it, filling in the necessary API keys:
LANGSMITH_API_KEY
=
lsv2...
5. Launch LangGraph Server 🚀
Start the LangGraph API server locally:
Sample output:
>    Ready!
>
>    - API: [http://localhost:2024](http://localhost:2024/)
>
>    - Docs: http://localhost:2024/docs
>
>    - LangGraph Studio Web UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
The
langgraph dev
command starts LangGraph Server in an in-memory mode. This mode is suitable for development and testing purposes. For production use, deploy LangGraph Server with access to a persistent storage backend. For more information, see
Deployment options
.
6. Test your application in LangGraph Studio
LangGraph Studio
is a specialized UI that you can connect to LangGraph API server to visualize, interact with, and debug your application locally. Test your graph in LangGraph Studio by visiting the URL provided in the output of the
langgraph dev
command:
>    - LangGraph Studio Web UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
For a LangGraph Server running on a custom host/port, update the baseURL parameter.
Safari compatibility
Use the
--tunnel
flag with your command to create a secure tunnel, as Safari has limitations when connecting to localhost servers:
7. Test the API
Python SDK (async)
Python SDK (sync)
Rest API
Install the LangGraph Python SDK:
pip
install
langgraph-sdk
Send a message to the assistant (threadless run):
from
langgraph_sdk
import
get_client
import
asyncio
client
=
get_client
(
url
=
"http://localhost:2024"
)
async
def
main
():
async
for
chunk
in
client
.
runs
.
stream
(
None
,
# Threadless run
"agent"
,
# Name of assistant. Defined in langgraph.json.
input
=
{
"messages"
:
[{
"role"
:
"human"
,
"content"
:
"What is LangGraph?"
,
}],
},
):
print
(
f
"Receiving new event of type:
{
chunk
.
event
}
..."
)
print
(
chunk
.
data
)
print
(
"
\n\n
"
)
asyncio
.
run
(
main
())
Install the LangGraph Python SDK:
pip
install
langgraph-sdk
Send a message to the assistant (threadless run):
from
langgraph_sdk
import
get_sync_client
client
=
get_sync_client
(
url
=
"http://localhost:2024"
)
for
chunk
in
client
.
runs
.
stream
(
None
,
# Threadless run
"agent"
,
# Name of assistant. Defined in langgraph.json.
input
=
{
"messages"
:
[{
"role"
:
"human"
,
"content"
:
"What is LangGraph?"
,
}],
},
stream_mode
=
"messages-tuple"
,
):
print
(
f
"Receiving new event of type:
{
chunk
.
event
}
..."
)
print
(
chunk
.
data
)
print
(
"
\n\n
"
)
curl
-s
--request
POST
\
--url
"http://localhost:2024/runs/stream"
\
--header
'Content-Type: application/json'
\
--data
"{
\"assistant_id\": \"agent\",
\"input\": {
\"messages\": [
{
\"role\": \"human\",
\"content\": \"What is LangGraph?\"
}
]
},
\"stream_mode\": \"messages-tuple\"
}"
Next steps
Now that you have a LangGraph app running locally, take your journey further by exploring deployment and advanced features:
