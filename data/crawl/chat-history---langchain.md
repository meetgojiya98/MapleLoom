---
{
  "title": "Chat history | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/concepts/chat_history/",
  "fetched_at": "2025-08-15T13:51:22.559072+00:00"
}
---

# Chat history | 🦜️🔗 LangChain

Chat history is a record of the conversation between the user and the chat model. It is used to maintain context and state throughout the conversation. The chat history is sequence of
messages
, each of which is associated with a specific
role
, such as "user", "assistant", "system", or "tool".
Conversation patterns
​
Most conversations start with a
system message
that sets the context for the conversation. This is followed by a
user message
containing the user's input, and then an
assistant message
containing the model's response.
The
assistant
may respond directly to the user or if configured with tools request that a
tool
be invoked to perform a specific task.
A full conversation often involves a combination of two patterns of alternating messages:
The
user
and the
assistant
representing a back-and-forth conversation.
The
assistant
and
tool messages
representing an
"agentic" workflow
where the assistant is invoking tools to perform specific tasks.
Managing chat history
​
Since chat models have a maximum limit on input size, it's important to manage chat history and trim it as needed to avoid exceeding the
context window
.
While processing chat history, it's essential to preserve a correct conversation structure.
Key guidelines for managing chat history:
The conversation should follow one of these structures:
The first message is either a "user" message or a "system" message, followed by a "user" and then an "assistant" message.
The last message should be either a "user" message or a "tool" message containing the result of a tool call.
When using
tool calling
, a "tool" message should only follow an "assistant" message that requested the tool invocation.
Understanding correct conversation structure is essential for being able to properly implement
memory
in chat models.
