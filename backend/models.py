from pydantic import BaseModel, Field


class CombineRequest(BaseModel):
    left: str
    right: str


class AICombination(BaseModel):
    result: str = Field(description=
                        "One real, well-known noun or named concept. "
                        "Title Case. Maximum two words. Never invent names.")
    explanation: str = Field(
        description=(
            "One concise, factual sentence explaining why combining the two inputs "
            "produces the result while teaching the player something interesting about it. "
            "Include one memorable fact, property, use, origin, or historical detail whenever possible. "
            "May contain a subtle pop-culture joke, but the explanation must remain accurate and educational."
        )
    )
    color: str = Field(description="Representative color as a hexadecimal string (#RRGGBB).")
    emoji: str = Field(
        description=(
            "Exactly one Unicode emoji representing the RESULT, not the inputs. "
            "Prefer an emoji depicting the object or concept itself. "
            "Use symbolic emojis only if no object emoji exists. "
            "Do not output text or multiple emojis."
        ),
        examples=["🔥", "🌊", "🪨", "🚀", "🧪", "🍞"],
    )

class CombinationRecord(BaseModel):
    left: str
    right: str
    result: str
    explanation: str
    color: str
    emoji: str