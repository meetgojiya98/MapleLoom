---
{
  "title": "How to use multimodal prompts",
  "source_url": "https://python.langchain.com/docs/how_to/multimodal_prompts/",
  "fetched_at": "2025-08-15T13:50:29.482365+00:00"
}
---

# How to use multimodal prompts

prompt
=
ChatPromptTemplate
(
[
{
"role"
:
"system"
,
"content"
:
"Describe the image provided."
,
}
,
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
"image"
,
"source_type"
:
"base64"
,
"mime_type"
:
"{image_mime_type}"
,
"data"
:
"{image_data}"
,
"cache_control"
:
{
"type"
:
"{cache_type}"
}
,
}
,
]
,
}
,
]
)
