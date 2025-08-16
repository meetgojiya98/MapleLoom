---
{
  "title": "Snapshots - Qdrant",
  "source_url": "https://qdrant.tech/documentation/concepts/snapshots/",
  "fetched_at": "2025-08-15T13:52:56.348668+00:00"
}
---

# Snapshots - Qdrant

Snapshots
Available as of v0.8.4
Snapshots are
tar
archive files that contain data and configuration of a specific collection on a specific node at a specific time. In a distributed setup, when you have multiple nodes in your cluster, you must create snapshots for each node separately when dealing with a single collection.
This feature can be used to archive data or easily replicate an existing deployment. For disaster recovery, Qdrant Cloud users may prefer to use
Backups
instead, which are physical disk-level copies of your data.
A collection level snapshot only contains data within that collection, including the collection configuration, all points and payloads. Collection aliases are not included and can be migrated or recovered
separately
.
For a step-by-step guide on how to use snapshots, see our
tutorial
.
Create snapshot
If you work with a distributed deployment, you have to create snapshots for each node separately. A single snapshot will contain only the data stored on the node on which the snapshot was created.
To create a new snapshot for an existing collection:
POST /collections/{collection_name}/snapshots
from
qdrant_client
import
QdrantClient
client
=
QdrantClient
(
url
=
"http://localhost:6333"
)
client
.
create_snapshot
(
collection_name
=
"
{collection_name}
"
)
import
{
QdrantClient
}
from
"@qdrant/js-client-rest"
;
const
client
=
new
QdrantClient
({
host
:
"localhost"
,
port
:
6333
});
client
.
createSnapshot
(
"{collection_name}"
);
use
qdrant_client
::
Qdrant
;
let
client
=
Qdrant
::
from_url
(
"http://localhost:6334"
).
build
()
?
;
client
.
create_snapshot
(
"{collection_name}"
).
await
?
;
import
io.qdrant.client.QdrantClient
;
import
io.qdrant.client.QdrantGrpcClient
;
QdrantClient
client
=
new
QdrantClient
(
QdrantGrpcClient
.
newBuilder
(
"localhost"
,
6334
,
false
).
build
());
client
.
createSnapshotAsync
(
"{collection_name}"
).
get
();
using
Qdrant.Client
;
var
client
=
new
QdrantClient
(
"localhost"
,
6334
);
await
client
.
CreateSnapshotAsync
(
"{collection_name}"
);
import
(
"context"
"github.com/qdrant/go-client/qdrant"
)
client
,
err
:=
qdrant
.
NewClient
(
&
qdrant
.
Config
{
Host
:
"localhost"
,
Port
:
6334
,
})
client
.
CreateSnapshot
(
context
.
Background
(),
"{collection_name}"
)
This is a synchronous operation for which a
tar
archive file will be generated into the
snapshot_path
.
Delete snapshot
Available as of v1.0.0
DELETE /collections/{collection_name}/snapshots/{snapshot_name}
from
qdrant_client
import
QdrantClient
client
=
QdrantClient
(
url
=
"http://localhost:6333"
)
client
.
delete_snapshot
(
collection_name
=
"
{collection_name}
"
,
snapshot_name
=
"
{snapshot_name}
"
)
import
{
QdrantClient
}
from
"@qdrant/js-client-rest"
;
const
client
=
new
QdrantClient
({
host
:
"localhost"
,
port
:
6333
});
client
.
deleteSnapshot
(
"{collection_name}"
,
"{snapshot_name}"
);
use
qdrant_client
::
qdrant
::
DeleteSnapshotRequestBuilder
;
use
qdrant_client
::
Qdrant
;
let
client
=
Qdrant
::
from_url
(
"http://localhost:6334"
).
build
()
?
;
client
.
delete_snapshot
(
DeleteSnapshotRequestBuilder
::
new
(
"{collection_name}"
,
"{snapshot_name}"
,
))
.
await
?
;
import
io.qdrant.client.QdrantClient
;
import
io.qdrant.client.QdrantGrpcClient
;
QdrantClient
client
=
new
QdrantClient
(
QdrantGrpcClient
.
newBuilder
(
"localhost"
,
6334
,
false
).
build
());
client
.
deleteSnapshotAsync
(
"{collection_name}"
,
"{snapshot_name}"
).
get
();
using
Qdrant.Client
;
var
client
=
new
QdrantClient
(
"localhost"
,
6334
);
await
client
.
DeleteSnapshotAsync
(
collectionName
:
"{collection_name}"
,
snapshotName
:
"{snapshot_name}"
);
import
(
"context"
"github.com/qdrant/go-client/qdrant"
)
client
,
err
:=
qdrant
.
NewClient
(
&
qdrant
.
Config
{
Host
:
"localhost"
,
Port
:
6334
,
})
client
.
DeleteSnapshot
(
context
.
Background
(),
"{collection_name}"
,
"{snapshot_name}"
)
List snapshot
List of snapshots for a collection:
GET /collections/{collection_name}/snapshots
from
qdrant_client
import
QdrantClient
client
=
QdrantClient
(
url
=
"http://localhost:6333"
)
client
.
list_snapshots
(
collection_name
=
"
{collection_name}
"
)
import
{
QdrantClient
}
from
"@qdrant/js-client-rest"
;
const
client
=
new
QdrantClient
({
host
:
"localhost"
,
port
:
6333
});
client
.
listSnapshots
(
"{collection_name}"
);
use
qdrant_client
::
Qdrant
;
let
client
=
Qdrant
::
from_url
(
"http://localhost:6334"
).
build
()
?
;
client
.
list_snapshots
(
"{collection_name}"
).
await
?
;
import
io.qdrant.client.QdrantClient
;
import
io.qdrant.client.QdrantGrpcClient
;
QdrantClient
client
=
new
QdrantClient
(
QdrantGrpcClient
.
newBuilder
(
"localhost"
,
6334
,
false
).
build
());
client
.
listSnapshotAsync
(
"{collection_name}"
).
get
();
using
Qdrant.Client
;
var
client
=
new
QdrantClient
(
"localhost"
,
6334
);
await
client
.
ListSnapshotsAsync
(
"{collection_name}"
);
import
(
"context"
"github.com/qdrant/go-client/qdrant"
)
client
,
err
:=
qdrant
.
NewClient
(
&
qdrant
.
Config
{
Host
:
"localhost"
,
Port
:
6334
,
})
client
.
ListSnapshots
(
context
.
Background
(),
"{collection_name}"
)
Retrieve snapshot
Only available through the REST API for the time being.
To download a specified snapshot from a collection as a file:
GET /collections/{collection_name}/snapshots/{snapshot_name}
curl
'http://{qdrant-url}:6333/collections/{collection_name}/snapshots/snapshot-2022-10-10.snapshot'
\
-H
'api-key: ********'
\
--output
'filename.snapshot'
Restore snapshot
Snapshots generated in one Qdrant cluster can only be restored to other Qdrant clusters that share the same minor version. For instance, a snapshot captured from a v1.4.1 cluster can only be restored to clusters running version v1.4.x, where x is equal to or greater than 1.
Snapshots can be restored in three possible ways:
Recovering from a URL or local file
(useful for restoring a snapshot file that is on a remote server or already stored on the node)
Recovering from an uploaded file
(useful for migrating data to a new cluster)
Recovering during start-up
(useful when running a self-hosted single-node Qdrant instance)
Regardless of the method used, Qdrant will extract the shard data from the snapshot and properly register shards in the cluster.
If there are other active replicas of the recovered shards in the cluster, Qdrant will replicate them to the newly recovered node by default to maintain data consistency.
Recover from a URL or local file
Available as of v0.11.3
This method of recovery requires the snapshot file to be downloadable from a URL or exist as a local file on the node (like if you
created the snapshot
on this node previously). If instead you need to upload a snapshot file, see the next section.
To recover from a URL or local file use the
snapshot recovery endpoint
. This endpoint accepts either a URL like
https://example.com
or a
file URI
like
file:///tmp/snapshot-2022-10-10.snapshot
. If the target collection does not exist, it will be created.
PUT /collections/{collection_name}/snapshots/recover
{
"location": "http://qdrant-node-1:6333/collections/{collection_name}/snapshots/snapshot-2022-10-10.snapshot"
}
from
qdrant_client
import
QdrantClient
client
=
QdrantClient
(
url
=
"http://qdrant-node-2:6333"
)
client
.
recover_snapshot
(
"
{collection_name}
"
,
"http://qdrant-node-1:6333/collections/collection_name/snapshots/snapshot-2022-10-10.snapshot"
,
)
import
{
QdrantClient
}
from
"@qdrant/js-client-rest"
;
const
client
=
new
QdrantClient
({
host
:
"localhost"
,
port
:
6333
});
client
.
recoverSnapshot
(
"{collection_name}"
,
{
location
:
"http://qdrant-node-1:6333/collections/{collection_name}/snapshots/snapshot-2022-10-10.snapshot"
,
});
When recovering from a URL, the URL must be reachable by the Qdrant node that you are restoring. In Qdrant Cloud, restoring via URL is not supported since all outbound traffic is blocked for security purposes. You may still restore via file URI or via an uploaded file.
Recover from an uploaded file
The snapshot file can also be uploaded as a file and restored using the
recover from uploaded snapshot
. This endpoint accepts the raw snapshot data in the request body. If the target collection does not exist, it will be created.
curl -X POST
'http://{qdrant-url}:6333/collections/{collection_name}/snapshots/upload?priority=snapshot'
\
-H
'api-key: ********'
\
-H
'Content-Type:multipart/form-data'
\
-F
'snapshot=@/path/to/snapshot-2022-10-10.snapshot'
This method is typically used to migrate data from one cluster to another, so we recommend setting the
priority
to “snapshot” for that use-case.
Recover during start-up
This method cannot be used in a multi-node deployment and cannot be used in Qdrant Cloud.
If you have a single-node deployment, you can recover any collection at start-up and it will be immediately available.
Restoring snapshots is done through the Qdrant CLI at start-up time via the
--snapshot
argument which accepts a list of pairs such as
<snapshot_file_path>:<target_collection_name>
For example:
./qdrant --snapshot /snapshots/test-collection-archive.snapshot:test-collection --snapshot /snapshots/test-collection-archive.snapshot:test-copy-collection
The target collection
must
be absent otherwise the program will exit with an error.
If you wish instead to overwrite an existing collection, use the
--force_snapshot
flag with caution.
Snapshot priority
When recovering a snapshot to a non-empty node, there may be conflicts between the snapshot data and the existing data. The “priority” setting controls how Qdrant handles these conflicts. The priority setting is important because different priorities can give very
different end results. The default priority may not be best for all situations.
The available snapshot recovery priorities are:
replica
:
(default)
prefer existing data over the snapshot.
snapshot
: prefer snapshot data over existing data.
no_sync
: restore snapshot without any additional synchronization.
To recover a new collection from a snapshot, you need to set
the priority to
snapshot
. With
snapshot
priority, all data from the snapshot
will be recovered onto the cluster. With
replica
priority
(default)
, you’d
end up with an empty collection because the collection on the cluster did not
contain any points and that source was preferred.
no_sync
is for specialized use cases and is not commonly used. It allows
managing shards and transferring shards between clusters manually without any
additional synchronization. Using it incorrectly will leave your cluster in a
broken state.
To recover from a URL, you specify an additional parameter in the request body:
PUT /collections/{collection_name}/snapshots/recover
{
"location": "http://qdrant-node-1:6333/collections/{collection_name}/snapshots/snapshot-2022-10-10.snapshot",
"priority": "snapshot"
}
curl -X POST
'http://qdrant-node-1:6333/collections/{collection_name}/snapshots/upload?priority=snapshot'
\
-H
'api-key: ********'
\
-H
'Content-Type:multipart/form-data'
\
-F
'snapshot=@/path/to/snapshot-2022-10-10.snapshot'
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
url
=
"http://qdrant-node-2:6333"
)
client
.
recover_snapshot
(
"
{collection_name}
"
,
"http://qdrant-node-1:6333/collections/
{collection_name}
/snapshots/snapshot-2022-10-10.snapshot"
,
priority
=
models
.
SnapshotPriority
.
SNAPSHOT
,
)
import
{
QdrantClient
}
from
"@qdrant/js-client-rest"
;
const
client
=
new
QdrantClient
({
host
:
"localhost"
,
port
:
6333
});
client
.
recoverSnapshot
(
"{collection_name}"
,
{
location
:
"http://qdrant-node-1:6333/collections/{collection_name}/snapshots/snapshot-2022-10-10.snapshot"
,
priority
:
"snapshot"
});
Snapshots for the whole storage
Available as of v0.8.5
Sometimes it might be handy to create snapshot not just for a single collection, but for the whole storage, including collection aliases.
Qdrant provides a dedicated API for that as well. It is similar to collection-level snapshots, but does not require
collection_name
.
Full storage snapshots are only suitable for single-node deployments.
Distributed
mode is not supported as it doesn't contain the necessary files for that.
Full storage snapshots can be created and downloaded from Qdrant Cloud, but you cannot restore a Qdrant Cloud cluster from a whole storage snapshot since that requires use of the Qdrant CLI. You can use
Backups
instead.
Create full storage snapshot
from
qdrant_client
import
QdrantClient
client
=
QdrantClient
(
url
=
"http://localhost:6333"
)
client
.
create_full_snapshot
()
import
{
QdrantClient
}
from
"@qdrant/js-client-rest"
;
const
client
=
new
QdrantClient
({
host
:
"localhost"
,
port
:
6333
});
client
.
createFullSnapshot
();
use
qdrant_client
::
Qdrant
;
let
client
=
Qdrant
::
from_url
(
"http://localhost:6334"
).
build
()
?
;
client
.
create_full_snapshot
().
await
?
;
import
io.qdrant.client.QdrantClient
;
import
io.qdrant.client.QdrantGrpcClient
;
QdrantClient
client
=
new
QdrantClient
(
QdrantGrpcClient
.
newBuilder
(
"localhost"
,
6334
,
false
).
build
());
client
.
createFullSnapshotAsync
().
get
();
using
Qdrant.Client
;
var
client
=
new
QdrantClient
(
"localhost"
,
6334
);
await
client
.
CreateFullSnapshotAsync
();
import
(
"context"
"github.com/qdrant/go-client/qdrant"
)
client
,
err
:=
qdrant
.
NewClient
(
&
qdrant
.
Config
{
Host
:
"localhost"
,
Port
:
6334
,
})
client
.
CreateFullSnapshot
(
context
.
Background
())
Delete full storage snapshot
Available as of v1.0.0
DELETE /snapshots/{snapshot_name}
from
qdrant_client
import
QdrantClient
client
=
QdrantClient
(
url
=
"http://localhost:6333"
)
client
.
delete_full_snapshot
(
snapshot_name
=
"
{snapshot_name}
"
)
import
{
QdrantClient
}
from
"@qdrant/js-client-rest"
;
const
client
=
new
QdrantClient
({
host
:
"localhost"
,
port
:
6333
});
client
.
deleteFullSnapshot
(
"{snapshot_name}"
);
use
qdrant_client
::
Qdrant
;
let
client
=
Qdrant
::
from_url
(
"http://localhost:6334"
).
build
()
?
;
client
.
delete_full_snapshot
(
"{snapshot_name}"
).
await
?
;
import
io.qdrant.client.QdrantClient
;
import
io.qdrant.client.QdrantGrpcClient
;
QdrantClient
client
=
new
QdrantClient
(
QdrantGrpcClient
.
newBuilder
(
"localhost"
,
6334
,
false
).
build
());
client
.
deleteFullSnapshotAsync
(
"{snapshot_name}"
).
get
();
using
Qdrant.Client
;
var
client
=
new
QdrantClient
(
"localhost"
,
6334
);
await
client
.
DeleteFullSnapshotAsync
(
"{snapshot_name}"
);
import
(
"context"
"github.com/qdrant/go-client/qdrant"
)
client
,
err
:=
qdrant
.
NewClient
(
&
qdrant
.
Config
{
Host
:
"localhost"
,
Port
:
6334
,
})
client
.
DeleteFullSnapshot
(
context
.
Background
(),
"{snapshot_name}"
)
List full storage snapshots
from
qdrant_client
import
QdrantClient
client
=
QdrantClient
(
"localhost"
,
port
=
6333
)
client
.
list_full_snapshots
()
import
{
QdrantClient
}
from
"@qdrant/js-client-rest"
;
const
client
=
new
QdrantClient
({
host
:
"localhost"
,
port
:
6333
});
client
.
listFullSnapshots
();
use
qdrant_client
::
Qdrant
;
let
client
=
Qdrant
::
from_url
(
"http://localhost:6334"
).
build
()
?
;
client
.
list_full_snapshots
().
await
?
;
import
io.qdrant.client.QdrantClient
;
import
io.qdrant.client.QdrantGrpcClient
;
QdrantClient
client
=
new
QdrantClient
(
QdrantGrpcClient
.
newBuilder
(
"localhost"
,
6334
,
false
).
build
());
client
.
listFullSnapshotAsync
().
get
();
using
Qdrant.Client
;
var
client
=
new
QdrantClient
(
"localhost"
,
6334
);
await
client
.
ListFullSnapshotsAsync
();
import
(
"context"
"github.com/qdrant/go-client/qdrant"
)
client
,
err
:=
qdrant
.
NewClient
(
&
qdrant
.
Config
{
Host
:
"localhost"
,
Port
:
6334
,
})
client
.
ListFullSnapshots
(
context
.
Background
())
Download full storage snapshot
Only available through the REST API for the time being.
GET /snapshots/{snapshot_name}
Restore full storage snapshot
Restoring snapshots can only be done through the Qdrant CLI at startup time.
For example:
./qdrant --storage-snapshot /snapshots/full-snapshot-2022-07-18-11-20-51.snapshot
Storage
Created, uploaded and recovered snapshots are stored as
.snapshot
files. By
default, they’re stored on the
local file system
. You may
also configure to use an
S3 storage
service for them.
Local file system
By default, snapshots are stored at
./snapshots
or at
/qdrant/snapshots
when
using our Docker image.
The target directory can be controlled through the
configuration
:
storage
:
# Specify where you want to store snapshots.
snapshots_path
:
./snapshots
Alternatively you may use the environment variable
QDRANT__STORAGE__SNAPSHOTS_PATH=./snapshots
.
Available as of v1.3.0
While a snapshot is being created, temporary files are placed in the configured
storage directory by default. In case of limited capacity or a slow
network attached disk, you can specify a separate location for temporary files:
storage
:
# Where to store temporary files
temp_path
:
/tmp
S3
Available as of v1.10.0
Rather than storing snapshots on the local file system, you may also configure
to store snapshots in an S3-compatible storage service. To enable this, you must
configure it in the
configuration
file.
For example, to configure for AWS S3:
storage
:
snapshots_config
:
# Use 's3' to store snapshots on S3
snapshots_storage
:
s3
s3_config
:
# Bucket name
bucket
:
your_bucket_here
# Bucket region (e.g. eu-central-1)
region
:
your_bucket_region_here
# Storage access key
# Can be specified either here or in the `QDRANT__STORAGE__SNAPSHOTS_CONFIG__S3_CONFIG__ACCESS_KEY` environment variable.
access_key
:
your_access_key_here
# Storage secret key
# Can be specified either here or in the `QDRANT__STORAGE__SNAPSHOTS_CONFIG__S3_CONFIG__SECRET_KEY` environment variable.
secret_key
:
your_secret_key_here
# S3-Compatible Storage URL
# Can be specified either here or in the `QDRANT__STORAGE__SNAPSHOTS_CONFIG__S3_CONFIG__ENDPOINT_URL` environment variable.
endpoint_url
:
your_url_here
Apart from Snapshots, Qdrant also provides the
Qdrant Migration Tool
that supports:
Migration between Qdrant Cloud instances.
Migrating vectors from other providers into Qdrant.
Migrating from Qdrant OSS to Qdrant Cloud.
Follow our
migration guide
to learn how to effectively use the Qdrant Migration tool.
