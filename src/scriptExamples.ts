import type { NodeType } from "./types";

type EventName = "onClick" | "onMouseEnter" | "onMouseLeave" | "onLoad" | "onValueChange";

// nodes helper API reference:
//   nodes.get('NodeName')
//     .setValue(val)   → sets node.value (+ persists if storage)
//     .getValue()      → returns current node.value
//     .update(patch)   → merges any patch into the node
//     .node            → the raw Node object

const HEADER = `// ── nodes helper ─────────────────────────────────────
// nodes.get('Name').setValue(val)   – set value
// nodes.get('Name').getValue()      – read value
// nodes.get('Name').update({ ... }) – patch any field
// nodes.get('Name').node            – raw node object
// ──────────────────────────────────────────────────────
`;

export const SCRIPT_EXAMPLES: Partial<
  Record<NodeType, Partial<Record<EventName, string>>>
> = {

  // ── Button ──────────────────────────────────────────
  button: {
    onClick: HEADER + `// Example 1: fetch an API and show the result in a Text node
(async () => {
  const res = await fetch('https://catfact.ninja/fact');
  const data = await res.json();
  nodes.get('MyText').update({ content: data.fact });
})();

// Example 2: toggle a checkbox and save to storage
// const cb = nodes.get('MyCheckbox');
// const next = !cb.node.checked;
// cb.update({ checked: next });
// nodes.get('AppStorage').setValue({ darkMode: next });

// Example 3: increment a counter stored in a Storage node
// const store = nodes.get('Counter');
// store.setValue((store.getValue() ?? 0) + 1);
// nodes.get('CountLabel').update({ content: String(store.getValue()) });
`,

    onMouseEnter: HEADER + `// Highlight the button label on hover
nodes.get('MyButton').update({ content: '→ ' + nodes.get('MyButton').node.content });

// Or set a CSS class for a glow effect:
// nodes.get('MyButton').update({ class: 'glow' });
`,

    onMouseLeave: HEADER + `// Restore the original label on mouse leave
const btn = nodes.get('MyButton');
const lbl = btn.node.content ?? '';
btn.update({ content: lbl.replace(/^→ /, '') });
`,

    onLoad: HEADER + `// On canvas load: read a saved value from Storage and set button label
const store = nodes.get('AppStorage');
const saved = store.getValue();
if (saved?.buttonLabel) {
  nodes.get('MyButton').update({ content: saved.buttonLabel });
}
`,
  },

  // ── Text ────────────────────────────────────────────
  text: {
    onClick: HEADER + `// Copy the text content to clipboard
const txt = nodes.get('MyText').node.content ?? '';
navigator.clipboard.writeText(txt).catch(console.error);
// Optional: briefly show a confirmation
nodes.get('MyText').update({ content: '✓ Copied!' });
setTimeout(() => nodes.get('MyText').update({ content: txt }), 1500);
`,

    onMouseEnter: HEADER + `// Underline on hover
nodes.get('MyText').update({
  font: { ...nodes.get('MyText').node.font, textDecoration: 'underline' }
});
`,

    onMouseLeave: HEADER + `// Remove underline on leave
nodes.get('MyText').update({
  font: { ...nodes.get('MyText').node.font, textDecoration: 'none' }
});
`,

    onLoad: HEADER + `// On load: fetch today's quote and display it
(async () => {
  try {
    const res = await fetch('https://api.quotable.io/random');
    const q = await res.json();
    nodes.get('MyText').update({ content: q.content + '\\n— ' + q.author });
  } catch (e) {
    nodes.get('MyText').update({ content: 'Could not load quote.' });
  }
})();
`,
  },

  // ── Input ───────────────────────────────────────────
  input: {
    onValueChange: HEADER + `// Mirror the typed value into a Text node live
const val = event.value;           // event.value = current input string
nodes.get('MyText').update({ content: val });

// Validate: turn label red if empty
// const label = nodes.get('InputLabel');
// label.update({
//   font: { ...label.node.font, color: val.trim() ? '' : '#ef4444' }
// });
`,

    onClick: HEADER + `// Clear the input field when clicked (useful as a "reset" click)
nodes.get('MyInput').setValue('');
`,

    onLoad: HEADER + `// Pre-fill the input from a Storage node on canvas load
const stored = nodes.get('AppStorage').getValue();
if (stored?.username) {
  nodes.get('MyInput').setValue(stored.username);
}
`,

    onMouseEnter: HEADER + `// Show a helper label when hovering the input
nodes.get('HintLabel').update({ content: 'Type your name here…' });
`,

    onMouseLeave: HEADER + `// Hide the helper label when leaving
nodes.get('HintLabel').update({ content: '' });
`,
  },

  // ── Checkbox ────────────────────────────────────────
  checkbox: {
    onValueChange: HEADER + `// event.value = true/false (checked state)
const isChecked = event.value;

// Example 1: show/hide another node via opacity class
nodes.get('MyPanel').update({ class: isChecked ? 'visible' : 'hidden' });

// Example 2: persist the checkbox state to Storage
// nodes.get('AppStorage').setValue({
//   ...nodes.get('AppStorage').getValue(),
//   darkMode: isChecked,
// });

// Example 3: enable/disable a button label
// nodes.get('SubmitBtn').update({
//   content: isChecked ? 'Submit' : 'Please agree first',
// });
`,

    onLoad: HEADER + `// Restore checkbox state from Storage on load
const saved = nodes.get('AppStorage').getValue();
if (saved?.agreed !== undefined) {
  nodes.get('MyCheckbox').update({ checked: saved.agreed });
}
`,
  },

  // ── Radio ────────────────────────────────────────────
  radio: {
    onValueChange: HEADER + `// event.value = true when this radio is selected
if (event.value) {
  // Uncheck sibling radios (by name convention)
  nodes.get('Option2').update({ checked: false });
  nodes.get('Option3').update({ checked: false });

  // Update a display text
  nodes.get('Selection').update({ content: 'You picked Option 1' });
}
`,

    onLoad: HEADER + `// Restore radio selection from Storage
const saved = nodes.get('AppStorage').getValue();
if (saved?.selectedOption === 'option1') {
  nodes.get('MyRadio').update({ checked: true });
}
`,
  },

  // ── Label ────────────────────────────────────────────
  label: {
    onClick: HEADER + `// Cycle through label text options on click
const labels = ['Status: Active', 'Status: Idle', 'Status: Error'];
const lbl = nodes.get('MyLabel');
const curr = labels.indexOf(lbl.node.content ?? labels[0]);
lbl.update({ content: labels[(curr + 1) % labels.length] });
`,

    onMouseEnter: HEADER + `// Bold the label on hover
const lbl = nodes.get('MyLabel');
lbl.update({ font: { ...lbl.node.font, weight: '700' } });
`,

    onMouseLeave: HEADER + `// Restore label weight on leave
const lbl = nodes.get('MyLabel');
lbl.update({ font: { ...lbl.node.font, weight: '400' } });
`,

    onLoad: HEADER + `// Display a Storage value in the label on canvas load
const store = nodes.get('AppStorage');
const val = store.getValue();
nodes.get('MyLabel').update({
  content: val !== undefined ? 'Saved: ' + JSON.stringify(val) : 'No data yet'
});
`,
  },

  // ── Container ────────────────────────────────────────
  container: {
    onClick: HEADER + `// Toggle a CSS class on the container (e.g. for expand/collapse)
const c = nodes.get('MyContainer');
const expanded = c.node.class?.includes('expanded');
c.update({ class: expanded ? 'collapsed' : 'expanded' });
`,

    onMouseEnter: HEADER + `// Highlight the container with a shadow class on hover
nodes.get('MyContainer').update({ class: 'highlighted' });
`,

    onMouseLeave: HEADER + `// Remove highlight
nodes.get('MyContainer').update({ class: '' });
`,

    onLoad: HEADER + `// Initialize children on canvas load
// Read config from storage and set child node values
const cfg = nodes.get('AppStorage').getValue() ?? {};
if (cfg.title) nodes.get('TitleText').update({ content: cfg.title });
if (cfg.count) nodes.get('CountLabel').update({ content: String(cfg.count) });
`,
  },

  // ── Fetch ────────────────────────────────────────────
  fetch: {
    onClick: HEADER + `// Manually re-trigger a fetch by clearing the value
// (The FetchNode auto-fetches when switching to view mode.
//  This script lets you force-refresh on click.)
nodes.get('MyFetch').update({ value: undefined });

(async () => {
  const url = nodes.get('MyFetch').node.link;
  const res = await fetch(url);
  const data = await res.json();
  nodes.get('MyFetch').setValue(data);

  // Optionally mirror a field into a Text node:
  // nodes.get('ResultText').update({ content: data.title ?? JSON.stringify(data) });
})();
`,

    onLoad: HEADER + `// After the FetchNode loads its data, push a field into another node.
// Note: onLoad runs once when the canvas switches to view mode.
// By then the fetch may still be in-flight; use a small delay or
// rely on {FetchNode.value.field} template syntax in Text nodes instead.

setTimeout(() => {
  const fetched = nodes.get('MyFetch').getValue();
  if (fetched?.title) {
    nodes.get('TitleText').update({ content: fetched.title });
  }
}, 1500); // wait for fetch to complete
`,

    onMouseEnter: HEADER + `// Show a "loading" indicator while the user hovers
nodes.get('StatusLabel').update({ content: '🔄 Data from API' });
`,

    onMouseLeave: HEADER + `nodes.get('StatusLabel').update({ content: '' });
`,
  },

  // ── Storage ──────────────────────────────────────────
  storage: {
    onClick: HEADER + `// Clear the storage node's value (reset)
nodes.get('AppStorage').setValue(undefined);
nodes.get('StatusLabel').update({ content: 'Storage cleared!' });
`,

    onLoad: HEADER + `// On canvas load: read stored data and distribute to other nodes.
// This is the recommended pattern for persisting state across sessions.
const store = nodes.get('AppStorage');
const data = store.getValue();
if (!data) return; // nothing saved yet

if (data.username) nodes.get('UsernameInput').setValue(data.username);
if (data.count !== undefined) nodes.get('Counter').update({ content: String(data.count) });
if (data.darkMode) nodes.get('DarkToggle').update({ checked: data.darkMode });
`,

    onMouseEnter: HEADER + `// Preview the stored value in a text node on hover
const val = nodes.get('AppStorage').getValue();
nodes.get('PreviewText').update({
  content: val !== undefined ? JSON.stringify(val, null, 2) : '(empty)'
});
`,

    onMouseLeave: HEADER + `// Hide preview
nodes.get('PreviewText').update({ content: '' });
`,
  },

  // ── Progress ─────────────────────────────────────────
  progress: {
    onClick: HEADER + `// Reset progress to 0 on click
nodes.get('MyProgress').setValue(0);

// Or animate up to 100 step by step:
// let v = 0;
// const id = setInterval(() => {
//   v += 5;
//   nodes.get('MyProgress').setValue(v);
//   if (v >= 100) clearInterval(id);
// }, 80);
`,

    onLoad: HEADER + `// Restore saved progress from storage
const saved = nodes.get('AppStorage').getValue();
if (saved?.progress !== undefined) {
  nodes.get('MyProgress').setValue(saved.progress);
}
`,
  },

  // ── Link ─────────────────────────────────────────────
  link: {
    onClick: HEADER + `// Build a dynamic URL from an Input node's value
const query = nodes.get('SearchInput').getValue() ?? '';
nodes.get('MyLink').update({
  link: 'https://www.google.com/search?q=' + encodeURIComponent(query)
});
// The link will open on the next click (in view mode the <a> fires after this)
`,

    onMouseEnter: HEADER + `// Show a tooltip-style label when hovering the link
nodes.get('TooltipLabel').update({ content: '🔗 Opens: ' + nodes.get('MyLink').node.link });
`,

    onMouseLeave: HEADER + `nodes.get('TooltipLabel').update({ content: '' });
`,
  },
};

