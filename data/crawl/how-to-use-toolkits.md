---
{
  "title": "How to use toolkits",
  "source_url": "https://python.langchain.com/docs/how_to/toolkits/",
  "fetched_at": "2025-08-15T13:49:14.348386+00:00"
}
---

# How to use toolkits

toolkit
=
ExampleTookit
(
.
.
.
)
tools
=
toolkit
.
get_tools
(
)
agent
=
create_agent_method
(
llm
,
tools
,
prompt
)
