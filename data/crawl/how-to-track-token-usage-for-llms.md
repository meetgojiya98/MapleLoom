---
{
  "title": "How to track token usage for LLMs",
  "source_url": "https://python.langchain.com/docs/how_to/llm_token_usage_tracking/",
  "fetched_at": "2025-08-15T13:50:19.572420+00:00"
}
---

# How to track token usage for LLMs

from
langchain_community
.
callbacks
import
get_openai_callback
from
langchain_openai
import
OpenAI
llm
=
OpenAI
(
model_name
=
"gpt-3.5-turbo-instruct"
)
with
get_openai_callback
(
)
as
cb
:
for
chunk
in
llm
.
stream
(
"Tell me a joke"
)
:
print
(
chunk
,
end
=
""
,
flush
=
True
)
print
(
result
)
print
(
"---"
)
print
(
)
print
(
f"Total Tokens:
{
cb
.
total_tokens
}
"
)
print
(
f"Prompt Tokens:
{
cb
.
prompt_tokens
}
"
)
print
(
f"Completion Tokens:
{
cb
.
completion_tokens
}
"
)
print
(
f"Total Cost (USD): $
{
cb
.
total_cost
}
"
)
