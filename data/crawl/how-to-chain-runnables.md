---
{
  "title": "How to chain runnables",
  "source_url": "https://python.langchain.com/docs/how_to/sequence/",
  "fetched_at": "2025-08-15T13:50:50.532492+00:00"
}
---

# How to chain runnables

This guide assumes familiarity with the following concepts:
One point about
LangChain Expression Language
is that any two runnables can be "chained" together into sequences. The output of the previous runnable's
.invoke()
call is passed as input to the next runnable. This can be done using the pipe operator (
|
), or the more explicit
.pipe()
method, which does the same thing.
The resulting
RunnableSequence
is itself a runnable, which means it can be invoked, streamed, or further chained just like any other runnable. Advantages of chaining runnables in this way are efficient streaming (the sequence will stream output as soon as it is available), and debugging and tracing with tools like
LangSmith
.
The pipe operator:
|
​
To show off how this works, let's go through an example. We'll walk through a common pattern in LangChain: using a
prompt template
to format input into a
chat model
, and finally converting the chat message output into a string with an
output parser
.
pip install -qU "langchain[google-genai]"
import
getpass
import
os
if
not
os
.
environ
.
get
(
"GOOGLE_API_KEY"
)
:
os
.
environ
[
"GOOGLE_API_KEY"
]
=
getpass
.
getpass
(
"Enter API key for Google Gemini: "
)
from
langchain
.
chat_models
import
init_chat_model
model
=
init_chat_model
(
"gemini-2.5-flash"
,
model_provider
=
"google_genai"
)
from
langchain_core
.
output_parsers
import
StrOutputParser
from
langchain_core
.
prompts
import
ChatPromptTemplate
prompt
=
ChatPromptTemplate
.
from_template
(
"tell me a joke about {topic}"
)
chain
=
prompt
|
model
|
StrOutputParser
(
)
Prompts and models are both runnable, and the output type from the prompt call is the same as the input type of the chat model, so we can chain them together. We can then invoke the resulting sequence like any other runnable:
chain
.
invoke
(
{
"topic"
:
"bears"
}
)
"Why don't bears wear shoes?\n\nBecause they prefer to go bear-foot!"
Coercion
​
We can even combine this chain with more runnables to create another chain. This may involve some input/output formatting using other types of runnables, depending on the required inputs and outputs of the chain components.
For example, let's say we wanted to compose the joke generating chain with another chain that evaluates whether or not the generated joke was funny.
We would need to be careful with how we format the input into the next chain. In the below example, the dict in the chain is automatically parsed and converted into a
RunnableParallel
, which runs all of its values in parallel and returns a dict with the results.
This happens to be the same format the next prompt template expects. Here it is in action:
from
langchain_core
.
output_parsers
import
StrOutputParser
analysis_prompt
=
ChatPromptTemplate
.
from_template
(
"is this a funny joke? {joke}"
)
composed_chain
=
{
"joke"
:
chain
}
|
analysis_prompt
|
model
|
StrOutputParser
(
)
composed_chain
.
invoke
(
{
"topic"
:
"bears"
}
)
'Yes, that\'s a funny joke! It\'s a classic pun that plays on the homophone pair "bare-foot" and "bear-foot." The humor comes from:\n\n1. The wordplay between "barefoot" (not wearing shoes) and "bear-foot" (the foot of a bear)\n2. The logical connection to the setup (bears don\'t wear shoes)\n3. It\'s family-friendly and accessible\n4. It\'s a simple, clean pun that creates an unexpected but satisfying punchline\n\nIt\'s the kind of joke that might make you groan and smile at the same time - what people often call a "dad joke."'
Functions will also be coerced into runnables, so you can add custom logic to your chains too. The below chain results in the same logical flow as before:
composed_chain_with_lambda
=
(
chain
|
(
lambda
input
:
{
"joke"
:
input
}
)
|
analysis_prompt
|
model
|
StrOutputParser
(
)
)
composed_chain_with_lambda
.
invoke
(
{
"topic"
:
"beets"
}
)
'Yes, that\'s a cute and funny joke! It works well because:\n\n1. It plays on the double meaning of "roots" - both the literal roots of the beet plant and the metaphorical sense of knowing one\'s origins or foundation\n2. It\'s a simple, clean pun that doesn\'t rely on offensive content\n3. It has a satisfying logical connection (beets are root vegetables)\n\nIt\'s the kind of wholesome food pun that might make people groan a little but also smile. Perfect for sharing in casual conversation or with kids!'
However, keep in mind that using functions like this may interfere with operations like streaming. See
this section
for more information.
The
.pipe()
method
​
We could also compose the same sequence using the
.pipe()
method. Here's what that looks like:
from
langchain_core
.
runnables
import
RunnableParallel
composed_chain_with_pipe
=
(
RunnableParallel
(
{
"joke"
:
chain
}
)
.
pipe
(
analysis_prompt
)
.
pipe
(
model
)
.
pipe
(
StrOutputParser
(
)
)
)
composed_chain_with_pipe
.
invoke
(
{
"topic"
:
"battlestar galactica"
}
)
"This joke is moderately funny! It plays on Battlestar Galactica lore where Cylons are robots with 12 different models trying to infiltrate human society. The humor comes from the idea of a Cylon accidentally revealing their non-human nature through a pickup line that references their artificial origins. It's a decent nerd-culture joke that would land well with fans of the show, though someone unfamiliar with Battlestar Galactica might not get the reference. The punchline effectively highlights the contradiction in a Cylon trying to blend in while simultaneously revealing their true identity."
Or the abbreviated:
composed_chain_with_pipe
=
RunnableParallel
(
{
"joke"
:
chain
}
)
.
pipe
(
analysis_prompt
,
model
,
StrOutputParser
(
)
)
Streaming
: Check out the streaming guide to understand the streaming behavior of a chain
