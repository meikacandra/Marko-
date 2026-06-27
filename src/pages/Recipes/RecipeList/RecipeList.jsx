import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getAllCategories,
  searchRecipes,
  getRecipesByCategory,
} from '../../../services/localRecipes/api';
import {
  searchMealsByName,
  getMealsByCategory,
  getAllCategories as getMealDBCategories,
} from '../../../services/mealdb/api';
import { useFavorites } from '../../../hooks/useFavorites';
import { useAuth } from '../../../context/AuthContext';

// ── Sub-components ────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  );
}

function RecipeCard({ recipe, isFav, onToggleFav, showFav }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      <Link to={`/recipes/${recipe.id}?source=local`} className="block flex-1">
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={recipe.thumbnail}
            alt={recipe.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentNode.innerHTML =
                '<div class="w-full h-full flex items-center justify-center text-4xl bg-green-50">🍽️</div>';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">
            {recipe.title}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {recipe.category && (
              <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                {recipe.category}
              </span>
            )}
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {showFav && (
        <div className="px-3 pb-3">
          <button
            onClick={() =>
              onToggleFav({
                recipeId:  recipe.id,
                source:    'local',
                title:     recipe.title,
                thumbnail: recipe.thumbnail,
                category:  recipe.category,
                area:      'Indonesia',
              })
            }
            className={`w-full text-xs py-1.5 rounded-lg border transition-colors font-medium ${
              isFav
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
            }`}
          >
            {isFav ? '❤️ Tersimpan' : '🤍 Simpan'}
          </button>
        </div>
      )}
    </div>
  );
}

