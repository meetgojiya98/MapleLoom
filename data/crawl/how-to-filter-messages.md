---
{
  "title": "How to filter messages",
  "source_url": "https://python.langchain.com/docs/how_to/filter_messages/",
  "fetched_at": "2025-08-15T13:50:13.464980+00:00"
}
---

# How to filter messages

from
langchain_core
.
messages
import
(
AIMessage
,
HumanMessage
,
SystemMessage
,
filter_messages
,
)
messages
=
[
SystemMessage
(
"you are a good assistant"
,
id
=
"1"
)
,
HumanMessage
(
"example input"
,
id
=
"2"
,
name
=
"example_user"
)
,
AIMessage
(
"example output"
,
id
=
"3"
,
name
=
"example_assistant"
)
,
HumanMessage
(
"real input"
,
id
=
"4"
,
name
=
"bob"
)
,
AIMessage
(
"real output"
,
id
=
"5"
,
name
=
"alice"
)
,
]
filter_messages
(
messages
,
include_types
=
"human"
)
