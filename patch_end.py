import re

with open("src/NodeRenderer.tsx", "r") as f:
    content = f.read()

old_drag_end = """  function handleDragEnd(e: MouseEvent) {
    if (!dragState.current) return;

    dragState.current = null;"""

new_drag_end = """  function handleDragEnd(e: MouseEvent) {
    if (!dragState.current) return;

    dispatchGuides([]);
    dragState.current = null;"""

content = content.replace(old_drag_end, new_drag_end)

old_resize_end = """  function handleResizeEnd() {
    resizeState.current = null;"""

new_resize_end = """  function handleResizeEnd() {
    dispatchGuides([]);
    resizeState.current = null;"""

content = content.replace(old_resize_end, new_resize_end)

with open("src/NodeRenderer.tsx", "w") as f:
    f.write(content)
