import { useRef, useEffect } from "react";
import type { Node, FontProps } from "./types";

import CustomNodeRunner from "./CustomNodeRunner";
import FetchNodeRunner from "./FetchNodeRunner";
import DynamicText, { evaluateTemplate } from "./DynamicText";

interface Props {
  node: Node;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onUpdate: (key: string, patch: Partial<Node>) => void;
  onReparent?: (key: string, newParentKey: string | null, newPosition?: [number, number]) => void;
  mode?: "edit" | "view";
  /** True when this is a top-level node (positioned absolutely on canvas) */
  isRoot?: boolean;
  allNodes: Node[];
}

export default function NodeRenderer({
  node,
  selectedKey,
  onSelect,
  onUpdate,
  onReparent,
  mode = "edit",
  isRoot = false,
  allNodes,
}: Props) {
  const canEdit = mode === "edit";
  const isSelected = selectedKey === node.key;

  // ── Drag to move (only root nodes, in edit mode) ──────────────────────────
  const dragState = useRef<{
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
  } | null>(null);

  function handleDragStart(e: React.MouseEvent) {
    if (!canEdit) return;

    // If it's a child node:
    // - Without Ctrl: child moves independently.
    // - With Ctrl: we let the event bubble so the parent moves instead.
    if (!isRoot && e.ctrlKey) {
      return;
    }

    e.stopPropagation();
    onSelect(node.key);
    dragState.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: node.position[0],
      startNodeY: node.position[1],
    };
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd as EventListener);
  }

  function handleDragMove(e: MouseEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startMouseX;
    const dy = e.clientY - dragState.current.startMouseY;
    onUpdate(node.key, {
      position: [
        dragState.current.startNodeX + dx,
        dragState.current.startNodeY + dy,
      ],
    });
  }

  function handleDragEnd(e: MouseEvent) {
    if (!dragState.current) return;
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
    const dw = e.clientX - resizeState.current.startMouseX;
    const dh = e.clientY - resizeState.current.startMouseY;
    onUpdate(node.key, {
      size: [
        Math.max(40, resizeState.current.startW + dw),
        Math.max(20, resizeState.current.startH + dh),
      ],
    });
  }

  function handleResizeEnd() {
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
      onSelect(node.key);
    } else {
      runScript(node.onClick, e);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) =>
    runScript(node.onMouseEnter, e);
  const handleMouseLeave = (e: React.MouseEvent) =>
    runScript(node.onMouseLeave, e);

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
      selectedKey={selectedKey}
      onSelect={onSelect}
      onUpdate={onUpdate}
      onReparent={onReparent}
      mode={mode}
      isRoot={false}
      allNodes={allNodes}
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
            ...fontStyle,
          }}
        >
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
      >
        {selectDot}
        <button
          className="nr-btn-inner"
          style={fontStyle}
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
      >
        {selectDot}
        <label
          className="nr-form-element nr-label-text"
          style={fontStyle}
          onClick={(e) => e.stopPropagation()}
        >
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
