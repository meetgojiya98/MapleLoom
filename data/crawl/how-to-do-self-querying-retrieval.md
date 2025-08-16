---
{
  "title": "How to do \"self-querying\" retrieval",
  "source_url": "https://python.langchain.com/docs/how_to/self_query/",
  "fetched_at": "2025-08-15T13:50:48.589173+00:00"
}
---

# How to do "self-querying" retrieval

Your goal is to structure the user's query to match the request schema provided below.
<< Structured Request Schema >>
When responding use a markdown code snippet with a JSON object formatted in the following schema:
\`\`\`json
{
"query": string \ text string to compare to document contents
"filter": string \ logical condition statement for filtering documents
}
\`\`\`
The query string should contain only text that is expected to match the contents of documents. Any conditions in the filter should not be mentioned in the query as well.
A logical condition statement is composed of one or more comparison and logical operation statements.
A comparison statement takes the form: `comp(attr, val)`:
- `comp` (eq | ne | gt | gte | lt | lte | contain | like | in | nin): comparator
- `attr` (string):  name of attribute to apply the comparison to
- `val` (string): is the comparison value
A logical operation statement takes the form `op(statement1, statement2, ...)`:
- `op` (and | or | not): logical operator
- `statement1`, `statement2`, ... (comparison statements or logical operation statements): one or more statements to apply the operation to
Make sure that you only use the comparators and logical operators listed above and no others.
Make sure that filters only refer to attributes that exist in the data source.
Make sure that filters only use the attributed names with its function names if there are functions applied on them.
Make sure that filters only use format `YYYY-MM-DD` when handling date data typed values.
Make sure that filters take into account the descriptions of attributes and only make comparisons that are feasible given the type of data being stored.
Make sure that filters are only used as needed. If there are no filters that should be applied return "NO_FILTER" for the filter value.
<< Example 1. >>
Data Source:
\`\`\`json
{
"content": "Lyrics of a song",
"attributes": {
"artist": {
"type": "string",
"description": "Name of the song artist"
},
"length": {
"type": "integer",
"description": "Length of the song in seconds"
},
"genre": {
"type": "string",
"description": "The song genre, one of "pop", "rock" or "rap""
}
}
}
\`\`\`
User Query:
What are songs by Taylor Swift or Katy Perry about teenage romance under 3 minutes long in the dance pop genre
Structured Request:
\`\`\`json
{
"query": "teenager love",
"filter": "and(or(eq(\"artist\", \"Taylor Swift\"), eq(\"artist\", \"Katy Perry\")), lt(\"length\", 180), eq(\"genre\", \"pop\"))"
}
\`\`\`
<< Example 2. >>
Data Source:
\`\`\`json
{
"content": "Lyrics of a song",
"attributes": {
"artist": {
"type": "string",
"description": "Name of the song artist"
},
"length": {
"type": "integer",
"description": "Length of the song in seconds"
},
"genre": {
"type": "string",
"description": "The song genre, one of "pop", "rock" or "rap""
}
}
}
\`\`\`
User Query:
What are songs that were not published on Spotify
Structured Request:
\`\`\`json
{
"query": "",
"filter": "NO_FILTER"
}
\`\`\`
<< Example 3. >>
Data Source:
\`\`\`json
{
"content": "Brief summary of a movie",
"attributes": {
"genre": {
"description": "The genre of the movie. One of ['science fiction', 'comedy', 'drama', 'thriller', 'romance', 'action', 'animated']",
"type": "string"
},
"year": {
"description": "The year the movie was released",
"type": "integer"
},
"director": {
"description": "The name of the movie director",
"type": "string"
},
"rating": {
"description": "A 1-10 rating for the movie",
"type": "float"
}
}
}
\`\`\`
User Query:
dummy question
Structured Request:
