---
{
  "title": "How to migrate to LangGraph memory",
  "source_url": "https://python.langchain.com/docs/versions/migrating_memory/",
  "fetched_at": "2025-08-15T13:52:05.759472+00:00"
}
---

# How to migrate to LangGraph memory

How to migrate to LangGraph memory
As of the v0.3 release of LangChain, we recommend that LangChain users take advantage of
LangGraph persistence
to incorporate
memory
into their LangChain application.
Users that rely on
RunnableWithMessageHistory
or
BaseChatMessageHistory
do
not
need to make any changes, but are encouraged to consider using LangGraph for more complex use cases.
Users that rely on deprecated memory abstractions from LangChain 0.0.x should follow this guide to upgrade to the new LangGraph persistence feature in LangChain 0.3.x.
Why use LangGraph for memory?
​
The main advantages of persistence in LangGraph are:
Built-in support for multiple users and conversations, which is a typical requirement for real-world conversational AI applications.
Ability to save and resume complex conversations at any point. This helps with:
Error recovery
Allowing human intervention in AI workflows
Exploring different conversation paths ("time travel")
Full compatibility with both traditional
language models
and modern
chat models
. Early memory implementations in LangChain weren't designed for newer chat model APIs, causing issues with features like tool-calling. LangGraph memory can persist any custom state.
Highly customizable, allowing you to fully control how memory works and use different storage backends.
Evolution of memory in LangChain
​
The concept of memory has evolved significantly in LangChain since its initial release.
LangChain 0.0.x memory
​
Broadly speaking, LangChain 0.0.x memory was used to handle three main use cases:
Use Case
Example
Managing conversation history
Keep only the last
n
turns of the conversation between the user and the AI.
Extraction of structured information
Extract structured information from the conversation history, such as a list of facts learned about the user.
Composite memory implementations
Combine multiple memory sources, e.g., a list of known facts about the user along with facts learned during a given conversation.
While the LangChain 0.0.x memory abstractions were useful, they were limited in their capabilities and not well suited for real-world conversational AI applications. These memory abstractions lacked built-in support for multi-user, multi-conversation scenarios, which are essential for practical conversational AI systems.
Most of these implementations have been officially deprecated in LangChain 0.3.x in favor of LangGraph persistence.
RunnableWithMessageHistory and BaseChatMessageHistory
​
As of LangChain v0.1, we started recommending that users rely primarily on
BaseChatMessageHistory
.
BaseChatMessageHistory
serves
as a simple persistence for storing and retrieving messages in a conversation.
At that time, the only option for orchestrating LangChain chains was via
LCEL
. To incorporate memory with
LCEL
, users had to use the
RunnableWithMessageHistory
interface. While sufficient for basic chat applications, many users found the API unintuitive and challenging to use.
As of LangChain v0.3, we recommend that
new
code takes advantage of LangGraph for both orchestration and persistence:
Orchestration: In LangGraph, users define
graphs
that specify the flow of the application. This allows users to keep using
LCEL
within individual nodes when
LCEL
is needed, while making it easy to define complex orchestration logic that is more readable and maintainable.
Persistence: Users can rely on LangGraph's
persistence
to store and retrieve data. LangGraph persistence is extremely flexible and can support a much wider range of use cases than the
RunnableWithMessageHistory
interface.
If you have been using
RunnableWithMessageHistory
or
BaseChatMessageHistory
, you do not need to make any changes. We do not plan on deprecating either functionality in the near future. This functionality is sufficient for simple chat applications and any code that uses
RunnableWithMessageHistory
will continue to work as expected.
Migrations
​
These guides assume some familiarity with the following concepts:
1. Managing conversation history
​
The goal of managing conversation history is to store and retrieve the history in a way that is optimal for a chat model to use.
Often this involves trimming and / or summarizing the conversation history to keep the most relevant parts of the conversation while having the conversation fit inside the context window of the chat model.
Memory classes that fall into this category include:
Memory Type
How to Migrate
Description
ConversationBufferMemory
Link to Migration Guide
A basic memory implementation that simply stores the conversation history.
ConversationStringBufferMemory
Link to Migration Guide
A special case of
ConversationBufferMemory
designed for LLMs and no longer relevant.
ConversationBufferWindowMemory
Link to Migration Guide
Keeps the last
n
turns of the conversation. Drops the oldest turn when the buffer is full.
ConversationTokenBufferMemory
Link to Migration Guide
Keeps only the most recent messages in the conversation under the constraint that the total number of tokens in the conversation does not exceed a certain limit.
ConversationSummaryMemory
Link to Migration Guide
Continually summarizes the conversation history. The summary is updated after each conversation turn. The abstraction returns the summary of the conversation history.
ConversationSummaryBufferMemory
Link to Migration Guide
Provides a running summary of the conversation together with the most recent messages in the conversation under the constraint that the total number of tokens in the conversation does not exceed a certain limit.
VectorStoreRetrieverMemory
See related
long-term memory agent tutorial
Stores the conversation history in a vector store and retrieves the most relevant parts of past conversation based on the input.
Please see
long-term memory agent tutorial
implements an agent that can extract structured information from the conversation history.
Memory classes that fall into this category include:
Memory Type
Description
BaseEntityStore
An abstract interface that resembles a key-value store. It was used for storing structured information learned during the conversation. The information had to be represented as a dictionary of key-value pairs.
ConversationEntityMemory
Combines the ability to summarize the conversation while extracting structured information from the conversation history.
And specific backend implementations of abstractions:
Memory Type
Description
InMemoryEntityStore
An implementation of
BaseEntityStore
that stores the information in the literal computer memory (RAM).
RedisEntityStore
A specific implementation of
BaseEntityStore
that uses Redis as the backend.
SQLiteEntityStore
A specific implementation of
BaseEntityStore
that uses SQLite as the backend.
UpstashRedisEntityStore
A specific implementation of
BaseEntityStore
that uses Upstash as the backend.
These abstractions have received limited development since their initial release. This is because they generally require significant customization for a specific application to be effective, making
them less widely used than the conversation history management abstractions.
For this reason, there are no migration guides for these abstractions. If you're struggling to migrate an application
that relies on these abstractions, please:
Please review this
Long-term memory agent tutorial
which should provide a good starting point for how to extract structured information from the conversation history.
If you're still struggling, please open an issue on the LangChain GitHub repository, explain your use case, and we'll try to provide more guidance on how to migrate these abstractions.
The general strategy for extracting structured information from the conversation history is to use a chat model with tool calling capabilities to extract structured information from the conversation history.
The extracted information can then be saved into an appropriate data structure (e.g., a dictionary), and information from it can be retrieved and added into the prompt as needed.
3. Implementations that provide composite logic on top of one or more memory implementations
​
Memory classes that fall into this category include:
Memory Type
Description
CombinedMemory
This abstraction accepted a list of
BaseMemory
and fetched relevant memory information from each of them based on the input.
SimpleMemory
Used to add read-only hard-coded context. Users can simply write this information into the prompt.
ReadOnlySharedMemory
Provided a read-only view of an existing
BaseMemory
implementation.
These implementations did not seem to be used widely or provide significant value. Users should be able
to re-implement these without too much difficulty in custom code.
Explore persistence with LangGraph:
Add persistence with simple LCEL (favor langgraph for more complex use cases):
Working with message history:
