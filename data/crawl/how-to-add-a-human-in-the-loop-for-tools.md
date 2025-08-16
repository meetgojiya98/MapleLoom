---
{
  "title": "How to add a human-in-the-loop for tools",
  "source_url": "https://python.langchain.com/docs/how_to/tools_human/",
  "fetched_at": "2025-08-15T13:51:13.580410+00:00"
}
---

# How to add a human-in-the-loop for tools

Do you approve of the following tool invocations
{
"name": "send_email",
"args": {
"recipient": "sally@gmail.com",
"message": "What's up homie"
},
"id": "toolu_014XccHFzBiVcc9GV1harV9U"
}
Anything except 'Y'/'Yes' (case-insensitive) will be treated as a no.
>>> no
``````output
Tool invocations not approved:
{
"name": "send_email",
"args": {
"recipient": "sally@gmail.com",
"message": "What's up homie"
},
"id": "toolu_014XccHFzBiVcc9GV1harV9U"
}
