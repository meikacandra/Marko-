import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';

function FavCard({ fav, onRemove }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group flex flex-col">
      <Link to={`/recipes/${fav.recipeId}?source=${fav.source}`} className="block flex-1">
        <div className="aspect-video overflow-hidden bg-gray-100">
          {fav.thumbnail ? (
            <img
              src={`${fav.thumbnail}${fav.source === 'mealdb' ? '/preview' : ''}`}
              alt={fav.title}
              onError={(e) => { e.currentTarget.src = fav.thumbnail; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-green-50">🍽️</div>
          )}
        </div>
        <div className="p-3 flex-1">
          <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1.5">
            {fav.title}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {fav.category && (
              <span className="text-[10px] bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                {fav.category}
              </span>
            )}
            {fav.area && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {fav.area}
              </span>
            )}
            {fav.source === 'user' && (
              <span className="text-[10px] bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full">
                Resep Saya
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={() => onRemove(fav.recipeId)}
        className="w-full py-2.5 border-t border-gray-50 text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
      >
        ❤️ Hapus dari Favorit
      </button>
    </div>
  );
}

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const [search, setSearch] = useState('');

  const sorted   = [...favorites].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  const filtered = sorted.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Favorit</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {favorites.length} resep tersimpan
        </p>
      </div>

      {/* Search */}
      {favorites.length > 0 && (
        <div className="relative mb-5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari favorit..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition bg-white"
          />
        </div>
      )}

      {/* Empty — no favorites */}
      {favorites.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🤍</p>
          <p className="text-lg font-bold text-gray-700">Belum ada favorit</p>
          <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto">
            Tekan ikon ❤️ di halaman resep untuk menyimpannya ke sini.
          </p>
          <Link
            to="/recipes"
            className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Jelajahi Resep
          </Link>
        </div>
      )}

      {/* Empty search */}
      {favorites.length > 0 && filtered.length === 0 && (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-gray-700">Tidak ditemukan</p>
          <button onClick={() => setSearch('')} className="mt-2 text-sm text-green-600 hover:underline">
            Reset
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((fav) => (
            <FavCard key={fav.favId} fav={fav} onRemove={removeFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
