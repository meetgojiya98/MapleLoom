---
{
  "title": "Installation - Qdrant",
  "source_url": "https://qdrant.tech/documentation/guides/installation/",
  "fetched_at": "2025-08-15T13:52:57.026756+00:00"
}
---

# Installation - Qdrant

Installation requirements
The following sections describe the requirements for deploying Qdrant.
CPU and memory
The preferred size of your CPU and RAM depends on:
Number of vectors
Vector dimensions
Payloads
and their indexes
Storage
Replication
How you configure quantization
Our
Cloud Pricing Calculator
can help you estimate required resources without payload or index data.
Supported CPU architectures:
64-bit system:
x86_64/amd64
AArch64/arm64
32-bit system:
Storage
For persistent storage, Qdrant requires block-level access to storage devices with a
POSIX-compatible file system
. Network systems such as
iSCSI
that provide block-level access are also acceptable.
Qdrant won’t work with
Network file systems
such as NFS, or
Object storage
systems such as S3.
If you offload vectors to a local disk, we recommend you use a solid-state (SSD or NVMe) drive.
Networking
Each Qdrant instance requires three open ports:
All Qdrant instances in a cluster must be able to:
Communicate with each other over these ports
Allow incoming connections to ports
6333
and
6334
from clients that use Qdrant.
Security
The default configuration of Qdrant might not be secure enough for every situation. Please see
our security documentation
for more information.
Installation options
Qdrant can be installed in different ways depending on your needs:
For production, you can use our Qdrant Cloud to run Qdrant either fully managed in our infrastructure or with Hybrid Cloud in yours.
If you want to run Qdrant in your own infrastructure, without any cloud connection, we recommend to install Qdrant in a Kubernetes cluster with our Qdrant Private Cloud Enterprise Operator.
For testing or development setups, you can run the Qdrant container or as a binary executable. We also provide a Helm chart for an easy installation in Kubernetes.
Production
Qdrant Cloud
You can set up production with the
Qdrant Cloud
, which provides fully managed Qdrant databases.
It provides horizontal and vertical scaling, one click installation and upgrades, monitoring, logging, as well as backup and disaster recovery. For more information, see the
Qdrant Cloud documentation
.
Qdrant Kubernetes Operator
We provide a Qdrant Enterprise Operator for Kubernetes installations as part of our
Qdrant Private Cloud
offering. For more information,
use this form
to contact us.
Kubernetes
You can use a ready-made
Helm Chart
to run Qdrant in your Kubernetes cluster. While it is possible to deploy Qdrant in a distributed setup with the Helm chart, it does not come with the same level of features for zero-downtime upgrades, up and down-scaling, monitoring, logging, and backup and disaster recovery as the Qdrant Cloud offering or the Qdrant Private Cloud Enterprise Operator. Instead you must manage and set this up
yourself
. Support for the Helm chart is limited to community support.
The following table gives you an overview about the feature differences between the Qdrant Cloud and the Helm chart:
Feature
Qdrant Helm Chart
Qdrant Cloud
Open-source
✅
Community support only
✅
Quick to get started
✅
✅
Vertical and horizontal scaling
✅
✅
API keys with granular access control
✅
✅
Qdrant version upgrades
✅
✅
Support for transit and storage encryption
✅
✅
Zero-downtime upgrades with optimized restart strategy
✅
Production ready out-of the box
✅
Dataloss prevention on downscaling
✅
Full cluster backup and disaster recovery
✅
Automatic shard rebalancing
✅
Re-sharding support
✅
Automatic persistent volume scaling
✅
Advanced telemetry
✅
One-click API key revoking
✅
Recreating nodes with new volumes in existing cluster
✅
Enterprise support
✅
To install the helm chart:
helm repo add qdrant https://qdrant.to/helm
helm install qdrant qdrant/qdrant
For more information, see the
qdrant-helm
README.
Docker and Docker Compose
Usually, we recommend to run Qdrant in Kubernetes, or use the Qdrant Cloud for production setups. This makes setting up highly available and scalable Qdrant clusters with backups and disaster recovery a lot easier.
However, you can also use Docker and Docker Compose to run Qdrant in production, by following the setup instructions in the
Docker
and
Docker Compose
Development sections.
In addition, you have to make sure:
Development
For development and testing, we recommend that you set up Qdrant in Docker. We also have different client libraries.
Docker
The easiest way to start using Qdrant for testing or development is to run the Qdrant container image.
The latest versions are always available on
DockerHub
.
Make sure that
Docker
,
Podman
or the container runtime of your choice is installed and running. The following instructions use Docker.
Pull the image:
docker pull qdrant/qdrant
In the following command, revise
$(pwd)/path/to/data
for your Docker configuration. Then use the updated command to run the container:
docker run -p 6333:6333
\
-v
$(
pwd
)
/path/to/data:/qdrant/storage
\
qdrant/qdrant
With this command, you start a Qdrant instance with the default configuration.
It stores all data in the
./path/to/data
directory.
By default, Qdrant uses port 6333, so at
localhost:6333
you should see the welcome message.
To change the Qdrant configuration, you can overwrite the production configuration:
docker run -p 6333:6333
\
-v
$(
pwd
)
/path/to/data:/qdrant/storage
\
-v
$(
pwd
)
/path/to/custom_config.yaml:/qdrant/config/production.yaml
\
qdrant/qdrant
Alternatively, you can use your own
custom_config.yaml
configuration file:
docker run -p 6333:6333
\
-v
$(
pwd
)
/path/to/data:/qdrant/storage
\
-v
$(
pwd
)
/path/to/custom_config.yaml:/qdrant/config/custom_config.yaml
\
qdrant/qdrant
\
./qdrant --config-path config/custom_config.yaml
For more information, see the
Configuration
documentation.
Docker Compose
You can also use
Docker Compose
to run Qdrant.
Here is an example customized compose file for a single node Qdrant cluster:
services
:
qdrant
:
image
:
qdrant/qdrant:latest
restart
:
always
container_name
:
qdrant
ports
:
-
6333
:
6333
-
6334
:
6334
expose
:
-
6333
-
6334
-
6335
configs
:
-
source
:
qdrant_config
target
:
/qdrant/config/production.yaml
volumes
:
-
./qdrant_data:/qdrant/storage
configs
:
qdrant_config
:
content
:
|
log_level: INFO
From source
Qdrant is written in Rust and can be compiled into a binary executable.
This installation method can be helpful if you want to compile Qdrant for a specific processor architecture or if you do not want to use Docker.
Before compiling, make sure that the necessary libraries and the
rust toolchain
are installed.
The current list of required libraries can be found in the
Dockerfile
.
Build Qdrant with Cargo:
cargo build --release --bin qdrant
After a successful build, you can find the binary in the following subdirectory
./target/release/qdrant
.
Client libraries
In addition to the service, Qdrant provides a variety of client libraries for different programming languages. For a full list, see our
Client libraries
documentation.
