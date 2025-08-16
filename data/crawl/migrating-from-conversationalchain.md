---
{
  "title": "Migrating from ConversationalChain",
  "source_url": "https://python.langchain.com/docs/versions/migrating_chains/conversation_chain/",
  "fetched_at": "2025-08-15T13:51:54.642011+00:00"
}
---

# Migrating from ConversationalChain

query
=
"I'm Bob, how are you?"
input_messages
=
[
{
"role"
:
"system"
,
"content"
:
"You are a pirate. Answer the following questions as best you can."
,
}
,
{
"role"
:
"user"
,
"content"
:
query
}
,
]
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
input_messages
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
