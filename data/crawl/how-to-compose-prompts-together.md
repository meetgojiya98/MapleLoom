---
{
  "title": "How to compose prompts together",
  "source_url": "https://python.langchain.com/docs/how_to/prompts_composition/",
  "fetched_at": "2025-08-15T13:49:22.459007+00:00"
}
---

# How to compose prompts together

from
langchain_core
.
prompts
import
PipelinePromptTemplate
,
PromptTemplate
full_template
=
"""{introduction}
{example}
{start}"""
full_prompt
=
PromptTemplate
.
from_template
(
full_template
)
introduction_template
=
"""You are impersonating {person}."""
introduction_prompt
=
PromptTemplate
.
from_template
(
introduction_template
)
example_template
=
"""Here's an example of an interaction:
Q: {example_q}
A: {example_a}"""
example_prompt
=
PromptTemplate
.
from_template
(
example_template
)
start_template
=
"""Now, do this for real!
Q: {input}
A:"""
start_prompt
=
PromptTemplate
.
from_template
(
start_template
)
input_prompts
=
[
(
"introduction"
,
introduction_prompt
)
,
(
"example"
,
example_prompt
)
,
(
"start"
,
start_prompt
)
,
]
pipeline_prompt
=
PipelinePromptTemplate
(
final_prompt
=
full_prompt
,
pipeline_prompts
=
input_prompts
)
pipeline_prompt
.
input_variables
