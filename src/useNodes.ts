import { useState, useEffect, useCallback } from "react";
import type { Node } from "./types";

const STORAGE_KEY = "home-canvas-nodes";

// Default nodes shown on first load (mirrors old home.json)
const DEFAULT_NODES: Node[] = [
  {
    key: "1",
    name: "Title",
    is: "text",
    position: [150, 20],
    size: [200, 50],
    Zindex: 1,
    content: "My Home Canvas",
    resize: true,
    children: [],
  },
  {
    key: "2",
    name: "Claude Link",
    is: "link",
    position: [35, 100],
    size: [120, 120],
    Zindex: 2,
    link: "https://www.claude.ai",
    resize: true,
    children: [
      {
        key: "2-1",
        name: "Claude",
        is: "image",
        position: [0, 0],
        size: [120, 120],
        Zindex: 3,
        link: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Claude-ai-icon.svg/960px-Claude-ai-icon.svg.png",
        resize: false,
        children: [],
      },
    ],
  },
];

function loadNodes(): Node[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Node[];
  } catch {
    // corrupted — fall back to defaults
  }
  return DEFAULT_NODES;
}

function saveNodes(nodes: Node[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
}

/** Deep-update a single node by key anywhere in the tree. */
function updateNodeInTree(nodes: Node[], key: string, patch: Partial<Node>): Node[] {
  return nodes.map((n) => {
    if (n.key === key) return { ...n, ...patch };
    if (n.children?.length) {
      return { ...n, children: updateNodeInTree(n.children, key, patch) };
    }
    return n;
  });
}

/** Remove a node by key from the tree. */
function removeNodeFromTree(nodes: Node[], key: string): Node[] {
  return nodes
    .filter((n) => n.key !== key)
    .map((n) =>
      n.children?.length
        ? { ...n, children: removeNodeFromTree(n.children, key) }
        : n
    );
}

export function useNodes() {
  const [nodes, setNodes] = useState<Node[]>(loadNodes);

  // Persist on every change
  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  const updateNode = useCallback((key: string, patch: Partial<Node>) => {
    setNodes((prev) => updateNodeInTree(prev, key, patch));
  }, []);

  const deleteNode = useCallback((key: string) => {
    setNodes((prev) => removeNodeFromTree(prev, key));
  }, []);

  const addNode = useCallback((node: Node, parentId?: string) => {
    setNodes((prev) => {
      if (!parentId) return [...prev, node];

      function insertIntoTree(list: Node[]): Node[] {
        return list.map((n) => {
          if (n.key === parentId) {
            return { ...n, children: [...(n.children || []), node] };
          }
          if (n.children && n.children.length > 0) {
            return { ...n, children: insertIntoTree(n.children) };
          }
          return n;
        });
      }

      return insertIntoTree(prev);
    });
  }, []);

  /** Find a node anywhere in the tree */
  const findNode = useCallback(
    (key: string): Node | null => {
      function search(list: Node[]): Node | null {
        for (const n of list) {
          if (n.key === key) return n;
          const found = search(n.children ?? []);
          if (found) return found;
        }
        return null;
      }
      return search(nodes);
    },
    [nodes]
  );

  const resetToDefault = useCallback(() => {
    setNodes(DEFAULT_NODES);
  }, []);

  return { nodes, updateNode, deleteNode, addNode, findNode, resetToDefault };
}
