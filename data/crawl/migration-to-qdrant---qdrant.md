---
{
  "title": "Migration to Qdrant - Qdrant",
  "source_url": "https://qdrant.tech/documentation/database-tutorials/migration/",
  "fetched_at": "2025-08-15T13:53:34.179713+00:00"
}
---

# Migration to Qdrant - Qdrant

Migration
Migrating data between vector databases, especially across regions, platforms, or deployment types, can be a hassle. That’s where the
Qdrant Migration Tool
comes in. It supports a wide range of migration needs, including transferring data between Qdrant instances and migrating from other vector database providers to Qdrant.
You can run the migration tool on any machine where you have connectivity to both the source and the target Qdrant databases. Direct connectivity between both databases is not required. For optimal performance, you should run the tool on a machine with a fast network connection and minimum latency to both databases.
In this tutorial, we will learn how to use the migration tool and walk through a practical example of migrating from other vector databases to Qdrant.
Why use this instead of Qdrant’s Native Snapshotting?
Qdrant supports
snapshot-based backups
, low-level disk operations built for same cluster recovery or local backups. These snapshots:
Require snapshot consistency across nodes.
Can be hard to port across machines or cloud zones.
On the other hand, the Qdrant Migration Tool:
Streams data in live batches.
Can resume interrupted migrations.
Works even when data is being inserted.
Supports collection reconfiguration (e.g., change replication, and quantization)
Supports migrating from other vector DBs (Pinecone, Chroma, Weaviate, etc.)
You can run the tool via Docker.
Installation:
docker pull registry.cloud.qdrant.io/library/qdrant-migration
Here is an example of how to perform a Qdrant to Qdrant migration:
docker run --rm -it
\
-e
SOURCE_API_KEY
=
'your-source-key'
\
-e
TARGET_API_KEY
=
'your-target-key'
\
registry.cloud.qdrant.io/library/qdrant-migration qdrant
\
--source-url
'https://source-instance.cloud.qdrant.io'
\
--source-collection
'benchmark'
\
--target-url
'https://target-instance.cloud.qdrant.io'
\
--target-collection
'benchmark'
Example: Migrate from Pinecone to Qdrant
Let’s now walk through an example of migrating from Pinecone to Qdrant. Assuming your Pinecone index looks like this:
The information you need from Pinecone is:
Your Pinecone API key
The index name
The index host URL
With that information, you can migrate your vector database from Pinecone to Qdrant with the following command:
docker run --net
=
host --rm -it registry.cloud.qdrant.io/library/qdrant-migration pinecone
\
--pinecone.index-host
'https://sample-movies-efgjrye.svc.aped-4627-b74a.pinecone.io'
\
--pinecone.index-name
'sample-movies'
\
--pinecone.api-key
'pcsk_7Dh5MW_…'
\
--qdrant.url
'https://5f1a5c6c-7d47-45c3-8d47-d7389b1fad66.eu-west-1-0.aws.cloud.qdrant.io:6334'
\
--qdrant.api-key
'eyJhbGciOiJIUzI1NiIsInR5c…'
\
--qdrant.collection
'sample-movies'
\
--migration.batch-size
64
When the migration is complete, you will see the new collection on Qdrant with all the vectors.
Conclusion
The
Qdrant Migration Tool
makes data transfer across vector database instances effortless. Whether you’re moving between cloud regions, upgrading from self-hosted to Qdrant Cloud, or switching from other databases such as Pinecone, this tool saves you hours of manual effort.
Try it today
.
