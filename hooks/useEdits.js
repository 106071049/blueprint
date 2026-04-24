'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ai-center-blueprint-edits-v1';

function loadEdits() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function defaultEdit() {
  return { plannedStart: '', plannedEnd: '', owner: '', notes: '', subtasks: [] };
}

export function useEdits() {
  const [edits, setEdits] = useState({});
  const [saveFlash, setSaveFlash] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setEdits(loadEdits());
  }, []);

  const persist = useCallback((next) => {
    setEdits(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1200);
  }, []);

  const getEdit = useCallback((id) => edits[id] || defaultEdit(), [edits]);

  const updateEdit = useCallback((id, patch) => {
    setEdits((prev) => {
      const next = { ...prev, [id]: { ...defaultEdit(), ...(prev[id] || {}), ...patch } };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1200);
  }, []);

  const addSubtask = useCallback((id, title) => {
    const st = {
      id: 'st-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title,
      done: false,
      dueDate: '',
    };
    setEdits((prev) => {
      const cur = prev[id] || defaultEdit();
      const next = { ...prev, [id]: { ...cur, subtasks: [...cur.subtasks, st] } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1200);
  }, []);

  const patchSubtask = useCallback((id, stId, patch) => {
    setEdits((prev) => {
      const cur = prev[id] || defaultEdit();
      const next = {
        ...prev,
        [id]: {
          ...cur,
          subtasks: cur.subtasks.map((s) => (s.id === stId ? { ...s, ...patch } : s)),
        },
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1200);
  }, []);

  const removeSubtask = useCallback((id, stId) => {
    setEdits((prev) => {
      const cur = prev[id] || defaultEdit();
      const next = {
        ...prev,
        [id]: { ...cur, subtasks: cur.subtasks.filter((s) => s.id !== stId) },
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1200);
  }, []);

  return { edits, getEdit, updateEdit, addSubtask, patchSubtask, removeSubtask, saveFlash };
}

export function getProgressWithEdits(project, edit) {
  if (edit && edit.subtasks && edit.subtasks.length > 0) {
    const done = edit.subtasks.filter((s) => s.done).length;
    return Math.round((done / edit.subtasks.length) * 100);
  }
  return project.progress || 0;
}
