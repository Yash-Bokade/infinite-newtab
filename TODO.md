# Roadmap & TODO List

Ideas and planned features to enhance the Home Canvas experience.

## 🚀 High Priority (UX & Workflow)
- [x] **Drag-to-Nest**: Allow moving existing nodes into containers simply by dragging them over the container.
- [x] **Z-Index Controls**: Add "Bring to Front" and "Send to Back" buttons to the property panel to manage overlapping nodes.
- [x] **Multi-Select**: Allow selecting multiple nodes (Shift + Click) to move or delete them in bulk.
- [x] **Duplicate Node**: A quick button to clone an existing node with all its properties.
- [x] **Context Menu**: Right-click menu for quick actions like Delete, Duplicate, and "Move to Parent".

## 🛠 Advanced Logic & Connectivity
- [x] **Event-Driven Scripting**: Allow users to write custom JS code for specific events on ANY node type:
    - `onClick`: Run code when clicked.
    - `onMouseEnter` / `onMouseLeave`: Hover effects and logic.
    - `onValueChange`: Trigger actions when an input or checkbox changes.
    - `onLoad`: Initialize state when the canvas opens.
- [x] **Integrated Script Editor**: A mini-popup editor for these event handlers with access to a `nodes` helper object to manipulate other nodes via code (e.g., `nodes.get('MyInput').setValue('Hello')`).
- [x] **External API Fetching**: A node type that can fetch data from a JSON API and display it using the `{Node.property}` syntax.
- [x] **Local Storage Node**: A node to store and retrieve persistent variables that aren't tied to a specific UI element.

## 🎨 Design & Customization
- [x] **Icon Picker**: Integrated icon library (e.g., Lucide or FontAwesome) for buttons and labels.
- [ ] **Themes**: Ability to save and switch between global color schemes (Glassmorphism, Cyberpunk, Minimalist, etc.).
- [ ] **Canvas Zooming**: Support for zooming in/out (pinch-to-zoom or wheel) to manage very large canvases.
- [ ] **Alignment Guides**: Snapping and visual guides to help align nodes perfectly.

## 💻 Developer Experience
- [ ] **Rich Code Editor**: Replace the standard textarea in the Code Modal with a syntax-highlighting editor (like Monaco or Prism).
- [ ] **Node Templates**: Save a group of nodes (like a "Login Form" or "Weather Widget") as a template to reuse later.
- [ ] **Export/Import JSON**: Easily share your canvas setup or back it up as a single file.
- [ ] **Console Logs in Modal**: A small console output inside the Code Modal to help debug custom components.
