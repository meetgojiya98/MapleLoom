---
{
  "title": "Vector stores | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/integrations/vectorstores/",
  "fetched_at": "2025-08-15T13:52:14.735575+00:00"
}
---

# Vector stores | 🦜️🔗 LangChain

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
