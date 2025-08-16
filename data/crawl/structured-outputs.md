---
{
  "title": "Structured outputs",
  "source_url": "https://python.langchain.com/docs/concepts/structured_outputs/",
  "fetched_at": "2025-08-15T13:51:40.621937+00:00"
}
---

# Structured outputs

Overview
​
For many applications, such as chatbots, models need to respond to users directly in natural language.
However, there are scenarios where we need models to output in a
structured format
.
For example, we might want to store the model output in a database and ensure that the output conforms to the database schema.
This need motivates the concept of structured output, where models can be instructed to respond with a particular output structure.
Key concepts
​
Schema definition:
The output structure is represented as a schema, which can be defined in several ways.
Returning structured output:
The model is given this schema, and is instructed to return output that conforms to it.
Recommended usage
​
This pseudocode illustrates the recommended workflow when using structured output.
LangChain provides a method,
with_structured_output()
, that automates the process of binding the schema to the
model
and parsing the output.
This helper function is available for all model providers that support structured output.
schema
=
{
"foo"
:
"bar"
}
model_with_structure
=
model
.
with_structured_output
(
schema
)
structured_output
=
model_with_structure
.
invoke
(
user_input
)
When combining structured output with additional tools, bind tools
first
, then apply structured output:
model_with_tools
=
model
.
bind_tools
(
[
tool1
,
tool2
]
)
structured_model
=
model_with_tools
.
with_structured_output
(
schema
)
structured_model
=
model
.
with_structured_output
(
schema
)
broken_model
=
structured_model
.
bind_tools
(
[
tool1
,
tool2
]
)
Schema definition
​
The central concept is that the output structure of model responses needs to be represented in some way.
While types of objects you can use depend on the model you're working with, there are common types of objects that are typically allowed or recommended for structured output in Python.
The simplest and most common format for structured output is a JSON-like structure, which in Python can be represented as a dictionary (dict) or list (list).
JSON objects (or dicts in Python) are often used directly when the tool requires raw, flexible, and minimal-overhead structured data.
{
"answer"
:
"The answer to the user's question"
,
"followup_question"
:
"A followup question the user could ask"
}
As a second example,
Pydantic
is particularly useful for defining structured output schemas because it offers type hints and validation.
Here's an example of a Pydantic schema:
from
pydantic
import
BaseModel
,
Field
class
ResponseFormatter
(
BaseModel
)
:
"""Always use this tool to structure your response to the user."""
answer
:
str
=
Field
(
description
=
"The answer to the user's question"
)
followup_question
:
str
=
Field
(
description
=
"A followup question the user could ask"
)
Returning structured output
​
With a schema defined, we need a way to instruct the model to use it.
While one approach is to include this schema in the prompt and
ask nicely
for the model to use it, this is not recommended.
Several more powerful methods that utilizes native features in the model provider's API are available.
Many
model providers support
tool calling, a concept discussed in more detail in our
tool calling guide
.
In short, tool calling involves binding a tool to a model and, when appropriate, the model can
decide
to call this tool and ensure its response conforms to the tool's schema.
With this in mind, the central concept is straightforward:
simply bind our schema to a model as a tool!
Here is an example using the
ResponseFormatter
schema defined above:
from
langchain_openai
import
ChatOpenAI
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
model_with_tools
=
model
.
bind_tools
(
[
ResponseFormatter
]
)
ai_msg
=
model_with_tools
.
invoke
(
"What is the powerhouse of the cell?"
)
The arguments of the tool call are already extracted as a dictionary.
This dictionary can be optionally parsed into a Pydantic object, matching our original
ResponseFormatter
schema.
ai_msg
.
tool_calls
[
0
]
[
"args"
]
{
'answer'
:
"The powerhouse of the cell is the mitochondrion. Mitochondria are organelles that generate most of the cell's supply of adenosine triphosphate (ATP), which is used as a source of chemical energy."
,
'followup_question'
:
'What is the function of ATP in the cell?'
}
pydantic_object
=
ResponseFormatter
.
model_validate
(
ai_msg
.
tool_calls
[
0
]
[
"args"
]
)
JSON mode
​
In addition to tool calling, some model providers support a feature called
JSON mode
.
This supports JSON schema definition as input and enforces the model to produce a conforming JSON output.
You can find a table of model providers that support JSON mode
here
.
Here is an example of how to use JSON mode with OpenAI:
from
langchain_openai
import
ChatOpenAI
model
=
ChatOpenAI
(
model
=
"gpt-4o"
)
.
with_structured_output
(
method
=
"json_mode"
)
ai_msg
=
model
.
invoke
(
"Return a JSON object with key 'random_ints' and a value of 10 random ints in [0-99]"
)
ai_msg
{
'random_ints'
:
[
45
,
67
,
12
,
34
,
89
,
23
,
78
,
56
,
90
,
11
]
}
Structured output method
​
There are a few challenges when producing structured output with the above methods:
When tool calling is used, tool call arguments needs to be parsed from a dictionary back to the original schema.
In addition, the model needs to be instructed to
always
use the tool when we want to enforce structured output, which is a provider specific setting.
When JSON mode is used, the output needs to be parsed into a JSON object.
With these challenges in mind, LangChain provides a helper function (
with_structured_output()
) to streamline the process.
This both binds the schema to the model as a tool and parses the output to the specified output schema.
model_with_structure
=
model
.
with_structured_output
(
ResponseFormatter
)
structured_output
=
model_with_structure
.
invoke
(
"What is the powerhouse of the cell?"
)
structured_output
ResponseFormatter
(
answer
=
"The powerhouse of the cell is the mitochondrion. Mitochondria are organelles that generate most of the cell's supply of adenosine triphosphate (ATP), which is used as a source of chemical energy."
,
followup_question
=
'What is the function of ATP in the cell?'
)
