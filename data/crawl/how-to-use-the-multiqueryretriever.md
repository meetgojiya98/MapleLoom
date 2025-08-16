---
{
  "title": "How to use the MultiQueryRetriever",
  "source_url": "https://python.langchain.com/docs/how_to/MultiQueryRetriever/",
  "fetched_at": "2025-08-15T13:49:29.399799+00:00"
}
---

# How to use the MultiQueryRetriever

from
typing
import
List
from
langchain_core
.
output_parsers
import
BaseOutputParser
from
langchain_core
.
prompts
import
PromptTemplate
from
pydantic
import
BaseModel
,
Field
class
LineListOutputParser
(
BaseOutputParser
[
List
[
str
]
]
)
:
"""Output parser for a list of lines."""
def
parse
(
self
,
text
:
str
)
-
>
List
[
str
]
:
lines
=
text
.
strip
(
)
.
split
(
"\n"
)
return
list
(
filter
(
None
,
lines
)
)
output_parser
=
LineListOutputParser
(
)
QUERY_PROMPT
=
PromptTemplate
(
input_variables
=
[
"question"
]
,
template
=
"""You are an AI language model assistant. Your task is to generate five
different versions of the given user question to retrieve relevant documents from a vector
database. By generating multiple perspectives on the user question, your goal is to help
the user overcome some of the limitations of the distance-based similarity search.
Provide these alternative questions separated by newlines.
Original question: {question}"""
,
)
llm
=
ChatOpenAI
(
temperature
=
0
)
llm_chain
=
QUERY_PROMPT
|
llm
|
output_parser
question
=
"What are the approaches to Task Decomposition?"
