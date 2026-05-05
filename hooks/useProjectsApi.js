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
  const [pendingReorderIds, setPendingReorderIds] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, duration = 4000) => {
    const id = Date.now();
    setToast({ id, message: msg, duration });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, duration);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

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

      // 若改的是排程相關欄位，後端會 cascade 後續項目，要重抑全部以反映
      const scheduleKeys = ['durationDays', 'plannedStart', 'plannedEnd'];
      if (scheduleKeys.some((k) => k in patch)) {
        await refresh();
      }
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

  const reorderProjects = useCallback((orderedIds) => {
    // 僅更新前端 state，並記錄有待儲存的排序
    setProjects((prev) => {
      const idx = new Map(orderedIds.map((id, i) => [id, i]));
      // 對有在 orderedIds 的項目依新順序；其他項目保持原位 (在末尾)
      const sortable = prev.filter((p) => idx.has(p.id)).sort((a, b) => idx.get(a.id) - idx.get(b.id));
      const rest = prev.filter((p) => !idx.has(p.id));
      return [...sortable, ...rest];
    });
    setPendingReorderIds(orderedIds);
  }, []);

  const saveReorder = useCallback(async () => {
    if (!pendingReorderIds) return;
    setIsSavingOrder(true);
    try {
      await req('/api/projects/reorder', {
        method: 'POST', headers: json, body: JSON.stringify({ ids: pendingReorderIds }),
      });
      setPendingReorderIds(null);
      flash();
      refresh();
      showToast('排序已儲存！並且已同步更新至資料庫中。');
    } catch (e) {
      setError('排序失敗：' + e.message);
      refresh();
    } finally {
      setIsSavingOrder(false);
    }
  }, [pendingReorderIds, refresh]);

  const cancelReorder = useCallback(() => {
    setPendingReorderIds(null);
    refresh(); // 重新向後端要資料，放棄目前的排序變更
  }, [refresh]);

  // === Settings + Schedule recompute ===
  const [settings, setSettings] = useState({
    'schedule.globalStartDate': '2026-04-27',
    'schedule.defaultDurationDays': '20',
  });

  const refreshSettings = useCallback(async () => {
    try {
      const data = await req('/api/settings');
      setSettings(data);
    } catch (e) {
      // silent fail; use defaults
    }
  }, []);

  useEffect(() => { refreshSettings(); }, [refreshSettings]);

  const updateSettings = useCallback(async (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    try {
      await req('/api/settings', {
        method: 'PUT', headers: json, body: JSON.stringify(patch),
      });
      flash();
    } catch (e) {
      setError('\u8a2d\u5b9a\u5132\u5b58\u5931\u6557\uff1a' + e.message);
      refreshSettings();
    }
  }, [refreshSettings]);

  const recomputeSchedule = useCallback(async (opts = {}) => {
    try {
      await req('/api/projects/recompute-schedule', {
        method: 'POST', headers: json, body: JSON.stringify(opts),
      });
      await refresh();
      flash();
    } catch (e) {
      setError('\u91cd\u65b0\u8a08\u7b97\u6392\u7a0b\u5931\u6557\uff1a' + e.message);
    }
  }, [refresh]);

  return {
    projects, loading, error, saveFlash,
    refresh, updateProject, createProject, deleteProject,
    addSubtask, updateSubtask, deleteSubtask,
    reorderProjects, pendingReorderIds, saveReorder, cancelReorder, isSavingOrder,
    settings, updateSettings, recomputeSchedule,
    toast, hideToast,
    clearError: () => setError(null),
  };
}