function MealDBCard({ meal, isFav, onToggleFav, showFav }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      <Link to={`/recipes/${meal.id}?source=mealdb`} className="block flex-1">
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={meal.thumbnail}
            alt={meal.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentNode.innerHTML =
                '<div class="w-full h-full flex items-center justify-center text-4xl bg-orange-50">🌍</div>';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">
            {meal.title}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {meal.category && (
              <span className="text-[10px] bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full font-medium">
                {meal.category}
              </span>
            )}
            {meal.area && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {meal.area}
              </span>
            )}
          </div>
        </div>
      </Link>

      {showFav && (
        <div className="px-3 pb-3">
          <button
            onClick={() =>
              onToggleFav({
                recipeId:  meal.id,
                source:    'mealdb',
                title:     meal.title,
                thumbnail: meal.thumbnail,
                category:  meal.category,
                area:      meal.area,
              })
            }
            className={`w-full text-xs py-1.5 rounded-lg border transition-colors font-medium ${
              isFav
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
            }`}
          >
            {isFav ? '❤️ Tersimpan' : '🤍 Simpan'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function RecipeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q        = searchParams.get('q')        ?? '';
  const category = searchParams.get('category') ?? '';
  const mode     = searchParams.get('mode')     ?? 'local';

  const isInternational = mode === 'mealdb';

  const [loading,          setLoading]          = useState(true);
  const [inputVal,         setInputVal]         = useState(q);
  const [mealdbMeals,      setMealdbMeals]      = useState([]);
  const [mealdbCategories, setMealdbCategories] = useState([]);

  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  const localCategories = useMemo(() => getAllCategories(), []);

  const localMeals = useMemo(() => {
    if (isInternational) return [];
    if (category) return getRecipesByCategory(category);
    return searchRecipes(q);
  }, [q, category, isInternational]);

  // Fetch MealDB categories once on first switch to international
  useEffect(() => {
    if (!isInternational || mealdbCategories.length > 0) return;
    getMealDBCategories()
      .then((data) => setMealdbCategories(data.categories ?? []))
      .catch(() => {});
  }, [isInternational, mealdbCategories.length]);

  // Fetch MealDB meals when query/category changes in international mode
  useEffect(() => {
    if (!isInternational) return;

    if (!q && !category) {
      setMealdbMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    (async () => {
      try {
        let raw = [];
        if (category) {
          const data = await getMealsByCategory(category);
          raw = (data.meals ?? []).map((m) => ({
            id:        m.idMeal,
            title:     m.strMeal,
            thumbnail: m.strMealThumb,
            category,
            area:      '',
          }));
        } else {
          const data = await searchMealsByName(q);
          raw = (data.meals ?? []).map((m) => ({
            id:        m.idMeal,
            title:     m.strMeal,
            thumbnail: m.strMealThumb,
            category:  m.strCategory,
            area:      m.strArea,
          }));
        }
        if (!controller.signal.aborted) setMealdbMeals(raw);
      } catch {
        if (!controller.signal.aborted) setMealdbMeals([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [q, category, isInternational]);

  // Local mode: short artificial delay for UX
  useEffect(() => {
    if (isInternational) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [q, category, isInternational]);

  const handleSearch = (e) => {
    e.preventDefault();
    const val = inputVal.trim();
    const params = { mode };
    if (val) params.q = val;
    setSearchParams(params);
  };

  const selectCategory = (cat) => {
    setInputVal('');
    const params = { mode };
    if (cat) params.category = cat;
    setSearchParams(params);
  };

  const switchMode = (newMode) => {
    setInputVal('');
    setSearchParams({ mode: newMode });
  };

  const resetAll = () => {
    setInputVal('');
    setSearchParams({ mode });
  };

  const meals = isInternational ? mealdbMeals : localMeals;

  const categoryPills = isInternational
    ? mealdbCategories.map((c) => ({ id: c.idCategory, name: c.strCategory, thumb: c.strCategoryThumb }))
    : localCategories;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">
          {isInternational ? 'Jelajahi Resep Internasional' : 'Jelajahi Resep Masakan Indonesia'}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {isInternational
            ? 'Temukan resep dari seluruh dunia via TheMealDB'
            : 'Resep favorit mahasiswa — mudah, bergizi, dan terjangkau'}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => switchMode('local')}
          className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
            !isInternational
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🇮🇩 Lokal
        </button>
        <button
          onClick={() => switchMode('mealdb')}
          className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
            isInternational
              ? 'bg-white text-orange-500 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🌍 Internasional
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={
            isInternational
              ? 'Search recipes... (e.g. pasta, chicken, sushi)'
              : 'Cari resep... (contoh: nasi goreng, ayam, soto, tempe)'
          }
          className="w-full pl-10 pr-24 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition bg-white"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          Cari
        </button>
      </form>

      {/* Category pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-3 mb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => selectCategory('')}
          className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
            !category
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600'
          }`}
        >
          Semua
        </button>
        {categoryPills.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategory(cat.name)}
            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
              category === cat.name
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600'
            }`}
          >
            {cat.thumb && (
              <img
                src={cat.thumb}
                alt=""
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-4 h-4 rounded-full object-cover"
              />
            )}
            {cat.name}
          </button>
        ))}
      </div>

      {/* International: prompt to search when idle */}
      {isInternational && !q && !category && !loading && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🌍</p>
          <p className="font-semibold text-gray-700 text-lg">Explore International Recipes</p>
          <p className="text-sm text-gray-400 mt-1.5">
            Search for a dish or pick a category above to get started.
          </p>
        </div>
      )}

      {/* Result info */}
      {!loading && (q || category || !isInternational) && (
        <p className="text-xs text-gray-400 mb-3">
          {meals.length > 0 ? (
            <>
              <span className="font-medium text-gray-600">{meals.length}</span> resep ditemukan
              {category && <> dalam kategori <span className="font-medium text-green-600">"{category}"</span></>}
              {q        && <> untuk <span className="font-medium text-green-600">"{q}"</span></>}
            </>
          ) : (
            'Tidak ada resep ditemukan.'
          )}
        </p>
      )}

      {/* Grid */}
      {(q || category || !isInternational) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : isInternational
              ? meals.map((meal) => (
                  <MealDBCard
                    key={meal.id}
                    meal={meal}
                    isFav={isFavorite(meal.id)}
                    onToggleFav={toggleFavorite}
                    showFav={isAuthenticated}
                  />
                ))
              : meals.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isFav={isFavorite(recipe.id)}
                    onToggleFav={toggleFavorite}
                    showFav={isAuthenticated}
                  />
                ))
          }
        </div>
      )}

      {/* Empty state */}
      {!loading && (q || category) && meals.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🥘</p>
          <p className="font-semibold text-gray-700 text-lg">Resep tidak ditemukan</p>
          <p className="text-sm text-gray-400 mt-1.5">
            {isInternational
              ? 'Try another keyword like "chicken", "pasta", or "sushi".'
              : 'Coba kata kunci lain seperti "ayam", "nasi", atau "soto".'}
          </p>
          <button
            onClick={resetAll}
            className="mt-5 text-sm text-green-600 font-semibold hover:underline"
          >
            Reset pencarian
          </button>
        </div>
      )}

      {/* Login nudge for guests */}
      {!isAuthenticated && meals.length > 0 && !loading && (
        <div className="mt-8 bg-green-50 border border-green-100 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3">
          <p className="text-sm text-green-700">
            💡 <span className="font-medium">Masuk</span> untuk menyimpan resep favorit kamu.
          </p>
          <Link
            to="/login"
            className="flex-shrink-0 text-xs bg-green-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
          >
            Masuk
          </Link>
        </div>
      )}
    </div>
  );
}
