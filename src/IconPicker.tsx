import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { icons } from "lucide-react";

const iconNames = Object.keys(icons);

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    if (!search) return iconNames.slice(0, 150); // Show max 150 when no search
    const lower = search.toLowerCase();
    return iconNames.filter((name) => name.toLowerCase().includes(lower)).slice(0, 150); // limit to keep UI responsive
  }, [search]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SelectedIcon = value && (icons as any)[value] ? (icons as any)[value] : null;

  return (
    <>
      <div
        className="lp-input"
        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}
        onClick={() => setIsOpen(true)}
      >
        {SelectedIcon ? <SelectedIcon size={16} /> : <div style={{width: 16, height: 16, border: "1px dashed var(--border)", borderRadius: 2}} />}
        <span style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", opacity: value ? 1 : 0.5 }}>
          {value || "Select Icon..."}
        </span>
        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "0 4px", fontSize: "16px", lineHeight: 1 }}
            title="Clear icon"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && createPortal(
        <div className="app-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="app-modal-content" style={{ display: "flex", flexDirection: "column", height: "60vh", width: "60%", minWidth: "300px" }} onClick={e => e.stopPropagation()}>
            <div className="app-modal-header">
              <h2 className="app-modal-title">Select Icon</h2>
              <button className="app-modal-close" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
              <input
                autoFocus
                className="lp-input"
                placeholder="Search icons..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: "16px", alignContent: "start" }}>
              {filteredIcons.map(name => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const IconComp = (icons as any)[name];
                return (
                  <button
                    key={name}
                    onClick={() => {
                      onChange(name);
                      setIsOpen(false);
                    }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                      background: "none", border: "1px solid transparent", color: "var(--text)", cursor: "pointer", padding: "8px",
                      borderRadius: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-h)";
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                    title={name}
                  >
                    <IconComp size={24} />
                    <span style={{ fontSize: "10px", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </span>
                  </button>
                );
              })}
              {filteredIcons.length === 0 && <div style={{ gridColumn: "1 / -1", textAlign: "center", opacity: 0.5 }}>No icons found.</div>}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
