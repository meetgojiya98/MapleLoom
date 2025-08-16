---
{
  "title": "How to disable parallel tool calling",
  "source_url": "https://python.langchain.com/docs/how_to/tool_calling_parallel/",
  "fetched_at": "2025-08-15T13:51:03.533220+00:00"
}
---

# How to disable parallel tool calling

from
langchain_core
.
tools
import
tool
@tool
def
add
(
a
:
int
,
b
:
int
)
-
>
int
:
"""Adds a and b."""
return
a
+
b
@tool
def
multiply
(
a
:
int
,
b
:
int
)
-
>
int
:
"""Multiplies a and b."""
return
a
*
b
tools
=
[
add
,
multiply
]
