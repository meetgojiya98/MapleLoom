---
{
  "title": "How to dispatch custom callback events",
  "source_url": "https://python.langchain.com/docs/how_to/callbacks_custom_events/",
  "fetched_at": "2025-08-15T13:49:35.418582+00:00"
}
---

# How to dispatch custom callback events

{'event': 'on_chain_start', 'data': {'input': 'hello world'}, 'name': 'foo', 'tags': [], 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'metadata': {}, 'parent_ids': []}
{'event': 'on_custom_event', 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'name': 'event1', 'tags': [], 'metadata': {}, 'data': {'x': 'hello world'}, 'parent_ids': []}
{'event': 'on_custom_event', 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'name': 'event2', 'tags': [], 'metadata': {}, 'data': 5, 'parent_ids': []}
{'event': 'on_chain_stream', 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'name': 'foo', 'tags': [], 'metadata': {}, 'data': {'chunk': 'hello world'}, 'parent_ids': []}
{'event': 'on_chain_end', 'data': {'output': 'hello world'}, 'run_id': 'f354ffe8-4c22-4881-890a-c1cad038a9a6', 'name': 'foo', 'tags': [], 'metadata': {}, 'parent_ids': []}
