import { useRef, useEffect } from "react";
import type { Node, FontProps } from "./types";

import { icons } from "lucide-react";
import CustomNodeRunner from "./CustomNodeRunner";
import FetchNodeRunner from "./FetchNodeRunner";
import DynamicText, { evaluateTemplate } from "./DynamicText";

interface Props {
  node: Node;
  selectedKeys: string[];
  onSelect: (key: string, multi: boolean) => void;
  onUpdate: (key: string, patch: Partial<Node>) => void;
  onUpdateMultiple?: (updates: { key: string; patch: Partial<Node> }[]) => void;
  onReparent?: (key: string, newParentKey: string | null, newPosition?: [number, number]) => void;
  onContextMenu?: (e: React.MouseEvent, key: string) => void;
  mode?: "edit" | "view";
  /** True when this is a top-level node (positioned absolutely on canvas) */
  isRoot?: boolean;
  allNodes: Node[];
  zoom?: number;
}


// ── Snapping Helpers ────────────────────────────────────────────────────────

const SNAP_THRESHOLD = 5;

interface SnapGuide {
  axis: "x" | "y";
  pos: number;
}

function getAbsoluteOffset(targetKey: string, all: Node[]): { x: number, y: number } {
  let x = 0;
  let y = 0;
  let currKey = targetKey;

  function findParent(nodes: Node[], childKey: string): Node | null {
    for (const n of nodes) {
      if (n.children?.some(c => c.key === childKey)) return n;
      if (n.children) {
        const p = findParent(n.children, childKey);
        if (p) return p;
      }
    }
    return null;
  }

  function findNode(nodes: Node[], key: string): Node | null {
    for (const n of nodes) {
      if (n.key === key) return n;
      if (n.children) {
        const f = findNode(n.children, key);
        if (f) return f;
      }
    }
    return null;
  }

  while (currKey) {
    const node = findNode(all, currKey);
    if (!node) break;
    x += node.position[0];
    y += node.position[1];
    const parent = findParent(all, currKey);
    if (!parent) break;
    currKey = parent.key;
  }
  return { x, y };
}

function findSiblings(nodeKey: string, all: Node[]): Node[] {
  function findParent(nodes: Node[], childKey: string): Node | null {
    for (const n of nodes) {
      if (n.children?.some(c => c.key === childKey)) return n;
      if (n.children) {
        const p = findParent(n.children, childKey);
        if (p) return p;
      }
    }
    return null;
  }

  const parent = findParent(all, nodeKey);
  if (parent) {
    return parent.children?.filter(c => c.key !== nodeKey) || [];
  } else {
    // Root nodes
    return all.filter(c => c.key !== nodeKey);
  }
}

function findSnaps(
  val: number,
  size: number,
  siblings: Node[],
  all: Node[],
  axis: "x" | "y"
): { snappedVal: number | null, guides: SnapGuide[] } {
  const edges = [val, val + size / 2, val + size];
  let minDiff = Infinity;
  let bestSnap: number | null = null;
  let activeGuides: SnapGuide[] = [];

  for (const sib of siblings) {
    const sibOffset = getAbsoluteOffset(sib.key, all);
    // Since siblings are in the same coordinate space as the node,
    // we can just use their position directly for snapping.
    const sibPos = axis === "x" ? sib.position[0] : sib.position[1];
    const sibSize = axis === "x" ? sib.size[0] : sib.size[1];

    const sibEdges = [sibPos, sibPos + sibSize / 2, sibPos + sibSize];

    for (const myEdge of edges) {
      for (const theirEdge of sibEdges) {
        const diff = Math.abs(myEdge - theirEdge);
        if (diff < SNAP_THRESHOLD && diff < minDiff) {
          minDiff = diff;
          bestSnap = val + (theirEdge - myEdge);

          // Guide position should be absolute
          const absPos = axis === "x" ? sibOffset.x + (theirEdge - sibPos) : sibOffset.y + (theirEdge - sibPos);
          activeGuides = [{ axis, pos: absPos }];
        } else if (diff === minDiff && diff < SNAP_THRESHOLD) {
           const absPos = axis === "x" ? sibOffset.x + (theirEdge - sibPos) : sibOffset.y + (theirEdge - sibPos);
           activeGuides.push({ axis, pos: absPos });
        }
      }
    }
  }

  return { snappedVal: bestSnap, guides: activeGuides };
}

