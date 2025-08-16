---
{
  "title": "How to pass multimodal data to models",
  "source_url": "https://python.langchain.com/docs/how_to/multimodal_inputs/",
  "fetched_at": "2025-08-15T13:50:28.555780+00:00"
}
---

# How to pass multimodal data to models

How to pass multimodal data to models
Here we demonstrate how to pass
multimodal
input directly to models.
LangChain supports multimodal data as input to chat models:
Following provider-specific formats
Adhering to a cross-provider standard
Below, we demonstrate the cross-provider standard. See
chat model integrations
for detail
on native formats for specific providers.
Most chat models that support multimodal
image
inputs also accept those values in
OpenAI's
Chat Completions format
:
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
,
}
Images
​
Many providers will accept images passed in-line as base64 data. Some will additionally accept an image from a URL directly.
Images from base64 data
​
To pass images in-line, format them as content blocks of the following form:
{
"type"
:
"image"
,
"source_type"
:
"base64"
,
"mime_type"
:
"image/jpeg"
,
"data"
:
"<base64 data string>"
,
}
Example:
import
base64
import
httpx
from
langchain
.
chat_models
import
init_chat_model
image_url
=
"https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
image_data
=
base64
.
b64encode
(
httpx
.
get
(
image_url
)
.
content
)
.
decode
(
"utf-8"
)
llm
=
init_chat_model
(
"anthropic:claude-3-5-sonnet-latest"
)
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Describe the weather in this image:"
,
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
image_data
,
"mime_type"
:
"image/jpeg"
,
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
print
(
response
.
text
(
)
)
The image shows a beautiful clear day with bright blue skies and wispy cirrus clouds stretching across the horizon. The clouds are thin and streaky, creating elegant patterns against the blue backdrop. The lighting suggests it's during the day, possibly late afternoon given the warm, golden quality of the light on the grass. The weather appears calm with no signs of wind (the grass looks relatively still) and no indication of rain. It's the kind of perfect, mild weather that's ideal for walking along the wooden boardwalk through the marsh grass.
See
LangSmith trace
for more detail.
Images from a URL
​
Some providers (including
OpenAI
,
Anthropic
, and
Google Gemini
) will also accept images from URLs directly.
To pass images as URLs, format them as content blocks of the following form:
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
Example:
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Describe the weather in this image:"
,
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
image_url
,
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
print
(
response
.
text
(
)
)
The weather in this image appears to be pleasant and clear. The sky is mostly blue with a few scattered, light clouds, and there is bright sunlight illuminating the green grass and plants. There are no signs of rain or stormy conditions, suggesting it is a calm, likely warm day—typical of spring or summer.
We can also pass in multiple images:
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Are these two images the same?"
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
image_url
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
image_url
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
print
(
response
.
text
(
)
)
Yes, these two images are the same. They depict a wooden boardwalk going through a grassy field under a blue sky with some clouds. The colors, composition, and elements in both images are identical.
Documents (PDF)
​
Some providers (including
OpenAI
,
Anthropic
, and
Google Gemini
) will accept PDF documents.
OpenAI requires file-names be specified for PDF inputs. When using LangChain's format, include the
filename
key. See
example below
.
Documents from base64 data
​
To pass documents in-line, format them as content blocks of the following form:
{
"type"
:
"file"
,
"source_type"
:
"base64"
,
"mime_type"
:
"application/pdf"
,
"data"
:
"<base64 data string>"
,
}
Example:
import
base64
import
httpx
from
langchain
.
chat_models
import
init_chat_model
pdf_url
=
"https://pdfobject.com/pdf/sample.pdf"
pdf_data
=
base64
.
b64encode
(
httpx
.
get
(
pdf_url
)
.
content
)
.
decode
(
"utf-8"
)
llm
=
init_chat_model
(
"anthropic:claude-3-5-sonnet-latest"
)
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Describe the document:"
,
}
,
{
"type"
:
"file"
,
"source_type"
:
"base64"
,
"data"
:
pdf_data
,
"mime_type"
:
"application/pdf"
,
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
print
(
response
.
text
(
)
)
This document appears to be a sample PDF file that contains Lorem ipsum placeholder text. It begins with a title "Sample PDF" followed by the subtitle "This is a simple PDF file. Fun fun fun."
The rest of the document consists of several paragraphs of Lorem ipsum text, which is a commonly used placeholder text in design and publishing. The text is formatted in a clean, readable layout with consistent paragraph spacing. The document appears to be a single page containing four main paragraphs of this placeholder text.
The Lorem ipsum text, while appearing to be Latin, is actually scrambled Latin-like text that is used primarily to demonstrate the visual form of a document or typeface without the distraction of meaningful content. It's commonly used in publishing and graphic design when the actual content is not yet available but the layout needs to be demonstrated.
The document has a professional, simple layout with generous margins and clear paragraph separation, making it an effective example of basic PDF formatting and structure.
Documents from a URL
​
Some providers (specifically
Anthropic
)
will also accept documents from URLs directly.
To pass documents as URLs, format them as content blocks of the following form:
{
"type"
:
"file"
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
Example:
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Describe the document:"
,
}
,
{
"type"
:
"file"
,
"source_type"
:
"url"
,
"url"
:
pdf_url
,
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
print
(
response
.
text
(
)
)
This document appears to be a sample PDF file with both text and an image. It begins with a title "Sample PDF" followed by the text "This is a simple PDF file. Fun fun fun." The rest of the document contains Lorem ipsum placeholder text arranged in several paragraphs. The content is shown both as text and as an image of the formatted PDF, with the same content displayed in a clean, formatted layout with consistent spacing and typography. The document consists of a single page containing this sample text.
Audio
​
Some providers (including
OpenAI
and
Google Gemini
) will accept audio inputs.
Audio from base64 data
​
To pass audio in-line, format them as content blocks of the following form:
{
"type"
:
"audio"
,
"source_type"
:
"base64"
,
"mime_type"
:
"audio/wav"
,
"data"
:
"<base64 data string>"
,
}
Example:
import
base64
import
httpx
from
langchain
.
chat_models
import
init_chat_model
audio_url
=
"https://upload.wikimedia.org/wikipedia/commons/3/3d/Alcal%C3%A1_de_Henares_%28RPS_13-04-2024%29_canto_de_ruise%C3%B1or_%28Luscinia_megarhynchos%29_en_el_Soto_del_Henares.wav"
audio_data
=
base64
.
b64encode
(
httpx
.
get
(
audio_url
)
.
content
)
.
decode
(
"utf-8"
)
llm
=
init_chat_model
(
"google_genai:gemini-2.5-flash"
)
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Describe this audio:"
,
}
,
{
"type"
:
"audio"
,
"source_type"
:
"base64"
,
"data"
:
audio_data
,
"mime_type"
:
"audio/wav"
,
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
print
(
response
.
text
(
)
)
The audio appears to consist primarily of bird sounds, specifically bird vocalizations like chirping and possibly other bird songs.
Provider-specific parameters
​
Some providers will support or require additional fields on content blocks containing multimodal data.
For example, Anthropic lets you specify
caching
of
specific content to reduce token consumption.
To use these fields, you can:
Store them on directly on the content block; or
Use the native format supported by each provider (see
chat model integrations
for detail).
We show three examples below.
Example: Anthropic prompt caching
​
llm
=
init_chat_model
(
"anthropic:claude-3-5-sonnet-latest"
)
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Describe the weather in this image:"
,
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
image_url
,
"cache_control"
:
{
"type"
:
"ephemeral"
}
,
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
print
(
response
.
text
(
)
)
response
.
usage_metadata
The image shows a beautiful, clear day with partly cloudy skies. The sky is a vibrant blue with wispy, white cirrus clouds stretching across it. The lighting suggests it's during daylight hours, possibly late afternoon or early evening given the warm, golden quality of the light on the grass. The weather appears calm with no signs of wind (the grass looks relatively still) and no threatening weather conditions. It's the kind of perfect weather you'd want for a walk along this wooden boardwalk through the marshland or grassland area.
{'input_tokens': 1586,
'output_tokens': 117,
'total_tokens': 1703,
'input_token_details': {'cache_read': 0, 'cache_creation': 1582}}
next_message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Summarize that in 5 words."
,
}
]
,
}
response
=
llm
.
invoke
(
[
message
,
response
,
next_message
]
)
print
(
response
.
text
(
)
)
response
.
usage_metadata
Clear blue skies, wispy clouds.
{'input_tokens': 1716,
'output_tokens': 12,
'total_tokens': 1728,
'input_token_details': {'cache_read': 1582, 'cache_creation': 0}}
Example: Anthropic citations
​
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Generate a 5 word summary of this document."
,
}
,
{
"type"
:
"file"
,
"source_type"
:
"base64"
,
"data"
:
pdf_data
,
"mime_type"
:
"application/pdf"
,
"citations"
:
{
"enabled"
:
True
}
,
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
response
.
content
[{'citations': [{'cited_text': 'Sample PDF\r\nThis is a simple PDF file. Fun fun fun.\r\n',
'document_index': 0,
'document_title': None,
'end_page_number': 2,
'start_page_number': 1,
'type': 'page_location'}],
'text': 'Simple PDF file: fun fun',
'type': 'text'}]
Example: OpenAI file names
​
OpenAI requires that PDF documents be associated with file names:
llm
=
init_chat_model
(
"openai:gpt-4.1"
)
message
=
{
"role"
:
"user"
,
"content"
:
[
{
"type"
:
"text"
,
"text"
:
"Describe the document:"
,
}
,
{
"type"
:
"file"
,
"source_type"
:
"base64"
,
"data"
:
pdf_data
,
"mime_type"
:
"application/pdf"
,
"filename"
:
"my-file"
,
}
,
]
,
}
response
=
llm
.
invoke
(
[
message
]
)
print
(
response
.
text
(
)
)
The document is a sample PDF file containing placeholder text. It consists of one page, titled "Sample PDF". The content is a mixture of English and the commonly used filler text "Lorem ipsum dolor sit amet..." and its extensions, which are often used in publishing and web design as generic text to demonstrate font, layout, and other visual elements.
**Key points about the document:**
- Length: 1 page
- Purpose: Demonstrative/sample content
- Content: No substantive or meaningful information, just demonstration text in paragraph form
- Language: English (with the Latin-like "Lorem Ipsum" text used for layout purposes)
There are no charts, tables, diagrams, or images on the page—only plain text. The document serves as an example of what a PDF file looks like rather than providing actual, useful content.
Some multimodal models support
tool calling
features as well. To call tools using such models, simply bind tools to them in the
usual way
, and invoke the model using content blocks of the desired type (e.g., containing image data).
from
typing
import
Literal
from
langchain_core
.
tools
import
tool
@tool
def
weather_tool
(
weather
:
Literal
[
"sunny"
,
"cloudy"
,
"rainy"
]
)
-
>
None
:
"""Describe the weather"""
pass
llm_with_tools
=
llm
.
bind_tools
(
[
weather_tool
]
)
message
=
{
"role"
:
"user"
,
"content"
:
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
image_url
}
,
]
,
}
response
=
llm_with_tools
.
invoke
(
[
message
]
)
response
.
tool_calls
[{'name': 'weather_tool',
'args': {'weather': 'sunny'},
'id': 'toolu_01G6JgdkhwggKcQKfhXZQPjf',
'type': 'tool_call'}]
