---
{
  "title": "Run models locally",
  "source_url": "https://python.langchain.com/docs/how_to/local_llms/",
  "fetched_at": "2025-08-15T13:50:20.476043+00:00"
}
---

# Run models locally

Use case
​
The popularity of projects like
llama.cpp
,
Ollama
,
GPT4All
,
llamafile
, and others underscore the demand to run LLMs locally (on your own device).
This has at least two important benefits:
Privacy
: Your data is not sent to a third party, and it is not subject to the terms of service of a commercial service
Cost
: There is no inference fee, which is important for token-intensive applications (e.g.,
long-running simulations
, summarization)
Overview
​
Running an LLM locally requires a few things:
Open-source LLM
: An open-source LLM that can be freely modified and shared
Inference
: Ability to run this LLM on your device w/ acceptable latency
Open-source LLMs
​
Users can now gain access to a rapidly growing set of
open-source LLMs
.
These LLMs can be assessed across at least two dimensions (see figure):
Base model
: What is the base-model and how was it trained?
Fine-tuning approach
: Was the base-model fine-tuned and, if so, what
set of instructions
was used?
The relative performance of these models can be assessed using several leaderboards, including:
LmSys
GPT4All
HuggingFace
Inference
​
A few frameworks for this have emerged to support inference of open-source LLMs on various devices:
llama.cpp
: C++ implementation of llama inference code with
weight optimization / quantization
gpt4all
: Optimized C backend for inference
ollama
: Bundles model weights and environment into an app that runs on device and serves the LLM
llamafile
: Bundles model weights and everything needed to run the model in a single file, allowing you to run the LLM locally from this file without any additional installation steps
In general, these frameworks will do a few things:
Quantization
: Reduce the memory footprint of the raw model weights
Efficient implementation for inference
: Support inference on consumer hardware (e.g., CPU or laptop GPU)
In particular, see
this excellent post
on the importance of quantization.
With less precision, we radically decrease the memory needed to store the LLM in memory.
In addition, we can see the importance of GPU memory bandwidth
sheet
!
A Mac M2 Max is 5-6x faster than a M1 for inference due to the larger GPU memory bandwidth.
Formatting prompts
​
Some providers have
chat model
wrappers that takes care of formatting your input prompt for the specific local model you're using. However, if you are prompting local models with a
text-in/text-out LLM
wrapper, you may need to use a prompt tailored for your specific model.
This can
require the inclusion of special tokens
.
Here's an example for LLaMA 2
.
Quickstart
​
Ollama
is one way to easily run inference on macOS.
The instructions
here
provide details, which we summarize:
Download and run
the app
From command line, fetch a model from this
list of options
: e.g.,
ollama pull gpt-oss:20b
When the app is running, all models are automatically served on
localhost:11434
%
pip install
-
qU langchain_ollama
from
langchain_ollama
import
ChatOllama
llm
=
ChatOllama
(
model
=
"gpt-oss:20b"
,
validate_model_on_init
=
True
)
llm
.
invoke
(
"The first man on the moon was ..."
)
.
content
'...Neil Armstrong!\n\nOn July 20, 1969, Neil Armstrong became the first person to set foot on the lunar surface, famously declaring "That\'s one small step for man, one giant leap for mankind" as he stepped off the lunar module Eagle onto the Moon\'s surface.\n\nWould you like to know more about the Apollo 11 mission or Neil Armstrong\'s achievements?'
Stream tokens as they are being generated:
for
chunk
in
llm
.
stream
(
"The first man on the moon was ..."
)
:
print
(
chunk
,
end
=
"|"
,
flush
=
True
)
...|
``````output
Neil| Armstrong|,| an| American| astronaut|.| He| stepped| out| of| the| lunar| module| Eagle| and| onto| the| surface| of| the| Moon| on| July| |20|,| |196|9|,| famously| declaring|:| "|That|'s| one| small| step| for| man|,| one| giant| leap| for| mankind|."||
Ollama also includes a chat model wrapper that handles formatting conversation turns:
from
langchain_ollama
import
ChatOllama
chat_model
=
ChatOllama
(
model
=
"llama3.1:8b"
)
chat_model
.
invoke
(
"Who was the first man on the moon?"
)
AIMessage(content='The answer is a historic one!\n\nThe first man to walk on the Moon was Neil Armstrong, an American astronaut and commander of the Apollo 11 mission. On July 20, 1969, Armstrong stepped out of the lunar module Eagle onto the surface of the Moon, famously declaring:\n\n"That\'s one small step for man, one giant leap for mankind."\n\nArmstrong was followed by fellow astronaut Edwin "Buzz" Aldrin, who also walked on the Moon during the mission. Michael Collins remained in orbit around the Moon in the command module Columbia.\n\nNeil Armstrong passed away on August 25, 2012, but his legacy as a pioneering astronaut and engineer continues to inspire people around the world!', response_metadata={'model': 'llama3.1:8b', 'created_at': '2024-08-01T00:38:29.176717Z', 'message': {'role': 'assistant', 'content': ''}, 'done_reason': 'stop', 'done': True, 'total_duration': 10681861417, 'load_duration': 34270292, 'prompt_eval_count': 19, 'prompt_eval_duration': 6209448000, 'eval_count': 141, 'eval_duration': 4432022000}, id='run-7bed57c5-7f54-4092-912c-ae49073dcd48-0', usage_metadata={'input_tokens': 19, 'output_tokens': 141, 'total_tokens': 160})
Environment
​
Inference speed is a challenge when running models locally (see above).
To minimize latency, it is desirable to run models locally on GPU, which ships with many consumer laptops
e.g., Apple devices
.
And even with GPU, the available GPU memory bandwidth (as noted above) is important.
Running Apple silicon GPU
​
ollama
and
llamafile
will automatically utilize the GPU on Apple devices.
Other frameworks require the user to set up the environment to utilize the Apple GPU.
For example,
llama.cpp
python bindings can be configured to use the GPU via
Metal
.
Metal is a graphics and compute API created by Apple providing near-direct access to the GPU.
See the
llama.cpp
setup
here
to enable this.
In particular, ensure that conda is using the correct virtual environment that you created (
miniforge3
).
e.g., for me:
conda activate /Users/rlm/miniforge3/envs/llama
With the above confirmed, then:
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
LLMs
​
There are various ways to gain access to quantized model weights.
HuggingFace
- Many quantized model are available for download and can be run with framework such as
llama.cpp
. You can also download models in
llamafile
format
from HuggingFace.
gpt4all
- The model explorer offers a leaderboard of metrics and associated quantized models available for download
ollama
- Several models can be accessed directly via
pull
Ollama
