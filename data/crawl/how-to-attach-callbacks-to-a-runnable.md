---
{
  "title": "How to attach callbacks to a runnable",
  "source_url": "https://python.langchain.com/docs/how_to/callbacks_attach/",
  "fetched_at": "2025-08-15T13:49:33.389219+00:00"
}
---

# How to attach callbacks to a runnable

Error in LoggingHandler.on_chain_start callback: AttributeError("'NoneType' object has no attribute 'get'")
``````output
Chain ChatPromptTemplate started
Chain ended, outputs: messages=[HumanMessage(content='What is 1 + 2?', additional_kwargs={}, response_metadata={})]
Chat model started
Chat model ended, response: generations=[[ChatGeneration(text='The sum of 1 + 2 is 3.', message=AIMessage(content='The sum of 1 + 2 is 3.', additional_kwargs={}, response_metadata={'id': 'msg_01F1qPrmBD9igfzHdqVipmKX', 'model': 'claude-3-7-sonnet-20250219', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'cache_creation_input_tokens': 0, 'cache_read_input_tokens': 0, 'input_tokens': 16, 'output_tokens': 17, 'server_tool_use': None, 'service_tier': 'standard'}, 'model_name': 'claude-3-7-sonnet-20250219'}, id='run--71edddf3-2474-42dc-ad43-fadb4882c3c8-0', usage_metadata={'input_tokens': 16, 'output_tokens': 17, 'total_tokens': 33, 'input_token_details': {'cache_read': 0, 'cache_creation': 0}}))]] llm_output={'id': 'msg_01F1qPrmBD9igfzHdqVipmKX', 'model': 'claude-3-7-sonnet-20250219', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'cache_creation_input_tokens': 0, 'cache_read_input_tokens': 0, 'input_tokens': 16, 'output_tokens': 17, 'server_tool_use': None, 'service_tier': 'standard'}, 'model_name': 'claude-3-7-sonnet-20250219'} run=None type='LLMResult'
Chain ended, outputs: content='The sum of 1 + 2 is 3.' additional_kwargs={} response_metadata={'id': 'msg_01F1qPrmBD9igfzHdqVipmKX', 'model': 'claude-3-7-sonnet-20250219', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'cache_creation_input_tokens': 0, 'cache_read_input_tokens': 0, 'input_tokens': 16, 'output_tokens': 17, 'server_tool_use': None, 'service_tier': 'standard'}, 'model_name': 'claude-3-7-sonnet-20250219'} id='run--71edddf3-2474-42dc-ad43-fadb4882c3c8-0' usage_metadata={'input_tokens': 16, 'output_tokens': 17, 'total_tokens': 33, 'input_token_details': {'cache_read': 0, 'cache_creation': 0}}
