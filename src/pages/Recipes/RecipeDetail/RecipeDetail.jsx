import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getMealById } from '../../../services/mealdb/api';
import { getRecipeById as getLocalRecipeById } from '../../../services/localRecipes/api';
import { useUserRecipes } from '../../../hooks/useUserRecipes';
import { useFavorites } from '../../../hooks/useFavorites';
import { useAuth } from '../../../context/AuthContext';

// ── Data helpers ──────────────────────────────────────────────────────────────

const extractIngredients = (meal) => {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]?.trim();
    const mea = meal[`strMeasure${i}`]?.trim();
    if (ing) items.push({ name: ing, amount: mea ?? '' });
  }
  return items;
};

const normalizeMealDB = (meal) => ({
  id:          meal.idMeal,
  title:       meal.strMeal,
  thumbnail:   meal.strMealThumb,
  category:    meal.strCategory ?? '',
  area:        meal.strArea     ?? '',
  tags:        meal.strTags ? meal.strTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  ingredients: extractIngredients(meal),
  steps:       (meal.strInstructions ?? '')
                 .split(/\r?\n/)
                 .map((s) => s.trim())
                 .filter(Boolean),
  youtube:     meal.strYoutube ?? '',
  sourceUrl:   meal.strSource  ?? '',
  nutrition:   null,
  isUserRecipe: false,
  authorId:    null,
});

const normalizeUser = (recipe) => ({
  id:          recipe.id,
  title:       recipe.title,
  thumbnail:   recipe.thumbnail ?? '',
  category:    recipe.category  ?? '',
  area:        '',
  tags:        recipe.dietTags  ?? [],
  ingredients: (recipe.ingredients ?? []).map((i) => ({ name: i.name, amount: i.amount })),
  steps:       recipe.instructions ?? [],
  youtube:     '',
  sourceUrl:   '',
  nutrition:   recipe.nutrition ?? null,
  isUserRecipe: true,
  authorId:    recipe.authorId,
});

const normalizeLocal = (recipe) => ({
  id:          recipe.id,
  title:       recipe.title,
  thumbnail:   recipe.thumbnail ?? '',
  category:    recipe.category  ?? '',
  area:        'Indonesia',
  tags:        recipe.tags      ?? [],
  ingredients: recipe.ingredients ?? [],
  steps:       recipe.steps    ?? [],
  youtube:     recipe.youtube   ?? '',
  sourceUrl:   '',
  nutrition:   recipe.nutrition ?? null,
  isUserRecipe: false,
  authorId:    null,
});

