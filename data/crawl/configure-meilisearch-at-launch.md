---
{
  "title": "Configure Meilisearch at launch",
  "source_url": "https://www.meilisearch.com/docs/learn/self_hosted/configure_meilisearch_at_launch",
  "fetched_at": "2025-08-15T13:54:05.350554+00:00"
}
---

# Configure Meilisearch at launch

When self-hosting Meilisearch, you can configure your instance at launch with
command-line options
,
environment variables
, or a
configuration file
.
These startup options affect your entire Meilisearch instance, not just a single index. For settings that affect search within a single index, see
index settings
.
Command-line options and flags
Pass
command-line options
and their respective values when launching a Meilisearch instance.
./meilisearch
--db-path
./meilifiles
--http-addr
'localhost:7700'
In the previous example,
./meilisearch
is the command that launches a Meilisearch instance, while
--db-path
and
--http-addr
are options that modify this instance’s behavior.
Meilisearch also has a number of
command-line flags.
Unlike command-line options,
flags don’t take values
. If a flag is given, it is activated and changes Meilisearch’s default behavior.
./meilisearch
--no-analytics
The above flag disables analytics for the Meilisearch instance and does not accept a value.
Both command-line options and command-line flags take precedence over environment variables.
All command-line options and flags are prepended with
--
.
Environment variables
To configure a Meilisearch instance using environment variables, set the environment variable prior to launching the instance. If you are unsure how to do this, read more about
setting and listing environment variables
, or
use a command-line option
instead.
export
MEILI_DB_PATH
=
./
meilifiles
export
MEILI_HTTP_ADDR
=
localhost
:
7700
./meilisearch
In the previous example,
./meilisearch
is the command that launches a Meilisearch instance, while
MEILI_DB_PATH
and
MEILI_HTTP_ADDR
are environment variables that modify this instance’s behavior.
Environment variables for command-line flags accept
n
,
no
,
f
,
false
,
off
, and
0
as
false
. An absent environment variable will also be considered as
false
. Any other value is considered
true
.
Environment variables are always identical to the corresponding command-line option, but prepended with
MEILI_
and written in all uppercase.
Configuration file
Meilisearch accepts a configuration file in the
.toml
format as an alternative to command-line options and environment variables. Configuration files can be easily shared and versioned, and allow you to define multiple options.
When used simultaneously, environment variables override the configuration file, and command-line options override environment variables.
You can download a default configuration file using the following command:
curl
https://raw.githubusercontent.com/meilisearch/meilisearch/latest/config.toml
>
config.toml
By default, Meilisearch will look for a
config.toml
file in the working directory. If it is present, it will be used as the configuration file. You can verify this when you launch Meilisearch:
888b     d888          d8b 888 d8b                                            888
8888b   d8888          Y8P 888 Y8P                                            888
88888b.d88888              888                                                888
888Y88888P888  .d88b.  888 888 888 .d8888b   .d88b.   8888b.  888d888 .d8888b 88888b.
888 Y888P 888 d8P  Y8b 888 888 888 88K      d8P  Y8b     "88b 888P"  d88P"    888 "88b
888  Y8P  888 88888888 888 888 888 "Y8888b. 88888888 .d888888 888    888      888  888
888   "   888 Y8b.     888 888 888      X88 Y8b.     888  888 888    Y88b.    888  888
888       888  "Y8888  888 888 888  88888P'  "Y8888  "Y888888 888     "Y8888P 888  888
Config file path:       "./config.toml"
If the
Config file path
is anything other than
"none"
, it means that a configuration file was successfully located and used to start Meilisearch.
You can override the default location of the configuration file using the
MEILI_CONFIG_FILE_PATH
environment variable or the
--config-file-path
CLI option:
./meilisearch
--config-file-path=
"./config.toml"
Configuration file formatting
You can configure any environment variable or CLI option using a configuration file. In configuration files, options must be written in
snake case
. For example,
--import-dump
would be written as
import_dump
.
import_dump
=
"./example.dump"
Specifying the
config_file_path
option within the configuration file will throw an error. This is the only configuration option that cannot be set within a configuration file.
Configuring cloud-hosted instances
To configure Meilisearch with command-line options in a cloud-hosted instance, edit its
service file
. The default location of the service file is
/etc/systemd/system/meilisearch.service
.
To configure Meilisearch with environment variables in a cloud-hosted instance, modify Meilisearch’s
env
file. Its default location is
/var/opt/meilisearch/env
.
After editing your configuration options, relaunch the Meilisearch service:
systemctl
restart
meilisearch
Meilisearch Cloud
offers an optimal pre-configured environment. You do not need to use any of the configuration options listed in this page when hosting your project on Meilisearch Cloud.
All instance options
Configuration file path
Environment variable
:
MEILI_CONFIG_FILE_PATH
CLI option
:
--config-file-path
Default
:
./config.toml
Expected value
: a filepath
Designates the location of the configuration file to load at launch.
Specifying this option in the configuration file itself will throw an error (assuming Meilisearch is able to find your configuration file).
Database path
Environment variable
:
MEILI_DB_PATH
CLI option
:
--db-path
Default value
:
"data.ms/"
Expected value
: a filepath
Designates the location where database files will be created and retrieved.
Environment
Environment variable
:
MEILI_ENV
CLI option
:
--env
Default value
:
development
Expected value
:
production
or
development
Configures the instance’s environment. Value must be either
production
or
development
.
production
:
Setting a
master key
of at least 16 bytes is
mandatory
. If no master key is provided or if it is under 16 bytes, Meilisearch will suggest a secure autogenerated master key
The
search preview interface
is disabled
development
:
Setting a
master key
is
optional
. If no master key is provided or if it is under 16 bytes, Meilisearch will suggest a secure autogenerated master key
Search preview is enabled
When the server environment is set to
development
, providing a master key is not mandatory. This is useful when debugging and prototyping, but dangerous otherwise since API routes are unprotected.
HTTP address & port binding
Environment variable
:
MEILI_HTTP_ADDR
CLI option
:
--http-addr
Default value
:
"localhost:7700"
Expected value
: an HTTP address and port
Sets the HTTP address and port Meilisearch will use.
Master key
Environment variable
:
MEILI_MASTER_KEY
CLI option
:
--master-key
Default value
:
None
Expected value
: a UTF-8 string of at least 16 bytes
Sets the instance’s master key, automatically protecting all routes except
GET /health
. This means you will need a valid API key to access all other endpoints.
When
--env
is set to
production
, providing a master key is mandatory. If none is given, or it is under 16 bytes, Meilisearch will throw an error and refuse to launch.
When
--env
is set to
development
, providing a master key is optional. If none is given, all routes will be unprotected and publicly accessible.
If you do not supply a master key in
production
or
development
environments or it is under 16 bytes, Meilisearch will suggest a secure autogenerated master key you can use when restarting your instance.
Learn more about Meilisearch’s use of security keys.
Disable analytics
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_NO_ANALYTICS
CLI option
:
--no-analytics
Deactivates Meilisearch’s built-in telemetry when provided.
Meilisearch automatically collects data from all instances that do not opt out using this flag. All gathered data is used solely for the purpose of improving Meilisearch, and can be
deleted at any time
.
Read more about our policy on data collection
, or take a look at
the comprehensive list of all data points we collect
.
Dumpless upgrade
experimental
Environment variable
:
MEILI_EXPERIMENTAL_DUMPLESS_UPGRADE
CLI option
:
--experimental-dumpless-upgrade
Default value
: None
Expected value
: None
Migrates the database to a new Meilisearch version after you have manually updated the binary.
Learn more about updating Meilisearch to a new release
.
Create a snapshot before a dumpless upgrade
Take a snapshot of your instance before performing a dumpless upgrade.
Dumpless upgrade are not currently atomic. It is possible some processes fail and Meilisearch still finalizes the upgrade. This may result in a corrupted database and data loss.
Dump directory
Environment variable
:
MEILI_DUMP_DIR
CLI option
:
--dump-dir
Default value
:
dumps/
Expected value
: a filepath pointing to a valid directory
Sets the directory where Meilisearch will create dump files.
Learn more about creating dumps
.
Import dump
Environment variable
:
MEILI_IMPORT_DUMP
CLI option
:
--import-dump
Default value
: none
Expected value
: a filepath pointing to a
.dump
file
Imports the dump file located at the specified path. Path must point to a
.dump
file. If a database already exists, Meilisearch will throw an error and abort launch.
Meilisearch will only launch once the dump data has been fully indexed. The time this takes depends on the size of the dump file.
Ignore missing dump
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_IGNORE_MISSING_DUMP
CLI option
:
--ignore-missing-dump
Prevents Meilisearch from throwing an error when
--import-dump
does not point to a valid dump file. Instead, Meilisearch will start normally without importing any dump.
This option will trigger an error if
--import-dump
is not defined.
Ignore dump if DB exists
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_IGNORE_DUMP_IF_DB_EXISTS
CLI option
:
--ignore-dump-if-db-exists
Prevents a Meilisearch instance with an existing database from throwing an error when using
--import-dump
. Instead, the dump will be ignored and Meilisearch will launch using the existing database.
This option will trigger an error if
--import-dump
is not defined.
Log level
Environment variable
:
MEILI_LOG_LEVEL
CLI option
:
--log-level
Default value
:
'INFO'
Expected value
: one of
ERROR
,
WARN
,
INFO
,
DEBUG
,
TRACE
, OR
OFF
Defines how much detail should be present in Meilisearch’s logs.
Meilisearch currently supports five log levels, listed in order of increasing verbosity:
'ERROR'
: only log unexpected events indicating Meilisearch is not functioning as expected
'WARN'
: log all unexpected events, regardless of their severity
'INFO'
: log all events. This is the default value of
--log-level
'DEBUG'
: log all events and include detailed information on Meilisearch’s internal processes. Useful when diagnosing issues and debugging
'TRACE'
: log all events and include even more detailed information on Meilisearch’s internal processes. We do not advise using this level as it is extremely verbose. Use
'DEBUG'
before considering
'TRACE'
.
'OFF'
: disable logging
Customize log output
experimental
Environment variable
:
MEILI_EXPERIMENTAL_LOGS_MODE
CLI option
:
--experimental-logs-mode
Default value
:
'human'
Expected value
: one of
human
or
json
Defines whether logs should output a human-readable text or JSON data.
Max indexing memory
Environment variable
:
MEILI_MAX_INDEXING_MEMORY
CLI option
:
--max-indexing-memory
Default value
: 2/3 of the available RAM
Expected value
: an integer (
104857600
) or a human readable size (
'100Mb'
)
Sets the maximum amount of RAM Meilisearch can use when indexing. By default, Meilisearch uses no more than two thirds of available memory.
The value must either be given in bytes or explicitly state a base unit:
107374182400
,
'107.7Gb'
, or
'107374 Mb'
.
It is possible that Meilisearch goes over the exact RAM limit during indexing. In most contexts and machines, this should be a negligible amount with little to no impact on stability and performance.
Setting
--max-indexing-memory
to a value bigger than or equal to your machine’s total memory is likely to cause your instance to crash.
Reduce indexing memory usage
experimental
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_EXPERIMENTAL_REDUCE_INDEXING_MEMORY_USAGE
CLI option
:
--experimental-reduce-indexing-memory-usage
Default value
:
None
Enables
MDB_WRITEMAP
, an LMDB option. Activating this option may reduce RAM usage in some UNIX and UNIX-like setups. However, it may also negatively impact write speeds and overall performance.
Max indexing threads
Environment variable
:
MEILI_MAX_INDEXING_THREADS
CLI option
:
--max-indexing-threads
Default value
: half of the available threads
Expected value
: an integer
Sets the maximum number of threads Meilisearch can use during indexing. By default, the indexer avoids using more than half of a machine’s total processing units. This ensures Meilisearch is always ready to perform searches, even while you are updating an index.
If
--max-indexing-threads
is higher than the real number of cores available in the machine, Meilisearch uses the maximum number of available cores.
In single-core machines, Meilisearch has no choice but to use the only core available for indexing. This may lead to a degraded search experience during indexing.
Avoid setting
--max-indexing-threads
to the total of your machine’s processor cores. Though doing so might speed up indexing, it is likely to severely impact search experience.
Payload limit size
Environment variable
:
MEILI_HTTP_PAYLOAD_SIZE_LIMIT
CLI option
:
--http-payload-size-limit
Default value
:
104857600
(~100MB)
Expected value
: an integer
Sets the maximum size of
accepted payloads
. Value must be given in bytes or explicitly stating a base unit. For example, the default value can be written as
107374182400
,
'107.7Gb'
, or
'107374 Mb'
.
Search queue size
experimental
Environment variable
:
MEILI_EXPERIMENTAL_SEARCH_QUEUE_SIZE
CLI option
:
--experimental-search-queue-size
Default value
:
1000
Expected value
: an integer
Configure the maximum amount of simultaneous search requests. By default, Meilisearch queues up to 1000 search requests at any given moment. This limit exists to prevent Meilisearch from consuming an unbounded amount of RAM.
Search query embedding cache
experimental
Environment variable
:
MEILI_EXPERIMENTAL_EMBEDDING_CACHE_ENTRIES
CLI option
:
--experimental-embedding-cache-entries
Default value
:
0
Expected value
: an integer
Sets the size of the search query embedding cache. By default, Meilisearch generates an embedding for every new search query. When this option is set to an integer bigger than 0, Meilisearch returns a previously generated embedding if it recently performed the same query.
The least recently used entries are evicted first. Embedders with the same configuration share the same cache, even if they were declared in distinct indexes.
Schedule snapshot creation
Environment variable
:
MEILI_SCHEDULE_SNAPSHOT
CLI option
:
--schedule-snapshot
Default value
: disabled if not present,
86400
if present without a value
Expected value
:
None
or an integer
Activates scheduled snapshots. Snapshots are disabled by default.
It is possible to use
--schedule-snapshot
without a value. If
--schedule-snapshot
is present when launching an instance but has not been assigned a value, Meilisearch takes a new snapshot every 24 hours.
For more control over snapshot scheduling, pass an integer representing the interval in seconds between each snapshot. When
--schedule-snapshot=3600
, Meilisearch takes a new snapshot every hour.
When using the configuration file, it is also possible to explicitly pass a boolean value to
schedule_snapshot
. Meilisearch takes a new snapshot every 24 hours when
schedule_snapshot=true
, and takes no snapshots when
schedule_snapshot=false
.
Learn more about snapshots
.
Snapshot destination
Environment variable
:
MEILI_SNAPSHOT_DIR
CLI option
:
--snapshot-dir
Default value
:
snapshots/
Expected value
: a filepath pointing to a valid directory
Sets the directory where Meilisearch will store snapshots.
Uncompressed snapshots
experimental
Environment variable
:
MEILI_EXPERIMENTAL_NO_SNAPSHOT_COMPACTION
CLI option
:
--experimental-no-snapshot-compaction
Disables snapshot compression. This may significantly speed up snapshot creation at the cost of bigger snapshot files.
Import snapshot
Environment variable
:
MEILI_IMPORT_SNAPSHOT
CLI option
:
--import-snapshot
Default value
:
None
Expected value
: a filepath pointing to a snapshot file
Launches Meilisearch after importing a previously-generated snapshot at the given filepath.
This command will throw an error if:
A database already exists
No valid snapshot can be found in the specified path
This behavior can be modified with the
--ignore-snapshot-if-db-exists
and
--ignore-missing-snapshot
options, respectively.
Ignore missing snapshot
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_IGNORE_MISSING_SNAPSHOT
CLI option
:
--ignore-missing-snapshot
Prevents a Meilisearch instance from throwing an error when
--import-snapshot
does not point to a valid snapshot file.
This command will throw an error if
--import-snapshot
is not defined.
Ignore snapshot if DB exists
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_IGNORE_SNAPSHOT_IF_DB_EXISTS
CLI option
:
--ignore-snapshot-if-db-exists
Prevents a Meilisearch instance with an existing database from throwing an error when using
--import-snapshot
. Instead, the snapshot will be ignored and Meilisearch will launch using the existing database.
This command will throw an error if
--import-snapshot
is not defined.
Task webhook URL
Environment variable
:
MEILI_TASK_WEBHOOK_URL
CLI option
:
--task-webhook-url
Default value
:
None
Expected value
: a URL string
Notifies the configured URL whenever Meilisearch
finishes processing a task
or batch of tasks. Meilisearch uses the URL as given, retaining any specified query parameters.
The webhook payload contains the list of finished tasks in
ndjson
. For more information,
consult the dedicated task webhook guide
.
The task webhook option requires having access to a command-line interface. If you are using Meilisearch Cloud, use the
/webhooks
API route
instead.
Environment variable
:
MEILI_TASK_WEBHOOK_AUTHORIZATION_HEADER
CLI option
:
--task-webhook-authorization-header
Default value
:
None
Expected value
: an authentication token string
Includes an authentication token in the authorization header when notifying the
webhook URL
.
Maximum number of batched tasks
experimental
Environment variable
:
MEILI_EXPERIMENTAL_MAX_NUMBER_OF_BATCHED_TASKS
CLI option
:
--experimental-max-number-of-batched-tasks
Default value
:
None
Expected value
: an integer
Limit the number of tasks Meilisearch performs in a single batch. May improve stability in systems handling a large queue of resource-intensive tasks.
Maximum batch payload size
experimental
Environment variable
:
MEILI_EXPERIMENTAL_LIMIT_BATCHED_TASKS_TOTAL_SIZE
CLI option
:
--experimental-limit-batched-tasks-total-size
Default value
:
None
Expected value
: an integer
Sets a maximum payload size for batches in bytes. Smaller batches are less efficient, but consume less RAM and reduce immediate latency.
Replication parameters
experimental
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_EXPERIMENTAL_REPLICATION_PARAMETERS
CLI option
:
--experimental-replication-parameters
Default value
:
None
Helps running Meilisearch in cluster environments. It does this by modifying task handling in three ways:
Task auto-deletion is disabled
Allows you to manually set task uids by adding a custom
TaskId
header to your API requests
Allows you to dry register tasks by specifying a
DryRun: true
header in your request
Disable new indexer
experimental
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_EXPERIMENTAL_NO_EDITION_2024_FOR_SETTINGS
CLI option
:
--experimental-no-edition-2024-for-settings
Default value
:
None
Falls back to previous settings indexer.
SSL options
SSL authentication path
Environment variable
:
MEILI_SSL_AUTH_PATH
CLI option
:
--ssl-auth-path
Default value
:
None
Expected value
: a filepath
Enables client authentication in the specified path.
SSL certificates path
Environment variable
:
MEILI_SSL_CERT_PATH
CLI option
:
--ssl-cert-path
Default value
:
None
Expected value
: a filepath pointing to a valid SSL certificate
Sets the server’s SSL certificates.
Value must be a path to PEM-formatted certificates. The first certificate should certify the KEYFILE supplied by
--ssl-key-path
. The last certificate should be a root CA.
SSL key path
Environment variable
:
MEILI_SSL_KEY_PATH
CLI option
:
--ssl-key-path
Default value
:
None
Expected value
: a filepath pointing to a valid SSL key file
Sets the server’s SSL key files.
Value must be a path to an RSA private key or PKCS8-encoded private key, both in PEM format.
SSL OCSP path
Environment variable
:
MEILI_SSL_OCSP_PATH
CLI option
:
--ssl-ocsp-path
Default value
:
None
Expected value
: a filepath pointing to a valid OCSP certificate
Sets the server’s OCSP file.
Optional
Reads DER-encoded OCSP response from OCSPFILE and staple to certificate.
SSL require auth
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_SSL_REQUIRE_AUTH
CLI option
:
--ssl-require-auth
Default value
:
None
Makes SSL authentication mandatory.
Sends a fatal alert if the client does not complete client authentication.
SSL resumption
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_SSL_RESUMPTION
CLI option
:
--ssl-resumption
Default value
:
None
Activates SSL session resumption.
SSL tickets
🚩 This option does not take any values. Assigning a value will throw an error. 🚩
Environment variable
:
MEILI_SSL_TICKETS
CLI option
:
--ssl-tickets
Default value
:
None
Activates SSL tickets.
