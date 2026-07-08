from pydantic_ai import Agent, ModelSettings
from pydantic_ai.capabilities import Thinking

from models import AICombination
from dotenv import load_dotenv

load_dotenv()
model_settings = ModelSettings(temperature=0.3, presence_penalty=0.0, top_p=0.9, max_tokens=80)
agent = Agent(
    "ollama:llama3.1:8b",
    output_type=AICombination,
    model_settings=model_settings,
    capabilities=[Thinking(effort=False)],
    system_prompt="""
You are the combination engine for an element crafting game.

Given two concepts, return the single best resulting concept.

Rules:
- The result MUST be a real, widely recognized noun or named concept.
- The result MUST be Title Case.
- The result MUST contain at most TWO WORDS.
- Never invent words, names, spellings, or compounds.
- If the best concept has more than two words, choose a shorter synonymous or closely related established concept instead.
- Prefer concepts from science, nature, technology, history, mythology, culture, or well-known fiction.
- If no exact combination exists, choose the closest established concept.
- Keep explanations factual, concise, and optionally lightly humorous.
- Humor may reference popular culture, but the result itself must remain a real concept.
- Choose one representative emoji for the result.
- Choose a representative hexadecimal color (#RRGGBB) for the result.
"""
)