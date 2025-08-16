---
{
  "title": "How to cache LLM responses",
  "source_url": "https://python.langchain.com/docs/how_to/llm_caching/",
  "fetched_at": "2025-08-15T13:50:18.461598+00:00"
}
---

# How to cache LLM responses

from
langchain_core
.
globals
import
set_llm_cache
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
n
=
2
,
best_of
=
2
)
