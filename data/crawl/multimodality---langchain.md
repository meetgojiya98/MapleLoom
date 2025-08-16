---
{
  "title": "Multimodality | 🦜️🔗 LangChain",
  "source_url": "https://python.langchain.com/docs/concepts/multimodality/",
  "fetched_at": "2025-08-15T13:51:32.631465+00:00"
}
---

# Multimodality | 🦜️🔗 LangChain

Overview
​
Multimodality
refers to the ability to work with data that comes in different forms, such as text, audio, images, and video. Multimodality can appear in various components, allowing models and systems to handle and process a mix of these data types seamlessly.
Chat Models
: These could, in theory, accept and generate multimodal inputs and outputs, handling a variety of data types like text, images, audio, and video.
Embedding Models
: Embedding Models can represent multimodal content, embedding various forms of data—such as text, images, and audio—into vector spaces.
Vector Stores
: Vector stores could search over embeddings that represent multimodal data, enabling retrieval across different types of information.
Multimodality in chat models
​
LangChain supports multimodal data as input to chat models:
Following provider-specific formats
Adhering to a cross-provider standard (see
how-to guides
for detail)
How to use multimodal models
​
What kind of multimodality is supported?
​
Inputs
​
Some models can accept multimodal inputs, such as images, audio, video, or files.
The types of multimodal inputs supported depend on the model provider. For instance,
OpenAI
,
Anthropic
, and
Google Gemini
support documents like PDFs as inputs.
The gist of passing multimodal inputs to a chat model is to use content blocks that
specify a type and corresponding data. For example, to pass an image to a chat model
as URL:
from
langchain_core
.
messages
import
HumanMessage
message
=
HumanMessage
(
content
=
[
{
"type"
:
"text"
,
"text"
:
"Describe the weather in this image:"
}
,
{
"type"
:
"image"
,
"source_type"
:
"url"
,
"url"
:
"https://..."
,
}
,
]
,
)
response
=
model
.
invoke
(
[
message
]
)
We can also pass the image as in-line data:
from
langchain_core
.
messages
import
HumanMessage
message
=
HumanMessage
(
content
=
[
{
"type"
:
"text"
,
"text"
:
"Describe the weather in this image:"
}
,
{
"type"
:
"image"
,
"source_type"
:
"base64"
,
"data"
:
"<base64 string>"
,
"mime_type"
:
"image/jpeg"
,
}
,
]
,
)
response
=
model
.
invoke
(
[
message
]
)
To pass a PDF file as in-line data (or URL, as supported by providers such as
Anthropic), just change
"type"
to
"file"
and
"mime_type"
to
"application/pdf"
.
See the
how-to guides
for more detail.
Most chat models that support multimodal
image
inputs also accept those values in
OpenAI's
Chat Completions format
:
from
langchain_core
.
messages
import
HumanMessage
message
=
HumanMessage
(
content
=
[
{
"type"
:
"text"
,
"text"
:
"Describe the weather in this image:"
}
,
{
"type"
:
"image_url"
,
"image_url"
:
{
"url"
:
image_url
}
}
,
]
,
)
response
=
model
.
invoke
(
[
message
]
)
Otherwise, chat models will typically accept the native, provider-specific content
block format. See
chat model integrations
for detail
on specific providers.
Outputs
​
Some chat models support multimodal outputs, such as images and audio. Multimodal
outputs will appear as part of the
AIMessage
response object. See for example:
Currently, no chat model is designed to work
directly
with multimodal data in a
tool call request
or
ToolMessage
result.
However, a chat model can easily interact with multimodal data by invoking tools with references (e.g., a URL) to the multimodal data, rather than the data itself. For example, any model capable of
tool calling
can be equipped with tools to download and process images, audio, or video.
Multimodality in embedding models
​
Embeddings
are vector representations of data used for tasks like similarity search and retrieval.
The current
embedding interface
used in LangChain is optimized entirely for text-based data, and will
not
work with multimodal data.
As use cases involving multimodal search and retrieval tasks become more common, we expect to expand the embedding interface to accommodate other data types like images, audio, and video.
Multimodality in vector stores
​
Vector stores are databases for storing and retrieving embeddings, which are typically used in search and retrieval tasks. Similar to embeddings, vector stores are currently optimized for text-based data.
As use cases involving multimodal search and retrieval tasks become more common, we expect to expand the vector store interface to accommodate other data types like images, audio, and video.
