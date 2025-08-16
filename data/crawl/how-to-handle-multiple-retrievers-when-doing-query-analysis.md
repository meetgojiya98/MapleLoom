---
{
  "title": "How to handle multiple retrievers when doing query analysis",
  "source_url": "https://python.langchain.com/docs/how_to/query_multiple_retrievers/",
  "fetched_at": "2025-08-15T13:49:23.369706+00:00"
}
---

# How to handle multiple retrievers when doing query analysis

from
typing
import
List
,
Optional
from
pydantic
import
BaseModel
,
Field
class
Search
(
BaseModel
)
:
"""Search for information about a person."""
query
:
str
=
Field
(
.
.
.
,
description
=
"Query to look up"
,
)
person
:
str
=
Field
(
.
.
.
,
description
=
"Person to look things up for. Should be `HARRISON` or `ANKUSH`."
,
)
