---
{
  "title": "How to select examples by n-gram overlap",
  "source_url": "https://python.langchain.com/docs/how_to/example_selectors_ngram/",
  "fetched_at": "2025-08-15T13:50:07.453841+00:00"
}
---

# How to select examples by n-gram overlap

from
langchain_community
.
example_selectors
import
NGramOverlapExampleSelector
from
langchain_core
.
prompts
import
FewShotPromptTemplate
,
PromptTemplate
example_prompt
=
PromptTemplate
(
input_variables
=
[
"input"
,
"output"
]
,
template
=
"Input: {input}\nOutput: {output}"
,
)
examples
=
[
{
"input"
:
"See Spot run."
,
"output"
:
"Ver correr a Spot."
}
,
{
"input"
:
"My dog barks."
,
"output"
:
"Mi perro ladra."
}
,
{
"input"
:
"Spot can run."
,
"output"
:
"Spot puede correr."
}
,
]
