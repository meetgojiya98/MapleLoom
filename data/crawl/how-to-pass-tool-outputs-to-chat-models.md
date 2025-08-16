---
{
  "title": "How to pass tool outputs to chat models",
  "source_url": "https://python.langchain.com/docs/how_to/tool_results_pass_to_model/",
  "fetched_at": "2025-08-15T13:51:06.605217+00:00"
}
---

# How to pass tool outputs to chat models

[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 87, 'total_tokens': 137}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-e3db3c46-bf9e-478e-abc1-dc9a264f4afe-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'type': 'tool_call'}], usage_metadata={'input_tokens': 87, 'output_tokens': 50, 'total_tokens': 137}),
ToolMessage(content='36', name='multiply', tool_call_id='call_loT2pliJwJe3p7nkgXYF48A1'),
ToolMessage(content='60', name='add', tool_call_id='call_bG9tYZCXOeYDZf3W46TceoV4')]
