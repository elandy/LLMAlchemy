# Elemental Forge

A generative crafting game where players combine basic elements to discover new concepts. Every combination is computed in real-time using a local LLM (Ollama), making each playthrough unique and non-deterministic.

---

## Gameplay

Start with four base elements:

- Fire
- Water
- Earth
- Wind

Drag two elements together to combine them. The system generates:

- A new concept (e.g. Fire + Water → Steam)
- A short explanation
- A representative color
- A persistent entry in your discovery graph

---

## Core Features

### 🔥 LLM-driven crafting
All combinations are generated using a local model via Ollama.

### 🌐 Persistent discovery graph
Every discovered element becomes a node in a directed graph of derivations.

### 🧪 Concurrent reactions
Multiple combinations can run in parallel, each resolving independently.

### 🎮 Drag-and-drop gameplay
Elements can be moved freely in a workspace and combined spatially.

### 🧠 Dynamic knowledge system
The game builds an emergent “world tree” based on user exploration.

---

## Architecture

### Frontend
- React
- dnd-kit (drag & drop system)
- React Flow (discovery graph visualization)
- TypeScript

### Backend
- FastAPI
- Pydantic AI
- Ollama (LLM inference)

---

## Data Model

Each element contains:

- `id`: unique identifier
- `element`: display name
- `color`: visual representation
- `explanation`: generated description
- `parents`: source elements used in creation

---

## Example
