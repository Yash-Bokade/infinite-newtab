import { useEffect, useRef, useState } from "react";

// ── Default starter code shown on new custom nodes ───────────────────────────
export const DEFAULT_CUSTOM_CODE = `import React, { useState } from "react";

export default function Component() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: "8px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <span style={{ fontSize: 28 }}>{count}</span>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: "4px 16px",
          borderRadius: 8,
          border: "1px solid #aaa",
          cursor: "pointer",
          background: "var(--accent, #aa3bff)",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        +1
      </button>
    </div>
  );
}`;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  code: string;
  /** Kept for API compatibility — forwarded as CSS vars to sandbox */
  width: number;
  height: number;
  /** When true, renders a transparent overlay so drag events reach the parent */
  canEdit?: boolean;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CustomNodeRunner({ code, width: _w, height: _h, canEdit }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Listen for messages from THIS sandbox only
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "cnr:ready") {
        setReady(true);
      } else if (event.data?.type === "cnr:ok") {
        setError(null);
      } else if (event.data?.type === "cnr:error") {
        setError(event.data.message as string);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Send code to sandbox whenever code changes or sandbox becomes ready
  useEffect(() => {
    if (!ready) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    setError(null);

    // Forward CSS vars so user components can reference them
    const cs = getComputedStyle(document.documentElement);
    const cssVars: Record<string, string> = {};
    for (const v of ["--accent", "--bg", "--text", "--text-h", "--border", "--code-bg"]) {
      cssVars[v] = cs.getPropertyValue(v).trim();
    }

    iframe.contentWindow.postMessage({ type: "cnr:render", code, cssVars }, "*");
  }, [code, ready]);

  return (
    <div className="cnr-wrapper" style={{ position: "relative" }}>
      {error && (
        <div className="cnr-error">
          <pre className="cnr-error-text">{error}</pre>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: error ? "none" : "block",
          background: "transparent",
        }}
        title="Custom Node Sandbox"
      />
      {/* In edit mode: transparent overlay captures mouse events for drag/select,
          preventing the iframe from swallowing them */}
      {canEdit && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            cursor: "grab",
          }}
        />
      )}
    </div>
  );
}
