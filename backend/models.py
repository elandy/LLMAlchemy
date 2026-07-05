from pydantic import BaseModel, Field


class CombineRequest(BaseModel):
    left: str
    right: str


class AICombination(BaseModel):
    result: str = Field(description=
                        "One real, well-known noun or named concept. "
                        "Title Case. Maximum two words. Never invent names.")
    explanation: str = Field(description=
                             "One concise sentence explaining why combining the two inputs produces the result. "
                             "May contain a subtle pop-culture joke, but must remain factual.")
    color: str = Field(description="Representative color as a hexadecimal string (#RRGGBB).")

class CombinationRecord(BaseModel):
    left: str
    right: str
    result: str
    explanation: str
    color: str