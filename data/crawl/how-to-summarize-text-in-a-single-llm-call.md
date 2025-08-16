---
{
  "title": "How to summarize text in a single LLM call",
  "source_url": "https://python.langchain.com/docs/how_to/summarize_stuff/",
  "fetched_at": "2025-08-15T13:49:13.390410+00:00"
}
---

# How to summarize text in a single LLM call

from
langchain_core
.
documents
import
Document
documents
=
[
Document
(
page_content
=
"Apples are red"
,
metadata
=
{
"title"
:
"apple_book"
}
)
,
Document
(
page_content
=
"Blueberries are blue"
,
metadata
=
{
"title"
:
"blueberry_book"
}
)
,
Document
(
page_content
=
"Bananas are yelow"
,
metadata
=
{
"title"
:
"banana_book"
}
)
,
]
