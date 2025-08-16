---
{
  "title": "Custom Embeddings",
  "source_url": "https://python.langchain.com/docs/how_to/custom_embeddings/",
  "fetched_at": "2025-08-15T13:49:48.428176+00:00"
}
---

# Custom Embeddings

LangChain is integrated with many
3rd party embedding models
. In this guide we'll show you how to create a custom Embedding class, in case a built-in one does not already exist. Embeddings are critical in natural language processing applications as they convert text into a numerical form that algorithms can understand, thereby enabling a wide range of applications such as similarity search, text classification, and clustering.
Implementing embeddings using the standard
Embeddings
interface will allow your embeddings to be utilized in existing
LangChain
abstractions (e.g., as the embeddings powering a
VectorStore
or cached using
CacheBackedEmbeddings
).
Interface
​
The current
Embeddings
abstraction in LangChain is designed to operate on text data. In this implementation, the inputs are either single strings or lists of strings, and the outputs are lists of numerical arrays (vectors), where each vector represents
an embedding of the input text into some n-dimensional space.
Your custom embedding must implement the following methods:
Method/Property
Description
Required/Optional
embed_documents(texts)
Generates embeddings for a list of strings.
Required
embed_query(text)
Generates an embedding for a single text query.
Required
aembed_documents(texts)
Asynchronously generates embeddings for a list of strings.
Optional
aembed_query(text)
Asynchronously generates an embedding for a single text query.
Optional
These methods ensure that your embedding model can be integrated seamlessly into the LangChain framework, providing both synchronous and asynchronous capabilities for scalability and performance optimization.
Embeddings
do not currently implement the
Runnable
interface and are also
not
instances of pydantic
BaseModel
.
Embedding queries vs documents
​
The
embed_query
and
embed_documents
methods are required. These methods both operate
on string inputs. The accessing of
Document.page_content
attributes is handled
by the vector store using the embedding model for legacy reasons.
embed_query
takes in a single string and returns a single embedding as a list of floats.
If your model has different modes for embedding queries vs the underlying documents, you can
implement this method to handle that.
embed_documents
takes in a list of strings and returns a list of embeddings as a list of lists of floats.
embed_documents
takes in a list of plain text, not a list of LangChain
Document
objects. The name of this method
may change in future versions of LangChain.
Implementation
​
As an example, we'll implement a simple embeddings model that returns a constant vector. This model is for illustrative purposes only.
from
typing
import
List
from
langchain_core
.
embeddings
import
Embeddings
class
ParrotLinkEmbeddings
(
Embeddings
)
:
"""ParrotLink embedding model integration.
# TODO: Populate with relevant params.
Key init args — completion params:
model: str
Name of ParrotLink model to use.
See full list of supported init args and their descriptions in the params section.
# TODO: Replace with relevant init params.
Instantiate:
.. code-block:: python
from langchain_parrot_link import ParrotLinkEmbeddings
embed = ParrotLinkEmbeddings(
model="...",
# api_key="...",
# other params...
)
Embed single text:
.. code-block:: python
input_text = "The meaning of life is 42"
embed.embed_query(input_text)
.. code-block:: python
# TODO: Example output.
# TODO: Delete if token-level streaming isn't supported.
Embed multiple text:
.. code-block:: python
input_texts = ["Document 1...", "Document 2..."]
embed.embed_documents(input_texts)
.. code-block:: python
# TODO: Example output.
# TODO: Delete if native async isn't supported.
Async:
.. code-block:: python
await embed.aembed_query(input_text)
# multiple:
# await embed.aembed_documents(input_texts)
.. code-block:: python
# TODO: Example output.
"""
def
__init__
(
self
,
model
:
str
)
:
self
.
model
=
model
def
embed_documents
(
self
,
texts
:
List
[
str
]
)
-
>
List
[
List
[
float
]
]
:
"""Embed search docs."""
return
[
[
0.5
,
0.6
,
0.7
]
for
_
in
texts
]
def
embed_query
(
self
,
text
:
str
)
-
>
List
[
float
]
:
"""Embed query text."""
return
self
.
embed_documents
(
[
text
]
)
[
0
]
Let's test it 🧪
​
embeddings
=
ParrotLinkEmbeddings
(
"test-model"
)
print
(
embeddings
.
embed_documents
(
[
"Hello"
,
"world"
]
)
)
print
(
embeddings
.
embed_query
(
"Hello"
)
)
[[0.5, 0.6, 0.7], [0.5, 0.6, 0.7]]
[0.5, 0.6, 0.7]
Contributing
​
We welcome contributions of Embedding models to the LangChain code base.
If you aim to contribute an embedding model for a new provider (e.g., with a new set of dependencies or SDK), we encourage you to publish your implementation in a separate
langchain-*
integration package. This will enable you to appropriately manage dependencies and version your package. Please refer to our
contributing guide
for a walkthrough of this process.
