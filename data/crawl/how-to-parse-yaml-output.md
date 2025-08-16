---
{
  "title": "How to parse YAML output",
  "source_url": "https://python.langchain.com/docs/how_to/output_parser_yaml/",
  "fetched_at": "2025-08-15T13:50:36.493138+00:00"
}
---

# How to parse YAML output

'The output should be formatted as a YAML instance that conforms to the given JSON schema below.\n\n# Examples\n## Schema\n\`\`\`\n{"title": "Players", "description": "A list of players", "type": "array", "items": {"$ref": "#/definitions/Player"}, "definitions": {"Player": {"title": "Player", "type": "object", "properties": {"name": {"title": "Name", "description": "Player name", "type": "string"}, "avg": {"title": "Avg", "description": "Batting average", "type": "number"}}, "required": ["name", "avg"]}}}\n\`\`\`\n## Well formatted instance\n\`\`\`\n- name: John Doe\n  avg: 0.3\n- name: Jane Maxfield\n  avg: 1.4\n\`\`\`\n\n## Schema\n\`\`\`\n{"properties": {"habit": { "description": "A common daily habit", "type": "string" }, "sustainable_alternative": { "description": "An environmentally friendly alternative to the habit", "type": "string"}}, "required": ["habit", "sustainable_alternative"]}\n\`\`\`\n## Well formatted instance\n\`\`\`\nhabit: Using disposable water bottles for daily hydration.\nsustainable_alternative: Switch to a reusable water bottle to reduce plastic waste and decrease your environmental footprint.\n\`\`\` \n\nPlease follow the standard YAML formatting conventions with an indent of 2 spaces and make sure that the data types adhere strictly to the following JSON schema: \n\`\`\`\n{"properties": {"setup": {"title": "Setup", "description": "question to set up a joke", "type": "string"}, "punchline": {"title": "Punchline", "description": "answer to resolve the joke", "type": "string"}}, "required": ["setup", "punchline"]}\n\`\`\`\n\nMake sure to always enclose the YAML output in triple backticks (\`\`\`). Please do not add anything other than valid YAML output!'