// ── Utility ──────────────────────────────────────────────────────────────────
/** Return an example script for the given node type + event, or "" if none */
export function getScriptExample(
  nodeType: NodeType,
  event: EventName
): string {
  return SCRIPT_EXAMPLES[nodeType]?.[event] ?? "";
}

/** Events that are relevant for a given node type */
export const RELEVANT_EVENTS: Partial<Record<NodeType, EventName[]>> = {
  container: ["onClick", "onMouseEnter", "onMouseLeave", "onLoad"],
  text:      ["onClick", "onMouseEnter", "onMouseLeave", "onLoad"],
  image:     ["onClick", "onMouseEnter", "onMouseLeave", "onLoad"],
  link:      ["onClick", "onMouseEnter", "onMouseLeave", "onLoad"],
  button:    ["onClick", "onMouseEnter", "onMouseLeave", "onLoad"],
  custom:    ["onClick", "onMouseEnter", "onMouseLeave", "onLoad"],
  progress:  ["onClick", "onLoad"],
  radio:     ["onValueChange", "onLoad"],
  checkbox:  ["onValueChange", "onLoad"],
  input:     ["onValueChange", "onClick", "onMouseEnter", "onMouseLeave", "onLoad"],
  label:     ["onClick", "onMouseEnter", "onMouseLeave", "onLoad"],
  fetch:     ["onClick", "onLoad", "onMouseEnter", "onMouseLeave"],
  storage:   ["onClick", "onLoad", "onMouseEnter", "onMouseLeave"],
};
