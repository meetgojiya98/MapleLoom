---
{
  "title": "How to load CSVs",
  "source_url": "https://python.langchain.com/docs/how_to/document_loader_csv/",
  "fetched_at": "2025-08-15T13:49:53.432870+00:00"
}
---

# How to load CSVs

import
tempfile
from
io
import
StringIO
string_data
=
"""
"Team", "Payroll (millions)", "Wins"
"Nationals",     81.34, 98
"Reds",          82.20, 97
"Yankees",      197.96, 95
"Giants",       117.62, 94
"""
.
strip
(
)
with
tempfile
.
NamedTemporaryFile
(
delete
=
False
,
mode
=
"w+"
)
as
temp_file
:
temp_file
.
write
(
string_data
)
temp_file_path
=
temp_file
.
name
loader
=
CSVLoader
(
file_path
=
temp_file_path
)
data
=
loader
.
load
(
)
for
record
in
data
[
:
2
]
:
print
(
record
)
