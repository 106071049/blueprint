'use client';

import { useCallback, useEffect, useState } from 'react';

const json = { 'Content-Type': 'application/json' };

async function req(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const e = await res.json(); msg = e.error || msg; } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function useProjectsApi() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveFlash, setSaveFlash] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await req('/api/projects');
      setProjects(data);
      setError(null);
    } catch (e) {
      setError('無法載入資料：' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const flash = () => {
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1200);
  };

  // === Projects ===
  const updateProject = useCallback(async (id, patch) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
    try {
      const updated = await req(`/api/projects/${id}`, {
        method: 'PATCH', headers: json, body: JSON.stringify(patch),
      });
      setProjects((prev) => prev.map((p) => p.id === id ? updated : p));
      flash();
    } catch (e) {
      setError('保存失敗：' + e.message);
      refresh();
    }
  }, [refresh]);

  const createProject = useCallback(async (data) => {
    try {
      const created = await req('/api/projects', {
        method: 'POST', headers: json, body: JSON.stringify(data),
      });
      setProjects((prev) => [...prev, created]);
      flash();
      return created;
    } catch (e) {
      setError('建立失敗：' + e.message);
      throw e;
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    const backup = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await req(`/api/projects/${id}`, { method: 'DELETE' });
      flash();
    } catch (e) {
      setError('刪除失敗：' + e.message);
      setProjects(backup);
    }
  }, [projects]);

  // === Subtasks ===
  const addSubtask = useCallback(async (projectId, title) => {
    try {
      const st = await req(`/api/projects/${projectId}/subtasks`, {
        method: 'POST', headers: json, body: JSON.stringify({ title }),
      });
      setProjects((prev) => prev.map((p) =>
        p.id === projectId ? { ...p, subtasks: [...p.subtasks, st] } : p
      ));
      flash();
    } catch (e) {
      setError('新增細項失敗：' + e.message);
    }
  }, []);

  const updateSubtask = useCallback(async (projectId, subtaskId, patch) => {
    setProjects((prev) => prev.map((p) =>
      p.id === projectId
        ? { ...p, subtasks: p.subtasks.map((s) => s.id === subtaskId ? { ...s, ...patch } : s) }
        : p
    ));
    try {
      await req(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH', headers: json, body: JSON.stringify(patch),
      });
      flash();
    } catch (e) {
      setError('更新細項失敗：' + e.message);
      refresh();
    }
  }, [refresh]);

  const deleteSubtask = useCallback(async (projectId, subtaskId) => {
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, subtasks: p.subtasks.filter((s) => s.id !== subtaskId) } : p
    ));
    try {
      await req(`/api/subtasks/${subtaskId}`, { method: 'DELETE' });
      flash();
    } catch (e) {
      setError('刪除細項失敗：' + e.message);
      refresh();
    }
  }, [refresh]);

  const reorderProjects = useCallback(async (orderedIds) => {
    // 樂觀更新：依 orderedIds 重新排列 state
    setProjects((prev) => {
      const idx = new Map(orderedIds.map((id, i) => [id, i]));
      // 對有在 orderedIds 的項目依新順序；其他項目保持原位 (在末尾)
      const sortable = prev.filter((p) => idx.has(p.id)).sort((a, b) => idx.get(a.id) - idx.get(b.id));
      const rest = prev.filter((p) => !idx.has(p.id));
      return [...sortable, ...rest];
    });
    try {
      await req('/api/projects/reorder', {
        method: 'POST', headers: json, body: JSON.stringify({ ids: orderedIds }),
      });
      flash();
    } catch (e) {
      setError('\u6392\u5e8f\u5931\u6557\uff1a' + e.message);
      refresh();
    }
  }, [refresh]);

  return {
    projects, loading, error, saveFlash,
    refresh, updateProject, createProject, deleteProject,
    addSubtask, updateSubtask, deleteSubtask,
    reorderProjects,
    clearError: () => setError(null),
  };
}
