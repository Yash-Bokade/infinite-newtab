import React from "react";
import { createRoot } from "react-dom/client";
import * as Babel from "@babel/standalone";
import "./App.css";


let appRoot: ReturnType<typeof createRoot> | null = null;

function buildAndRender(code: string) {
  try {
    const result = Babel.transform(code, {
      presets: ["env", "react"],
      filename: "custom-node.jsx",
    });

    const transpiled = result.code ?? "";

    const customRequire = (mod: string): unknown => {
      if (mod === "react") return React;
      throw new Error(`Module '${mod}' not found`);
    };

    const exportsObj: Record<string, unknown> = {};

    // eslint-disable-next-line no-new-func
    const factory = new Function(
      "React",
      "require",
      "exports",
      `${transpiled}\n; return exports.default || (typeof Component !== 'undefined' ? Component : null);`
    );

    const UserComponent = factory(
      React,
      customRequire,
      exportsObj
    ) as React.ComponentType;

    if (!UserComponent)
      throw new Error(
        "No default export. Export a default function or name it Component()."
      );

    const container = document.getElementById("sandbox-root")!;
    if (!appRoot) appRoot = createRoot(container);
    appRoot.render(React.createElement(UserComponent));

    window.parent.postMessage({ type: "cnr:ok" }, "*");
  } catch (err) {
    window.parent.postMessage(
      {
        type: "cnr:error",
        message: err instanceof Error ? err.message : String(err),
      },
      "*"
    );
  }
}

// ── postMessage storage result listener ──────────────────────────────────────
const _pendingGets = new Map<string, (val: unknown) => void>();

window.addEventListener("message", (event) => {
  if (event.data?.type === "cnr:render") {
    // Apply CSS vars passed from parent so user components can use them
    if (event.data.cssVars) {
      const root = document.documentElement;
      for (const [k, v] of Object.entries(
        event.data.cssVars as Record<string, string>
      )) {
        root.style.setProperty(k, v);
      }
    }
    buildAndRender(event.data.code as string);
  }

  if (event.data?.type === "hc:storage:result") {
    const cb = _pendingGets.get(event.data.id as string);
    if (cb) { cb(event.data.value); _pendingGets.delete(event.data.id as string); }
  }
});

// ── Console log interception ────────────────────────────────────────────────
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
};

function safeStringify(args: unknown[]) {
  try {
    return args.map((a) =>
      typeof a === "string" ? a : JSON.stringify(a, null, 2)
    ).join(" ");
  } catch {
    return args.map((a) => String(a)).join(" ");
  }
}

console.log = (...args) => {
  originalConsole.log(...args);
  window.parent.postMessage({ type: "cnr:log", level: "info", message: safeStringify(args) }, "*");
};
console.info = (...args) => {
  originalConsole.info(...args);
  window.parent.postMessage({ type: "cnr:log", level: "info", message: safeStringify(args) }, "*");
};
console.warn = (...args) => {
  originalConsole.warn(...args);
  window.parent.postMessage({ type: "cnr:log", level: "warn", message: safeStringify(args) }, "*");
};
console.error = (...args) => {
  originalConsole.error(...args);
  window.parent.postMessage({ type: "cnr:log", level: "error", message: safeStringify(args) }, "*");
};

// ── window.__hc — bridge API available inside all custom node components ──────
// Usage:
//   window.__hc.storage.get('myKey', function(val) { ... })
//   window.__hc.storage.set('myKey', value)
//   window.__hc.open('https://example.com')   // opens in new tab via parent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__hc = {
  storage: {
    get(key: string, cb: (val: unknown) => void) {
      const id = Math.random().toString(36).slice(2);
      _pendingGets.set(id, cb);
      window.parent.postMessage({ type: "hc:storage:get", key, id }, "*");
    },
    set(key: string, value: unknown) {
      window.parent.postMessage({ type: "hc:storage:set", key, value }, "*");
    },
  },
  open(url: string) {
    window.parent.postMessage({ type: "hc:open", url }, "*");
  },
};

// Tell the parent we're ready
window.parent.postMessage({ type: "cnr:ready" }, "*");

