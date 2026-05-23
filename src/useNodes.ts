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

/** Bring a node to the front among its siblings by setting its Zindex to max + 1. */
function bringNodeToFrontInTree(nodes: Node[], key: string): { newNodes: Node[]; updated: boolean } {
  // Check if the node is at this level
  const target = nodes.find((n) => n.key === key);
  if (target) {
    const maxZ = Math.max(...nodes.map((n) => n.Zindex || 0));
    return {
      newNodes: nodes.map((n) => (n.key === key ? { ...n, Zindex: maxZ + 1 } : n)),
      updated: true,
    };
  }

  // Otherwise search in children
  let updated = false;
  const newNodes = nodes.map((n) => {
    if (updated || !n.children?.length) return n;
    const res = bringNodeToFrontInTree(n.children, key);
    if (res.updated) {
      updated = true;
      return { ...n, children: res.newNodes };
    }
    return n;
  });

  return { newNodes, updated };
}

/** Send a node to the back among its siblings by setting its Zindex to min - 1. */
function sendNodeToBackInTree(nodes: Node[], key: string): { newNodes: Node[]; updated: boolean } {
  // Check if the node is at this level
  const target = nodes.find((n) => n.key === key);
  if (target) {
    const minZ = Math.min(...nodes.map((n) => n.Zindex || 0));
    return {
      newNodes: nodes.map((n) => (n.key === key ? { ...n, Zindex: minZ - 1 } : n)),
      updated: true,
    };
  }

  // Otherwise search in children
  let updated = false;
  const newNodes = nodes.map((n) => {
    if (updated || !n.children?.length) return n;
    const res = sendNodeToBackInTree(n.children, key);
    if (res.updated) {
      updated = true;
      return { ...n, children: res.newNodes };
    }
    return n;
  });

  return { newNodes, updated };
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

  const updateMultipleNodes = useCallback((updates: { key: string; patch: Partial<Node> }[]) => {
    setNodes((prev) => {
      let next = prev;
      for (const { key, patch } of updates) {
        next = updateNodeInTree(next, key, patch);
      }
      return next;
    });
  }, []);

  const deleteNode = useCallback((key: string) => {
    setNodes((prev) => removeNodeFromTree(prev, key));
  }, []);

  const deleteMultipleNodes = useCallback((keys: string[]) => {
    setNodes((prev) => {
      let next = prev;
      for (const key of keys) {
        next = removeNodeFromTree(next, key);
      }
      return next;
    });
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

  const bringToFront = useCallback((key: string) => {
    setNodes((prev) => bringNodeToFrontInTree(prev, key).newNodes);
  }, []);

  const sendToBack = useCallback((key: string) => {
    setNodes((prev) => sendNodeToBackInTree(prev, key).newNodes);
  }, []);

  const resetToDefault = useCallback(() => {
    setNodes(DEFAULT_NODES);
  }, []);

  const reparentNode = useCallback((key: string, targetParentKey: string | null, newPosition?: [number, number]) => {
    setNodes((prev) => {
      // Find the node
      function findNodeTree(list: Node[]): Node | null {
        for (const n of list) {
          if (n.key === key) return n;
          if (n.children) {
            const f = findNodeTree(n.children);
            if (f) return f;
          }
        }
        return null;
      }
      const nodeToMoveSource = findNodeTree(prev);
      if (!nodeToMoveSource) return prev;

      // Prevent dropping into itself or its descendants
      if (targetParentKey !== null) {
        function checkDescendant(n: Node): boolean {
          if (n.key === targetParentKey) return true;
          return n.children?.some(checkDescendant) ?? false;
        }
        if (checkDescendant(nodeToMoveSource)) {
          return prev; // Invalid drop
        }
      }

      // Also check if already in that parent
      function findParent(list: Node[], childKey: string): Node | null {
        for (const n of list) {
          if (n.children?.some(c => c.key === childKey)) return n;
          if (n.children) {
            const p = findParent(n.children, childKey);
            if (p) return p;
          }
        }
        return null;
      }
      const currentParent = findParent(prev, key);
      const currentParentKey = currentParent ? currentParent.key : null;
      if (currentParentKey === targetParentKey) {
        return prev; // No change
      }

      const nodeToMove = { ...nodeToMoveSource };
      if (newPosition) {
        nodeToMove.position = newPosition;
      }

      // 1. Remove from current position
      let newNodes = removeNodeFromTree(prev, key);

      // 2. Add to new position
      if (targetParentKey === null) {
        newNodes = [...newNodes, nodeToMove];
      } else {
        function insert(list: Node[]): Node[] {
          return list.map(n => {
            if (n.key === targetParentKey) {
              return { ...n, children: [...(n.children || []), nodeToMove] };
            }
            if (n.children) {
              return { ...n, children: insert(n.children) };
            }
            return n;
          });
        }
        newNodes = insert(newNodes);
      }

      return newNodes;
    });
  }, []);

  return { nodes, updateNode, updateMultipleNodes, deleteNode, deleteMultipleNodes, addNode, findNode, bringToFront, sendToBack, reparentNode, resetToDefault };
}
