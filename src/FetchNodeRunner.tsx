import { useEffect, useRef, useState } from "react";
import type { Node } from "./types";
import { evaluateTemplate } from "./DynamicText";

interface Props {
  node: Node;
  allNodes: Node[];
  canEdit: boolean;
  onUpdate: (key: string, patch: Partial<Node>) => void;
}

export default function FetchNodeRunner({ node, allNodes, canEdit, onUpdate }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const prevUrl = useRef("");

  useEffect(() => {
    if (canEdit) return;
    const url = evaluateTemplate(node.link ?? "", allNodes);
    if (!url || url === prevUrl.current) return;
    prevUrl.current = url;

    setStatus("loading");
    setErrMsg("");

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        onUpdate(node.key, { value: data });
        setStatus("ok");
      })
      .catch((e) => {
        setErrMsg(String(e));
        setStatus("error");
      });
  // We intentionally only re-run when URL changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, node.link]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    padding: "6px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontFamily: "monospace",
    overflow: "auto",
    boxSizing: "border-box",
    background: canEdit ? "var(--fetch-bg-edit, #1e1e2e)" : "var(--fetch-bg, #0d1117)",
    color: canEdit ? "var(--fetch-color-edit, #89b4fa)" : "var(--fetch-color, #58a6ff)",
    border: "1px solid var(--fetch-border, #30363d)",
  };

  if (canEdit) {
    return (
      <div style={containerStyle}>
        <div style={{ opacity: 0.6, marginBottom: 2 }}>🌐 API Fetch</div>
        <div style={{ opacity: 0.9, wordBreak: "break-all" }}>{node.link || "No URL set"}</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {status === "idle" && <span style={{ opacity: 0.5 }}>Waiting…</span>}
      {status === "loading" && <span style={{ opacity: 0.7 }}>⏳ Loading…</span>}
      {status === "error" && (
        <span style={{ color: "#f85149" }}>⚠ {errMsg}</span>
      )}
      {status === "ok" && (
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {JSON.stringify(node.value, null, 2)}
        </pre>
      )}
    </div>
  );
}
