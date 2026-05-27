import type { Node, NodeType } from "./types";
import { DEFAULT_CUSTOM_CODE } from "./CustomNodeRunner";
import { getScriptExample, RELEVANT_EVENTS } from "./scriptExamples";

// ── helpers ─────────────────────────────────────────────────────────────────

interface Props {
  selectedNodes: Node[];
  onUpdate: (key: string, patch: Partial<Node>) => void;
  onDelete: (key: string) => void;
  onDeleteMultiple: (keys: string[]) => void;
  onDuplicate: (keys: string[]) => void;
  onAdd: (node: Node) => void;
  onDeselect: () => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Template for each node type
function makeNode(type: NodeType): Node {
  const base = {
    key: uid(),
    name: type,
    is: type,
    position: [20, 20] as [number, number],
    size: [140, 80] as [number, number],
    Zindex: 10,
    resize: true,
    children: [],
  };
  if (type === "text")    return { ...base, content: "New text",   size: [160, 40]  };
  if (type === "button")  return { ...base, content: "Click me",   size: [120, 44]  };
  if (type === "image")   return { ...base, link: "",               size: [140, 140] };
  if (type === "link")      return { ...base, link: "https://",       size: [120, 44]  };
  if (type === "custom")    return { ...base, code: DEFAULT_CUSTOM_CODE, size: [160, 160] };
  if (type === "progress")  return { ...base, value: 50,              size: [150, 20]  };
  if (type === "radio")     return { ...base, checked: false,         size: [24, 24]   };
  if (type === "checkbox")  return { ...base, checked: false,         size: [24, 24]   };
  if (type === "input")     return { ...base, value: "",              size: [150, 32]  };
  if (type === "label")     return { ...base, content: "Label",       size: [100, 24]  };
  if (type === "fetch")     return { ...base, link: "https://",       size: [160, 60]  };
  if (type === "storage")   return { ...base, size: [120, 60]  };
  return base; // container
}

// ── Field helpers ─────────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  children: React.ReactNode;
};
function Field({ label, children }: FieldProps) {
  return (
    <div className="lp-field">
      <label className="lp-label">{label}</label>
      {children}
    </div>
  );
}

