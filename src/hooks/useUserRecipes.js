import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const key   = (uid) => `marko_my_recipes_${uid}`;
const read  = (uid) => { try { return JSON.parse(localStorage.getItem(key(uid))) ?? []; } catch { return []; } };
const write = (uid, data) => localStorage.setItem(key(uid), JSON.stringify(data));

// recipe shape: { id, authorId, title, category, thumbnail, dietTags,
//                 ingredients[{name,amount}], instructions[string],
//                 nutrition:{calories,protein,carbs,fat,fiber},
//                 createdAt, updatedAt }
export function useUserRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setRecipes(user ? read(user.uid) : []); setLoading(false); }, [user]);

  const sync = useCallback((data) => { write(user.uid, data); setRecipes(data); }, [user]);

  const addRecipe    = useCallback((fields) => {
    if (!user) return null;
    const now = new Date().toISOString();
    const r   = { id: crypto.randomUUID(), authorId: user.uid, ...fields, createdAt: now, updatedAt: now };
    sync([r, ...read(user.uid)]);
    return r;
  }, [user, sync]);

  const updateRecipe = useCallback((id, fields) => {
    if (!user) return;
    sync(read(user.uid).map((r) => r.id === id ? { ...r, ...fields, updatedAt: new Date().toISOString() } : r));
  }, [user, sync]);

  const deleteRecipe = useCallback((id) => {
    if (!user) return;
    sync(read(user.uid).filter((r) => r.id !== id));
  }, [user, sync]);

  const getRecipeById = useCallback((id) => user ? read(user.uid).find((r) => r.id === id) ?? null : null, [user]);

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, getRecipeById };
}
