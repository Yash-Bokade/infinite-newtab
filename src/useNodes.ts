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

  const bringToFront = useCallback((key: string) => {
    setNodes((prev) => bringNodeToFrontInTree(prev, key).newNodes);
  }, []);

  const sendToBack = useCallback((key: string) => {
    setNodes((prev) => sendNodeToBackInTree(prev, key).newNodes);
  }, []);

  const reparentNode = useCallback(
    (nodeKey: string, newParentKey: string | null) => {
      setNodes((prev) => {
        // Find the node to reparent and its absolute position before moving
        const searchAbs = (
          list: Node[],
          key: string,
          accX: number,
          accY: number
        ): { node: Node; absX: number; absY: number } | null => {
          for (const n of list) {
            const curAbsX = accX + n.position[0];
            const curAbsY = accY + n.position[1];
            if (n.key === key) return { node: n, absX: curAbsX, absY: curAbsY };
            const found = searchAbs(n.children ?? [], key, curAbsX, curAbsY);
            if (found) return found;
          }
          return null;
        };

        const targetData = searchAbs(prev, nodeKey, 0, 0);
        if (!targetData) return prev; // Node not found
        const { node: targetNode, absX: targetAbsX, absY: targetAbsY } = targetData;

        // Find the absolute position of the new parent
        let newParentAbsX = 0;
        let newParentAbsY = 0;
        if (newParentKey) {
          const newParentData = searchAbs(prev, newParentKey, 0, 0);
          if (!newParentData) return prev; // Parent not found
          newParentAbsX = newParentData.absX;
          newParentAbsY = newParentData.absY;
        }

        // Calculate the new relative position
        const newRelX = targetAbsX - newParentAbsX;
        const newRelY = targetAbsY - newParentAbsY;

        // 1. Remove the node from the tree
        const treeWithoutTarget = removeNodeFromTree(prev, nodeKey);

        // Update the target node's position
        const updatedTargetNode: Node = {
          ...targetNode,
          position: [newRelX, newRelY],
        };

        // 2. Insert the node at the new location
        if (!newParentKey) {
          return [...treeWithoutTarget, updatedTargetNode];
        }

        function insertIntoTree(list: Node[]): Node[] {
          return list.map((n) => {
            if (n.key === newParentKey) {
              return { ...n, children: [...(n.children || []), updatedTargetNode] };
            }
            if (n.children && n.children.length > 0) {
              return { ...n, children: insertIntoTree(n.children) };
            }
            return n;
          });
        }

        return insertIntoTree(treeWithoutTarget);
      });
    },
    []
  );

  const resetToDefault = useCallback(() => {
    setNodes(DEFAULT_NODES);
  }, []);

  return { nodes, updateNode, deleteNode, addNode, findNode, bringToFront, sendToBack, resetToDefault, reparentNode };
}
