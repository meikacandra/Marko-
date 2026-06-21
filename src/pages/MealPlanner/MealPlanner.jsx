import { useState, useCallback } from 'react';
import { useMealPlanner } from '../../hooks/useMealPlanner';
import { useFavorites } from '../../hooks/useFavorites';
import { useUserRecipes } from '../../hooks/useUserRecipes';
import { MEAL_TIMES } from '../../constants/config';
import { todayKey, toDateKey } from '../../utils/formatDate';

// ── Week helpers ───────────────────────────────────────────────────────────────

const getMondayOf = (dateKey) => {
  const d   = new Date(dateKey + 'T00:00:00');
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return toDateKey(d);
};

const addDays = (dateKey, n) => {
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};

const formatShort = (dateKey) => {
  const d = new Date(dateKey + 'T00:00:00');
  return {
    day:  d.toLocaleDateString('id-ID', { weekday: 'short' }),
    date: d.getDate(),
    full: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
  };
};

const MEAL_META = {
  'Sarapan':     { icon: '🌅', color: 'text-orange-500', bg: 'bg-orange-50'  },
  'Makan Siang': { icon: '☀️',  color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'Makan Malam': { icon: '🌙', color: 'text-indigo-500', bg: 'bg-indigo-50'  },
  'Camilan':     { icon: '🍎', color: 'text-green-500',  bg: 'bg-green-50'   },
};

// ── Add Meal Modal ─────────────────────────────────────────────────────────────

function AddMealModal({ isOpen, targetDate, onClose, onAdd }) {
  const { recipes }            = useUserRecipes();
  const { favorites }          = useFavorites();

  const [mealTime,   setMealTime]   = useState('Makan Siang');
  const [activeTab,  setActiveTab]  = useState('my-recipes');
  const [search,     setSearch]     = useState('');
  const [manualName, setManualName] = useState('');
  const [manualErr,  setManualErr]  = useState('');

  const dateLabel = targetDate
    ? new Date(targetDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFavs = favorites.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (mealData) => {
    onAdd(targetDate, { mealTime, ...mealData });
    handleClose();
  };

  const handleManual = () => {
    if (!manualName.trim()) { setManualErr('Nama tidak boleh kosong.'); return; }
    handleAdd({
      recipeId:  crypto.randomUUID(),
      source:    'manual',
      title:     manualName.trim(),
      thumbnail: '',
      nutrition: null,
    });
  };

  const handleClose = () => {
    setSearch('');
    setManualName('');
    setManualErr('');
    setActiveTab('my-recipes');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-800">Tambah Rencana Makan</h2>
            <p className="text-xs text-gray-400 mt-0.5">{dateLabel}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Meal time */}
        <div className="px-5 pb-3 flex-shrink-0">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2">Waktu Makan</p>
          <div className="flex gap-2 flex-wrap">
            {MEAL_TIMES.map((mt) => {
              const m = MEAL_META[mt];
              return (
                <button
                  key={mt}
                  onClick={() => setMealTime(mt)}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    mealTime === mt
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {m?.icon} {mt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 gap-4 flex-shrink-0">
          {[
            { key: 'my-recipes', label: '📝 Resep Saya' },
            { key: 'favorites',  label: '❤️ Favorit'    },
            { key: 'manual',     label: '✏️ Manual'     },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setSearch(''); }}
              className={`pb-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Resep Saya ──────────────────────────────────────────── */}
          {activeTab === 'my-recipes' && (
            <div className="px-5 py-4 space-y-3">
              {recipes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Belum ada resep. Buat dulu di menu <strong>Resep Saya</strong>.
                </p>
              ) : (
                <>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari resep..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition"
                  />
                  {filteredRecipes.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Tidak ditemukan.</p>
                  ) : (
                    filteredRecipes.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleAdd({ recipeId: r.id, source: 'user', title: r.title, thumbnail: r.thumbnail ?? '', nutrition: r.nutrition ?? null })}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-gray-100">
                          {r.thumbnail
                            ? <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; }} />
                            : <span className="w-full h-full flex items-center justify-center text-lg">🍽️</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{r.category}</p>
                        </div>
                        <span className="text-green-400 text-lg">+</span>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Favorit ─────────────────────────────────────────────── */}
          {activeTab === 'favorites' && (
            <div className="px-5 py-4 space-y-3">
              {favorites.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Belum ada favorit. Simpan resep dulu di halaman <strong>Jelajahi</strong>.
                </p>
              ) : (
                <>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari favorit..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition"
                  />
                  {filteredFavs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Tidak ditemukan.</p>
                  ) : (
                    filteredFavs.map((f) => (
                      <button
                        key={f.favId}
                        onClick={() => handleAdd({ recipeId: f.recipeId, source: f.source, title: f.title, thumbnail: f.thumbnail, nutrition: null })}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-gray-100">
                          {f.thumbnail
                            ? <img src={`${f.thumbnail}${f.source === 'mealdb' ? '/preview' : ''}`} alt={f.title} className="w-full h-full object-cover" />
                            : <span className="w-full h-full flex items-center justify-center text-lg">🍽️</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{f.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{f.category}</p>
                        </div>
                        <span className="text-green-400 text-lg">+</span>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Manual ──────────────────────────────────────────────── */}
          {activeTab === 'manual' && (
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Nama Makanan / Acara <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => { setManualName(e.target.value); setManualErr(''); }}
                  placeholder="Contoh: Makan di kantin, Ayam bakar mama..."
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 transition ${
                    manualErr ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-300 focus:border-green-400'
                  }`}
                />
                {manualErr && <p className="text-xs text-red-500 mt-1">{manualErr}</p>}
              </div>
              <p className="text-xs text-gray-400">
                💡 Untuk mencatat nutrisinya, catat juga di halaman <strong>Tracker</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA (manual only) */}
        {activeTab === 'manual' && (
          <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex-shrink-0">
            <button
              onClick={handleManual}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Tambahkan ke {mealTime}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Day Column ────────────────────────────────────────────────────────────────

function DayColumn({ dateKey, isToday, onAdd, onRemove, getMealsForDate }) {
  const { day, date } = formatShort(dateKey);
  const meals         = getMealsForDate(dateKey);
  const totalItems    = meals.length;

  return (
    <div
      className={`flex-shrink-0 w-[130px] rounded-2xl border flex flex-col overflow-hidden ${
        isToday ? 'border-green-400 shadow-md' : 'border-gray-100 bg-white shadow-sm'
      }`}
    >
      {/* Day header */}
      <div
        className={`px-2 py-2.5 text-center border-b ${
          isToday ? 'bg-green-500 border-green-400' : 'bg-gray-50 border-gray-100'
        }`}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? 'text-green-100' : 'text-gray-400'}`}>
          {day}
        </p>
        <p className={`text-xl font-black mt-0.5 ${isToday ? 'text-white' : 'text-gray-700'}`}>
          {date}
        </p>
        {isToday && <p className="text-[10px] text-green-100 font-medium mt-0.5">Hari Ini</p>}
      </div>

      {/* Meals list */}
      <div className="flex-1 p-2 space-y-1.5 min-h-[120px] bg-white">
        {meals.length === 0 ? (
          <p className="text-[10px] text-gray-300 text-center mt-4 leading-relaxed">
            Belum ada rencana
          </p>
        ) : (
          meals.map((meal) => {
            const meta = MEAL_META[meal.mealTime];
            return (
              <div
                key={meal.planId}
                className={`relative group/item rounded-lg px-2 py-1.5 ${meta?.bg ?? 'bg-gray-50'}`}
              >
                <p className="text-[10px] font-semibold text-gray-700 leading-snug line-clamp-2 pr-4">
                  {meal.title}
                </p>
                <p className={`text-[9px] font-medium mt-0.5 ${meta?.color ?? 'text-gray-400'}`}>
                  {meta?.icon} {meal.mealTime}
                </p>
                <button
                  onClick={() => onRemove(dateKey, meal.planId)}
                  className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-gray-300 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all text-[10px] leading-none"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAdd(dateKey)}
        className={`flex items-center justify-center gap-1 py-2 text-[11px] font-semibold border-t transition-colors ${
          isToday
            ? 'border-green-100 text-green-600 hover:bg-green-50'
            : 'border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-green-500'
        }`}
      >
        + Tambah
      </button>
    </div>
  );
}

// ── Week Summary ──────────────────────────────────────────────────────────────

function WeekSummary({ weekDates, getMealsForDate }) {
  const total = weekDates.reduce((s, d) => s + getMealsForDate(d).length, 0);
  const days  = weekDates.filter((d) => getMealsForDate(d).length > 0).length;

  if (total === 0) return null;

  return (
    <div className="flex gap-3 mt-4">
      <div className="flex-1 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 text-center">
        <p className="text-xl font-black text-green-600">{total}</p>
        <p className="text-[10px] text-green-500 font-medium">Total Rencana</p>
      </div>
      <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-center">
        <p className="text-xl font-black text-blue-600">{days}</p>
        <p className="text-[10px] text-blue-500 font-medium">Hari Direncanakan</p>
      </div>
      <div className="flex-1 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5 text-center">
        <p className="text-xl font-black text-purple-600">{7 - days}</p>
        <p className="text-[10px] text-purple-500 font-medium">Hari Kosong</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MealPlanner() {
  const today = todayKey();

  const [weekStart, setWeekStart] = useState(() => getMondayOf(today));
  const [modalOpen, setModalOpen] = useState(false);
  const [targetDate,setTargetDate]= useState(null);

  const { addMeal, removeMeal, getMealsForDate, loading } = useMealPlanner();

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));
  const goToday  = () => setWeekStart(getMondayOf(today));

  const openModal = useCallback((date) => {
    setTargetDate(date);
    setModalOpen(true);
  }, []);

  const weekLabel = (() => {
    const start = new Date(weekStart + 'T00:00:00');
    const end   = new Date(addDays(weekStart, 6) + 'T00:00:00');
    const opts  = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('id-ID', opts)} – ${end.toLocaleDateString('id-ID', opts)}`;
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Meal Planner</h1>
        <p className="text-sm text-gray-400 mt-0.5">Rencanakan menu makananmu seminggu ke depan</p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        <button
          onClick={prevWeek}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500 font-semibold"
        >
          ‹
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-gray-800">{weekLabel}</p>
          {weekStart !== getMondayOf(today) && (
            <button
              onClick={goToday}
              className="text-xs text-green-600 font-medium hover:underline mt-0.5"
            >
              Kembali ke minggu ini
            </button>
          )}
        </div>

        <button
          onClick={nextWeek}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500 font-semibold"
        >
          ›
        </button>
      </div>

      {/* Week summary */}
      <WeekSummary weekDates={weekDates} getMealsForDate={getMealsForDate} />

      {/* 7-day grid — horizontal scroll */}
      <div className="mt-4 overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2.5 pb-2" style={{ minWidth: 'max-content' }}>
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[130px] h-[200px] bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))
            : weekDates.map((dateKey) => (
                <DayColumn
                  key={dateKey}
                  dateKey={dateKey}
                  isToday={dateKey === today}
                  onAdd={openModal}
                  onRemove={removeMeal}
                  getMealsForDate={getMealsForDate}
                />
              ))
          }
        </div>
      </div>

      {/* Tips */}
      <div className="mt-5 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-xs text-green-700">
        💡 <strong>Tips:</strong> Rencanakan menu di awal minggu agar lebih mudah belanja bahan dan menjaga pola makan tetap sehat dan variatif.
      </div>

      {/* Modal */}
      <AddMealModal
        isOpen={modalOpen}
        targetDate={targetDate}
        onClose={() => setModalOpen(false)}
        onAdd={addMeal}
      />
    </div>
  );
}
