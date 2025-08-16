---
{
  "title": "How to handle cases where no queries are generated",
  "source_url": "https://python.langchain.com/docs/how_to/query_no_queries/",
  "fetched_at": "2025-08-15T13:49:08.344006+00:00"
}
---

# How to handle cases where no queries are generated

AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_korLZrh08PTRL94f4L7rFqdj', 'function': {'arguments': '{"query":"Harrison"}', 'name': 'Search'}, 'type': 'function'}], 'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 14, 'prompt_tokens': 95, 'total_tokens': 109}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_483d39d857', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-ea94d376-37bf-4f80-abe6-e3b42b767ea0-0', tool_calls=[{'name': 'Search', 'args': {'query': 'Harrison'}, 'id': 'call_korLZrh08PTRL94f4L7rFqdj', 'type': 'tool_call'}], usage_metadata={'input_tokens': 95, 'output_tokens': 14, 'total_tokens': 109})
