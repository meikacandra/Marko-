import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserRecipes } from '../../hooks/useUserRecipes';
import { ROUTES } from '../../constants/routes';

// ── Delete confirmation modal ──────────────────────────────────────────────────

function DeleteModal({ recipe, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <p className="text-3xl text-center mb-3">🗑️</p>
        <h3 className="text-base font-bold text-gray-800 text-center mb-1">Hapus Resep?</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          <span className="font-semibold text-gray-700">"{recipe.title}"</span> akan dihapus permanen
          dan tidak bisa dikembalikan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Recipe card ────────────────────────────────────────────────────────────────

function RecipeCard({ recipe, onDelete }) {
  const hasNutrition = recipe.nutrition &&
    Object.values(recipe.nutrition).some((v) => v != null && v !== '');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
      {/* Thumbnail */}
      <Link to={`/recipes/${recipe.id}?source=user`} className="block">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {recipe.thumbnail ? (
            <img
              src={recipe.thumbnail}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-green-50">🍽️</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <Link to={`/recipes/${recipe.id}?source=user`}>
          <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug hover:text-green-600 transition-colors">
            {recipe.title}
          </p>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {recipe.category && (
            <span className="text-[10px] bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-medium">
              {recipe.category}
            </span>
          )}
          {(recipe.dietTags ?? []).slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {(recipe.dietTags ?? []).length > 2 && (
            <span className="text-[10px] text-gray-400">+{recipe.dietTags.length - 2}</span>
          )}
        </div>

        {/* Nutrition chips */}
        {hasNutrition && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.nutrition.calories != null && (
              <span className="text-[10px] font-semibold text-orange-500">
                🔥 {recipe.nutrition.calories} kkal
              </span>
            )}
            {recipe.nutrition.protein != null && (
              <span className="text-[10px] text-blue-500">P {recipe.nutrition.protein}g</span>
            )}
            {recipe.nutrition.carbs != null && (
              <span className="text-[10px] text-yellow-600">K {recipe.nutrition.carbs}g</span>
            )}
            {recipe.nutrition.fat != null && (
              <span className="text-[10px] text-red-400">L {recipe.nutrition.fat}g</span>
            )}
          </div>
        )}

        {/* Stats */}
        <p className="text-[10px] text-gray-400 mt-auto">
          {recipe.ingredients?.length ?? 0} bahan · {recipe.instructions?.length ?? 0} langkah
        </p>
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-50">
        <Link
          to={`/my-recipes/edit/${recipe.id}`}
          className="flex-1 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors text-center"
        >
          ✏️ Edit
        </Link>
        <div className="w-px bg-gray-50" />
        <button
          onClick={() => onDelete(recipe)}
          className="flex-1 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors"
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MyRecipes() {
  const { recipes, loading, deleteRecipe } = useUserRecipes();
  const [search,      setSearch]      = useState('');
  const [toDelete,    setToDelete]    = useState(null);

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (toDelete) { deleteRecipe(toDelete.id); setToDelete(null); }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-video bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Resep Saya</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {recipes.length} resep tersimpan
          </p>
        </div>
        <Link
          to={ROUTES.MY_RECIPES_CREATE}
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          + Buat Resep
        </Link>
      </div>

      {/* Search */}
      {recipes.length > 0 && (
        <div className="relative mb-5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama resep..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition bg-white"
          />
        </div>
      )}

      {/* Empty state — no recipes at all */}
      {recipes.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg font-bold text-gray-700">Belum ada resep</p>
          <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto">
            Buat resepmu sendiri lengkap dengan info gizi agar bisa dilacak di Tracker.
          </p>
          <Link
            to={ROUTES.MY_RECIPES_CREATE}
            className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm"
          >
            + Buat Resep Pertama
          </Link>
        </div>
      )}

      {/* Empty search result */}
      {recipes.length > 0 && filtered.length === 0 && (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-gray-700">Resep tidak ditemukan</p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-sm text-green-600 font-medium hover:underline"
          >
            Reset pencarian
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {/* Delete modal */}
      {toDelete && (
        <DeleteModal
          recipe={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
