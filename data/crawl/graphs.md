---
{
  "title": "Graphs",
  "source_url": "https://langchain-ai.github.io/langgraph/reference/graphs/",
  "fetched_at": "2025-08-15T13:52:34.027293+00:00"
}
---

# Graphs

Bases:
Generic
[
StateT
,
ContextT
,
InputT
,
OutputT
]
A graph whose nodes communicate by reading and writing to a shared state.
The signature of each node is State -> Partial
.
Each state key can optionally be annotated with a reducer function that
will be used to aggregate the values of that key received from multiple nodes.
The signature of a reducer function is (Value, Value) -> Value.
Parameters:
Name
Type
Description
Default
state_schema
type
[
StateT
]
The schema class that defines the state.
required
context_schema
type
[
ContextT
] | None
The schema class that defines the runtime context.
Use this to expose immutable context data to your nodes, like user_id, db_conn, etc.
None
input_schema
type
[
InputT
] | None
The schema class that defines the input to the graph.
None
output_schema
type
[
OutputT
] | None
The schema class that defines the output from the graph.
None
config_schema
Deprecated
The
config_schema
parameter is deprecated in v0.6.0 and support will be removed in v2.0.0.
Please use
context_schema
instead to specify the schema for run-scoped context.
Example
from
langchain_core.runnables
import
RunnableConfig
from
typing_extensions
import
Annotated
,
TypedDict
from
langgraph.checkpoint.memory
import
InMemorySaver
from
langgraph.graph
import
StateGraph
from
langgraph.runtime
import
Runtime
def
reducer
(
a
:
list
,
b
:
int
|
None
)
->
list
:
if
b
is
not
None
:
return
a
+
[
b
]
return
a
class
State
(
TypedDict
):
x
:
Annotated
[
list
,
reducer
]
class
Context
(
TypedDict
):
r
:
float
graph
=
StateGraph
(
state_schema
=
State
,
context_schema
=
Context
)
def
node
(
state
:
State
,
runtime
:
Runtime
[
Context
])
->
dict
:
r
=
runtie
.
context
.
get
(
"r"
,
1.0
)
x
=
state
[
"x"
][
-
1
]
next_value
=
x
*
r
*
(
1
-
x
)
return
{
"x"
:
next_value
}
graph
.
add_node
(
"A"
,
node
)
graph
.
set_entry_point
(
"A"
)
graph
.
set_finish_point
(
"A"
)
compiled
=
graph
.
compile
()
step1
=
compiled
.
invoke
({
"x"
:
0.5
},
context
=
{
"r"
:
3.0
})
# {'x': [0.5, 0.75]}
Methods:
Name
Description
add_node
Add a new node to the state graph.
add_edge
Add a directed edge from the start node (or list of start nodes) to the end node.
add_conditional_edges
Add a conditional edge from the starting node to any number of destination nodes.
add_sequence
Add a sequence of nodes that will be executed in the provided order.
compile
Compiles the state graph into a
CompiledStateGraph
object.
add_node
add_node
(
node
:
str
|
StateNode
[
NodeInputT
,
ContextT
],
action
:
StateNode
[
NodeInputT
,
ContextT
]
|
None
=
None
,
*
,
defer
:
bool
=
False
,
metadata
:
dict
[
str
,
Any
]
|
None
=
None
,
input_schema
:
type
[
NodeInputT
]
|
None
=
None
,
retry_policy
:
(
RetryPolicy
|
Sequence
[
RetryPolicy
]
|
None
)
=
None
,
cache_policy
:
CachePolicy
|
None
=
None
,
destinations
:
(
dict
[
str
,
str
]
|
tuple
[
str
,
...
]
|
None
)
=
None
,
**
kwargs
:
Unpack
[
DeprecatedKwargs
]
)
->
Self
Add a new node to the state graph.
Parameters:
Name
Type
Description
Default
node
str
|
StateNode
[
NodeInputT
,
ContextT
]
The function or runnable this node will run.
If a string is provided, it will be used as the node name, and action will be used as the function or runnable.
required
action
StateNode
[
NodeInputT
,
ContextT
] | None
The action associated with the node. (default: None)
Will be used as the node function or runnable if
node
is a string (node name).
None
defer
bool
Whether to defer the execution of the node until the run is about to end.
False
metadata
dict
[
str
,
Any
] | None
The metadata associated with the node. (default: None)
None
input_schema
type
[
NodeInputT
] | None
The input schema for the node. (default: the graph's state schema)
None
retry_policy
RetryPolicy
|
Sequence
[
RetryPolicy
] | None
The retry policy for the node. (default: None)
If a sequence is provided, the first matching policy will be applied.
None
cache_policy
CachePolicy
| None
The cache policy for the node. (default: None)
None
destinations
dict
[
str
,
str
] |
tuple
[
str
, ...] | None
Destinations that indicate where a node can route to.
This is useful for edgeless graphs with nodes that return
Command
objects.
If a dict is provided, the keys will be used as the target node names and the values will be used as the labels for the edges.
If a tuple is provided, the values will be used as the target node names.
NOTE: this is only used for graph rendering and doesn't have any effect on the graph execution.
None
Example
from
typing_extensions
import
TypedDict
from
langchain_core.runnables
import
RunnableConfig
from
langgraph.graph
import
START
,
StateGraph
class
State
(
TypedDict
):
x
:
int
def
my_node
(
state
:
State
,
config
:
RunnableConfig
)
->
State
:
return
{
"x"
:
state
[
"x"
]
+
1
}
builder
=
StateGraph
(
State
)
builder
.
add_node
(
my_node
)
# node name will be 'my_node'
builder
.
add_edge
(
START
,
"my_node"
)
graph
=
builder
.
compile
()
graph
.
invoke
({
"x"
:
1
})
# {'x': 2}
Customize the name:
builder
=
StateGraph
(
State
)
builder
.
add_node
(
"my_fair_node"
,
my_node
)
builder
.
add_edge
(
START
,
"my_fair_node"
)
graph
=
builder
.
compile
()
graph
.
invoke
({
"x"
:
1
})
# {'x': 2}
Returns:
Name
Type
Description
Self
Self
The instance of the state graph, allowing for method chaining.
add_edge
Add a directed edge from the start node (or list of start nodes) to the end node.
When a single start node is provided, the graph will wait for that node to complete
before executing the end node. When multiple start nodes are provided,
the graph will wait for ALL of the start nodes to complete before executing the end node.
Parameters:
Name
Type
Description
Default
start_key
str
|
list
[
str
]
The key(s) of the start node(s) of the edge.
required
end_key
str
The key of the end node of the edge.
required
Raises:
Type
Description
ValueError
If the start key is 'END' or if the start key or end key is not present in the graph.
Returns:
Name
Type
Description
Self
Self
The instance of the state graph, allowing for method chaining.
add_conditional_edges
Add a conditional edge from the starting node to any number of destination nodes.
Parameters:
Returns:
Name
Type
Description
Self
Self
The instance of the graph, allowing for method chaining.
Without typehints on the
path
function's return value (e.g.,
-> Literal["foo", "__end__"]:
)
or a path_map, the graph visualization assumes the edge could transition to any node in the graph.
add_sequence
add_sequence
(
nodes
:
Sequence
[
StateNode
[
NodeInputT
,
ContextT
]
|
tuple
[
str
,
StateNode
[
NodeInputT
,
ContextT
]]
],
)
->
Self
Add a sequence of nodes that will be executed in the provided order.
Parameters:
Name
Type
Description
Default
nodes
Sequence
[
StateNode
[
NodeInputT
,
ContextT
] |
tuple
[
str
,
StateNode
[
NodeInputT
,
ContextT
]]]
A sequence of StateNodes (callables that accept a state arg) or (name, StateNode) tuples.
If no names are provided, the name will be inferred from the node object (e.g. a runnable or a callable name).
Each node will be executed in the order provided.
required
Raises:
Type
Description
ValueError
if the sequence is empty.
ValueError
if the sequence contains duplicate node names.
Returns:
Name
Type
Description
Self
Self
The instance of the state graph, allowing for method chaining.
compile
compile
(
checkpointer
:
Checkpointer
=
None
,
*
,
cache
:
BaseCache
|
None
=
None
,
store
:
BaseStore
|
None
=
None
,
interrupt_before
:
All
|
list
[
str
]
|
None
=
None
,
interrupt_after
:
All
|
list
[
str
]
|
None
=
None
,
debug
:
bool
=
False
,
name
:
str
|
None
=
None
)
->
CompiledStateGraph
[
StateT
,
ContextT
,
InputT
,
OutputT
]
Compiles the state graph into a
CompiledStateGraph
object.
The compiled graph implements the
Runnable
interface and can be invoked,
streamed, batched, and run asynchronously.
Parameters:
Name
Type
Description
Default
checkpointer
Checkpointer
A checkpoint saver object or flag.
If provided, this Checkpointer serves as a fully versioned "short-term memory" for the graph,
allowing it to be paused, resumed, and replayed from any point.
If None, it may inherit the parent graph's checkpointer when used as a subgraph.
If False, it will not use or inherit any checkpointer.
None
interrupt_before
All
|
list
[
str
] | None
An optional list of node names to interrupt before.
None
interrupt_after
All
|
list
[
str
] | None
An optional list of node names to interrupt after.
None
debug
bool
A flag indicating whether to enable debug mode.
False
name
str
| None
The name to use for the compiled graph.
None
Returns:
Name
Type
Description
CompiledStateGraph
CompiledStateGraph
[
StateT
,
ContextT
,
InputT
,
OutputT
]
The compiled state graph.
