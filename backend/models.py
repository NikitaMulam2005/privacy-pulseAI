from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class ScanRequest(BaseModel):
    url: str

class TrackerInfo(BaseModel):
    name: str
    category: Optional[str] = None
    blocked: bool = False

class ScanResult(BaseModel):
    url: str
    summary: str
    classification: str
    score: Optional[float] = None
    trackers: List[TrackerInfo] = Field(default_factory=list)
    cookies: List[str] = Field(default_factory=list)
    raw_policy_text: Optional[str] = None
    features: Dict[str, float] = Field(default_factory=dict)
