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

window.addEventListener("message", (event) => {
  if (event.data?.type !== "cnr:render") return;

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
});

// Tell the parent we're ready
window.parent.postMessage({ type: "cnr:ready" }, "*");
