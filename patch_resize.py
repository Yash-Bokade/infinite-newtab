import re

with open("src/NodeRenderer.tsx", "r") as f:
    content = f.read()

old_resize_move = """  function handleResizeMove(e: MouseEvent) {
    if (!resizeState.current) return;
    const dw = (e.clientX - resizeState.current.startMouseX) / zoom;
    const dh = (e.clientY - resizeState.current.startMouseY) / zoom;
    onUpdate(node.key, {
      size: [
        Math.max(40, resizeState.current.startW + dw),
        Math.max(20, resizeState.current.startH + dh),
      ],
    });
  }"""

new_resize_move = """  function handleResizeMove(e: MouseEvent) {
    if (!resizeState.current) return;
    let dw = (e.clientX - resizeState.current.startMouseX) / zoom;
    let dh = (e.clientY - resizeState.current.startMouseY) / zoom;

    let w = Math.max(40, resizeState.current.startW + dw);
    let h = Math.max(20, resizeState.current.startH + dh);

    let allGuides: SnapGuide[] = [];

    if (!e.altKey) {
        const siblings = findSiblings(node.key, allNodes);

        // We only snap the right and bottom edges during resize
        const edgesX = [node.position[0] + w];
        const edgesY = [node.position[1] + h];

        let minDiffX = Infinity;
        let minDiffY = Infinity;
        let snapX: number | null = null;
        let snapY: number | null = null;

        for (const sib of siblings) {
            const sibOffset = getAbsoluteOffset(sib.key, allNodes);
            const sibPos = [sib.position[0], sib.position[1]];
            const sibSize = [sib.size[0], sib.size[1]];

            const sibEdgesX = [sibPos[0], sibPos[0] + sibSize[0] / 2, sibPos[0] + sibSize[0]];
            const sibEdgesY = [sibPos[1], sibPos[1] + sibSize[1] / 2, sibPos[1] + sibSize[1]];

            for (const theirEdgeX of sibEdgesX) {
                const diff = Math.abs(edgesX[0] - theirEdgeX);
                if (diff < SNAP_THRESHOLD && diff < minDiffX) {
                    minDiffX = diff;
                    snapX = theirEdgeX - node.position[0];
                    const absPos = sibOffset.x + (theirEdgeX - sibPos[0]);
                    allGuides = allGuides.filter(g => g.axis !== "x");
                    allGuides.push({ axis: "x", pos: absPos });
                } else if (diff === minDiffX && diff < SNAP_THRESHOLD) {
                    const absPos = sibOffset.x + (theirEdgeX - sibPos[0]);
                    allGuides.push({ axis: "x", pos: absPos });
                }
            }

            for (const theirEdgeY of sibEdgesY) {
                const diff = Math.abs(edgesY[0] - theirEdgeY);
                if (diff < SNAP_THRESHOLD && diff < minDiffY) {
                    minDiffY = diff;
                    snapY = theirEdgeY - node.position[1];
                    const absPos = sibOffset.y + (theirEdgeY - sibPos[1]);
                    allGuides = allGuides.filter(g => g.axis !== "y");
                    allGuides.push({ axis: "y", pos: absPos });
                } else if (diff === minDiffY && diff < SNAP_THRESHOLD) {
                    const absPos = sibOffset.y + (theirEdgeY - sibPos[1]);
                    allGuides.push({ axis: "y", pos: absPos });
                }
            }
        }

        if (snapX !== null) w = Math.max(40, snapX);
        if (snapY !== null) h = Math.max(20, snapY);
    }

    dispatchGuides(allGuides);

    onUpdate(node.key, {
      size: [w, h],
    });
  }"""

content = content.replace(old_resize_move, new_resize_move)

with open("src/NodeRenderer.tsx", "w") as f:
    f.write(content)
