import { SMART_COMPONENTS } from '../data/componentsList';

const COMPONENT_LIST_STR = SMART_COMPONENTS.map(c => `- ${c.id}: ${c.label}`).join('\n');

const MASTER_PROMPT = `
You are a senior software architect who specializes in converting visual diagrams into precise digital flow charts.

## STEP 1 — ANALYZE THE IMAGE DEEPLY
Before outputting anything, mentally answer these questions:
- What is the dominant flow direction? (left→right = "LR", top→bottom = "TB")
- How many distinct hierarchy levels / ranks exist? (e.g., rank 0 = entry point, rank 1 = next step...)
- Are there parallel nodes at the same rank (side-by-side in the same column/row)?
- Are there branches, merges, or loops?
- What kind of system is this? (API architecture, data pipeline, process flow, AI system, etc.)
- What text is written on or next to arrows? (these become edge labels)

## STEP 2 — ASSIGN RANKS
Rank = the level in the hierarchy:
- For LR flows: rank 0 = leftmost nodes, rank increases going right
- For TB flows: rank 0 = topmost nodes, rank increases going down
- Parallel paths at the same depth share the same rank

## STEP 3 — DETERMINE EDGE HANDLES
Based on flow direction, set which side each connection leaves from and arrives at:
- LR flow: arrow leaves "right" side of source → arrives at "left" side of target
- TB flow: arrow leaves "bottom" side of source → arrives at "top" side of target
- Diagonal/branch: use the geometrically correct side ("bottom"→"left", "right"→"top", etc.)

## STEP 4 — OUTPUT STRUCTURED JSON

AVAILABLE COMPONENT TYPES (pick the most specific match):
${COMPONENT_LIST_STR}

EDGE SHAPE GUIDE:
- "bezier" → for organic, non-hierarchical flows (curved, natural)
- "smoothstep" → for structured hierarchical flows (right-angle steps)
- "straight" → only for simple linear single-path flows

OUTPUT (strict JSON, no markdown, no extra text):
{
  "flowDirection": "LR" or "TB",
  "nodes": [
    {
      "id": "1",
      "type": "universal",
      "data": {
        "label": "Short Label",
        "componentId": "component_id_from_list_above",
        "description": "one-line role description"
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
        "label": "label text from image or null",
        "showLabel": false,
        "stroke": "solid",
        "arrow": "arrow"
      }
    }
  ]
}

CRITICAL RULES:
- Node IDs must be simple strings: "1", "2", "3" etc.
- Every edge MUST have both sourceHandle and targetHandle
- Use the correct handles for the flow direction (LR → "right"/"left", TB → "bottom"/"top")
- For branching: child at lower-left uses sourceHandle "bottom", targetHandle "top" etc.
- If an arrow label is visible in the image, put it in "label" and set "showLabel": true
- Parallel nodes at the same level must get the same rank value
- Return ONLY the raw JSON object. No code blocks, no markdown, no explanation.
`;

/**
 * Image to Flow — OpenAI Vision (Chat Completions)
 */
export async function convertImageToFlow(base64Image, mimeType = 'image/png') {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key is missing. Add VITE_OPENAI_API_KEY to your .env file.');
  }

  const dataUrl = `data:${mimeType};base64,${base64Image}`;
  const models = ['gpt-4o-mini', 'gpt-4o'];
  const errors = [];

  for (const model of models) {
    try {
      console.log(`Attempting conversion with ${model}...`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: MASTER_PROMPT.trim() },
                {
                  type: 'image_url',
                  image_url: { url: dataUrl },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try {
          const err = await response.json();
          msg = err.error?.message || msg;
        } catch {
          /* ignore */
        }
        console.warn(`Model ${model} failed: ${msg}`);
        errors.push(`${model}: ${msg}`);
        continue;
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content?.trim();
      if (!rawText) {
        const msg = 'No text in response';
        errors.push(`${model}: ${msg}`);
        continue;
      }

      const jsonStr = rawText.replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      errors.push(`${model}: ${error.message}`);
    }
  }

  throw new Error(
    `OpenAI vision failed for all models. Attempts:\n${errors.map((e) => `  • ${e}`).join('\n')}`
  );
}
