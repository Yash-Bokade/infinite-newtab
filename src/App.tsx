import { useEffect, useRef, useState } from "react";
import "./App.css";
import type { Mode, Node } from "./types";
import { useNodes } from "./useNodes";
import LeftPanel from "./LeftPanel";
import NodeRenderer from "./NodeRenderer";
import { getScriptExample, RELEVANT_EVENTS } from "./scriptExamples";

export default function App() {
  const [mode, setMode] = useState<Mode>("view");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [editingScript, setEditingScript] = useState<{
    key: string;
    field: keyof Node;
    title: string;
  } | null>(null);

  const { nodes, addNode, updateNode, deleteNode, findNode, bringToFront, sendToBack, reparentNode } = useNodes();

  // ── Canvas pan ────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  function handleCanvasMouseDown(e: React.MouseEvent) {
    // Only start panning if clicked on the canvas bg itself, not a node
    if ((e.target as HTMLElement).closest(".nr-node")) return;
    isDragging.current = true;
    hasDragged.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDragged.current = true;
      canvasRef.current!.style.cursor = "grabbing";
    }
    if (!hasDragged.current) return;
    offset.current.x += dx;
    offset.current.y += dy;
    lastPos.current = { x: e.clientX, y: e.clientY };
    canvasRef.current!.style.backgroundPosition = `${offset.current.x}px ${offset.current.y}px`;
    worldRef.current!.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`;
  }

  function stopDragging() {
    isDragging.current = false;
    canvasRef.current!.style.cursor = "grab";
  }

  // Clicking canvas background deselects
  function handleCanvasClick(e: React.MouseEvent) {
    if (!(e.target as HTMLElement).closest(".nr-node")) {
      setSelectedKey(null);
    }
  }

  const selectedNode = selectedKey ? findNode(selectedKey) : null;

  // ── Ctrl+[ → enter edit mode ──────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "[") {
        e.preventDefault();
        setMode("edit");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── postMessage bridge for sandbox iframes ────────────────────────────────
  // Sandboxed pages have an opaque origin and cannot use localStorage or
  // window.open directly. They send hc: messages here and we handle them.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (!d || typeof d.type !== "string") return;

      if (d.type === "hc:storage:set") {
        try { localStorage.setItem(d.key, JSON.stringify(d.value)); } catch {}

      } else if (d.type === "hc:storage:get") {
        let value = null;
        try { const raw = localStorage.getItem(d.key); value = raw !== null ? JSON.parse(raw) : null; } catch {}
        (e.source as Window)?.postMessage({ type: "hc:storage:result", id: d.id, value }, "*");

      } else if (d.type === "hc:open") {
        window.open(d.url as string, "_blank");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);


  return (
    <div id="app-root">
      {/* ── Left panel — hidden in view mode ── */}
      {mode === "edit" && (
        <LeftPanel
          selected={selectedNode}
          onUpdate={updateNode}
          onDelete={(key) => {
            deleteNode(key);
            setSelectedKey(null);
          }}
          onAdd={(node) => {
            if (selectedNode) {
              addNode(node, selectedNode.key);
            } else {
              addNode(node);
            }
          }}
          onDeselect={() => setSelectedKey(null)}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onEditScript={(key, field, title) =>
            setEditingScript({ key, field, title })
          }
        />
      )}

      {/* ── Canvas ── */}
      <div
        ref={canvasRef}
        className={`canvas app-canvas-container ${mode === "edit" ? "edit" : "view"}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onClick={handleCanvasClick}
      >
        {/* Mode toggle — only visible in edit mode */}
        {mode === "edit" && (
          <button
            className="mode-btn"
            onClick={() => setMode("view")}
            title="Switch to view mode  (Ctrl+[ to return)"
          >
            👁 View
          </button>
        )}

        {/* World — pans with offset */}
        <div ref={worldRef} className="world">
          {nodes.map((node) => (
            <NodeRenderer
              key={node.key}
              node={node}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              onUpdate={updateNode}
              mode={mode}
              isRoot
              allNodes={nodes}
              onReparent={reparentNode}
            />
          ))}
        </div>
      </div>

      {/* ── Script Editor Modal ── */}
      {editingScript &&
        (() => {
          const node = findNode(editingScript.key);
          if (!node) {
            setEditingScript(null);
            return null;
          }
          type EK =
            | "onClick"
            | "onMouseEnter"
            | "onMouseLeave"
            | "onLoad"
            | "onValueChange";
          const currentField = editingScript.field as EK;
          const nodeEvents = (RELEVANT_EVENTS[node.is] ?? []) as EK[];
          const currentExample = getScriptExample(node.is, currentField);
          return (
            <div className="app-modal-overlay">
              <div
                className="app-modal-content"
                style={{ maxWidth: showExamples ? 1100 : 800 }}
              >
                {/* Header */}
                <div className="app-modal-header">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <h3 className="app-modal-title">{editingScript.title}</h3>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "monospace",
                        background: "var(--accent-bg)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent-border)",
                        borderRadius: 4,
                        padding: "2px 6px",
                      }}
                    >
                      {node.is}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <button
                      className="app-modal-button"
                      style={{
                        background: "var(--code-bg)",
                        color: "var(--text-h)",
                        border: "1px solid var(--border)",
                        fontSize: 12,
                      }}
                      onClick={() => setShowExamples((v) => !v)}
                    >
                      {showExamples ? "◄ Hide Examples" : "Examples ►"}
                    </button>
                    <button
                      onClick={() => setEditingScript(null)}
                      className="app-modal-close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                  {/* Editor */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      overflow: "hidden",
                    }}
                  >
                    {/* Event tabs */}
                    {nodeEvents.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          padding: "6px 12px",
                          borderBottom: "1px solid var(--border)",
                          background: "var(--code-bg)",
                          overflowX: "auto",
                        }}
                      >
                        {nodeEvents.map((evt) => (
                          <button
                            key={evt}
                            style={{
                              padding: "3px 10px",
                              fontSize: 11,
                              borderRadius: 6,
                              border: "1px solid var(--border)",
                              background:
                                evt === currentField
                                  ? "var(--accent)"
                                  : "var(--bg)",
                              color:
                                evt === currentField ? "#fff" : "var(--text-h)",
                              cursor: "pointer",
                              fontFamily: "monospace",
                              position: "relative",
                            }}
                            onClick={() => {
                              const example = getScriptExample(node.is, evt);
                              if (!node[evt] && example)
                                updateNode(editingScript.key, {
                                  [evt]: example,
                                });
                              setEditingScript({
                                ...editingScript,
                                field: evt,
                                title: `${evt} script · ${node.name}`,
                              });
                            }}
                          >
                            {node[evt] ? (
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "#22c55e",
                                  display: "inline-block",
                                  marginRight: 4,
                                }}
                              />
                            ) : null}
                            {evt}
                          </button>
                        ))}
                      </div>
                    )}
                    <textarea
                      className="app-modal-textarea"
                      value={(node[currentField] as string) ?? ""}
                      onChange={(e) =>
                        updateNode(editingScript.key, {
                          [currentField]: e.target.value,
                        })
                      }
                      spellCheck={false}
                      placeholder={
                        currentExample
                          ? `// Click 'Examples ►' to load example code for ${currentField}`
                          : `// Write your ${currentField} script here
// nodes.get('NodeName').setValue(value)
// nodes.get('NodeName').getValue()
// nodes.get('NodeName').update({ ... })`
                      }
                    />
                  </div>

                  {/* Examples sidebar */}
                  {showExamples && (
                    <div
                      style={{
                        width: 380,
                        minWidth: 320,
                        borderLeft: "1px solid var(--border)",
                        display: "flex",
                        flexDirection: "column",
                        background: "var(--code-bg)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 14px",
                          borderBottom: "1px solid var(--border)",
                          fontWeight: 600,
                          fontSize: 12,
                          color: "var(--text-h)",
                        }}
                      >
                        📚 Example:{" "}
                        <code style={{ fontFamily: "monospace", fontSize: 11 }}>
                          {currentField}
                        </code>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          overflow: "auto",
                          padding: "12px 14px",
                        }}
                      >
                        {currentExample ? (
                          <>
                            <pre
                              style={{
                                margin: 0,
                                fontSize: 11,
                                lineHeight: 1.6,
                                fontFamily: "monospace",
                                color: "var(--text-h)",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                              }}
                            >
                              {currentExample}
                            </pre>
                            <div
                              style={{
                                marginTop: 12,
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="app-modal-button"
                                style={{ fontSize: 12 }}
                                onClick={() => {
                                  const curr =
                                    (node[currentField] as string) ?? "";
                                  // Append example below existing code (or replace if only whitespace)
                                  const newVal = curr.trim()
                                    ? curr + "\n\n" + currentExample
                                    : currentExample;
                                  updateNode(editingScript.key, {
                                    [currentField]: newVal,
                                  });
                                }}
                              >
                                + Append to Script
                              </button>
                              <button
                                className="app-modal-button"
                                style={{
                                  fontSize: 12,
                                  background: "var(--code-bg)",
                                  color: "var(--text-h)",
                                  border: "1px solid var(--border)",
                                }}
                                onClick={() =>
                                  updateNode(editingScript.key, {
                                    [currentField]: currentExample,
                                  })
                                }
                              >
                                Replace with Example
                              </button>
                            </div>
                          </>
                        ) : (
                          <p style={{ color: "var(--text)", fontSize: 12 }}>
                            No example available for{" "}
                            <strong>{currentField}</strong> on{" "}
                            <strong>{node.is}</strong> nodes.
                          </p>
                        )}
                      </div>
                      {/* API reference */}
                      <div
                        style={{
                          padding: "10px 14px",
                          borderTop: "1px solid var(--border)",
                          fontSize: 11,
                          color: "var(--text)",
                          fontFamily: "monospace",
                          lineHeight: 1.7,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 6,
                            fontFamily: "inherit",
                            color: "var(--text-h)",
                          }}
                        >
                          🔖 API Reference
                        </div>
                        <div>
                          <b>nodes.get</b>(<em>'NodeName'</em>)
                        </div>
                        <div style={{ paddingLeft: 12 }}>.setValue(val)</div>
                        <div style={{ paddingLeft: 12 }}>.getValue()</div>
                        <div style={{ paddingLeft: 12 }}>
                          .update({"{ ... }"})
                        </div>
                        <div style={{ paddingLeft: 12 }}>
                          .node → raw object
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <b>event</b>.value → new value
                        </div>
                        <div>
                          <b>fetch</b>(url).then(r{"=>"}r.json())
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="app-modal-footer" style={{ gap: 8 }}>
                  {(node[currentField] as string) && (
                    <button
                      className="app-modal-button"
                      style={{
                        background: "rgba(220,60,60,0.1)",
                        color: "#dc3c3c",
                        border: "1px solid rgba(220,60,60,0.3)",
                        marginRight: "auto",
                      }}
                      onClick={() =>
                        updateNode(editingScript.key, {
                          [currentField]: undefined,
                        })
                      }
                    >
                      Clear Script
                    </button>
                  )}
                  <button
                    onClick={() => setEditingScript(null)}
                    className="app-modal-button"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
