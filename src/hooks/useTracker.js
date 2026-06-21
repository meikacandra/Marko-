import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { todayKey } from '../utils/formatDate';
import { sumNutrition } from '../utils/nutrition';

const key   = (uid) => `marko_tracker_${uid}`;
const read  = (uid) => { try { return JSON.parse(localStorage.getItem(key(uid))) ?? {}; } catch { return {}; } };
const write = (uid, data) => localStorage.setItem(key(uid), JSON.stringify(data));

// tracker shape:
// { "YYYY-MM-DD": { logs: [{ logId, mealTime, title, thumbnail, nutrition:{calories,protein,carbs,fat}, loggedAt }] } }
export function useTracker(dateKey = todayKey()) {
  const { user } = useAuth();
  const [allData, setAllData] = useState({});

  useEffect(() => { setAllData(user ? read(user.uid) : {}); }, [user]);

  const sync = useCallback((data) => { write(user.uid, data); setAllData(data); }, [user]);

  const logs      = allData[dateKey]?.logs ?? [];
  const totals    = sumNutrition(logs);

  const addLog = useCallback((mealData) => {
    if (!user) return;
    const cur    = read(user.uid);
    const day    = cur[dateKey] ?? { logs: [] };
    const entry  = { logId: crypto.randomUUID(), loggedAt: new Date().toISOString(), ...mealData };
    sync({ ...cur, [dateKey]: { ...day, logs: [...day.logs, entry] } });
  }, [user, dateKey, sync]);

  const removeLog = useCallback((logId) => {
    if (!user) return;
    const cur  = read(user.uid);
    const day  = cur[dateKey] ?? { logs: [] };
    sync({ ...cur, [dateKey]: { ...day, logs: day.logs.filter((l) => l.logId !== logId) } });
  }, [user, dateKey, sync]);

  // Ambil ringkasan untuk semua tanggal (untuk grafik history)
  const getHistory = useCallback((days = 7) => {
    const cur = read(user?.uid ?? '');
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const dk = d.toISOString().split('T')[0];
      return { date: dk, ...sumNutrition(cur[dk]?.logs ?? []) };
    });
  }, [user]);

  return { logs, totals, addLog, removeLog, getHistory };
}