type InputProps = {
  value: string | number;
  type?: string;
  onChange: (v: string) => void;
};
function Input({ value, type = "text", onChange }: InputProps) {
  return (
    <input
      className="lp-input"
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

type SelectProps = {
  value: string;
  options: string[];
  onChange: (v: string) => void;
};
function Select({ value, options, onChange }: SelectProps) {
  return (
    <select
      className="lp-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">— default —</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface LeftPanelProps extends Props {
  onBringToFront: (key: string) => void;
  onSendToBack: (key: string) => void;
  onEditScript?: (key: string, field: keyof Node, title: string) => void;
}

export default function LeftPanel({ selectedNodes, onUpdate, onDelete, onDeleteMultiple, onDuplicate, onAdd, onDeselect, onBringToFront, onSendToBack, onEditScript }: LeftPanelProps) {
  const nodeTypes: NodeType[] = ["container", "text", "image", "link", "button", "custom", "progress", "radio", "checkbox", "input", "label", "fetch", "storage"];
  const selected = selectedNodes.length === 1 ? selectedNodes[0] : null;

  return (
    <aside className="lp-root">
      {/* ── Properties ── */}
      <div className="lp-section lp-props">
        <div className="lp-section-header">
          {selectedNodes.length === 1 && selected ? (
            <>
              <span className="lp-section-title">
                <span className="lp-badge">{selected.is}</span> {selected.name}
              </span>
              <button className="lp-icon-btn" title="Deselect" onClick={onDeselect}>✕</button>
            </>
          ) : selectedNodes.length > 1 ? (
            <>
              <span className="lp-section-title">
                <span className="lp-badge">{selectedNodes.length}</span> nodes selected
              </span>
              <button className="lp-icon-btn" title="Deselect All" onClick={onDeselect}>✕</button>
            </>
          ) : (
            <span className="lp-section-title lp-muted">No node selected</span>
          )}
        </div>

        {selectedNodes.length > 1 && (
          <div className="lp-fields">
            <button
              className="lp-add-btn"
              onClick={() => onDuplicate(selectedNodes.map(n => n.key))}
            >
              Duplicate {selectedNodes.length} nodes
            </button>
             <button
              className="lp-delete-btn"
              onClick={() => onDeleteMultiple(selectedNodes.map(n => n.key))}
            >
              Delete all {selectedNodes.length} nodes
            </button>
          </div>
        )}

        {selectedNodes.length === 1 && selected && (
          <div className="lp-fields">
            <Field label="Name">
              <Input
                value={selected.name}
                onChange={(v) => onUpdate(selected.key, { name: v })}
              />
            </Field>

            {/* Position */}
            <div className="lp-row">
              <Field label="X">
                <Input
                  type="number"
                  value={selected.position[0]}
                  onChange={(v) =>
                    onUpdate(selected.key, {
                      position: [+v, selected.position[1]],
                    })
                  }
                />
              </Field>
              <Field label="Y">
                <Input
                  type="number"
                  value={selected.position[1]}
                  onChange={(v) =>
                    onUpdate(selected.key, {
                      position: [selected.position[0], +v],
                    })
                  }
                />
              </Field>
            </div>

            {/* Size */}
            <div className="lp-row">
              <Field label="W">
                <Input
                  type="number"
                  value={selected.size[0]}
                  onChange={(v) =>
                    onUpdate(selected.key, {
                      size: [+v, selected.size[1]],
                    })
                  }
                />
              </Field>
              <Field label="H">
                <Input
                  type="number"
                  value={selected.size[1]}
                  onChange={(v) =>
                    onUpdate(selected.key, {
                      size: [selected.size[0], +v],
                    })
                  }
                />
              </Field>
            </div>

            <Field label="Z-Index">
              <div style={{ display: 'flex', gap: 4 }}>
                <Input
                  type="number"
                  value={selected.Zindex}
                  onChange={(v) => onUpdate(selected.key, { Zindex: +v })}
                />
                <button
                  className="lp-icon-btn"
                  title="Bring to Front"
                  onClick={() => onBringToFront(selected.key)}
                >
                  ↑
                </button>
                <button
                  className="lp-icon-btn"
                  title="Send to Back"
                  onClick={() => onSendToBack(selected.key)}
                >
                  ↓
                </button>
              </div>
            </Field>

            {/* Type-specific fields */}
            {(selected.is === "text" || selected.is === "button" || selected.is === "label") && (
              <>
                <Field label="Content">
                  <textarea
                    className="lp-input"
                    style={{ minHeight: 56, resize: "vertical", fontFamily: "inherit" }}
                    value={selected.content ?? ""}
                    onChange={(e) => onUpdate(selected.key, { content: e.target.value })}
                  />
                </Field>
                <Field label="Icon (Lucide)">
                  <Input
                    value={selected.icon ?? ""}
                    onChange={(v) => onUpdate(selected.key, { icon: v })}
                  />
                </Field>
              </>
            )}

            {(selected.is === "progress" || selected.is === "input") && (
              <Field label="Value">
                <Input
                  value={selected.value ?? ""}
                  type={selected.is === "progress" ? "number" : "text"}
                  onChange={(v) => onUpdate(selected.key, { value: selected.is === "progress" ? +v : v })}
                />
              </Field>
            )}

            {(selected.is === "radio" || selected.is === "checkbox") && (
              <div className="lp-check-row">
                <label className="lp-check-label">
                  <input
                    type="checkbox"
                    checked={selected.checked ?? false}
                    onChange={(e) => onUpdate(selected.key, { checked: e.target.checked })}
                  />
                  Checked
                </label>
              </div>
            )}

            {/* Storage key field */}
            {selected.is === "storage" && (
              <Field label="Storage Key">
                <Input
                  value={selected.content ?? ""}
                  onChange={(v) => onUpdate(selected.key, { content: v })}
                />
              </Field>
            )}

            {(selected.is === "link" || selected.is === "image" || selected.is === "button" || selected.is === "fetch") && (
              <Field label={selected.is === "image" ? "Image URL" : selected.is === "button" ? "Action URL" : selected.is === "fetch" ? "API URL" : "Link URL"}>
                <Input
                  value={selected.link ?? ""}
                  onChange={(v) => onUpdate(selected.key, { link: v })}
                />
              </Field>
            )}

            <Field label="CSS Classes">
              <Input
                value={selected.class ?? ""}
                onChange={(v) => onUpdate(selected.key, { class: v })}
              />
            </Field>

            {/* Font Properties */}
            {(selected.is === "text" || selected.is === "label" || selected.is === "button") && (
              <>
                <div className="lp-section-header" style={{ marginTop: '0.75rem' }}>
                  <span className="lp-section-title" style={{ fontSize: '0.8rem' }}>Typography</span>
                </div>
                <div className="lp-row">
                  <Field label="Size">
                    <Input
                      value={selected.font?.size ?? ""}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, size: v || undefined } })}
                    />
                  </Field>
                  <Field label="Weight">
                    <Select
                      value={selected.font?.weight ?? ""}
                      options={["100","200","300","400","500","600","700","800","900","bold","bolder","lighter"]}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, weight: v || undefined } })}
                    />
                  </Field>
                </div>
                <Field label="Family">
                  <Input
                    value={selected.font?.family ?? ""}
                    onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, family: v || undefined } })}
                  />
                </Field>
                <Field label="Color">
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      type="color"
                      className="lp-color-swatch"
                      value={selected.font?.color ?? "#ffffff"}
                      onChange={(e) => onUpdate(selected.key, { font: { ...selected.font, color: e.target.value } })}
                    />
                    <Input
                      value={selected.font?.color ?? ""}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, color: v || undefined } })}
                    />
                  </div>
                </Field>
                <div className="lp-row">
                  <Field label="Align">
                    <Select
                      value={selected.font?.textAlign ?? ""}
                      options={["left","center","right","justify"]}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, textAlign: v || undefined } })}
                    />
                  </Field>
                  <Field label="Style">
                    <Select
                      value={selected.font?.style ?? ""}
                      options={["normal","italic","oblique"]}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, style: v || undefined } })}
                    />
                  </Field>
                </div>
                <div className="lp-row">
                  <Field label="Line Height">
                    <Input
                      value={selected.font?.lineHeight ?? ""}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, lineHeight: v || undefined } })}
                    />
                  </Field>
                  <Field label="Letter Spacing">
                    <Input
                      value={selected.font?.letterSpacing ?? ""}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, letterSpacing: v || undefined } })}
                    />
                  </Field>
                </div>
                <div className="lp-row">
                  <Field label="Decoration">
                    <Select
                      value={selected.font?.textDecoration ?? ""}
                      options={["none","underline","overline","line-through"]}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, textDecoration: v || undefined } })}
                    />
                  </Field>
                  <Field label="Transform">
                    <Select
                      value={selected.font?.textTransform ?? ""}
                      options={["none","uppercase","lowercase","capitalize"]}
                      onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, textTransform: v || undefined } })}
                    />
                  </Field>
                </div>
                <Field label="Overflow">
                  <Select
                    value={selected.font?.overflow ?? ""}
                    options={["visible","hidden","clip","ellipsis"]}
                    onChange={(v) => onUpdate(selected.key, { font: { ...selected.font, overflow: v || undefined } })}
                  />
                </Field>
              </>
            )}

            {selected.is === "custom" && (
              <button 
                className="lp-add-btn lp-add-custom-btn"
                onClick={() => onEditScript?.(selected.key, "code", "Edit Custom Node")}
              >
                Edit Custom Code
              </button>
            )}

            {/* Event Handlers */}
            <div className="lp-section-header" style={{ marginTop: '1rem' }}>
              <span className="lp-section-title" style={{ fontSize: '0.8rem' }}>Events / Scripts</span>
            </div>
            <div className="lp-add-grid">
              {(RELEVANT_EVENTS[selected.is] ?? ["onClick","onMouseEnter","onMouseLeave","onLoad","onValueChange"]).map((evtName) => {
                type EK = "onClick"|"onMouseEnter"|"onMouseLeave"|"onLoad"|"onValueChange";
                const field = evtName as EK;
                const hasScript = !!selected[field];
                const example = getScriptExample(selected.is, field);
                return (
                  <button
                    key={field}
                    className="lp-add-btn lp-event-btn"
                    title={hasScript ? `${field} (script set — click to edit)` : example ? `${field} — click to load example` : field}
                    onClick={() => {
                      // Auto-fill with example if field is currently empty
                      if (!hasScript && example) {
                        onUpdate(selected.key, { [field]: example });
                      }
                      onEditScript?.(selected.key, field as keyof Node, `${field} script · ${selected.name}`);
                    }}
                  >
                    <span className="lp-event-dot" data-active={hasScript ? "true" : undefined} />
                    {field}
                  </button>
                );
              })}
            </div>

            {/* Resize toggle */}
            <div className="lp-check-row">
              <label className="lp-check-label">
                <input
                  type="checkbox"
                  checked={selected.resize ?? false}
                  onChange={(e) =>
                    onUpdate(selected.key, { resize: e.target.checked })
                  }
                />
                Resizable
              </label>
            </div>

            {/* Actions */}
            <button
              className="lp-add-btn"
              onClick={() => onDuplicate([selected.key])}
            >
              Duplicate node
            </button>
            <button
              className="lp-delete-btn"
              onClick={() => onDelete(selected.key)}
            >
              Delete node
            </button>
          </div>
        )}
      </div>

      {/* ── Add nodes ── */}
      <div className="lp-section lp-add">
        <p className="lp-section-title">Add Node</p>
        <div className="lp-add-grid">
          {nodeTypes.map((t) => (
            <button
              key={t}
              className="lp-add-btn"
              onClick={() => onAdd(makeNode(t))}
            >
              <span className="lp-add-icon">{nodeIcon(t)}</span>
              {t}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function nodeIcon(t: NodeType) {
  switch (t) {
    case "container": return "▭";
    case "text":      return "T";
    case "image":     return "🖼";
    case "link":      return "🔗";
    case "button":    return "⬜";
    case "custom":    return "⚛️";
    case "progress":  return "📊";
    case "radio":     return "🔘";
    case "checkbox":  return "☑️";
    case "input":     return "📝";
    case "label":     return "🏷️";
    case "fetch":     return "🌐";
    case "storage":   return "💾";
  }
}
