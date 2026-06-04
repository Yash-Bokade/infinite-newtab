import re

with open("src/NodeRenderer.tsx", "r") as f:
    content = f.read()

# Fix prefer-const
content = content.replace("let dw = (e.clientX - resizeState.current.startMouseX) / zoom;", "const dw = (e.clientX - resizeState.current.startMouseX) / zoom;")
content = content.replace("let dh = (e.clientY - resizeState.current.startMouseY) / zoom;", "const dh = (e.clientY - resizeState.current.startMouseY) / zoom;")

with open("src/NodeRenderer.tsx", "w") as f:
    f.write(content)
