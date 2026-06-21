import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const key   = (uid) => `marko_favorites_${uid}`;
const read  = (uid) => { try { return JSON.parse(localStorage.getItem(key(uid))) ?? []; } catch { return []; } };
const write = (uid, data) => localStorage.setItem(key(uid), JSON.stringify(data));

// favorite shape: { favId, recipeId, source, title, thumbnail, category, area, savedAt }
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => { setFavorites(user ? read(user.uid) : []); }, [user]);

  const sync = useCallback((data) => { write(user.uid, data); setFavorites(data); }, [user]);

  const addFavorite = useCallback((recipe) => {
    if (!user) return;
    const cur = read(user.uid);
    if (cur.some((f) => f.recipeId === recipe.recipeId)) return;
    sync([...cur, { favId: crypto.randomUUID(), savedAt: new Date().toISOString(), ...recipe }]);
  }, [user, sync]);

  const removeFavorite = useCallback((recipeId) => {
    if (!user) return;
    sync(read(user.uid).filter((f) => f.recipeId !== recipeId));
  }, [user, sync]);

  const toggleFavorite  = useCallback((recipe) => {
    if (!user) return;
    read(user.uid).some((f) => f.recipeId === recipe.recipeId)
      ? removeFavorite(recipe.recipeId)
      : addFavorite(recipe);
  }, [user, addFavorite, removeFavorite]);

  const isFavorite = useCallback((recipeId) => favorites.some((f) => f.recipeId === recipeId), [favorites]);

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite };
}
