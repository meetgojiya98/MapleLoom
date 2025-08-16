---
{
  "title": "How to force models to call a tool",
  "source_url": "https://python.langchain.com/docs/how_to/tool_choice/",
  "fetched_at": "2025-08-15T13:51:04.532409+00:00"
}
---

# How to force models to call a tool

AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_9cViskmLvPnHjXk9tbVla5HA', 'function': {'arguments': '{"a":2,"b":4}', 'name': 'Multiply'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 9, 'prompt_tokens': 103, 'total_tokens': 112}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': None, 'finish_reason': 'stop', 'logprobs': None}, id='run-095b827e-2bdd-43bb-8897-c843f4504883-0', tool_calls=[{'name': 'Multiply', 'args': {'a': 2, 'b': 4}, 'id': 'call_9cViskmLvPnHjXk9tbVla5HA'}], usage_metadata={'input_tokens': 103, 'output_tokens': 9, 'total_tokens': 112})
