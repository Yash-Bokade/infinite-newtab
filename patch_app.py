import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add guides state
old_state = """  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("home-canvas-theme") || "default";
  });"""

new_state = """  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("home-canvas-theme") || "default";
  });
  const [guides, setGuides] = useState<{ axis: "x" | "y", pos: number }[]>([]);

  useEffect(() => {
    function handleGuides(e: Event) {
      const customEvent = e as CustomEvent;
      setGuides(customEvent.detail);
    }
    window.addEventListener("hc:guides", handleGuides);
    return () => window.removeEventListener("hc:guides", handleGuides);
  }, []);"""

content = content.replace(old_state, new_state)

# Render guides
old_render = """        {/* World — pans with offset */}
        <div ref={worldRef} className="world">
          {nodes.map((node) => ("""

new_render = """        {/* World — pans with offset */}
        <div ref={worldRef} className="world">
          {guides.map((g, i) => (
            <div
              key={`guide-${i}`}
              style={{
                position: "absolute",
                background: "var(--accent, #3b82f6)",
                opacity: 0.5,
                zIndex: 9999,
                pointerEvents: "none",
                ...(g.axis === "x"
                  ? { left: g.pos, top: -10000, width: 1, height: 20000 }
                  : { top: g.pos, left: -10000, width: 20000, height: 1 }),
              }}
            />
          ))}
          {nodes.map((node) => ("""

content = content.replace(old_render, new_render)

with open("src/App.tsx", "w") as f:
    f.write(content)
