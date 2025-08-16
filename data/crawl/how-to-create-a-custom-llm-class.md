---
{
  "title": "How to create a custom LLM class",
  "source_url": "https://python.langchain.com/docs/how_to/custom_llm/",
  "fetched_at": "2025-08-15T13:49:49.458154+00:00"
}
---

# How to create a custom LLM class

{'event': 'on_chain_start', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'name': 'RunnableSequence', 'tags': [], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_start', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_end', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}, 'output': ChatPromptValue(messages=[SystemMessage(content='you are a bot'), HumanMessage(content='hello there!')])}}
{'event': 'on_llm_start', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'input': {'prompts': ['System: you are a bot\nHuman: hello there!']}}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'S'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'S'}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'y'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'y'}}
