import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const key   = (uid) => `marko_exercise_log_${uid}`;
const read  = (uid) => { try { return JSON.parse(localStorage.getItem(key(uid))) ?? []; } catch { return []; } };
const write = (uid, data) => localStorage.setItem(key(uid), JSON.stringify(data));

// log shape: { logId, date, exerciseId, name, type, duration, caloriesBurned, loggedAt }
export function useExercise() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => { setLogs(user ? read(user.uid) : []); }, [user]);

  const sync = useCallback((data) => { write(user.uid, data); setLogs(data); }, [user]);

  const logExercise = useCallback((exerciseData) => {
    if (!user) return;
    const entry = {
      logId:    crypto.randomUUID(),
      date:     new Date().toISOString().split('T')[0],
      loggedAt: new Date().toISOString(),
      ...exerciseData,
    };
    sync([entry, ...read(user.uid)]);
  }, [user, sync]);

  const removeLog = useCallback((logId) => {
    if (!user) return;
    sync(read(user.uid).filter((l) => l.logId !== logId));
  }, [user, sync]);

  const getTodayLogs = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter((l) => l.date === today);
  }, [logs]);

  const getTotalCaloriesBurned = useCallback((dateKey) => {
    return logs.filter((l) => l.date === dateKey).reduce((sum, l) => sum + (l.caloriesBurned ?? 0), 0);
  }, [logs]);

  return { logs, logExercise, removeLog, getTodayLogs, getTotalCaloriesBurned };
}
