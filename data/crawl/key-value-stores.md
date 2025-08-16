---
{
  "title": "Key-value stores",
  "source_url": "https://python.langchain.com/docs/concepts/key_value_stores/",
  "fetched_at": "2025-08-15T13:51:29.653531+00:00"
}
---

# Key-value stores

Overview
​
LangChain provides a key-value store interface for storing and retrieving data.
LangChain includes a
BaseStore
interface,
which allows for storage of arbitrary data. However, LangChain components that require KV-storage accept a
more specific
BaseStore[str, bytes]
instance that stores binary data (referred to as a
ByteStore
), and internally take care of
encoding and decoding data for their specific needs.
This means that as a user, you only need to think about one type of store rather than different ones for different types of data.
Usage
​
The key-value store interface in LangChain is used primarily for:
Caching
embeddings
via
CachedBackedEmbeddings
to avoid recomputing embeddings for repeated queries or when re-indexing content.
As a simple
Document
persistence layer in some retrievers.
Please see these how-to guides for more information:
Interface
​
All
BaseStores
support the following interface. Note that the interface allows for modifying
multiple
key-value pairs at once:
mget(key: Sequence[str]) -> List[Optional[bytes]]
: get the contents of multiple keys, returning
None
if the key does not exist
mset(key_value_pairs: Sequence[Tuple[str, bytes]]) -> None
: set the contents of multiple keys
mdelete(key: Sequence[str]) -> None
: delete multiple keys
yield_keys(prefix: Optional[str] = None) -> Iterator[str]
: yield all keys in the store, optionally filtering by a prefix
Integrations
​
Please reference the
stores integration page
for a list of available key-value store integrations.
