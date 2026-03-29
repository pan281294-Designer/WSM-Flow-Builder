import { SMART_COMPONENTS } from '../data/componentsList';

const COMPONENT_LIST_STR = SMART_COMPONENTS.map(c => `"${c.id}" → ${c.label}`).join('\n');

/**
 * Browser-side image preprocessing using Canvas API.
 * Resizes, converts to grayscale and boosts contrast — significantly
 * improves AI accuracy on whiteboard / hand-drawn sketches.
 */
export function preprocessImageInBrowser(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // 1. Resize to max 1600px on the long side (optimal for vision models)
      const MAX = 1600;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // White background (handles transparent PNGs)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // 2. Enhance contrast — push pixels toward black or white
      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        // Grayscale
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        // High-contrast: pull dark pixels darker, light pixels lighter
        const contrast = gray < 140
          ? Math.max(0, gray * 0.7)        // darken shadows
          : Math.min(255, 255 - (255 - gray) * 0.5); // lighten highlights
        d[i] = contrast;
        d[i + 1] = contrast;
        d[i + 2] = contrast;
      }
      ctx.putImageData(imageData, 0, 0);

      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        'image/png',
        0.95
      );
    };

    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Remove orphan edges, self-loops, and duplicate edges.
 * This is critical — AI sometimes returns edges pointing to
 * non-existent nodes or duplicated connections.
 */
export function validateAndCleanFlow(nodes, edges) {
  const nodeIds = new Set(nodes.map(n => n.id));

  // 1. Remove edges where source or target doesn't exist, or it's a self-loop
  const validEdges = edges.filter(e =>
    e.source && e.target &&
    nodeIds.has(String(e.source)) &&
    nodeIds.has(String(e.target)) &&
    e.source !== e.target
  );

  // 2. Remove duplicate edges (same source → target pair)
  const seen = new Set();
  const uniqueEdges = validEdges.filter(e => {
    const key = `${e.source}→${e.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 3. Normalize node IDs to strings (AI sometimes returns numbers)
  const cleanNodes = nodes.map(n => ({ ...n, id: String(n.id) }));
  const cleanEdges = uniqueEdges.map(e => ({
    ...e,
    source: String(e.source),
    target: String(e.target),
  }));

  return { nodes: cleanNodes, edges: cleanEdges };
}

// ── AI Prompt ──────────────────────────────────────────────────────────────────

const MASTER_PROMPT = `You are an expert software architect. Your ONLY job is to convert a diagram image into a precise JSON flow chart.

## YOUR PROCESS (follow in order)

### PHASE 1 — READ THE IMAGE LITERALLY
Before writing JSON, identify:
- Every distinct box/shape = one node
- Every arrow/line = one edge
- The overall flow direction: left-to-right ("LR") or top-to-bottom ("TB")
- Text written inside or next to each shape = node label
- Text written on arrows = edge label

### PHASE 2 — STRICT RULES
- ONLY create nodes for shapes you can actually see. DO NOT invent nodes.
- ONLY create edges for arrows you can actually see. DO NOT infer connections.
- If you cannot read a label clearly, use a generic name like "Service" or "Database".
- Each node MUST have a unique id ("1", "2", "3"...).
- Every edge source and target MUST match an existing node id.
- NO self-loops (source cannot equal target).
- NO duplicate edges (same source→target pair only once).

### PHASE 3 — CLASSIFY EACH NODE
Pick the single best matching componentId from this list:
${COMPONENT_LIST_STR}

Use the node label and visual shape to decide:
- Cylinder shape → database type (sql-table, vector-db, cache)
- Rounded rectangle → service type (api-server, auth, ai-agent, llm)
- Document shape → dataset or knowledge-base
- Cloud shape → container or storage
- Person/actor → web-app or ui
- Diamond → decision (use pipeline)

### PHASE 4 — DYNAMIC ICONS
For every node, provide an \`iconName\` that represents the EXACT specific technology or concept.
- Prefer exact Iconify names (e.g., "logos:aws-lambda", "logos:postgresql", "logos:react", "logos:stripe") for known tools.
- If it's a generic concept, provide a relevant lucide-react icon name (e.g., "Globe", "Database", "Shield").
- DO NOT leave this blank.

### PHASE 5 — EDGE HANDLES
Set the connection side based on flow direction:
- LR flow: sourceHandle="right", targetHandle="left"
- TB flow: sourceHandle="bottom", targetHandle="top"
- Diagonal branch going down-right: sourceHandle="bottom", targetHandle="left"
- Diagonal branch going up-right: sourceHandle="top", targetHandle="left"

## OUTPUT FORMAT
Return ONLY valid JSON. No markdown. No explanation. No code fences.

{
  "flowDirection": "LR",
  "nodes": [
    {
      "id": "1",
      "data": {
        "label": "Exact text from image",
        "componentId": "api-server",
        "description": "one-line description",
        "iconName": "logos:nodejs"
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
        "label": "text on arrow or empty string",
        "showLabel": false,
        "stroke": "solid",
        "arrow": "arrow"
      }
    }
  ]
}`;

// ── API Call ───────────────────────────────────────────────────────────────────

export async function convertImageToFlow(base64Image, mimeType = 'image/png') {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key is missing. Add VITE_OPENAI_API_KEY to your .env file.');
  }

  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  // Try gpt-4o first (best vision), fall back to gpt-4o-mini
  const models = ['gpt-4o', 'gpt-4o-mini'];
  const errors = [];

  for (const model of models) {
    try {
      console.log(`[AI] Attempting conversion with ${model}...`);

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
              role: 'system',
              content: 'You are a diagram-to-JSON converter. You output ONLY valid JSON. Never add markdown, code fences, or explanation.',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: MASTER_PROMPT },
                { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
              ],
            },
          ],
          temperature: 0.05,  // Very low — we want deterministic structure reading
          max_tokens: 4096,
          response_format: { type: 'json_object' }, // Force JSON mode
        }),
      });

      if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try { const err = await response.json(); msg = err.error?.message || msg; } catch {}
        console.warn(`[AI] ${model} failed: ${msg}`);
        errors.push(`${model}: ${msg}`);
        continue;
      }

      const responseData = await response.json();
      const rawText = responseData.choices?.[0]?.message?.content?.trim();

      if (!rawText) {
        errors.push(`${model}: empty response`);
        continue;
      }

      // Strip any accidental markdown fences
      const jsonStr = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/g, '')
        .trim();

      const parsed = JSON.parse(jsonStr);

      // Sanity check — must have nodes array
      if (!Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
        errors.push(`${model}: no nodes in response`);
        continue;
      }

      console.log(`[AI] Success with ${model}: ${parsed.nodes.length} nodes, ${parsed.edges?.length ?? 0} edges`);
      return parsed;

    } catch (error) {
      console.error(`[AI] Error with ${model}:`, error);
      errors.push(`${model}: ${error.message}`);
    }
  }

  throw new Error(
    `AI conversion failed.\n${errors.map(e => `  • ${e}`).join('\n')}`
  );
}
