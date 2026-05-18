# Infinite newTab

> this is a Webbrowser extension that allows user to customize their new tab page 


[Installation](https://github.com/Yash-Bokade/infinite-newtab/blob/main/installation.md)

Example
<p align="center">
<img width="1920" height="935" alt="image" src="https://github.com/user-attachments/assets/707e782e-a17c-4273-b890-3f0aaeeb7c19" />
</p>

Step for Creation

1. **user `Ctrl + [`** to open the left Tab 

2. in the left tab you can select a Component for editing menu <p align="center">
<img width="233" height="395" align="center" alt="image" src="https://github.com/user-attachments/assets/feb6d193-ec37-492b-ba9f-381000de7166" /></p>

3. for any custome node You will Have `Edit Custom Code` After Clicking <p align="center">
<img width="818" height="818" alt="Group 5" src="https://github.com/user-attachments/assets/d8cd42ab-596d-428d-92b9-348939509e9d" /></p>

4. Click on `Done` after that you can see the changes performed on the node <p align="center">
<img width="336" height="135" alt="image" src="https://github.com/user-attachments/assets/a34b7050-58e4-4321-b865-4f2be4607b31" /></p>


 
> Important ting is that You base Css Will be considered For the styles
> Alternatively you can use Inline Css but the Css will only be valid inside the `CustomNode`

<details>
  <summary>My Example</summary>

  # Home Canvas — Custom Node Functions

> Paste any of these into a **Custom** node's code editor.
> All components use `import React, { useState, useEffect } from "react"` — the sandbox provides React automatically.

---

## 1. Clock / Time

Displays live time (and optionally date). Updates every second.

```jsx
import React, { useState, useEffect } from "react";

export default function Component() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="textp">
      <div>{time}</div>
      <div style={{ fontSize: "0.5em", opacity: 0.6 }}>{date}</div>
    </div>
  );
}
```

---

## 2. To-Do List

Add, check off, and delete tasks. Persists across tabs via the `window.__hc.storage` bridge.

```jsx
import React, { useState, useEffect } from "react";

const KEY = "hc_todos";

export default function Component() {
  var [todos, setTodos] = useState([]);
  var [input, setInput] = useState("");
  var [loaded, setLoaded] = useState(false);

  // Load from parent localStorage on mount
  useEffect(function() {
    window.__hc.storage.get(KEY, function(val) {
      if (Array.isArray(val)) setTodos(val);
      setLoaded(true);
    });
  }, []);

  // Save whenever todos change (skip the initial empty state before load)
  useEffect(function() {
    if (!loaded) return;
    window.__hc.storage.set(KEY, todos);
  }, [todos, loaded]);

  function add() {
    var text = input.trim();
    if (!text) return;
    setTodos(function(t) { return t.concat([{ id: Date.now(), text: text, done: false }]); });
    setInput("");
  }

  function toggle(id) {
    setTodos(function(t) { return t.map(function(x) { return x.id === id ? { id: x.id, text: x.text, done: !x.done } : x; }); });
  }

  function remove(id) {
    setTodos(function(t) { return t.filter(function(x) { return x.id !== id; }); });
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 12, gap: 8, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13 }}>To-Do</strong>

      <div style={{ display: "flex", gap: 4 }}>
        <input
          className="nr-text-input"
          style={{ flex: 1 }}
          placeholder="New task…"
          value={input}
          onChange={function(e) { setInput(e.target.value); }}
          onKeyDown={function(e) { if (e.key === "Enter") add(); }}
        />
        <button className="cbutn" onClick={add}>+</button>
      </div>

      <ul style={{ flex: 1, overflowY: "auto", listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {todos.map(function(t) { return (
          <li key={t.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={t.done} onChange={function() { toggle(t.id); }} />
            <span style={{ flex: 1, textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.4 : 1, fontSize: 13 }}>
              {t.text}
            </span>
            <button onClick={function() { remove(t.id); }} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.5, fontSize: 14 }}>×</button>
          </li>
        ); })}
      </ul>
    </div>
  );
}
```

---

## 3. Google Search Bar

Search input that opens a new Google results tab on submit.

```jsx
import React, { useState } from "react";

export default function Component() {
  const [query, setQuery] = useState("");

  function search() {
    const q = query.trim();
    if (!q) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, height: "100%", boxSizing: "border-box" }}>
      <span style={{ fontSize: 18 }}>🔍</span>
      <input
        className="nr-text-input"
        style={{ flex: 1 }}
        placeholder="Search Google…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && search()}
        autoFocus
      />
      <button className="cbutn" onClick={search}>Go</button>
    </div>
  );
}
```

---

## 4. Recent Apps Grid

A pinnable grid of app shortcuts. Edit the `APPS` array with your own icons and URLs.

```jsx
import React from "react";

const APPS = [
  { name: "Gmail",    icon: "📧", url: "https://mail.google.com" },
  { name: "YouTube",  icon: "▶️", url: "https://youtube.com" },
  { name: "GitHub",   icon: "🐙", url: "https://github.com" },
  { name: "Maps",     icon: "🗺️", url: "https://maps.google.com" },
  { name: "Drive",    icon: "📁", url: "https://drive.google.com" },
  { name: "Calendar", icon: "📅", url: "https://calendar.google.com" },
  { name: "Notion",   icon: "📝", url: "https://notion.so" },
  { name: "Figma",    icon: "🎨", url: "https://figma.com" },
  { name: "Twitter",  icon: "🐦", url: "https://x.com" },
  { name: "Reddit",   icon: "🤖", url: "https://reddit.com" },
];

export default function Component() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 12, gap: 8, boxSizing: "border-box" }}>
      <strong style={{ fontSize: 13 }}>Recent Apps</strong>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, flex: 1 }}>
        {APPS.map(app => (
          <button
            key={app.name}
            className="lp-add-btn"
            title={app.name}
            onClick={() => window.open(app.url, "_blank")}
            style={{ flexDirection: "column", gap: 4, fontSize: 10 }}
          >
            <span style={{ fontSize: 24 }}>{app.icon}</span>
            {app.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Quick Links Grid

A dynamic grid of bookmarks. Each link shows its favicon (or a custom image) and name. Opens in a **new tab** via the bridge. Persists across tabs.

```jsx
import React, { useState, useEffect } from "react";

const KEY = "hc_quicklinks";

function getFavicon(url) {
  try {
    var domain = new URL(url).hostname;
    return "https://www.google.com/s2/favicons?domain=" + domain + "&sz=64";
  } catch(e) { return null; }
}

var EMPTY_FORM = { name: "", url: "", img: "" };

export default function Component() {
  var [links, setLinks] = useState([]);
  var [loaded, setLoaded] = useState(false);
  var [adding, setAdding] = useState(false);
  var [form, setForm] = useState(EMPTY_FORM);

  // Load on mount
  useEffect(function() {
    window.__hc.storage.get(KEY, function(val) {
      if (Array.isArray(val)) setLinks(val);
      setLoaded(true);
    });
  }, []);

  // Save on change
  useEffect(function() {
    if (!loaded) return;
    window.__hc.storage.set(KEY, links);
  }, [links, loaded]);

  function field(key, val) {
    setForm({ name: form.name, url: form.url, img: form.img, [key]: val });
  }

  function addLink() {
    var url = form.url.trim();
    if (!url) return;
    if (!url.startsWith("http")) url = "https://" + url;
    setLinks(function(l) {
      return l.concat([{ id: Date.now(), name: form.name.trim() || url, url: url, img: form.img.trim() }]);
    });
    setForm(EMPTY_FORM);
    setAdding(false);
  }

  function removeLink(id) {
    setLinks(function(l) { return l.filter(function(x) { return x.id !== id; }); });
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 10, gap: 8, boxSizing: "border-box", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontSize: 13 }}>Quick Links</strong>
        <button className="cbutn" style={{ padding: "2px 12px", fontSize: 16 }} onClick={function() { setAdding(true); }}>+</button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8, background: "var(--code-bg)", borderRadius: 8 }}>
          <input className="nr-text-input" placeholder="Name (optional)" value={form.name}
            style={{ width: "100%", boxSizing: "border-box" }}
            onChange={function(e) { field("name", e.target.value); }} />
          <input className="nr-text-input" placeholder="URL  e.g. github.com" value={form.url}
            style={{ width: "100%", boxSizing: "border-box" }}
            onChange={function(e) { field("url", e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") addLink(); }} />
          <input className="nr-text-input" placeholder="Custom image URL (blank = auto favicon)" value={form.img}
            style={{ width: "100%", boxSizing: "border-box" }}
            onChange={function(e) { field("img", e.target.value); }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button className="cbutn" style={{ flex: 1 }} onClick={addLink}>Add</button>
            <button style={{ flex: 1, background: "none", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text)" }}
              onClick={function() { setAdding(false); setForm(EMPTY_FORM); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))", gap: 8, alignContent: "start" }}>
        {links.map(function(link) {
          var src = link.img || getFavicon(link.url);
          return (
            <div key={link.id} title={link.url}
              style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}
              onClick={function() { window.__hc.open(link.url); }}>

              {/* Delete */}
              <button onClick={function(e) { e.stopPropagation(); removeLink(link.id); }}
                style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
                  background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer",
                  fontSize: 10, lineHeight: 1, zIndex: 2 }}>×</button>

              {/* Icon */}
              <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden",
                background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {src
                  ? <img src={src} alt={link.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={function(e) { e.target.style.display = "none"; }} />
                  : <span style={{ fontSize: 22 }}>🔗</span>
                }
              </div>

              {/* Name */}
              <span style={{ fontSize: 10, textAlign: "center", width: "100%",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                color: "var(--text-h)" }}>{link.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Tips

| Topic | Note |
|---|---|
| CSS vars | All `var(--accent)`, `var(--bg)`, `var(--text)` etc. from App.css are available |
| Classes | Use `.cbutn`, `.nr-text-input`, `.lp-add-btn`, `.textp` directly in JSX `className` |
| Storage | Use `window.__hc.storage.get(key, cb)` and `window.__hc.storage.set(key, val)` — persists across tabs |
| Open URL | Use `window.__hc.open(url)` to open a new tab (routes through parent) |
| Re-render | The sandbox re-renders on every code save, but storage reloads on mount |

</details>
