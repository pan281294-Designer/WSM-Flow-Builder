import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";

let clipboard = null;

// ── Helper: snapshot for undo/redo ────────────────────────────────────────
const snapshot = (state) => ({
  nodes: state.nodes.map(n => ({ ...n })),
  edges: state.edges.map(e => ({ ...e })),
});

// ── Ensure nodes always have interactive flags set ────────────────────────
const ensureInteractive = (nodes) =>
  nodes.map(n => ({
    ...n,
    draggable: true,
    selectable: true,
    connectable: true,
  }));

const HISTORY_LIMIT = 50;

export const useFlowStore = create((set, get) => ({
  nodes: [],
  edges: [],

  // Undo / Redo stacks
  past: [],
  future: [],

  // Selected tracking (for properties panel)
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  selectedEdgeId: null,
  setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),

  // Panel Visibility
  isSidebarOpen: true,
  isPropertiesOpen: true,
  toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
  toggleProperties: () => set({ isPropertiesOpen: !get().isPropertiesOpen }),

  // Update a specific edge's data
  updateEdgeData: (id, data) => {
    get()._pushHistory();
    set({
      edges: get().edges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...(edge.data || {}), ...data } } : edge
      ),
    });
  },

  // ── Internal: push current state to undo stack before a mutation ─────────
  _pushHistory: () => {
    const { nodes, edges, past } = get();
    const newPast = [...past, { nodes: nodes.map(n => ({ ...n })), edges: edges.map(e => ({ ...e })) }];
    set({ past: newPast.slice(-HISTORY_LIMIT), future: [] });
  },

  // ── Undo ─────────────────────────────────────────────────────────────────
  undo: () => {
    const { past, nodes, edges, future } = get();
    if (!past.length) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ nodes: nodes.map(n => ({ ...n })), edges: edges.map(e => ({ ...e })) }, ...future].slice(0, HISTORY_LIMIT),
      nodes: ensureInteractive(prev.nodes),
      edges: prev.edges,
    });
  },

  // ── Redo ─────────────────────────────────────────────────────────────────
  redo: () => {
    const { past, nodes, edges, future } = get();
    if (!future.length) return;
    const next = future[0];
    set({
      future: future.slice(1),
      past: [...past, { nodes: nodes.map(n => ({ ...n })), edges: edges.map(e => ({ ...e })) }].slice(-HISTORY_LIMIT),
      nodes: ensureInteractive(next.nodes),
      edges: next.edges,
    });
  },

  // ── Set absolutely — used by AI Gen / Auto-layout / Image upload ──────────
  setNodes: (nodes) => {
    get()._pushHistory();
    set({ nodes: ensureInteractive(nodes) });
  },
  setEdges: (edges) => {
    get()._pushHistory();
    set({ edges });
  },

  // ── Update a specific node's data (immutable) ────────────────────────────
  updateNodeData: (id, data) => {
    get()._pushHistory();
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  addNode: (node) => {
    get()._pushHistory();
    const newNode = {
      ...node,
      id: node.id || crypto.randomUUID(),
    };
    set({ nodes: ensureInteractive([...get().nodes, newNode]) });
  },

  // ── Multi-select / Bulk Edit ─────────────────────────────────────────────
  updateSelectedNodesData: (data) => {
    get()._pushHistory();
    set({
      nodes: get().nodes.map((node) =>
        node.selected ? { ...node, data: { ...(node.data || {}), ...data } } : node
      ),
    });
  },

  // ── Persistence ──────────────────────────────────────────────────────────
  saveProject: () => {
    const { nodes, edges } = get();
    const data = { nodes, edges, timestamp: Date.now() };
    localStorage.setItem("wsm-flow-project", JSON.stringify(data));
    return true;
  },

  loadProject: () => {
    try {
      const saved = localStorage.getItem("wsm-flow-project");
      if (!saved) return false;
      const data = JSON.parse(saved);
      if (!data.nodes) return false;
      
      get()._pushHistory();
      set({ 
        nodes: ensureInteractive(data.nodes || []), 
        edges: data.edges || [],
        future: [], 
      });
      return true;
    } catch (e) {
      console.error("Failed to load project", e);
      return false;
    }
  },

  // ── React Flow change handlers (don't push to history — too noisy) ───────
  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) => {
    get()._pushHistory();
    set({
      edges: addEdge({
        ...connection,
        type: 'custom',
        zIndex: 1000,
        data: { shape: 'bezier', stroke: 'solid', arrow: 'arrow', color: '#155DFC', width: 2 }
      }, get().edges),
    });
  },

  // ── CLIPBOARD ─────────────────────────────────────────────────────────────
  copy: () => {
    const selected = get().nodes.filter(n => n.selected);
    if (!selected.length) return;
    const ids = new Set(selected.map(n => n.id));
    const selectedEdges = get().edges.filter(e => ids.has(e.source) && ids.has(e.target));
    clipboard = { nodes: selected, edges: selectedEdges };
  },

  paste: () => {
    if (!clipboard) return;
    get()._pushHistory();
    const OFFSET = 40;
    const newNodes = clipboard.nodes.map(n => ({
      ...n,
      id: crypto.randomUUID(),
      position: { x: n.position.x + OFFSET, y: n.position.y + OFFSET },
      selected: false,
      draggable: true, selectable: true, connectable: true,
    }));
    const idMap = {};
    clipboard.nodes.forEach((n, i) => { idMap[n.id] = newNodes[i].id; });
    const newEdges = clipboard.edges.map(e => ({
      ...e,
      id: crypto.randomUUID(),
      source: idMap[e.source],
      target: idMap[e.target],
    }));
    set({
      nodes: [...get().nodes, ...newNodes],
      edges: [...get().edges, ...newEdges],
    });
  },

  duplicate: () => {
    get().copy();
    get().paste();
  },

  deleteSelected: () => {
    const ids = new Set(get().nodes.filter(n => n.selected).map(n => n.id));
    if (!ids.size) return;
    get()._pushHistory();
    set({
      nodes: get().nodes.filter(n => !ids.has(n.id)),
      edges: get().edges.filter(e => !ids.has(e.source) && !ids.has(e.target)),
    });
  },

  deselectAll: () => {
    set({
      selectedNodeId: null,
      selectedEdgeId: null,
      nodes: get().nodes.map(n => ({ ...n, selected: false })),
      edges: get().edges.map(e => ({ ...e, selected: false })),
    });
  },
}));
