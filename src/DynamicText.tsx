import { useState, useEffect } from "react";
import type { Node } from "./types";

export function evaluateTemplate(template: string, nodes: Node[]): string {
  if (!template) return "";
  let result = template;

  const now = new Date();
  result = result.replace(/{date}/gi, now.toLocaleDateString());
  result = result.replace(/{time}/gi, now.toLocaleTimeString());
  result = result.replace(/{date\.now\.time}/gi, now.toLocaleTimeString());

  // Replace {NodeName.property} or {NodeName.property.subprop}
  result = result.replace(/{([^}]+?)\.([^}]+)}/g, (match, nodeName, path) => {
    function findByName(list: Node[], name: string): Node | undefined {
      for (const n of list) {
        if (n.name === name) return n;
        if (n.children) {
          const found = findByName(n.children, name);
          if (found) return found;
        }
      }
      return undefined;
    }

    const targetNode = findByName(nodes, nodeName);
    if (!targetNode) return match;

    const parts = path.split('.');
    let val: any = targetNode;
    for (const part of parts) {
      if (val == null) return "";
      val = val[part];
    }
    
    if (val === undefined) return "";
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  });

  return result;
}

export default function DynamicText({ content, allNodes }: { content: string, allNodes: Node[] }) {
  const [evaluated, setEvaluated] = useState(content);

  useEffect(() => {
    const hasTimeVariables = /{(date|time|date\.now\.time)}/i.test(content);

    const evaluate = () => {
      setEvaluated(evaluateTemplate(content, allNodes));
    };

    evaluate(); // initial evaluation

    if (hasTimeVariables) {
      const interval = setInterval(evaluate, 1000);
      return () => clearInterval(interval);
    }
  }, [content, allNodes]);

  return <>{evaluated}</>;
}
