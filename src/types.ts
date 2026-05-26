export type Mode = "edit" | "view";

export type NodeType =
  | "container"
  | "text"
  | "image"
  | "link"
  | "button"
  | "custom"
  | "progress"
  | "radio"
  | "checkbox"
  | "input"
  | "label"
  | "fetch"
  | "storage";

export type FontProps = {
  size?: string;        // e.g. "16px", "1.2rem"
  family?: string;      // e.g. "Inter, sans-serif"
  color?: string;       // e.g. "#ffffff", "red"
  weight?: string;      // e.g. "400", "bold"
  style?: string;       // "normal" | "italic" | "oblique"
  lineHeight?: string;  // e.g. "1.5"
  letterSpacing?: string; // e.g. "0.05em"
  textAlign?: string;   // "left" | "center" | "right" | "justify"
  textDecoration?: string; // "none" | "underline" | "line-through"
  textTransform?: string;  // "none" | "uppercase" | "lowercase" | "capitalize"
  overflow?: string;    // "visible" | "hidden" | "clip" | "ellipsis"
};

export type Node = {
  key: string;
  name: string;
  is: NodeType;
  position: [number, number]; // [x, y] in canvas space
  size: [number, number];     // [width, height]
  Zindex: number;
  class?: string;             // extra tailwind / css classes
  // type-specific fields
  content?: string;           // text / button label / storage key
  link?: string;              // href for link, src for image, api url for fetch
  code?: string;              // JSX source for custom nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;                // progress value, input value, fetched data
  checked?: boolean;          // radio/checkbox state
  resize?: boolean;           // whether resize handle is shown
  children?: Node[];
  font?: FontProps;           // typography properties
  icon?: string;              // lucide icon name

  // Scripting / Events
  onClick?: string;
  onMouseEnter?: string;
  onMouseLeave?: string;
  onValueChange?: string;
  onLoad?: string;
};

export type CanvasData = {
  nodes: Node[];
};
