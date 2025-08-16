---
{
  "title": "How to add default invocation args to a Runnable",
  "source_url": "https://python.langchain.com/docs/how_to/binding/",
  "fetched_at": "2025-08-15T13:48:59.311266+00:00"
}
---

# How to add default invocation args to a Runnable

AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_z0OU2CytqENVrRTI6T8DkI3u', 'function': {'arguments': '{"location": "San Francisco, CA", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}, {'id': 'call_ft96IJBh0cMKkQWrZjNg4bsw', 'function': {'arguments': '{"location": "New York, NY", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}, {'id': 'call_tfbtGgCLmuBuWgZLvpPwvUMH', 'function': {'arguments': '{"location": "Los Angeles, CA", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 84, 'prompt_tokens': 85, 'total_tokens': 169}, 'model_name': 'gpt-4o-mini', 'system_fingerprint': 'fp_77a673219d', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-d57ad5fa-b52a-4822-bc3e-74f838697e18-0', tool_calls=[{'name': 'get_current_weather', 'args': {'location': 'San Francisco, CA', 'unit': 'celsius'}, 'id': 'call_z0OU2CytqENVrRTI6T8DkI3u'}, {'name': 'get_current_weather', 'args': {'location': 'New York, NY', 'unit': 'celsius'}, 'id': 'call_ft96IJBh0cMKkQWrZjNg4bsw'}, {'name': 'get_current_weather', 'args': {'location': 'Los Angeles, CA', 'unit': 'celsius'}, 'id': 'call_tfbtGgCLmuBuWgZLvpPwvUMH'}])
