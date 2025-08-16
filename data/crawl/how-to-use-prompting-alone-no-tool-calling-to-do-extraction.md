---
{
  "title": "How to use prompting alone (no tool calling) to do extraction",
  "source_url": "https://python.langchain.com/docs/how_to/extraction_parse/",
  "fetched_at": "2025-08-15T13:50:11.464025+00:00"
}
---

# How to use prompting alone (no tool calling) to do extraction

System: Answer the user query. Wrap the output in `json` tags
The output should be formatted as a JSON instance that conforms to the JSON schema below.
As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}
the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.
Here is the output schema:
\`\`\`
{"$defs": {"Person": {"description": "Information about a person.", "properties": {"name": {"description": "The name of the person", "title": "Name", "type": "string"}, "height_in_meters": {"description": "The height of the person expressed in meters.", "title": "Height In Meters", "type": "number"}}, "required": ["name", "height_in_meters"], "title": "Person", "type": "object"}}, "description": "Identifying information about all people in a text.", "properties": {"people": {"items": {"$ref": "#/$defs/Person"}, "title": "People", "type": "array"}}, "required": ["people"]}
\`\`\`
Human: Anna is 23 years old and she is 6 feet tall
