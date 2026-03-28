import dagre from 'dagre';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 180;

/**
 * Smart Auto Layout Engine
 * Creates a fresh dagre graph per call to prevent state pollution between runs.
 *
 * @param {Array}  nodes     - Current nodes (may include .rank from AI)
 * @param {Array}  edges     - Current edges
 * @param {String} direction - 'LR' | 'TB' | null (auto-detect)
 */
export function getLayoutedElements(nodes, edges, direction = null) {
  // Fresh graph per call — avoids singleton state pollution across conversions
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Direction: prefer explicit arg, then AI-provided flowDirection on first node, then auto-detect
  const aiDirection = nodes[0]?._flowDirection;
  const layoutDirection = direction || aiDirection || (nodes.length > 5 ? 'LR' : 'TB');

  // Adaptive spacing: give more room for larger graphs
  const count = nodes.length;
  const nodesep = layoutDirection === 'LR'
    ? Math.max(80, 150 - count * 4)
    : Math.max(80, 170 - count * 4);
  const ranksep = layoutDirection === 'LR'
    ? Math.max(180, 280 - count * 6)
    : Math.max(130, 200 - count * 5);

  dagreGraph.setGraph({
    rankdir: layoutDirection,
    nodesep,
    ranksep,
    marginx: 60,
    marginy: 60,
    align: 'UL',
    ranker: 'network-simplex',
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
