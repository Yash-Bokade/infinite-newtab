import re

with open("src/NodeRenderer.tsx", "r") as f:
    content = f.read()

old_drag_move = """  function handleDragMove(e: MouseEvent) {
    if (!dragState.current) return;
    const dx = (e.clientX - dragState.current.startMouseX) / zoom;
    const dy = (e.clientY - dragState.current.startMouseY) / zoom;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      wasDragged.current = true;
    }

    if (onUpdateMultiple) {
      const updates = dragState.current.startPositions.map(pos => ({
        key: pos.key,
        patch: { position: [pos.x + dx, pos.y + dy] as [number, number] }
      }));
      onUpdateMultiple(updates);
    } else {
      onUpdate(node.key, {
        position: [
          (dragState.current.startPositions.find(p => p.key === node.key)?.x || node.position[0]) + dx,
          (dragState.current.startPositions.find(p => p.key === node.key)?.y || node.position[1]) + dy,
        ],
      });
    }
  }"""

new_drag_move = """  function handleDragMove(e: MouseEvent) {
    if (!dragState.current) return;
    let dx = (e.clientX - dragState.current.startMouseX) / zoom;
    let dy = (e.clientY - dragState.current.startMouseY) / zoom;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      wasDragged.current = true;
    }

    let allGuides: SnapGuide[] = [];

    // Only snap if single node is dragged and Alt is not pressed
    if (dragState.current.startPositions.length === 1 && !e.altKey) {
      const p = dragState.current.startPositions[0];
      const siblings = findSiblings(node.key, allNodes);

      const newX = p.x + dx;
      const newY = p.y + dy;

      const snapX = findSnaps(newX, node.size[0], siblings, allNodes, "x");
      const snapY = findSnaps(newY, node.size[1], siblings, allNodes, "y");

      if (snapX.snappedVal !== null) dx = snapX.snappedVal - p.x;
      if (snapY.snappedVal !== null) dy = snapY.snappedVal - p.y;

      allGuides = [...snapX.guides, ...snapY.guides];
    }

    dispatchGuides(allGuides);

    if (onUpdateMultiple) {
      const updates = dragState.current.startPositions.map(pos => ({
        key: pos.key,
        patch: { position: [pos.x + dx, pos.y + dy] as [number, number] }
      }));
      onUpdateMultiple(updates);
    } else {
      onUpdate(node.key, {
        position: [
          (dragState.current.startPositions.find(p => p.key === node.key)?.x || node.position[0]) + dx,
          (dragState.current.startPositions.find(p => p.key === node.key)?.y || node.position[1]) + dy,
        ],
      });
    }
  }"""

content = content.replace(old_drag_move, new_drag_move)

with open("src/NodeRenderer.tsx", "w") as f:
    f.write(content)