// ── Sub-components ────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="px-4 pt-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
        <div className="h-10 bg-gray-100 rounded-xl" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${85 - i * 5}%` }} />
        ))}
      </div>
    </div>
  );
}

function NutritionGrid({ nutrition }) {
  const items = [
    { label: 'Kalori',      value: nutrition.calories, unit: 'kkal', bg: 'bg-orange-50', text: 'text-orange-600' },
    { label: 'Protein',     value: nutrition.protein,  unit: 'g',    bg: 'bg-blue-50',   text: 'text-blue-600'   },
    { label: 'Karbohidrat', value: nutrition.carbs,    unit: 'g',    bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { label: 'Lemak',       value: nutrition.fat,      unit: 'g',    bg: 'bg-red-50',    text: 'text-red-500'    },
    { label: 'Serat',       value: nutrition.fiber,    unit: 'g',    bg: 'bg-green-50',  text: 'text-green-600'  },
  ].filter((n) => n.value != null && n.value !== '');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((n) => (
        <div key={n.label} className={`${n.bg} rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-black ${n.text}`}>{n.value}</p>
          <p className={`text-xs font-medium ${n.text} mt-0.5`}>{n.unit}</p>
          <p className="text-xs text-gray-400 mt-0.5">{n.label}</p>
        </div>
      ))}
      {items.length === 0 && (
        <p className="col-span-2 text-sm text-gray-400 text-center py-6">
          Info nutrisi tidak tersedia.
        </p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function RecipeDetail() {
  const { id }         = useParams();
  const [params]       = useSearchParams();
  const source         = params.get('source') ?? 'mealdb';
  const navigate       = useNavigate();

  const { user }                         = useAuth();
  const { toggleFavorite, isFavorite }   = useFavorites();
  const { getRecipeById }                = useUserRecipes();

  const [recipe,  setRecipe]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('ingredients');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTab('ingredients');

    if (source === 'user') {
      const r = getRecipeById(id);
      if (r) setRecipe(normalizeUser(r));
      else   setError('Resep tidak ditemukan.');
      setLoading(false);
    } else if (source === 'local') {
      const r = getLocalRecipeById(id);
      if (r) setRecipe(normalizeLocal(r));
      else   setError('Resep tidak ditemukan.');
      setLoading(false);
    } else {
      getMealById(id)
        .then((res) => {
          const m = res.meals?.[0];
          if (m) setRecipe(normalizeMealDB(m));
          else   setError('Resep tidak ditemukan di MealDB.');
        })
        .catch(() => setError('Gagal memuat resep. Periksa koneksi internetmu.'))
        .finally(() => setLoading(false));
    }
  }, [id, source]);

  if (loading) return <Skeleton />;

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-lg font-semibold text-gray-700">{error}</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-5 text-sm text-green-600 font-semibold hover:underline"
      >
        ← Kembali
      </button>
    </div>
  );

  if (!recipe) return null;

  const isFav   = isFavorite(recipe.id);
  const isOwner = recipe.isUserRecipe && user?.uid === recipe.authorId;

  const tabs = [
    { key: 'ingredients', label: `🥕 Bahan (${recipe.ingredients.length})` },
    { key: 'steps',       label: `👨‍🍳 Cara Memasak` },
    ...(recipe.nutrition  ? [{ key: 'nutrition', label: '📊 Nutrisi' }] : []),
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="aspect-video bg-gray-200 overflow-hidden">
          {recipe.thumbnail ? (
            <img
              src={recipe.thumbnail}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-green-50">🍽️</div>
          )}
        </div>

        {/* Floating action buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow text-gray-700 hover:bg-white transition-colors font-semibold text-sm"
          >
            ←
          </button>

          <div className="flex gap-2">
            {user && (
              <button
                onClick={() =>
                  toggleFavorite({
                    recipeId:  recipe.id,
                    source,
                    title:     recipe.title,
                    thumbnail: recipe.thumbnail,
                    category:  recipe.category,
                    area:      recipe.area,
                  })
                }
                className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors text-base"
                title={isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              >
                {isFav ? '❤️' : '🤍'}
              </button>
            )}

            {recipe.youtube && (
              <a
                href={recipe.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors text-xs font-bold"
                title="Tonton di YouTube"
              >
                ▶
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="px-4 pt-5">

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">
          {recipe.title}
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {recipe.category && (
            <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2.5 py-0.5 rounded-full font-medium">
              {recipe.category}
            </span>
          )}
          {recipe.area && (
            <span className="text-xs bg-blue-50 text-blue-500 border border-blue-100 px-2.5 py-0.5 rounded-full">
              🌍 {recipe.area}
            </span>
          )}
          {recipe.isUserRecipe && (
            <span className="text-xs bg-orange-50 text-orange-500 border border-orange-100 px-2.5 py-0.5 rounded-full font-medium">
              ✏️ Resep Saya
            </span>
          )}
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Edit button (owner only) */}
        {isOwner && (
          <Link
            to={`/my-recipes/edit/${recipe.id}`}
            className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg font-medium hover:bg-orange-100 transition-colors mb-4"
          >
            ✏️ Edit Resep Ini
          </Link>
        )}

        {/* Source link */}
        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors mb-4 truncate"
          >
            🔗 <span className="truncate">{recipe.sourceUrl}</span>
          </a>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-100 mb-5 gap-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-2.5 mr-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Bahan-bahan ──────────────────────────────────────────────────── */}
        {tab === 'ingredients' && (
          <div>
            {recipe.ingredients.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                Bahan tidak tersedia.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recipe.ingredients.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700 capitalize">{item.name}</span>
                    </div>
                    {item.amount && (
                      <span className="text-xs text-gray-400 font-medium text-right max-w-[45%]">
                        {item.amount}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Cara Memasak ─────────────────────────────────────────────────── */}
        {tab === 'steps' && (
          <div className="space-y-4">
            {recipe.steps.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                Langkah memasak tidak tersedia.
              </p>
            ) : (
              recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-green-500 text-white rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1 pt-1">
                    {step}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Nutrisi (resep user saja) ─────────────────────────────────────── */}
        {tab === 'nutrition' && recipe.nutrition && (
          <NutritionGrid nutrition={recipe.nutrition} />
        )}

        {/* ── YouTube embed prompt ──────────────────────────────────────────── */}
        {recipe.youtube && tab === 'steps' && (
          <a
            href={recipe.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-sm rounded-xl transition-colors"
          >
            ▶ Tonton Video Tutorial di YouTube
          </a>
        )}

      </div>
    </div>
  );
}
