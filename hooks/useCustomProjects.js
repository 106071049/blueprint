'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ai-center-custom-projects-v1';

function load() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function useCustomProjects() {
  const [custom, setCustom] = useState([]);

  useEffect(() => { setCustom(load()); }, []);

  const persist = useCallback((next) => {
    setCustom(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addProject = useCallback((p) => {
    const item = {
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      progress: p.status === '已完成' ? 100 : (p.status === '進行中' ? 50 : 0),
      isCustom: true,
      createdAt: new Date().toISOString(),
      ...p,
    };
    setCustom((prev) => {
      const next = [...prev, item];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return item;
  }, []);

  const removeProject = useCallback((id) => {
    setCustom((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { custom, addProject, removeProject };
}
