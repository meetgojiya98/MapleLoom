---
{
  "title": "Retrieval augmented generation (RAG)",
  "source_url": "https://python.langchain.com/docs/concepts/rag/",
  "fetched_at": "2025-08-15T13:51:35.587042+00:00"
}
---

# Retrieval augmented generation (RAG)

from
langchain_openai
import
ChatOpenAI
from
langchain_core
.
messages
import
SystemMessage
,
HumanMessage
system_prompt
=
"""You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.
Context: {context}:"""
question
=
"""What are the main components of an LLM-powered autonomous agent system?"""
docs
=
retriever
.
invoke
(
question
)
docs_text
=
""
.
join
(
d
.
page_content
for
d
in
docs
)
system_prompt_fmt
=
system_prompt
.
format
(
context
=
docs_text
)
model
=
ChatOpenAI
(
model
=
"gpt-4o"
,
temperature
=
0
)
questions
=
model
.
invoke
(
[
SystemMessage
(
content
=
system_prompt_fmt
)
,
HumanMessage
(
content
=
question
)
]
)
