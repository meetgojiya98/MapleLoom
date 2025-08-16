---
{
  "title": "How to handle rate limits",
  "source_url": "https://python.langchain.com/docs/how_to/chat_model_rate_limiting/",
  "fetched_at": "2025-08-15T13:49:39.394284+00:00"
}
---

# How to handle rate limits

from
langchain_core
.
rate_limiters
import
InMemoryRateLimiter
rate_limiter
=
InMemoryRateLimiter
(
requests_per_second
=
0.1
,
check_every_n_seconds
=
0.1
,
max_bucket_size
=
10
,
)
