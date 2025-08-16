---
{
  "title": "Monitoring & Telemetry",
  "source_url": "https://qdrant.tech/documentation/guides/monitoring/",
  "fetched_at": "2025-08-15T13:53:05.047922+00:00"
}
---

# Monitoring & Telemetry

Monitoring & Telemetry
Qdrant exposes its metrics in
Prometheus
/
OpenMetrics
format, so you can integrate them easily
with the compatible tools and monitor Qdrant with your own monitoring system. You can
use the
/metrics
endpoint and configure it as a scrape target.
Metrics endpoint:
http://localhost:6333/metrics
The integration with Qdrant is easy to
configure
with Prometheus and Grafana.
Monitoring multi-node clusters
When scraping metrics from multi-node Qdrant clusters, it is important to scrape from
each node individually instead of using a load-balanced URL. Otherwise, your metrics will appear inconsistent after each scrape.
Monitoring in Qdrant Cloud
Qdrant Cloud offers additional metrics and telemetry that are not available in the open-source version. For more information, see
Qdrant Cloud Monitoring
.
Exposed metrics
There are two endpoints avaliable:
/metrics
is the direct endpoint of the underlying Qdrant database node.
/sys_metrics
is a Qdrant cloud-only endpoint that provides additional operational and infrastructure metrics about your cluster, like CPU, memory and disk utilisation, collection metrics and load balancer telemetry. For more information, see
Qdrant Cloud Monitoring
.
Node metrics
/metrics
Each Qdrant server will expose the following metrics.
Name
Type
Meaning
app_info
gauge
Information about Qdrant server
app_status_recovery_mode
gauge
If Qdrant is currently started in recovery mode
collections_total
gauge
Number of collections
collections_vector_total
gauge
Total number of vectors in all collections
collections_full_total
gauge
Number of full collections
collections_aggregated_total
gauge
Number of aggregated collections
rest_responses_total
counter
Total number of responses through REST API
rest_responses_fail_total
counter
Total number of failed responses through REST API
rest_responses_avg_duration_seconds
gauge
Average response duration in REST API
rest_responses_min_duration_seconds
gauge
Minimum response duration in REST API
rest_responses_max_duration_seconds
gauge
Maximum response duration in REST API
grpc_responses_total
counter
Total number of responses through gRPC API
grpc_responses_fail_total
counter
Total number of failed responses through REST API
grpc_responses_avg_duration_seconds
gauge
Average response duration in gRPC API
grpc_responses_min_duration_seconds
gauge
Minimum response duration in gRPC API
grpc_responses_max_duration_seconds
gauge
Maximum response duration in gRPC API
cluster_enabled
gauge
Whether the cluster support is enabled. 1 - YES
memory_active_bytes
gauge
Total number of bytes in active pages allocated by the application.
Reference
memory_allocated_bytes
gauge
Total number of bytes allocated by the application.
Reference
memory_metadata_bytes
gauge
Total number of bytes dedicated to allocator metadata.
Reference
memory_resident_bytes
gauge
Maximum number of bytes in physically resident data pages mapped.
Reference
memory_retained_bytes
gauge
Total number of bytes in virtual memory mappings.
Reference
collection_hardware_metric_cpu
gauge
CPU measurements of a collection (Experimental)
Cluster-related metrics
There are also some metrics which are exposed in distributed mode only.
Name
Type
Meaning
cluster_peers_total
gauge
Total number of cluster peers
cluster_term
counter
Current cluster term
cluster_commit
counter
Index of last committed (finalized) operation cluster peer is aware of
cluster_pending_operations_total
gauge
Total number of pending operations for cluster peer
cluster_voter
gauge
Whether the cluster peer is a voter or learner. 1 - VOTER
Telemetry endpoint
Qdrant also provides a
/telemetry
endpoint, which provides information about the current state of the database, including the number of vectors, shards, and other useful information. You can find a full documentation of this endpoint in the
API reference
.
Kubernetes health endpoints
Available as of v1.5.0
Qdrant exposes three endpoints, namely
/healthz
,
/livez
and
/readyz
, to indicate the current status of the
Qdrant server.
These currently provide the most basic status response, returning HTTP 200 if
Qdrant is started and ready to be used.
Regardless of whether an
API key
is configured,
the endpoints are always accessible.
You can read more about Kubernetes health endpoints
here
.
