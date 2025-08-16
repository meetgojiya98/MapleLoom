---
{
  "title": "How to reorder retrieved results to mitigate the \"lost in the middle\" effect",
  "source_url": "https://python.langchain.com/docs/how_to/long_context_reorder/",
  "fetched_at": "2025-08-15T13:50:22.472815+00:00"
}
---

# How to reorder retrieved results to mitigate the "lost in the middle" effect

from
langchain_core
.
vectorstores
import
InMemoryVectorStore
from
langchain_openai
import
OpenAIEmbeddings
embeddings
=
OpenAIEmbeddings
(
)
texts
=
[
"Basquetball is a great sport."
,
"Fly me to the moon is one of my favourite songs."
,
"The Celtics are my favourite team."
,
"This is a document about the Boston Celtics"
,
"I simply love going to the movies"
,
"The Boston Celtics won the game by 20 points"
,
"This is just a random text."
,
"Elden Ring is one of the best games in the last 15 years."
,
"L. Kornet is one of the best Celtics players."
,
"Larry Bird was an iconic NBA player."
,
]
retriever
=
InMemoryVectorStore
.
from_texts
(
texts
,
embedding
=
embeddings
)
.
as_retriever
(
search_kwargs
=
{
"k"
:
10
}
)
query
=
"What can you tell me about the Celtics?"
docs
=
retriever
.
invoke
(
query
)
for
doc
in
docs
:
print
(
f"-
{
doc
.
page_content
}
"
)
