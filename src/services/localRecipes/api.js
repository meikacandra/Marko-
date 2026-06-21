import { INDONESIAN_RECIPES, INDONESIAN_CATEGORIES } from '../../data/indonesianRecipes';

export const getAllCategories = () => INDONESIAN_CATEGORIES;

export const searchRecipes = (query = '') => {
  if (!query.trim()) return INDONESIAN_RECIPES;
  const q = query.toLowerCase();
  return INDONESIAN_RECIPES.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(q)),
  );
};

export const getRecipesByCategory = (category) =>
  INDONESIAN_RECIPES.filter((r) => r.category === category);

export const getRecipeById = (id) =>
  INDONESIAN_RECIPES.find((r) => r.id === id) ?? null;

export const getRandomRecipes = (count = 6) => {
  const shuffled = [...INDONESIAN_RECIPES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
