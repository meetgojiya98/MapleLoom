---
{
  "title": "How to use example selectors",
  "source_url": "https://python.langchain.com/docs/how_to/example_selectors/",
  "fetched_at": "2025-08-15T13:48:55.303290+00:00"
}
---

# How to use example selectors

prompt
=
FewShotPromptTemplate
(
example_selector
=
example_selector
,
example_prompt
=
example_prompt
,
suffix
=
"Input: {input} -> Output:"
,
prefix
=
"Translate the following words from English to Italian:"
,
input_variables
=
[
"input"
]
,
)
print
(
prompt
.
format
(
input
=
"word"
)
)
