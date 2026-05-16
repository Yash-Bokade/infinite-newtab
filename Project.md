# Home Canvas Project Overview

An infinite-canvas "New Tab" style application where users can create, organize, and automate their dashboard using interactive nodes, containers, and custom React components.

## Project Roadmap & Timeline

### Phase 1: Foundation & Interactive Canvas
- **State Management**: Built `useNodes.ts` to handle a recursive node tree with full CRUD operations.
- **Persistence**: Implemented `localStorage` syncing so all canvas changes are saved locally.
- **Canvas UI**: 
    - Infinite panning via background drag.
    - Dual modes: `Edit` (full control) and `View` (clean interface, interactive forms).
    - Quick-toggle edit mode via `Ctrl+[` shortcut.
- **Root Node Types**: Implemented `container`, `text`, `image`, `link`, and `button` with drag/resize capabilities.

### Phase 2: Custom React Components (JSX Runtime)
- **Runtime Transpilation**: Integrated `@babel/standalone` to allow users to write live React code inside "Custom" nodes.
- **Sandboxed Execution**: Created `CustomNodeRunner.tsx` to execute user code safely using an `ErrorBoundary`.
- **Advanced Code Support**:
    - Added support for standard ES6 `import` and `export default` syntax inside nodes.
    - Mocked `require('react')` to allow standard hook usage (`useState`, `useEffect`).
- **Code Editor Modal**: Moved code editing from the side panel to a dedicated full-screen popup for better developer experience.

### Phase 3: Form Elements & Interactivity
- **UI Components**: Expanded node library to include `input`, `progress`, `radio`, `checkbox`, and `label`.
- **View Mode Interactivity**: Enabled form inputs to be editable in `View` mode while keeping the layout locked.
- **Style Cleanup**: Removed inline styles across the app, migrating them to modular CSS files (`CustomNodeRunner.css`, `NodeRenderer.css`) for a cleaner architecture.

### Phase 4: Intelligence & Logic Connectivity
- **Templating Engine**: Built `evaluateTemplate` to support dynamic variables.
    - Automatic Clocks: `{date}`, `{time}`, and `{date.now.time}` with real-time updates.
- **Inter-Node Communication**: Implemented node-to-node references using `{NodeName.property}` syntax (e.g., `{SearchInput.value}`).
- **Action URLs**: Enabled buttons to trigger dynamic actions. For example, a button can open a URL like `https://google.com/search?q={MyInput.value}` by resolving the input's current value on click.
- **Nesting Support**: Enabled true hierarchical nesting, allowing any node type to be added as a child of a `container`, moving relative to its parent.

## Core Technology Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Variables)
- **Runtime**: @babel/standalone (Custom Node execution)
- **Storage**: Browser LocalStorage
