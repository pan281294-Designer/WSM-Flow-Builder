/**
 * WSM Flow Exporter — Professional Vector SVG Generator
 */

import { getBezierPath, getStraightPath, getSmoothStepPath } from 'reactflow';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import * as LucideIcons from 'lucide-react';
import { getComponentDetails } from '../data/componentsList';
import download from 'downloadjs';
import { toPng, toSvg } from 'html-to-image';

const NODE_W = 200, NODE_H = 170;

// ── Calculate handle coordinates relative to node top-left ────────────────────
function getHandlePos(handleId) {
  if (handleId === 'top')    return { x: NODE_W / 2, y: 0, pos: 'top' };
  if (handleId === 'bottom') return { x: NODE_W / 2, y: NODE_H, pos: 'bottom' };
  if (handleId === 'left')   return { x: 0, y: NODE_H / 2, pos: 'left' };
  return { x: NODE_W, y: NODE_H / 2, pos: 'right' }; // 'right' or default
}

// ── Path builder (mirrors CustomEdge) ────────────────────────────────────────
function buildEdgePath(shape, p) {
  if (shape === 'straight')   return getStraightPath(p);
  if (shape === 'smoothstep') return getSmoothStepPath({ ...p, borderRadius: 14 });
  return getBezierPath(p);
}

// ── Get icon SVG string and fix it for external tools ────────────────────────
function iconToSVGString(details, customIcon, color) {
  try {
    if (customIcon && customIcon.includes(':')) return null;

    let el;
    if (customIcon && LucideIcons[customIcon]) {
      el = createElement(LucideIcons[customIcon], { size: 28, stroke: color, strokeWidth: 1.5 });
    } else if (details.preferred === 'hero' && details.heroIcon) {
      el = createElement(details.heroIcon, { style: { width: 28, height: 28, color }, strokeWidth: 1.5 });
    } else if (details.lucideIcon) {
      el = createElement(details.lucideIcon, { size: 28, stroke: color, strokeWidth: 1.5 });
    }
    
    if (!el) return null;
    
    return renderToStaticMarkup(el)
      .replace(/currentColor/g, color) // Replace CSS variables with hard hex
      .replace(/fill="none"/g, 'fill="none"') // Ensure fill is explicit
      .replace(/<svg/, `<svg width="28" height="28" x="0" y="0"`);
  } catch (e) {
    return null;
  }
}

