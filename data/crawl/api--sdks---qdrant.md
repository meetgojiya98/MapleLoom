---
{
  "title": "API & SDKs - Qdrant",
  "source_url": "https://qdrant.tech/documentation/interfaces/",
  "fetched_at": "2025-08-15T13:52:42.003617+00:00"
}
---

# API & SDKs - Qdrant

Interfaces
Qdrant supports these “official” clients.
Note:
If you are using a language that is not listed here, you can use the REST API directly or generate a client for your language
using
OpenAPI
or
protobuf
definitions.
Client Libraries
API Reference
All interaction with Qdrant takes place via the REST API. We recommend using REST API if you are using Qdrant for the first time or if you are working on a prototype.
gRPC Interface
The gRPC methods follow the same principles as REST. For each REST endpoint, there is a corresponding gRPC method.
As per the
configuration file
, the gRPC interface is available on the specified port.
If you decide to use gRPC, you must expose the port when starting Qdrant.
Running the service inside of Docker will look like this:
docker run -p 6333:6333 -p 6334:6334
\
-v
$(
pwd
)
/qdrant_storage:/qdrant/storage:z
\
qdrant/qdrant
When to use gRPC:
The choice between gRPC and the REST API is a trade-off between convenience and speed. gRPC is a binary protocol and can be more challenging to debug. We recommend using gRPC if you are already familiar with Qdrant and are trying to optimize the performance of your application.
