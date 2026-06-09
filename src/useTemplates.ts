import { useState, useEffect, useCallback } from "react";
import type { Node } from "./types";

const STORAGE_KEY = "home-canvas-templates";

export type Template = {
  id: string;
  name: string;
  nodes: Node[];
};

function loadTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Template[];
  } catch {
    // corrupted
  }
  return [];
}

function saveTemplatesToStorage(templates: Template[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>(loadTemplates);

  useEffect(() => {
    saveTemplatesToStorage(templates);
  }, [templates]);

  const saveTemplate = useCallback((name: string, nodes: Node[]) => {
    const newTemplate: Template = {
      id: Math.random().toString(36).slice(2, 10),
      name,
      nodes,
    };
    setTemplates((prev) => [...prev, newTemplate]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { templates, saveTemplate, deleteTemplate };
}