const EXPORT_COLORS = {
  emerald: { bg: '#ecfdf5', border: '#10b981', text: '#047857' },
  violet:  { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
  blue:    { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  cyan:    { bg: '#ecfeff', border: '#06b6d4', text: '#0e7490' },
  amber:   { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
  rose:    { bg: '#fff1f2', border: '#f43f5e', text: '#be123c' },
  slate:   { bg: '#f8fafc', border: '#94a3b8', text: '#334155' },
};

// ── Main: build vector SVG ───────────────────────────────────────────────────
export function buildVectorSVG(nodes, edges) {
  const PAD = 80;
  if (!nodes.length) return '';

  const xs = nodes.map(n => n.position.x);
  const ys = nodes.map(n => n.position.y);
  const minX = Math.min(...xs) - PAD;
  const minY = Math.min(...ys) - PAD;
  const maxX = Math.max(...xs) + NODE_W + PAD;
  const maxY = Math.max(...ys) + NODE_H + PAD;
  const width = maxX - minX;
  const height = maxY - minY;

  const defs = `
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L8,3 Z" fill="#94a3b8"/>
    </marker>
    <filter id="nodeShad" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.1"/>
    </filter>
  </defs>`;

  const edgeSVG = edges.map(edge => {
    const src = nodes.find(n => n.id === edge.source);
    const tgt = nodes.find(n => n.id === edge.target);
    if (!src || !tgt) return '';

    const sH = getHandlePos(edge.sourceHandle || 'right');
    const tH = getHandlePos(edge.targetHandle || 'left');

    const p = {
      sourceX: src.position.x - minX + sH.x,
      sourceY: src.position.y - minY + sH.y,
      sourcePosition: sH.pos,
      targetX: tgt.position.x - minX + tH.x,
      targetY: tgt.position.y - minY + tH.y,
      targetPosition: tH.pos
    };

    const [path, labelX, labelY] = buildEdgePath(edge.data?.shape || 'bezier', p);
    const strokeDash = edge.data?.stroke === 'dashed' ? '8 5' : edge.data?.stroke === 'dotted' ? '2 4' : '';
    const markerEnd = edge.data?.arrow !== 'none' ? 'url(#arrow)' : '';
    const label = edge.data?.label || '';
    const showLabel = edge.data?.showLabel !== false;
    const labelColor = edge.data?.labelColor || 'emerald';

    let edgeLabelSVG = '';
    if (label && showLabel) {
      const theme = EXPORT_COLORS[labelColor] || EXPORT_COLORS.emerald;
      const textWidth = label.length * 8 + 24; 
      edgeLabelSVG = `
        <g transform="translate(${labelX}, ${labelY})">
          <rect x="-${textWidth/2}" y="-13" width="${textWidth}" height="26" rx="13" fill="${theme.bg}" stroke="${theme.border}" stroke-width="2" />
          <text y="4.5" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle" fill="${theme.text}">${label}</text>
        </g>
      `;
    }

    return `
      <path d="${path}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${strokeDash ? `stroke-dasharray="${strokeDash}"` : ''} ${markerEnd ? `marker-end="${markerEnd}"` : ''} />
      ${edgeLabelSVG}
    `;
  }).join('\n');

  const STATUS_MAP = { Active: '#10b981', Idle: '#f59e0b', Error: '#ef4444', Offline: '#64748b' };

  const nodesSVG = nodes.map(node => {
    const { data, position } = node;
    const details = getComponentDetails(data.componentId);
    const color = data.color || details.colorHint || '#06b6d4';
    const x = position.x - minX;
    const y = position.y - minY;
    const label = data.label || details.label || '';
    const status = data.status || 'Active';
    const statusColor = STATUS_MAP[status] || STATUS_MAP.Active;

    const iconStr = iconToSVGString(details, data.customIcon, color);
    
    // Icon centering
    const iconEmbed = iconStr ? `<g transform="translate(${x + NODE_W/2 - 14}, ${y + 34})">${iconStr}</g>` : '';

    // Label wrap
    const words = label.split(' ');
    const lines = []; let cur = '';
    words.forEach(w => {
      if ((cur + ' ' + w).trim().length > 18) { lines.push(cur.trim()); cur = w; }
      else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur.trim());
    
    const labelLines = lines.map((l, i) =>
      `<text x="${x + NODE_W / 2}" y="${y + 125 + i * 16}" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle" fill="#1e293b">${l}</text>`
    ).join('\n');

    return `
<g id="node-${node.id}">
  <rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#nodeShad)" />
  <rect x="${x + NODE_W/2 - 32}" y="${y + 16}" width="64" height="64" rx="14" fill="${color}" fill-opacity="0.1" />
  ${iconEmbed}
  ${labelLines}
  <circle cx="${x + NODE_W/2 - 24}" cy="${y + NODE_H - 18}" r="3.5" fill="${statusColor}" />
  <text x="${x + NODE_W/2 - 16}" y="${y + NODE_H - 14}" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="700" letter-spacing="1" fill="${statusColor}">${status.toUpperCase()}</text>
</g>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f8fafc" />
  ${defs}
  <g id="edges-layer">${edgeSVG}</g>
  <g id="nodes-layer">${nodesSVG}</g>
</svg>`;
}

export function downloadVectorSVG(nodes, edges) {
  const svg = buildVectorSVG(nodes, edges);
  download(svg, 'wsm-flow-diagram.svg', 'image/svg+xml');
}

export async function copyVectorSVG(nodes, edges) {
  const svg = buildVectorSVG(nodes, edges);
  try { await navigator.clipboard.writeText(svg); return true; } catch { return false; }
}

export async function downloadPNG(containerRef) {
  const el = containerRef?.current?.querySelector('.react-flow__viewport');
  if (!el) return;
  const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#f8fafc' });
  download(dataUrl, 'wsm-flow-diagram.png');
}
