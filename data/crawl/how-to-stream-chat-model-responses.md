---
{
  "title": "How to stream chat model responses",
  "source_url": "https://python.langchain.com/docs/how_to/chat_streaming/",
  "fetched_at": "2025-08-15T13:48:58.305985+00:00"
}
---

# How to stream chat model responses

{'event': 'on_chat_model_start', 'data': {'input': 'Write me a 1 verse song about goldfish on the moon'}, 'name': 'ChatAnthropic', 'tags': [], 'run_id': '1d430164-52b1-4d00-8c00-b16460f7737e', 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-haiku-20240307', 'ls_model_type': 'chat', 'ls_temperature': None, 'ls_max_tokens': 1024}, 'parent_ids': []}
{'event': 'on_chat_model_stream', 'run_id': '1d430164-52b1-4d00-8c00-b16460f7737e', 'name': 'ChatAnthropic', 'tags': [], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-haiku-20240307', 'ls_model_type': 'chat', 'ls_temperature': None, 'ls_max_tokens': 1024}, 'data': {'chunk': AIMessageChunk(content='', additional_kwargs={}, response_metadata={}, id='run-1d430164-52b1-4d00-8c00-b16460f7737e', usage_metadata={'input_tokens': 21, 'output_tokens': 2, 'total_tokens': 23, 'input_token_details': {'cache_creation': 0, 'cache_read': 0}})}, 'parent_ids': []}
{'event': 'on_chat_model_stream', 'run_id': '1d430164-52b1-4d00-8c00-b16460f7737e', 'name': 'ChatAnthropic', 'tags': [], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-haiku-20240307', 'ls_model_type': 'chat', 'ls_temperature': None, 'ls_max_tokens': 1024}, 'data': {'chunk': AIMessageChunk(content="Here's", additional_kwargs={}, response_metadata={}, id='run-1d430164-52b1-4d00-8c00-b16460f7737e')}, 'parent_ids': []}
{'event': 'on_chat_model_stream', 'run_id': '1d430164-52b1-4d00-8c00-b16460f7737e', 'name': 'ChatAnthropic', 'tags': [], 'metadata': {'ls_provider': 'anthropic', 'ls_model_name': 'claude-3-haiku-20240307', 'ls_model_type': 'chat', 'ls_temperature': None, 'ls_max_tokens': 1024}, 'data': {'chunk': AIMessageChunk(content=' a short one-verse song', additional_kwargs={}, response_metadata={}, id='run-1d430164-52b1-4d00-8c00-b16460f7737e')}, 'parent_ids': []}
...Truncated
