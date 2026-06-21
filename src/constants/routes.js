export const ROUTES = {
  HOME: '/',

  // Resep sehat (MealDB)
  RECIPES:       '/recipes',
  RECIPE_DETAIL: '/recipes/:id',

  // Resep saya (CRUD + info gizi)
  MY_RECIPES:        '/my-recipes',
  MY_RECIPES_CREATE: '/my-recipes/create',
  MY_RECIPES_EDIT:   '/my-recipes/edit/:id',

  // Fitur kesehatan
  FAVORITES:    '/favorites',
  MEAL_PLANNER: '/meal-planner',
  TRACKER:      '/tracker',      // tracker asupan harian
  EXERCISE:     '/exercise',     // rekomendasi olahraga

  // Akun
  PROFILE:  '/profile',
  LOGIN:    '/login',
  REGISTER: '/register',
};
