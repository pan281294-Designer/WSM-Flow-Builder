/**
 * AI Service for Vision-to-Flow conversion
 * Handles GPT-4o Vision API calls and structured JSON extraction
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Convert base64 image to Flow data
 */
export async function convertImageToFlow(base64Image, apiKey) {
  if (!apiKey) throw new Error('OpenAI API Key is required');

  const MASTER_PROMPT = `
    You are a system architect and diagram expert. Analyze the provided hand-drawn sketch or architecture diagram.
    
    Use a 3-PHASE ANALYSIS approach:
    PHASE 1 (Context): Identify the flow direction (LR = left-to-right, TB = top-to-bottom) and total levels of hierarchy.
    PHASE 2 (Ranks): For each node, assign a 'rank'. Rank 0 is the entry point. Increment rank with each level deeper in the flow.
    PHASE 3 (Handles): Determine which side an arrow leaves (sourceHandle) and enters (targetHandle).
       - LR: Usually right -> left.
       - TB: Usually bottom -> top.
       - Adjust for branching (e.g., bottom -> left if branching down and then right).
    
    EXTRACT:
    - flowDirection: "LR" or "TB"
    - nodes: Array of { id, type: "universal", data: { label, componentId, description }, rank }
    - edges: Array of { id, source, target, sourceHandle, targetHandle, data: { label, showLabel: boolean } }
    
    COMPONENT CATEGORIES (use for componentId):
    - Client: web-app, mobile-app
    - Backend: api-server, auth, security
    - Data: sql-table, vector-db, cache, storage, data-warehouse, data-lake, csv-dataset
    - AI/ML: llm, ai-agent, embeddings, neural-network
    - Knowledge: knowledge-base, semantic-search
    - Flow: pipeline, trainer
    - Infra: ui, webhook, container, monitoring, notification, analytics
    
    RETURN ONLY a JSON object:
    {
      "flowDirection": "LR" | "TB",
      "nodes": [...],
      "edges": [...]
    }
  `;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: MASTER_PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to call OpenAI Vision API');
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    return content;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}
