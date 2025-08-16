---
{
  "title": "How to convert tools to OpenAI Functions",
  "source_url": "https://python.langchain.com/docs/how_to/tools_as_openai_functions/",
  "fetched_at": "2025-08-15T13:51:10.550310+00:00"
}
---

# How to convert tools to OpenAI Functions

{'name': 'move_file',
'description': 'Move or rename a file from one location to another',
'parameters': {'type': 'object',
'properties': {'source_path': {'description': 'Path of the file to move',
'type': 'string'},
'destination_path': {'description': 'New path for the moved file',
'type': 'string'}},
'required': ['source_path', 'destination_path']}}
