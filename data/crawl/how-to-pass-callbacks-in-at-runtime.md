---
{
  "title": "How to pass callbacks in at runtime",
  "source_url": "https://python.langchain.com/docs/how_to/callbacks_runtime/",
  "fetched_at": "2025-08-15T13:49:36.395268+00:00"
}
---

# How to pass callbacks in at runtime

Error in LoggingHandler.on_chain_start callback: AttributeError("'NoneType' object has no attribute 'get'")
``````output
Chain ChatPromptTemplate started
Chain ended, outputs: messages=[HumanMessage(content='What is 1 + 2?', additional_kwargs={}, response_metadata={})]
Chat model started
Chat model ended, response: generations=[[ChatGeneration(text='1 + 2 = 3', message=AIMessage(content='1 + 2 = 3', additional_kwargs={}, response_metadata={'id': 'msg_019ieJt8K32iC77qBbQmSa9m', 'model': 'claude-3-7-sonnet-20250219', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'cache_creation_input_tokens': 0, 'cache_read_input_tokens': 0, 'input_tokens': 16, 'output_tokens': 13, 'server_tool_use': None, 'service_tier': 'standard'}, 'model_name': 'claude-3-7-sonnet-20250219'}, id='run--2f596356-99c9-45ef-94ff-fb170072abdf-0', usage_metadata={'input_tokens': 16, 'output_tokens': 13, 'total_tokens': 29, 'input_token_details': {'cache_read': 0, 'cache_creation': 0}}))]] llm_output={'id': 'msg_019ieJt8K32iC77qBbQmSa9m', 'model': 'claude-3-7-sonnet-20250219', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'cache_creation_input_tokens': 0, 'cache_read_input_tokens': 0, 'input_tokens': 16, 'output_tokens': 13, 'server_tool_use': None, 'service_tier': 'standard'}, 'model_name': 'claude-3-7-sonnet-20250219'} run=None type='LLMResult'
Chain ended, outputs: content='1 + 2 = 3' additional_kwargs={} response_metadata={'id': 'msg_019ieJt8K32iC77qBbQmSa9m', 'model': 'claude-3-7-sonnet-20250219', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'cache_creation_input_tokens': 0, 'cache_read_input_tokens': 0, 'input_tokens': 16, 'output_tokens': 13, 'server_tool_use': None, 'service_tier': 'standard'}, 'model_name': 'claude-3-7-sonnet-20250219'} id='run--2f596356-99c9-45ef-94ff-fb170072abdf-0' usage_metadata={'input_tokens': 16, 'output_tokens': 13, 'total_tokens': 29, 'input_token_details': {'cache_read': 0, 'cache_creation': 0}}
