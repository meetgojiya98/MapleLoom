from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class Source(BaseModel):
    id: str
    uri: Optional[str] = None
    title: Optional[str] = None
    chunk: Optional[str] = None
    score: Optional[float] = None
    metadata: Dict[str, Any] = {}

class QueryRequest(BaseModel):
    query: str = Field(..., description="User's natural language query")
    top_k: int = 5
    use_reranker: bool = True
    with_trace: bool = False

class Message(BaseModel):
    role: str
    content: str

class Answer(BaseModel):
    answer: str
    sources: List[Source] = []
    trace: Optional[Dict[str, Any]] = None

class Feedback(BaseModel):
    query: str
    answer: str
    rating: int = Field(..., description="1=bad, 5=great")
    comment: Optional[str] = None
