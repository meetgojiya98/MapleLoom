---
{
  "title": "Load a HuggingFace Dataset",
  "source_url": "https://qdrant.tech/documentation/database-tutorials/huggingface-datasets/",
  "fetched_at": "2025-08-15T13:53:32.089111+00:00"
}
---

# Load a HuggingFace Dataset

Load and Search Hugging Face Datasets with Qdrant
Hugging Face
provides a platform for sharing and using ML models and
datasets.
Qdrant
also publishes datasets along with the
embeddings that you can use to practice with Qdrant and build your applications based on semantic
search.
Please
let us know
if you’d like to see a specific dataset!
arxiv-titles-instructorxl-embeddings
This dataset
contains
embeddings generated from the paper titles only. Each vector has a payload with the title used to
create it, along with the DOI (Digital Object Identifier).
{
"title"
:
"Nash Social Welfare for Indivisible Items under Separable, Piecewise-Linear Concave Utilities"
,
"DOI"
:
"1612.05191"
}
You can find a detailed description of the dataset in the
Practice Datasets
section. If you prefer loading the dataset from a Qdrant snapshot, it also linked there.
Loading the dataset is as simple as using the
load_dataset
function from the
datasets
library:
from
datasets
import
load_dataset
dataset
=
load_dataset
(
"Qdrant/arxiv-titles-instructorxl-embeddings"
)
The dataset has over 16 GB, so it might take a while to download.
The dataset contains 2,250,000 vectors. This is how you can check the list of the features in the dataset:
Streaming the dataset
Dataset streaming lets you work with a dataset without downloading it. The data is streamed as
you iterate over the dataset. You can read more about it in the
Hugging Face
documentation
.
from
datasets
import
load_dataset
dataset
=
load_dataset
(
"Qdrant/arxiv-titles-instructorxl-embeddings"
,
split
=
"train"
,
streaming
=
True
)
Loading the dataset into Qdrant
You can load the dataset into Qdrant using the
Python SDK
.
The embeddings are already precomputed, so you can store them in a collection, that we’re going
to create in a second:
from
qdrant_client
import
QdrantClient
,
models
client
=
QdrantClient
(
"http://localhost:6333"
)
client
.
create_collection
(
collection_name
=
"arxiv-titles-instructorxl-embeddings"
,
vectors_config
=
models
.
VectorParams
(
size
=
768
,
distance
=
models
.
Distance
.
COSINE
,
),
)
It is always a good idea to use batching, while loading a large dataset, so let’s do that.
We are going to need a helper function to split the dataset into batches:
from
itertools
import
islice
def
batched
(
iterable
,
n
):
iterator
=
iter
(
iterable
)
while
batch
:=
list
(
islice
(
iterator
,
n
)):
yield
batch
If you are a happy user of Python 3.12+, you can use the
batched
function from the
itertools
package instead.
No matter what Python version you are using, you can use the
upsert
method to load the dataset,
batch by batch, into Qdrant:
batch_size
=
100
for
batch
in
batched
(
dataset
,
batch_size
):
ids
=
[
point
.
pop
(
"id"
)
for
point
in
batch
]
vectors
=
[
point
.
pop
(
"vector"
)
for
point
in
batch
]
client
.
upsert
(
collection_name
=
"arxiv-titles-instructorxl-embeddings"
,
points
=
models
.
Batch
(
ids
=
ids
,
vectors
=
vectors
,
payloads
=
batch
,
),
)
Your collection is ready to be used for search! Please
let us know using Discord
if you would like to see more datasets published on Hugging Face hub.
