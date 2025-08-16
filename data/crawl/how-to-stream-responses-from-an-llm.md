---
{
  "title": "How to stream responses from an LLM",
  "source_url": "https://python.langchain.com/docs/how_to/streaming_llm/",
  "fetched_at": "2025-08-15T13:50:59.538183+00:00"
}
---

# How to stream responses from an LLM

from
langchain_openai
import
OpenAI
llm
=
OpenAI
(
model
=
"gpt-3.5-turbo-instruct"
,
temperature
=
0
,
max_tokens
=
512
)
async
for
chunk
in
llm
.
astream
(
"Write me a 1 verse song about sparkling water."
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
