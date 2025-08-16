---
{
  "title": "Troubleshooting - Qdrant",
  "source_url": "https://qdrant.tech/documentation/guides/common-errors/",
  "fetched_at": "2025-08-15T13:53:09.117559+00:00"
}
---

# Troubleshooting - Qdrant

Solving common errors
Too many files open (OS error 24)
Each collection segment needs some files to be open. At some point you may encounter the following errors in your server log:
Error: Too many files open (OS error 24)
In such a case you may need to increase the limit of the open files. It might be done, for example, while you launch the Docker container:
docker run --ulimit
nofile
=
10000:10000 qdrant/qdrant:latest
The command above will set both soft and hard limits to
10000
.
If you are not using Docker, the following command will change the limit for the current user session:
Please note, the command should be executed before you run Qdrant server.
When starting a Qdrant instance as part of a distributed deployment, you may
come across an error message similar to this:
Can
'
t open Collections meta Wal: Os
{
code: 11, kind: WouldBlock, message:
"Resource temporarily unavailable"
}
It means that Qdrant cannot start because a collection cannot be loaded. Its
associated
WAL
files are currently
unavailable, likely because the same files are already being used by another
Qdrant instance.
Each node must have their own separate storage directory, volume or mount.
The formed cluster will take care of sharing all data with each node, putting it
all in the correct places for you. If using Kubernetes, each node must have
their own volume. If using Docker, each node must have their own storage mount
or volume. If using Qdrant directly, each node must have their own storage
directory.
Using python gRPC client with
multiprocessing
When using the Python gRPC client with
multiprocessing
, you may encounter an error like this:
<_InactiveRpcError of RPC that terminated with:
status = StatusCode.UNAVAILABLE
details = "sendmsg: Socket operation on non-socket (88)"
debug_error_string = "UNKNOWN:Error received from peer  {grpc_message:"sendmsg: Socket operation on non-socket (88)", grpc_status:14, created_time:"....."}"
This error happens, because
multiprocessing
creates copies of gRPC channels, which share the same socket. When the parent process closes the channel, it closes the socket, and the child processes try to use a closed socket.
To prevent this error, you can use the
forkserver
or
spawn
start methods for
multiprocessing
.
import
multiprocessing
multiprocessing
.
set_start_method
(
"forkserver"
)
# or "spawn"
Alternatively, you can switch to
REST
API, async client, or use built-in parallelization in the Python client - functions like
qdrant.upload_points(...)
