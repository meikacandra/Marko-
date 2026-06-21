const BASE = 'https://www.themealdb.com/api/json/v1/1';
const get  = async (ep) => { const r = await fetch(BASE + ep); if (!r.ok) throw new Error('MealDB error'); return r.json(); };

export const searchMealsByName   = (name) => get(`/search.php?s=${encodeURIComponent(name)}`);
export const getMealById         = (id)   => get(`/lookup.php?i=${id}`);
export const getMealsByCategory  = (cat)  => get(`/filter.php?c=${encodeURIComponent(cat)}`);
export const getMealsByArea      = (area) => get(`/filter.php?a=${encodeURIComponent(area)}`);
export const getAllCategories     = ()    => get('/categories.php');
export const getRandomMeal       = ()    => get('/random.php');
