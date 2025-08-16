---
{
  "title": "How to add chat history",
  "source_url": "https://python.langchain.com/docs/how_to/qa_chat_history_how_to/",
  "fetched_at": "2025-08-15T13:50:39.603852+00:00"
}
---

# How to add chat history

This guide previously used the
RunnableWithMessageHistory
abstraction. You can access this version of the documentation in the
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
In many
Q&A applications
we want to allow the user to have a back-and-forth conversation, meaning the application needs some sort of "memory" of past questions and answers, and some logic for incorporating those into its current thinking.
In this guide we focus on
adding logic for incorporating historical messages.
This is largely a condensed version of the
Conversational RAG tutorial
.
We will cover two approaches:
Chains
, in which we always execute a retrieval step;
Agents
, in which we give an LLM discretion over whether and how to execute a retrieval step (or multiple steps).
For the external knowledge source, we will use the same
LLM Powered Autonomous Agents
blog post by Lilian Weng from the
RAG tutorial
.
Both approaches leverage
LangGraph
as an orchestration framework. LangGraph implements a built-in
persistence layer
, making it ideal for chat applications that support multiple conversational turns.
Setup
​
Dependencies
​
We'll use OpenAI embeddings and an InMemory vector store in this walkthrough, but everything shown here works with any
Embeddings
, and
VectorStore
or
Retriever
.
We'll use the following packages:
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
quiet langgraph langchain
-
community beautifulsoup4
LangSmith
​
Many of the applications you build with LangChain will contain multiple steps with multiple invocations of LLM calls. As these applications get more and more complex, it becomes crucial to be able to inspect what exactly is going on inside your chain or agent. The best way to do this is with
LangSmith
.
Note that LangSmith is not needed, but it is helpful. If you do want to use LangSmith, after you sign up at the link above, make sure to set your environment variables to start logging traces:
os
.
environ
[
"LANGSMITH_TRACING"
]
=
"true"
if
not
os
.
environ
.
get
(
"LANGSMITH_API_KEY"
)
:
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
Components
​
We will need to select three components from LangChain's suite of integrations.
A
chat model
:
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
llm
=
init_chat_model
(
"gemini-2.5-flash"
,
model_provider
=
"google_genai"
)
An
embedding model
:
pip install -qU langchain-openai
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
"OPENAI_API_KEY"
)
:
os
.
environ
[
"OPENAI_API_KEY"
]
=
getpass
.
getpass
(
"Enter API key for OpenAI: "
)
from
langchain_openai
import
OpenAIEmbeddings
embeddings
=
OpenAIEmbeddings
(
model
=
"text-embedding-3-large"
)
And a
vector store
:
pip install -qU langchain-core
from
langchain_core
.
vectorstores
import
InMemoryVectorStore
vector_store
=
InMemoryVectorStore
(
embeddings
)
Chains
​
The
RAG Tutorial
indexes an
LLM Powered Autonomous Agents
blog post by Lilian Weng. We will repeat that here. Below we load the content of the page, split it into sub-documents, and embed the documents into our
vector store
:
import
bs4
from
langchain
import
hub
from
langchain_community
.
document_loaders
import
WebBaseLoader
from
langchain_core
.
documents
import
Document
from
langchain_text_splitters
import
RecursiveCharacterTextSplitter
from
typing_extensions
import
List
,
TypedDict
loader
=
WebBaseLoader
(
web_paths
=
(
"https://lilianweng.github.io/posts/2023-06-23-agent/"
,
)
,
bs_kwargs
=
dict
(
parse_only
=
bs4
.
SoupStrainer
(
class_
=
(
"post-content"
,
"post-title"
,
"post-header"
)
)
)
,
)
docs
=
loader
.
load
(
)
text_splitter
=
RecursiveCharacterTextSplitter
(
chunk_size
=
1000
,
chunk_overlap
=
200
)
all_splits
=
text_splitter
.
split_documents
(
docs
)
_
=
vector_store
.
add_documents
(
documents
=
all_splits
)
As detailed in
Part 2
of the RAG tutorial, we can naturally support a conversational experience by representing the flow of the RAG application as a sequence of
messages
:
User input as a
HumanMessage
;
Vector store query as an
AIMessage
with tool calls;
Retrieved documents as a
ToolMessage
;
Final response as a
AIMessage
.
We will use
tool-calling
to facilitate this, which additionally allows the query to be generated by the LLM. We can build a
tool
to execute the retrieval step:
from
langchain_core
.
tools
import
tool
@tool
(
response_format
=
"content_and_artifact"
)
def
retrieve
(
query
:
str
)
:
"""Retrieve information related to a query."""
retrieved_docs
=
vector_store
.
similarity_search
(
query
,
k
=
2
)
serialized
=
"\n\n"
.
join
(
(
f"Source:
{
doc
.
metadata
}
\nContent:
{
doc
.
page_content
}
"
)
for
doc
in
retrieved_docs
)
return
serialized
,
retrieved_docs
We can now build our LangGraph application.
Note that we compile it with a
checkpointer
to support a back-and-forth conversation. LangGraph comes with a simple
in-memory checkpointer
, which we use below. See its documentation for more detail, including how to use different persistence backends (e.g., SQLite or Postgres).
from
langchain_core
.
messages
import
SystemMessage
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
END
,
MessagesState
,
StateGraph
from
langgraph
.
prebuilt
import
ToolNode
,
tools_condition
def
query_or_respond
(
state
:
MessagesState
)
:
"""Generate tool call for retrieval or respond."""
llm_with_tools
=
llm
.
bind_tools
(
[
retrieve
]
)
response
=
llm_with_tools
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
[
response
]
}
tools
=
ToolNode
(
[
retrieve
]
)
def
generate
(
state
:
MessagesState
)
:
"""Generate answer."""
recent_tool_messages
=
[
]
for
message
in
reversed
(
state
[
"messages"
]
)
:
if
message
.
type
==
"tool"
:
recent_tool_messages
.
append
(
message
)
else
:
break
tool_messages
=
recent_tool_messages
[
:
:
-
1
]
docs_content
=
"\n\n"
.
join
(
doc
.
content
for
doc
in
tool_messages
)
system_message_content
=
(
"You are an assistant for question-answering tasks. "
"Use the following pieces of retrieved context to answer "
"the question. If you don't know the answer, say that you "
"don't know. Use three sentences maximum and keep the "
"answer concise."
"\n\n"
f"
{
docs_content
}
"
)
conversation_messages
=
[
message
for
message
in
state
[
"messages"
]
if
message
.
type
in
(
"human"
,
"system"
)
or
(
message
.
type
==
"ai"
and
not
message
.
tool_calls
)
]
prompt
=
[
SystemMessage
(
system_message_content
)
]
+
conversation_messages
response
=
llm
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
graph_builder
=
StateGraph
(
MessagesState
)
graph_builder
.
add_node
(
query_or_respond
)
graph_builder
.
add_node
(
tools
)
graph_builder
.
add_node
(
generate
)
graph_builder
.
set_entry_point
(
"query_or_respond"
)
graph_builder
.
add_conditional_edges
(
"query_or_respond"
,
tools_condition
,
{
END
:
END
,
"tools"
:
"tools"
}
,
)
graph_builder
.
add_edge
(
"tools"
,
"generate"
)
graph_builder
.
add_edge
(
"generate"
,
END
)
memory
=
MemorySaver
(
)
graph
=
graph_builder
.
compile
(
checkpointer
=
memory
)
from
IPython
.
display
import
Image
,
display
display
(
Image
(
graph
.
get_graph
(
)
.
draw_mermaid_png
(
)
)
)
Let's test our application.
Note that it responds appropriately to messages that do not require an additional retrieval step:
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
"Hello"
for
step
in
graph
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
input_message
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
config
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
================================[1m Human Message [0m=================================
Hello
==================================[1m Ai Message [0m==================================
Hello! How can I assist you today?
And when executing a search, we can stream the steps to observe the query generation, retrieval, and answer generation:
input_message
=
"What is Task Decomposition?"
for
step
in
graph
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
input_message
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
config
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
================================[1m Human Message [0m=================================
What is Task Decomposition?
==================================[1m Ai Message [0m==================================
Tool Calls:
retrieve (call_RntwX5GMt531biEE9MqSbgLV)
Call ID: call_RntwX5GMt531biEE9MqSbgLV
Args:
query: Task Decomposition
=================================[1m Tool Message [0m=================================
Name: retrieve
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Fig. 1. Overview of a LLM-powered autonomous agent system.
Component One: Planning#
A complicated task usually involves many steps. An agent needs to know what they are and plan ahead.
Task Decomposition#
Chain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.
Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.
==================================[1m Ai Message [0m==================================
Task Decomposition is the process of breaking down a complicated task into smaller, more manageable steps. It often involves techniques like Chain of Thought (CoT), where the model is prompted to "think step by step," allowing for better handling of complex tasks. This approach enhances model performance and provides insight into the model's reasoning process.
Finally, because we have compiled our application with a
checkpointer
, historical messages are maintained in the state. This allows the model to contextualize user queries:
input_message
=
"Can you look up some common ways of doing it?"
for
step
in
graph
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
input_message
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
config
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
================================[1m Human Message [0m=================================
Can you look up some common ways of doing it?
==================================[1m Ai Message [0m==================================
Tool Calls:
retrieve (call_kwO5rYPyJ0MftYKoKRFjKpZM)
Call ID: call_kwO5rYPyJ0MftYKoKRFjKpZM
Args:
query: common methods for task decomposition
=================================[1m Tool Message [0m=================================
Name: retrieve
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.
Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Fig. 1. Overview of a LLM-powered autonomous agent system.
Component One: Planning#
A complicated task usually involves many steps. An agent needs to know what they are and plan ahead.
Task Decomposition#
Chain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.
==================================[1m Ai Message [0m==================================
Common ways of Task Decomposition include: (1) using large language models (LLMs) with simple prompts like "Steps for XYZ" or "What are the subgoals for achieving XYZ?"; (2) utilizing task-specific instructions, such as "Write a story outline" for creative tasks; and (3) incorporating human inputs to guide the decomposition process.
Note that we can observe the full sequence of messages sent to the chat model-- including tool calls and retrieved context-- in the
LangSmith trace
.
The conversation history can also be inspected via the state of the application:
chat_history
=
graph
.
get_state
(
config
)
.
values
[
"messages"
]
for
message
in
chat_history
:
message
.
pretty_print
(
)
================================[1m Human Message [0m=================================
Hello
==================================[1m Ai Message [0m==================================
Hello! How can I assist you today?
================================[1m Human Message [0m=================================
What is Task Decomposition?
==================================[1m Ai Message [0m==================================
Tool Calls:
retrieve (call_RntwX5GMt531biEE9MqSbgLV)
Call ID: call_RntwX5GMt531biEE9MqSbgLV
Args:
query: Task Decomposition
=================================[1m Tool Message [0m=================================
Name: retrieve
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Fig. 1. Overview of a LLM-powered autonomous agent system.
Component One: Planning#
A complicated task usually involves many steps. An agent needs to know what they are and plan ahead.
Task Decomposition#
Chain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.
Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.
==================================[1m Ai Message [0m==================================
Task Decomposition is the process of breaking down a complicated task into smaller, more manageable steps. It often involves techniques like Chain of Thought (CoT), where the model is prompted to "think step by step," allowing for better handling of complex tasks. This approach enhances model performance and provides insight into the model's reasoning process.
================================[1m Human Message [0m=================================
Can you look up some common ways of doing it?
==================================[1m Ai Message [0m==================================
Tool Calls:
retrieve (call_kwO5rYPyJ0MftYKoKRFjKpZM)
Call ID: call_kwO5rYPyJ0MftYKoKRFjKpZM
Args:
query: common methods for task decomposition
=================================[1m Tool Message [0m=================================
Name: retrieve
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.
Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Fig. 1. Overview of a LLM-powered autonomous agent system.
Component One: Planning#
A complicated task usually involves many steps. An agent needs to know what they are and plan ahead.
Task Decomposition#
Chain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.
==================================[1m Ai Message [0m==================================
Common ways of Task Decomposition include: (1) using large language models (LLMs) with simple prompts like "Steps for XYZ" or "What are the subgoals for achieving XYZ?"; (2) utilizing task-specific instructions, such as "Write a story outline" for creative tasks; and (3) incorporating human inputs to guide the decomposition process.
Agents
​
Agents
leverage the reasoning capabilities of LLMs to make decisions during execution. Using agents allows you to offload additional discretion over the retrieval process. Although their behavior is less predictable than the above "chain", they are able to execute multiple retrieval steps in service of a query, or iterate on a single search.
Below we assemble a minimal RAG agent. Using LangGraph's
pre-built ReAct agent constructor
, we can do this in one line.
Check out LangGraph's
Agentic RAG
tutorial for more advanced formulations.
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
llm
,
[
retrieve
]
,
checkpointer
=
memory
)
Let's inspect the graph:
display
(
Image
(
agent_executor
.
get_graph
(
)
.
draw_mermaid_png
(
)
)
)
The key difference from our earlier implementation is that instead of a final generation step that ends the run, here the tool invocation loops back to the original LLM call. The model can then either answer the question using the retrieved context, or generate another tool call to obtain more information.
Let's test this out. We construct a question that would typically require an iterative sequence of retrieval steps to answer:
config
=
{
"configurable"
:
{
"thread_id"
:
"def234"
}
}
input_message
=
(
"What is the standard method for Task Decomposition?\n\n"
"Once you get the answer, look up common extensions of that method."
)
for
event
in
agent_executor
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
input_message
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
config
,
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
What is the standard method for Task Decomposition?
Once you get the answer, look up common extensions of that method.
==================================[1m Ai Message [0m==================================
Tool Calls:
retrieve (call_rxBqio7dxthnMuzjr4AIquSZ)
Call ID: call_rxBqio7dxthnMuzjr4AIquSZ
Args:
query: standard method for Task Decomposition
=================================[1m Tool Message [0m=================================
Name: retrieve
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.
Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Fig. 1. Overview of a LLM-powered autonomous agent system.
Component One: Planning#
A complicated task usually involves many steps. An agent needs to know what they are and plan ahead.
Task Decomposition#
Chain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.
==================================[1m Ai Message [0m==================================
Tool Calls:
retrieve (call_kmQMRWCKeBdtXdlJi8yZD9CO)
Call ID: call_kmQMRWCKeBdtXdlJi8yZD9CO
Args:
query: common extensions of Task Decomposition methods
=================================[1m Tool Message [0m=================================
Name: retrieve
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.
Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.
Source: {'source': 'https://lilianweng.github.io/posts/2023-06-23-agent/'}
Content: Fig. 1. Overview of a LLM-powered autonomous agent system.
Component One: Planning#
A complicated task usually involves many steps. An agent needs to know what they are and plan ahead.
Task Decomposition#
Chain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to “think step by step” to utilize more test-time computation to decompose hard tasks into smaller and simpler steps. CoT transforms big tasks into multiple manageable tasks and shed lights into an interpretation of the model’s thinking process.
==================================[1m Ai Message [0m==================================
The standard method for Task Decomposition involves breaking down complex tasks into smaller, manageable steps. Here are the main techniques:
1. **Chain of Thought (CoT)**: This prompting technique encourages a model to "think step by step," allowing it to utilize more computational resources during testing to decompose challenging tasks into simpler parts. CoT not only simplifies tasks but also provides insights into the model's reasoning process.
2. **Simple Prompting**: This can involve straightforward queries like "Steps for XYZ" or "What are the subgoals for achieving XYZ?" to guide the model in identifying the necessary steps.
3. **Task-specific Instructions**: Using specific prompts tailored to the task at hand, such as "Write a story outline" for creative writing, allows for more directed decomposition.
4. **Human Inputs**: Involving human expertise can also aid in breaking down tasks effectively.
### Common Extensions of Task Decomposition Methods
1. **Tree of Thoughts**: This method extends CoT by exploring multiple reasoning possibilities at each step. It decomposes the problem into various thought steps and generates multiple thoughts per step, forming a tree structure. This can utilize search processes like breadth-first search (BFS) or depth-first search (DFS) to evaluate states through classifiers or majority voting.
These extensions build on the basic principles of task decomposition, enhancing the depth and breadth of reasoning applied to complex tasks.
Note that the agent:
Generates a query to search for a standard method for task decomposition;
Receiving the answer, generates a second query to search for common extensions of it;
Having received all necessary context, answers the question.
We can see the full sequence of steps, along with latency and other metadata, in the
LangSmith trace
.
Next steps
​
We've covered the steps to build a basic conversational Q&A application:
We used chains to build a predictable application that generates search queries for each user input;
We used agents to build an application that "decides" when and how to generate search queries.
To explore different types of retrievers and retrieval strategies, visit the
retrievers
section of the how-to guides.
For a detailed walkthrough of LangChain's conversation memory abstractions, visit the
How to add message history (memory)
LCEL page.
To learn more about agents, head to the
Agents Modules
.
