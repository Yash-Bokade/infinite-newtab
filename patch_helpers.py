import re

with open("src/NodeRenderer.tsx", "r") as f:
    content = f.read()

helpers = """
// ── Snapping Helpers ────────────────────────────────────────────────────────

const SNAP_THRESHOLD = 5;

interface SnapGuide {
  axis: "x" | "y";
  pos: number;
}

function getAbsoluteOffset(targetKey: string, all: Node[]): { x: number, y: number } {
  let x = 0;
  let y = 0;
  let currKey = targetKey;

  function findParent(nodes: Node[], childKey: string): Node | null {
    for (const n of nodes) {
      if (n.children?.some(c => c.key === childKey)) return n;
      if (n.children) {
        const p = findParent(n.children, childKey);
        if (p) return p;
      }
    }
    return null;
  }

  function findNode(nodes: Node[], key: string): Node | null {
    for (const n of nodes) {
      if (n.key === key) return n;
      if (n.children) {
        const f = findNode(n.children, key);
        if (f) return f;
      }
    }
    return null;
  }

  while (currKey) {
    const node = findNode(all, currKey);
    if (!node) break;
    x += node.position[0];
    y += node.position[1];
    const parent = findParent(all, currKey);
    if (!parent) break;
    currKey = parent.key;
  }
  return { x, y };
}

function findSiblings(nodeKey: string, all: Node[]): Node[] {
  function findParent(nodes: Node[], childKey: string): Node | null {
    for (const n of nodes) {
      if (n.children?.some(c => c.key === childKey)) return n;
      if (n.children) {
        const p = findParent(n.children, childKey);
        if (p) return p;
      }
    }
    return null;
  }

  const parent = findParent(all, nodeKey);
  if (parent) {
    return parent.children?.filter(c => c.key !== nodeKey) || [];
  } else {
    // Root nodes
    return all.filter(c => c.key !== nodeKey);
  }
}

function findSnaps(
  val: number,
  size: number,
  siblings: Node[],
  all: Node[],
  axis: "x" | "y"
): { snappedVal: number | null, guides: SnapGuide[] } {
  const edges = [val, val + size / 2, val + size];
  let minDiff = Infinity;
  let bestSnap: number | null = null;
  let activeGuides: SnapGuide[] = [];

  for (const sib of siblings) {
    const sibOffset = getAbsoluteOffset(sib.key, all);
    // Since siblings are in the same coordinate space as the node,
    // we can just use their position directly for snapping.
    const sibPos = axis === "x" ? sib.position[0] : sib.position[1];
    const sibSize = axis === "x" ? sib.size[0] : sib.size[1];

    const sibEdges = [sibPos, sibPos + sibSize / 2, sibPos + sibSize];

    for (const myEdge of edges) {
      for (const theirEdge of sibEdges) {
        const diff = Math.abs(myEdge - theirEdge);
        if (diff < SNAP_THRESHOLD && diff < minDiff) {
          minDiff = diff;
          bestSnap = val + (theirEdge - myEdge);

          // Guide position should be absolute
          const absPos = axis === "x" ? sibOffset.x + (theirEdge - sibPos) : sibOffset.y + (theirEdge - sibPos);
          activeGuides = [{ axis, pos: absPos }];
        } else if (diff === minDiff && diff < SNAP_THRESHOLD) {
           const absPos = axis === "x" ? sibOffset.x + (theirEdge - sibPos) : sibOffset.y + (theirEdge - sibPos);
           activeGuides.push({ axis, pos: absPos });
        }
      }
    }
  }

  return { snappedVal: bestSnap, guides: activeGuides };
}

// Dispatch event for guides
function dispatchGuides(guides: SnapGuide[]) {
  window.dispatchEvent(new CustomEvent("hc:guides", { detail: guides }));
}
"""

content = content.replace("export default function NodeRenderer({", helpers + "\nexport default function NodeRenderer({")

with open("src/NodeRenderer.tsx", "w") as f:
    f.write(content)
