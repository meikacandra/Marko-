import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const key   = (uid) => `marko_meal_plan_${uid}`;
const read  = (uid) => { try { return JSON.parse(localStorage.getItem(key(uid))) ?? {}; } catch { return {}; } };
const write = (uid, data) => localStorage.setItem(key(uid), JSON.stringify(data));

// plan shape: { "YYYY-MM-DD": [{ planId, mealTime, recipeId, source, title, thumbnail, nutrition }] }
export function useMealPlanner() {
  const { user } = useAuth();
  const [plan, setPlan]       = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPlan(user ? read(user.uid) : {}); setLoading(false); }, [user]);

  const sync = useCallback((data) => { write(user.uid, data); setPlan(data); }, [user]);

  const addMeal = useCallback((date, mealData) => {
    if (!user) return;
    const cur = read(user.uid);
    sync({ ...cur, [date]: [...(cur[date] ?? []), { planId: crypto.randomUUID(), addedAt: new Date().toISOString(), ...mealData }] });
  }, [user, sync]);

  const removeMeal = useCallback((date, planId) => {
    if (!user) return;
    const cur      = read(user.uid);
    const dayMeals = (cur[date] ?? []).filter((m) => m.planId !== planId);
    const updated  = { ...cur };
    dayMeals.length ? (updated[date] = dayMeals) : delete updated[date];
    sync(updated);
  }, [user, sync]);

  const getMealsForDate = useCallback((date) => plan[date] ?? [], [plan]);

  return { plan, loading, addMeal, removeMeal, getMealsForDate };
}
