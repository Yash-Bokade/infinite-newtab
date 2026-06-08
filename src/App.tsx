import { useEffect, useRef, useState } from "react";
import "./App.css";
import type { Mode, Node, Template } from "./types";
import { useNodes } from "./useNodes";
import Editor from "@monaco-editor/react";
import LeftPanel from "./LeftPanel";
import NodeRenderer from "./NodeRenderer";
import { getScriptExample, RELEVANT_EVENTS } from "./scriptExamples";

export default function App() {
  const [mode, setMode] = useState<Mode>("view");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [editingScript, setEditingScript] = useState<{
    key: string;
    field: keyof Node;
    title: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeKey: string } | null>(null);
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("home-canvas-theme") || "default";
  });
  const [guides, setGuides] = useState<{type: 'x'|'y', pos: number}[]>([]);
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const raw = localStorage.getItem("home-canvas-templates");
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("home-canvas-templates", JSON.stringify(templates));
  }, [templates]);

  const { nodes, addNode, updateNode, updateMultipleNodes, deleteNode, deleteMultipleNodes, duplicateNodes, findNode, findNodeParent, bringToFront, sendToBack, reparentNode, setAllNodes } = useNodes();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("home-canvas-theme", theme);
  }, [theme]);

  // ── Canvas pan & zoom ──────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    function handleWheel(e: WheelEvent) {
      // Don't zoom if we are inside a node and not holding ctrl
      // E.g., scrolling a textarea or a list
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput && !e.ctrlKey) return;

      e.preventDefault();

      setZoom((prevZoom) => {
        const zoomFactor = 1.05;
        const direction = e.deltaY > 0 ? -1 : 1;
        let newZoom = direction > 0 ? prevZoom * zoomFactor : prevZoom / zoomFactor;

        // Clamp zoom
        if (newZoom < 0.1) newZoom = 0.1;
        if (newZoom > 10) newZoom = 10;
        if (newZoom === prevZoom) return prevZoom;

        const rect = canvasEl!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate how much the mouse position in "world coordinates" has changed due to scale
        const worldX = (mouseX - offset.current.x) / prevZoom;
        const worldY = (mouseY - offset.current.y) / prevZoom;

        const newOffsetX = mouseX - worldX * newZoom;
        const newOffsetY = mouseY - worldY * newZoom;

        offset.current.x = newOffsetX;
        offset.current.y = newOffsetY;

        // Update styles
        canvasEl!.style.backgroundPosition = `${offset.current.x}px ${offset.current.y}px`;
        canvasEl!.style.backgroundSize = `${30 * newZoom}px ${30 * newZoom}px`;
        worldRef.current!.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px) scale(${newZoom})`;

        return newZoom;
      });
    }

    canvasEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvasEl.removeEventListener("wheel", handleWheel);
  }, []);

  function handleCanvasMouseDown(e: React.MouseEvent) {
    setContextMenu(null);
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
    worldRef.current!.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px) scale(${zoom})`;
  }

  function stopDragging() {
    isDragging.current = false;
    canvasRef.current!.style.cursor = "grab";
  }

  // Clicking canvas background deselects
  function handleCanvasClick(e: React.MouseEvent) {
    setContextMenu(null);
    if (!(e.target as HTMLElement).closest(".nr-node")) {
      setSelectedKeys([]);
    }
  }

  function handleContextMenu(e: React.MouseEvent, key: string) {
    setContextMenu({ x: e.clientX, y: e.clientY, nodeKey: key });
  }

  const selectedNodes = selectedKeys.map(k => findNode(k)).filter((n): n is Node => n !== null);
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  function handleSaveTemplate(name: string) {
    if (selectedNodes.length === 0) return;

    // We only want to save the top-level selected nodes, children are saved automatically
    const topLevelNodes = selectedNodes.filter(n => {
      const parent = findNodeParent(n.key);
      // It's top level if it has no parent, or if its parent is NOT in the selection
      return !parent || !selectedKeys.includes(parent.key);
    });

    // Deep clone the nodes
    function deepClone(list: Node[]): Node[] {
      return list.map(n => ({
        ...n,
        children: n.children ? deepClone(n.children) : []
      }));
    }

    const template: Template = {
      id: Math.random().toString(36).slice(2, 10),
      name: name || "Untitled Template",
      nodes: deepClone(topLevelNodes),
    };
    setTemplates(prev => [...prev, template]);
  }

  function handleAddTemplate(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const rootKeyMap = new Map<string, string>();
    function instantiateNodeTree(list: Node[], isRoot: boolean): Node[] {
       return list.map(n => {
         const newKey = Math.random().toString(36).slice(2, 10);
         if (isRoot) rootKeyMap.set(n.key, newKey);
         return {
           ...n,
           key: newKey,
           position: isRoot ? [n.position[0] + 20, n.position[1] + 20] as [number, number] : [...n.position] as [number, number],
           children: n.children ? instantiateNodeTree(n.children, false) : []
         };
       });
    }

    const newNodes = instantiateNodeTree(template.nodes, true);
    for (const n of newNodes) {
       addNode(n);
    }
    setSelectedKeys(Array.from(rootKeyMap.values()));
  }

  function handleDeleteTemplate(templateId: string) {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }

  function handleExportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "canvas-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function handleImportJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.nodes)) {
            setAllNodes(parsed.nodes);
            setSelectedKeys([]);
          } else {
            alert("Invalid JSON format");
          }
        } catch {
          alert("Error parsing JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleSelect(key: string, multi: boolean) {
    setSelectedKeys((prev) => {
      if (multi) {
        return prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      }
      return [key];
    });
  }

  // ── Ctrl+[ → enter edit mode ──────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "[") {
        e.preventDefault();
        setMode("edit");
      }
      if (e.key === "Escape") {
        setContextMenu(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick() {
      setContextMenu(null);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // ── postMessage bridge for sandbox iframes ────────────────────────────────
  // Sandboxed pages have an opaque origin and cannot use localStorage or
  // window.open directly. They send hc: messages here and we handle them.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (!d || typeof d.type !== "string") return;

      if (d.type === "hc:storage:set") {
        try { localStorage.setItem(d.key, JSON.stringify(d.value)); } catch (err) { console.error(err); }

      } else if (d.type === "hc:storage:get") {
        let value = null;
        try { const raw = localStorage.getItem(d.key); value = raw !== null ? JSON.parse(raw) : null; } catch (err) { console.error(err); }
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
          selectedNodes={selectedNodes}
          templates={templates}
          onSaveTemplate={handleSaveTemplate}
          onAddTemplate={handleAddTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onUpdate={updateNode}
          onDelete={(key) => {
            deleteNode(key);
            setSelectedKeys((prev) => prev.filter(k => k !== key));
          }}
          onDeleteMultiple={(keys) => {
            deleteMultipleNodes(keys);
            setSelectedKeys((prev) => prev.filter((k) => !keys.includes(k)));
          }}
          onDuplicate={(keys) => {
            const newKeys = duplicateNodes(keys);
            setSelectedKeys(newKeys);
          }}
          onAdd={(node) => {
            if (selectedNode) {
              addNode(node, selectedNode.key);
            } else {
              addNode(node);
            }
          }}
          onDeselect={() => setSelectedKeys([])}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onEditScript={(key, field, title) =>
            setEditingScript({ key, field, title })
          }
            theme={theme}
            onThemeChange={setTheme}
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
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
              onUpdate={updateNode}
              onUpdateMultiple={updateMultipleNodes}
              onReparent={reparentNode}
              onContextMenu={handleContextMenu}
              mode={mode}
              isRoot
              allNodes={nodes}
              zoom={zoom}
              onShowGuides={setGuides}
            />
          ))}

          {/* Render Alignment Guides */}
          {guides.map((guide, i) => {
            if (guide.type === 'x') {
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: guide.pos,
                    top: -10000,
                    width: 1 / zoom,
                    height: 20000,
                    background: "var(--accent)",
                    zIndex: 99999,
                    pointerEvents: "none",
                  }}
                />
              );
            } else {
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: guide.pos,
                    left: -10000,
                    height: 1 / zoom,
                    width: 20000,
                    background: "var(--accent)",
                    zIndex: 99999,
                    pointerEvents: "none",
                  }}
                />
              );
            }
          })}
        </div>
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: "absolute",
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 9999,
            background: "var(--panel-bg)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            padding: "4px 0",
            minWidth: 150,
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="cm-btn"
            style={{ padding: "6px 12px", background: "none", border: "none", color: "var(--text)", textAlign: "left", cursor: "pointer", fontSize: 12 }}
            onClick={() => {
              const keys = selectedKeys.includes(contextMenu.nodeKey) ? selectedKeys : [contextMenu.nodeKey];
              const newKeys = duplicateNodes(keys);
              setSelectedKeys(newKeys);
              setContextMenu(null);
            }}
          >
            Duplicate
          </button>
          <button
            className="cm-btn"
            style={{ padding: "6px 12px", background: "none", border: "none", color: "var(--text)", textAlign: "left", cursor: "pointer", fontSize: 12 }}
            onClick={() => {
              const keys = selectedKeys.includes(contextMenu.nodeKey) ? selectedKeys : [contextMenu.nodeKey];
              for (const k of keys) {
                const parent = findNodeParent(k);
                if (parent) {
                  const grandParent = findNodeParent(parent.key);
                  // Reparent to grandparent (or null if parent was root)
                  reparentNode(k, grandParent ? grandParent.key : null);
                }
              }
              setContextMenu(null);
            }}
          >
            Move to Parent
          </button>
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
          <button
            className="cm-btn"
            style={{ padding: "6px 12px", background: "none", border: "none", color: "#ef4444", textAlign: "left", cursor: "pointer", fontSize: 12 }}
            onClick={() => {
              const keys = selectedKeys.includes(contextMenu.nodeKey) ? selectedKeys : [contextMenu.nodeKey];
              deleteMultipleNodes(keys);
              setSelectedKeys((prev) => prev.filter((k) => !keys.includes(k)));
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}

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
                    <div style={{ flex: 1, width: "100%", overflow: "hidden" }}>
                      <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme={theme === "light" ? "vs-light" : "vs-dark"}
                        value={(node[currentField] as string) ?? ""}
                        onChange={(value) =>
                          updateNode(editingScript.key, {
                            [currentField]: value,
                          })
                        }
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          wordWrap: "on",
                          padding: { top: 16 },
                        }}
                      />
                    </div>
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
