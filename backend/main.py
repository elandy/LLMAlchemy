from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from agent import agent
from cache import get, put
from models import (
    AICombination,
    CombinationRecord,
    CombineRequest,
)

app = FastAPI()

frontend = Path("../frontend/dist")

app.mount(
    "/assets",
    StaticFiles(directory=frontend / "assets"),
    name="assets",
)


@app.get("/")
async def index():
    return FileResponse(frontend / "index.html")


@app.post("/api/combine")
async def combine(request: CombineRequest):
    cached = get(request.left, request.right)
    if cached: return cached
    prompt = f"""Combine: {request.left} + {request.right}"""
    print(prompt)
    result = await agent.run(prompt)
    record = CombinationRecord(
        left=request.left,
        right=request.right,
        result=result.output.result,
        explanation=result.output.explanation,
        color=result.output.color,
    )
    print(record.result)
    print(record.explanation)
    put(record)
    return record

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)