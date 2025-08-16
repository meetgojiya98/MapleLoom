---
{
  "title": "How to merge consecutive messages of the same type",
  "source_url": "https://python.langchain.com/docs/how_to/merge_message_runs/",
  "fetched_at": "2025-08-15T13:50:24.466727+00:00"
}
---

# How to merge consecutive messages of the same type

AIMessage(content="# Definition of a Convergent Series\n\nA series is a sum of terms in a sequence, typically written as:\n\n$$\\sum_{n=1}^{\\infty} a_n = a_1 + a_2 + a_3 + \\ldots$$\n\nA series is called **convergent** if the sequence of partial sums approaches a finite limit.\n\n## Formal Definition\n\nLet's define the sequence of partial sums:\n$$S_N = \\sum_{n=1}^{N} a_n = a_1 + a_2 + \\ldots + a_N$$\n\nA series $\\sum_{n=1}^{\\infty} a_n$ is convergent if and only if:\n- The limit of the partial sums exists and is finite\n- That is, there exists a finite number $S$ such that $\\lim_{N \\to \\infty} S_N = S$\n\nIf this limit exists, we say the series converges to $S$, and we write:\n$$\\sum_{n=1}^{\\infty} a_n = S$$\n\nIf the limit doesn't exist or is infinite, the series is called divergent.", additional_kwargs={}, response_metadata={'id': 'msg_018ypyi2MTjV6S7jCydSqDn9', 'model': 'claude-3-7-sonnet-20250219', 'stop_reason': 'end_turn', 'stop_sequence': None, 'usage': {'cache_creation_input_tokens': 0, 'cache_read_input_tokens': 0, 'input_tokens': 29, 'output_tokens': 273, 'server_tool_use': None, 'service_tier': 'standard'}, 'model_name': 'claude-3-7-sonnet-20250219'}, id='run--5de0ca29-d031-48f7-bc75-671eade20b74-0', usage_metadata={'input_tokens': 29, 'output_tokens': 273, 'total_tokens': 302, 'input_token_details': {'cache_read': 0, 'cache_creation': 0}})
