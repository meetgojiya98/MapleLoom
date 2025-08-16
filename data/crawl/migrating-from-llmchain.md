---
{
  "title": "Migrating from LLMChain",
  "source_url": "https://python.langchain.com/docs/versions/migrating_chains/llm_chain/",
  "fetched_at": "2025-08-15T13:51:56.630912+00:00"
}
---

# Migrating from LLMChain

from
langchain
.
chains
import
LLMChain
from
langchain_core
.
prompts
import
ChatPromptTemplate
from
langchain_openai
import
ChatOpenAI
prompt
=
ChatPromptTemplate
.
from_messages
(
[
(
"user"
,
"Tell me a {adjective} joke"
)
]
,
)
legacy_chain
=
LLMChain
(
llm
=
ChatOpenAI
(
)
,
prompt
=
prompt
)
legacy_result
=
legacy_chain
(
{
"adjective"
:
"funny"
}
)
legacy_result