// Dispatch event for guides
function dispatchGuides(guides: SnapGuide[]) {
  window.dispatchEvent(new CustomEvent("hc:guides", { detail: guides }));
}

export default function NodeRenderer({
  node,
  selectedKeys,
  onSelect,
  onUpdate,
  onUpdateMultiple,
  onReparent,
  onContextMenu,
  mode = "edit",
  isRoot = false,
  allNodes,
  zoom = 1,
}: Props) {
  const canEdit = mode === "edit";
  const isSelected = selectedKeys.includes(node.key);

  // ── Drag to move (only root nodes, in edit mode) ──────────────────────────
  const dragState = useRef<{
    startMouseX: number;
    startMouseY: number;
    startPositions: { key: string, x: number, y: number }[];
  } | null>(null);

  const wasDragged = useRef(false);

  function handleDragStart(e: React.MouseEvent) {
    if (!canEdit) return;

    // If we click a child node and ctrl is NOT pressed, we want to select it.
    // The old logic allowed child nodes to be selected, but prevented dragging them up the tree if ctrl was pressed.
    // Actually, `if (!isRoot && e.ctrlKey) return;` means if we click a child node with Ctrl, let it bubble to the parent.
    // So we don't handle selection or drag for the child. The parent will receive the event and become selected.
    if (!isRoot && e.ctrlKey) {
      return;
    }

    e.stopPropagation();
    wasDragged.current = false;

    // If the node we click to drag is not selected, select it (and clear others if no shift).
    // If it IS selected, we keep current selection so we can drag all selected.
    let activeSelection = selectedKeys;
    if (!selectedKeys.includes(node.key)) {
      onSelect(node.key, e.shiftKey);
      if (!e.shiftKey) {
        activeSelection = [node.key];
      } else {
        activeSelection = [...selectedKeys, node.key];
      }
    } else if (e.shiftKey) {
      // If we shift+click a selected node, we want to deselect it, but normally dragging starts anyway.
      // Standard behavior: shift+mousedown on selected node deselects it, but we might want to prevent drag if deselected.
      // For simplicity, let's just trigger selection and skip drag if it gets deselected.
      onSelect(node.key, true);
      return;
    }

    // Find start positions for all actively selected nodes
    const startPositions: { key: string, x: number, y: number }[] = [];

    function findStarts(list: Node[]) {
      for (const n of list) {
        if (activeSelection.includes(n.key)) {
          startPositions.push({ key: n.key, x: n.position[0], y: n.position[1] });
        }
        if (n.children) {
          findStarts(n.children);
        }
      }
    }
    findStarts(allNodes);

    dragState.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPositions,
    };
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd as EventListener);
  }

  function handleDragMove(e: MouseEvent) {
    if (!dragState.current) return;
    let dx = (e.clientX - dragState.current.startMouseX) / zoom;
    let dy = (e.clientY - dragState.current.startMouseY) / zoom;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      wasDragged.current = true;
    }

    let allGuides: SnapGuide[] = [];

    // Only snap if single node is dragged and Alt is not pressed
    if (dragState.current.startPositions.length === 1 && !e.altKey) {
      const p = dragState.current.startPositions[0];
      const siblings = findSiblings(node.key, allNodes);

      const newX = p.x + dx;
      const newY = p.y + dy;

      const snapX = findSnaps(newX, node.size[0], siblings, allNodes, "x");
      const snapY = findSnaps(newY, node.size[1], siblings, allNodes, "y");

      if (snapX.snappedVal !== null) dx = snapX.snappedVal - p.x;
      if (snapY.snappedVal !== null) dy = snapY.snappedVal - p.y;

      allGuides = [...snapX.guides, ...snapY.guides];
    }

    dispatchGuides(allGuides);

    if (onUpdateMultiple) {
      const updates = dragState.current.startPositions.map(pos => ({
        key: pos.key,
        patch: { position: [pos.x + dx, pos.y + dy] as [number, number] }
      }));
      onUpdateMultiple(updates);
    } else {
      onUpdate(node.key, {
        position: [
          (dragState.current.startPositions.find(p => p.key === node.key)?.x || node.position[0]) + dx,
          (dragState.current.startPositions.find(p => p.key === node.key)?.y || node.position[1]) + dy,
        ],
      });
    }
  }

  function handleDragEnd(e: MouseEvent) {
    if (!dragState.current) return;

    dispatchGuides([]);
    dragState.current = null;
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd as EventListener);

    // Look for drop targets
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    let targetContainerKey: string | null = null;
    let isCanvas = false;

    for (const el of elements) {
      if (el.classList.contains("container")) {
        const key = el.getAttribute("data-node-key");
        if (key && key !== node.key) {
          targetContainerKey = key;
          break; // Found the top-most container
        }
      }
      if (el.classList.contains("app-canvas-container")) {
        isCanvas = true;
      }
    }

    const nodeEl = document.querySelector(`[data-node-key="${node.key}"]`) as HTMLElement | null;

    if (targetContainerKey !== null) {
      const targetEl = document.querySelector(`[data-node-key="${targetContainerKey}"]`) as HTMLElement | null;
      if (targetEl && nodeEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const nodeRect = nodeEl.getBoundingClientRect();
        const newX = nodeRect.left - targetRect.left;
        const newY = nodeRect.top - targetRect.top;
        if (onReparent) onReparent(node.key, targetContainerKey, [newX, newY]);
      }
    } else if (isCanvas) {
      const worldEl = document.querySelector(".world") as HTMLElement | null;
      if (worldEl && nodeEl) {
        const worldRect = worldEl.getBoundingClientRect();
        const nodeRect = nodeEl.getBoundingClientRect();
        const newX = nodeRect.left - worldRect.left;
        const newY = nodeRect.top - worldRect.top;
        if (onReparent) onReparent(node.key, null, [newX, newY]);
      }
    }
  }

  // ── Resize (only if node.resize === true) ─────────────────────────────────
  const resizeState = useRef<{
    startMouseX: number;
    startMouseY: number;
    startW: number;
    startH: number;
  } | null>(null);

  function handleResizeStart(e: React.MouseEvent) {
    if (!canEdit) return;
    e.stopPropagation();
    e.preventDefault();
    resizeState.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startW: node.size[0],
      startH: node.size[1],
    };
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
  }

  function handleResizeMove(e: MouseEvent) {
    if (!resizeState.current) return;
    const dw = (e.clientX - resizeState.current.startMouseX) / zoom;
    const dh = (e.clientY - resizeState.current.startMouseY) / zoom;

    let w = Math.max(40, resizeState.current.startW + dw);
    let h = Math.max(20, resizeState.current.startH + dh);

    let allGuides: SnapGuide[] = [];

    if (!e.altKey) {
        const siblings = findSiblings(node.key, allNodes);

        // We only snap the right and bottom edges during resize
        const edgesX = [node.position[0] + w];
        const edgesY = [node.position[1] + h];

        let minDiffX = Infinity;
        let minDiffY = Infinity;
        let snapX: number | null = null;
        let snapY: number | null = null;

        for (const sib of siblings) {
            const sibOffset = getAbsoluteOffset(sib.key, allNodes);
            const sibPos = [sib.position[0], sib.position[1]];
            const sibSize = [sib.size[0], sib.size[1]];

            const sibEdgesX = [sibPos[0], sibPos[0] + sibSize[0] / 2, sibPos[0] + sibSize[0]];
            const sibEdgesY = [sibPos[1], sibPos[1] + sibSize[1] / 2, sibPos[1] + sibSize[1]];

            for (const theirEdgeX of sibEdgesX) {
                const diff = Math.abs(edgesX[0] - theirEdgeX);
                if (diff < SNAP_THRESHOLD && diff < minDiffX) {
                    minDiffX = diff;
                    snapX = theirEdgeX - node.position[0];
                    const absPos = sibOffset.x + (theirEdgeX - sibPos[0]);
                    allGuides = allGuides.filter(g => g.axis !== "x");
                    allGuides.push({ axis: "x", pos: absPos });
                } else if (diff === minDiffX && diff < SNAP_THRESHOLD) {
                    const absPos = sibOffset.x + (theirEdgeX - sibPos[0]);
                    allGuides.push({ axis: "x", pos: absPos });
                }
            }

            for (const theirEdgeY of sibEdgesY) {
                const diff = Math.abs(edgesY[0] - theirEdgeY);
                if (diff < SNAP_THRESHOLD && diff < minDiffY) {
                    minDiffY = diff;
                    snapY = theirEdgeY - node.position[1];
                    const absPos = sibOffset.y + (theirEdgeY - sibPos[1]);
                    allGuides = allGuides.filter(g => g.axis !== "y");
                    allGuides.push({ axis: "y", pos: absPos });
                } else if (diff === minDiffY && diff < SNAP_THRESHOLD) {
                    const absPos = sibOffset.y + (theirEdgeY - sibPos[1]);
                    allGuides.push({ axis: "y", pos: absPos });
                }
            }
        }

        if (snapX !== null) w = Math.max(40, snapX);
        if (snapY !== null) h = Math.max(20, snapY);
    }

    dispatchGuides(allGuides);

    onUpdate(node.key, {
      size: [w, h],
    });
  }

  function handleResizeEnd() {
    dispatchGuides([]);
    resizeState.current = null;
    window.removeEventListener("mousemove", handleResizeMove);
    window.removeEventListener("mouseup", handleResizeEnd);
  }

  const wrapperStyle: React.CSSProperties = {
    "--node-position": isRoot ? "absolute" : "relative",
    "--node-left": `${node.position[0]}px`,
    "--node-top": `${node.position[1]}px`,
    "--node-z": node.Zindex ?? 1,
    "--node-width": `${node.size[0]}px`,
    "--node-height": `${node.size[1]}px`,
  } as React.CSSProperties;

  // Build CSS properties from node.font
  function buildFontStyle(font?: FontProps): React.CSSProperties {
    if (!font) return {};
    const s: React.CSSProperties = {};
    if (font.size) {
      s.fontSize = !isNaN(Number(font.size)) && font.size.trim() !== "" ? `${font.size}px` : font.size;
    }
    if (font.family) s.fontFamily = font.family;
    if (font.color) s.color = font.color;
    if (font.weight)
      s.fontWeight = font.weight as React.CSSProperties["fontWeight"];
    if (font.style)
      s.fontStyle = font.style as React.CSSProperties["fontStyle"];
    if (font.lineHeight) s.lineHeight = font.lineHeight;
    if (font.letterSpacing) {
      s.letterSpacing = !isNaN(Number(font.letterSpacing)) && font.letterSpacing.trim() !== "" 
        ? `${font.letterSpacing}px` 
        : font.letterSpacing;
    }
    if (font.textAlign)
      s.textAlign = font.textAlign as React.CSSProperties["textAlign"];
    if (font.textDecoration) s.textDecoration = font.textDecoration;
    if (font.textTransform)
      s.textTransform =
        font.textTransform as React.CSSProperties["textTransform"];
    if (font.overflow === "ellipsis") {
      s.overflow = "hidden";
      s.textOverflow = "ellipsis";
      s.whiteSpace = "nowrap";
    } else if (font.overflow === "clip") {
      s.overflow = "hidden";
    }
    return s;
  }
  const fontStyle = buildFontStyle(node.font);

  // ── Script Execution ──────────────────────────────────────────────────────
  const runScript = (script?: string, localEvent?: any) => {
    if (canEdit || !script) return;
    try {
      const helper = {
        get: (name: string) => {
          const findByName = (list: Node[], n: string): Node | undefined => {
            for (const item of list) {
              if (item.name === n) return item;
              if (item.children) {
                const f = findByName(item.children, n);
                if (f) return f;
              }
            }
            return undefined;
          };
          const target = findByName(allNodes, name);
          if (!target) return null;
          return {
            setValue: (val: any) => {
              onUpdate(target.key, { value: val });
              // Also persist if it's a storage node
              if (target.is === "storage") {
                const stKey = `storage_node_${target.content || target.name}`;
                localStorage.setItem(stKey, JSON.stringify(val));
              }
            },
            getValue: () => target.value,
            update: (patch: Partial<Node>) => onUpdate(target.key, patch),
            node: target,
          };
        },
      };
      const fn = new Function("nodes", "event", script);
      fn(helper, localEvent);
    } catch (err) {
      console.error(`Error in script for node ${node.name}:`, err);
    }
  };

  useEffect(() => {
    if (!canEdit && node.onLoad) {
      runScript(node.onLoad);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit]);

  // Event handlers for wrapper
  const handleWrapperClick = (e: React.MouseEvent) => {
    if (canEdit) {
      e.stopPropagation();

      if (wasDragged.current) {
        wasDragged.current = false;
        return;
      }

      // If we just clicked a node without shift, and it was already selected along with others,
      // mousedown kept the multi-selection for dragging, but since we didn't drag,
      // click should select ONLY this node.
      if (!e.shiftKey && selectedKeys.length > 1 && selectedKeys.includes(node.key)) {
        onSelect(node.key, false);
      }
    } else {
      runScript(node.onClick, e);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) =>
    runScript(node.onMouseEnter, e);
  const handleMouseLeave = (e: React.MouseEvent) =>
    runScript(node.onMouseLeave, e);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (canEdit && onContextMenu) {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, node.key);
    }
  };

  // Remove stale individual fetch/storage effects — FetchNodeRunner handles fetch now
  // Storage read-on-mount
  useEffect(() => {
    if (!canEdit && node.is === "storage") {
      const stKey = `storage_node_${node.content || node.name}`;
      try {
        const stored = localStorage.getItem(stKey);
        if (stored !== null) {
          onUpdate(node.key, { value: JSON.parse(stored) });
        }
      } catch (_e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, node.is, node.content, node.name]);

  // Storage write-on-value-change
  useEffect(() => {
    if (!canEdit && node.is === "storage" && node.value !== undefined) {
      const stKey = `storage_node_${node.content || node.name}`;
      localStorage.setItem(stKey, JSON.stringify(node.value));
    }
  }, [canEdit, node.is, node.content, node.name, node.value]);

  // ── Child renderer ────────────────────────────────────────────────────────
  const childNodes = node.children?.map((child) => (
    <NodeRenderer
      key={child.key}
      node={child}
      selectedKeys={selectedKeys}
      onSelect={onSelect}
      onUpdate={onUpdate}
      onUpdateMultiple={onUpdateMultiple}
      onReparent={onReparent}
      onContextMenu={onContextMenu}
      mode={mode}
      isRoot={false}
      allNodes={allNodes}
      zoom={zoom}
    />
  ));

  // ── Resize handle — edit mode only ───────────────────────────────────────
  const resizeHandle = canEdit && node.resize && (
    <div
      className="nr-resize-handle"
      onMouseDown={handleResizeStart}
      title="Drag to resize"
    />
  );

  // ── Selection dot — edit mode only ───────────────────────────────────────
  const selectDot = canEdit && isSelected && (
    <div className="nr-select-dot" title={`${node.is} · ${node.key}`} />
  );


  // ── Render by type ────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = node.icon && (icons as any)[node.icon] ? (icons as any)[node.icon] : null;

  if (node.is === "container") {
    return (
      <div
        className={`nr-node container ${node.class} ${isSelected ? "nr-selected" : ""}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <span className="nr-container-label">{node.name}</span>
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "text") {
    return (
      <div
        className={`nr-node nr-text ${node.class ?? ""}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "inherit",
            padding: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            ...fontStyle,
          }}
        >
          {IconComponent && <IconComponent size="1em" />}
          <DynamicText
            content={node.content ?? node.name}
            allNodes={allNodes}
          />
        </pre>
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "image") {
    return (
      <div
        className={`nr-node nr-img-wrap ${node.class}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        {node.link ? (
          <img
            src={node.link}
            alt={node.name}
            draggable={false}
            className="nr-img-element"
          />
        ) : (
          <div className="nr-img-placeholder">🖼 {node.name}</div>
        )}
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "link") {
    return (
      <div
        className={`nr-node nr-link-wrap ${node.class}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        {/* The actual <a> is only active in view mode — children sit inside */}
        <a
          href={
            canEdit ? undefined : evaluateTemplate(node.link ?? "", allNodes)
          }
          target="_blank"
          rel="noopener noreferrer"
          className="nr-link-anchor"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        >
          {childNodes && childNodes.length > 0 ? (
            childNodes
          ) : (
            <span className="nr-link-label">🔗 {node.name}</span>
          )}
        </a>
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "button") {
    return (
      <div
        className={`nr-node nr-button ${node.class ?? ""}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <button
          className="nr-btn-inner"
          style={{ ...fontStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          onClick={(e) => {
            if (canEdit) return;
            e.stopPropagation();
            if (node.link) {
              const url = evaluateTemplate(node.link, allNodes);
              if (url) window.open(url, "_blank");
            }
            runScript(node.onClick, e);
          }}
        >
          {IconComponent && <IconComponent size="1em" />}
          {node.content ?? node.name}
        </button>
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "progress") {
    return (
      <div
        className={`nr-node nr-progress ${node.class}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <progress
          className="nr-form-element"
          value={node.value ?? 50}
          max={100}
          onClick={(e) => e.stopPropagation()}
        />
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "radio" || node.is === "checkbox") {
    return (
      <div
        className={`nr-node nr-check ${node.class}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <input
          className="nr-form-element nr-check-input"
          type={node.is}
          checked={node.checked ?? false}
          onChange={(e) => {
            const val = e.target.checked;
            onUpdate(node.key, { checked: val });
            runScript(node.onValueChange, { value: val });
          }}
          onClick={(e) => e.stopPropagation()}
        />
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "input") {
    return (
      <div
        className={`nr-node nr-input ${node.class}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <input
          className="nr-form-element nr-text-input"
          type="text"
          value={node.value ?? ""}
          placeholder={node.name}
          onChange={(e) => {
            const val = e.target.value;
            onUpdate(node.key, { value: val });
            runScript(node.onValueChange, { value: val });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "label") {
    return (
      <div
        className={`nr-node nr-label ${node.class ?? ""}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <label
          className="nr-form-element nr-label-text"
          style={{ ...fontStyle, display: "flex", alignItems: "center", gap: "0.5rem" }}
          onClick={(e) => e.stopPropagation()}
        >
          {IconComponent && <IconComponent size="1em" />}
          <DynamicText
            content={node.content ?? node.name}
            allNodes={allNodes}
          />
        </label>
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "custom") {
    return (
      <div
        className={`nr-node nr-custom ${node.class}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <CustomNodeRunner
          code={node.code ?? ""}
          width={node.size[0]}
          height={node.size[1]}
          canEdit={canEdit}
        />
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "fetch") {
    return (
      <div
        className={`nr-node nr-fetch ${node.class ?? ""} ${isSelected ? "nr-selected" : ""}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <FetchNodeRunner
          node={node}
          allNodes={allNodes}
          canEdit={canEdit}
          onUpdate={onUpdate}
        />
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  if (node.is === "storage") {
    const stKey = node.content || node.name;
    return (
      <div
        className={`nr-node nr-storage ${node.class ?? ""} ${isSelected ? "nr-selected" : ""}`}
        style={wrapperStyle}
        data-node-key={node.key}
        onMouseDown={handleDragStart}
        onClick={handleWrapperClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {selectDot}
        <div
          style={{
            width: "100%",
            height: "100%",
            padding: "6px 8px",
            borderRadius: 6,
            fontSize: 11,
            fontFamily: "monospace",
            overflow: "auto",
            boxSizing: "border-box",
            background: canEdit ? "#1a1a2e" : "#0d1b2a",
            color: canEdit ? "#c3e88d" : "#80ffea",
            border: "1px solid #2d3748",
          }}
        >
          <div style={{ opacity: 0.6, marginBottom: 2 }}>💾 {stKey}</div>
          <div style={{ wordBreak: "break-word" }}>
            {node.value !== undefined ? (
              JSON.stringify(node.value)
            ) : (
              <span style={{ opacity: 0.4 }}>empty</span>
            )}
          </div>
        </div>
        {childNodes}
        {resizeHandle}
      </div>
    );
  }

  return null;
}
