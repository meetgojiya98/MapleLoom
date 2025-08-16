---
{
  "title": "How to handle tool errors",
  "source_url": "https://python.langchain.com/docs/how_to/tools_error/",
  "fetched_at": "2025-08-15T13:51:11.578977+00:00"
}
---

# How to handle tool errors

---------------------------------------------------------------------------
``````output
ValidationError                           Traceback (most recent call last)
``````output
Cell In[5], line 1
----> 1 chain.invoke(
2     "use complex tool. the args are 5, 2.1, empty dictionary. don't forget dict_arg"
3 )
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/runnables/base.py:2998, in RunnableSequence.invoke(self, input, config, **kwargs)
2996             input = context.run(step.invoke, input, config, **kwargs)
2997         else:
-> 2998             input = context.run(step.invoke, input, config)
2999 # finish the root run
3000 except BaseException as e:
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:456, in BaseTool.invoke(self, input, config, **kwargs)
449 def invoke(
450     self,
451     input: Union[str, Dict, ToolCall],
452     config: Optional[RunnableConfig] = None,
453     **kwargs: Any,
454 ) -> Any:
455     tool_input, kwargs = _prep_run_args(input, config, **kwargs)
--> 456     return self.run(tool_input, **kwargs)
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:659, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, run_id, config, tool_call_id, **kwargs)
657 if error_to_raise:
658     run_manager.on_tool_error(error_to_raise)
--> 659     raise error_to_raise
660 output = _format_output(content, artifact, tool_call_id, self.name, status)
661 run_manager.on_tool_end(output, color=color, name=self.name, **kwargs)
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:622, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, run_id, config, tool_call_id, **kwargs)
620 context = copy_context()
621 context.run(_set_config_context, child_config)
--> 622 tool_args, tool_kwargs = self._to_args_and_kwargs(tool_input)
623 if signature(self._run).parameters.get("run_manager"):
624     tool_kwargs["run_manager"] = run_manager
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:545, in BaseTool._to_args_and_kwargs(self, tool_input)
544 def _to_args_and_kwargs(self, tool_input: Union[str, Dict]) -> Tuple[Tuple, Dict]:
--> 545     tool_input = self._parse_input(tool_input)
546     # For backwards compatibility, if run_input is a string,
547     # pass as a positional argument.
548     if isinstance(tool_input, str):
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/langchain_core/tools/base.py:487, in BaseTool._parse_input(self, tool_input)
485 if input_args is not None:
486     if issubclass(input_args, BaseModel):
--> 487         result = input_args.model_validate(tool_input)
488         result_dict = result.model_dump()
489     elif issubclass(input_args, BaseModelV1):
``````output
File ~/langchain/.venv/lib/python3.11/site-packages/pydantic/main.py:568, in BaseModel.model_validate(cls, obj, strict, from_attributes, context)
566 # `__tracebackhide__` tells pytest and some other tools to omit this function from tracebacks
567 __tracebackhide__ = True
--> 568 return cls.__pydantic_validator__.validate_python(
569     obj, strict=strict, from_attributes=from_attributes, context=context
570 )
``````output
ValidationError: 1 validation error for complex_toolSchema
dict_arg
Field required [type=missing, input_value={'int_arg': 5, 'float_arg': 2.1}, input_type=dict]
For further information visit https://errors.pydantic.dev/2.8/v/missing
