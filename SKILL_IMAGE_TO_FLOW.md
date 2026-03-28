# Skill: Image → Flow Diagram

Convert any hand-drawn sketch, whiteboard photo, or architecture diagram image into a fully connected, human-quality digital flow diagram.

---

## What This Skill Does

1. **Accepts** a photo or screenshot of any flow diagram
2. **Deeply analyzes** the structure — hierarchy levels, flow direction, node relationships, arrow labels
3. **Generates** properly connected nodes with correct icons and colors
4. **Lays out** the diagram using smart auto-layout (dagre) with the correct direction
5. **Wires** all edges with proper connection handles so arrows connect from the correct sides

---

## How It Works (Pipeline)

```
Image Upload
     │
     ▼
Base64 Encode
     │
     ▼
OpenAI Vision API  ◄── Deep Analysis Prompt
     │                  - Flow direction (LR / TB)
     │                  - Node ranks / hierarchy levels
     │                  - Edge handles (which side arrows leave/arrive)
     │                  - Edge labels from image
     │                  - Component type matching
     ▼
Enrich Nodes
     │  - Match componentId → icon + color
     │  - Carry flowDirection for layout
     ▼
Enrich Edges
     │  - type: "custom"  (uses styled CustomEdge)
     │  - sourceHandle + targetHandle from AI
     │  - Default: LR → right/left, TB → bottom/top
     │  - Edge label, shape, stroke, arrow defaults
     ▼
Auto Layout  (fresh dagre graph per call)
     │  - Direction from AI flowDirection
     │  - Adaptive spacing (scales with node count)
     │  - network-simplex ranker for clean hierarchy
     ▼
Review Screen
     │  - Edit node labels
     │  - Remove unwanted nodes
     │  - Edges auto-filter to match remaining nodes
     ▼
Apply to Canvas
```

---

## Key Files

| File | Role |
|------|------|
| `src/services/aiService.js` | AI prompt + OpenAI Vision API call |
| `src/utils/autoLayout.js` | Dagre-based layout engine |
| `src/components/ImageUploadModal.jsx` | UI + pipeline orchestration |
| `src/components/edges/CustomEdge.jsx` | Styled edge renderer with toolbar |
| `src/data/componentsList.js` | 24 component types with icons + keywords |

---

## AI Prompt Strategy

The prompt uses a **3-phase analysis approach**:

### Phase 1 — Understand the diagram
- What is the flow direction? (LR = left-to-right, TB = top-to-bottom)
- How many hierarchy levels exist?
- Are there parallel paths, branches, or loops?
- What type of system is this?

### Phase 2 — Assign ranks
- Rank 0 = entry point (leftmost or topmost)
- Rank increases with each level deeper in the hierarchy
- Parallel nodes at the same depth share the same rank

### Phase 3 — Determine edge handles
- LR flow: arrow leaves `right` → arrives `left`
- TB flow: arrow leaves `bottom` → arrives `top`
- Diagonal branches: geometrically correct side

---

## Edge Handle Logic

Handles determine which side of a node an arrow connects to. Without correct handles, React Flow connects from random sides making the diagram look broken.

| Flow Direction | sourceHandle | targetHandle |
|---------------|-------------|-------------|
| Left → Right  | `right`     | `left`      |
| Top → Bottom  | `bottom`    | `top`       |
| Branch down-left | `bottom` | `top`      |
| Branch right-down | `right` | `top`      |

---

## Auto Layout

- **Fresh graph per call** — prevents state pollution from previous conversions
- **Adaptive spacing** — larger graphs get more room between nodes
- **Direction from AI** — uses `flowDirection` returned by the model, not just node count
- **Ranker** — `network-simplex` for clean, minimal-crossing hierarchies

---

## Component Type Matching

The AI is given the full list of 24 component types and picks the best match. If the match is wrong, the system falls back to `detectComponent()` keyword matching.

**24 Available Types:**
- Client: Web App, Mobile App
- Backend: API Server, Auth Service, Security
- Data: SQL Database, Vector Database, Cache, Storage, Data Warehouse, Data Lake, Dataset
- AI/ML: LLM/AI Model, AI Agent, Embeddings, Neural Network
- Knowledge: Knowledge Base, Semantic Search
- Infrastructure: Pipeline, ML Trainer, Container/Infra
- Integration: UI, Webhook/Integration, Monitoring, Notification, Analytics

---

## Tips for Best Results

| Do | Avoid |
|----|-------|
| Clear handwriting with bold lines | Faint pencil sketches |
| High contrast lighting | Dark/shadowy photos |
| One clear flow direction | Overlapping arrows in all directions |
| Labels inside or clearly next to boxes | Labels far from their boxes |
| Arrows with visible arrowheads | Plain lines with no direction |

---

## Output JSON Shape (from AI)

```json
{
  "flowDirection": "LR",
  "nodes": [
    {
      "id": "1",
      "type": "universal",
      "data": {
        "label": "API Gateway",
        "componentId": "api_server",
        "description": "Entry point for all client requests"
      },
      "rank": 0
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2",
      "sourceHandle": "right",
      "targetHandle": "left",
      "data": {
        "shape": "bezier",
        "label": "HTTP Request",
        "showLabel": true,
        "stroke": "solid",
        "arrow": "arrow"
      }
    }
  ]
}
```

---

## Models Used

| Model | Role |
|-------|------|
| `gpt-4o-mini` | First attempt (fast, cost-efficient) |
| `gpt-4o` | Fallback if mini fails |

Both support vision input. `gpt-4o` gives more accurate results for complex or low-quality images.

---

## Environment Setup

```bash
# .env file in wsm-builder/
VITE_OPENAI_API_KEY=sk-...
```
