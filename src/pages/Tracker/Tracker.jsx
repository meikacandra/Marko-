import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTracker } from '../../hooks/useTracker';
import { useExercise } from '../../hooks/useExercise';
import { useUserRecipes } from '../../hooks/useUserRecipes';
import { useAuth } from '../../context/AuthContext';
import { DAILY_TARGETS } from '../../constants/nutrition';
import { MEAL_TIMES } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { calcMacroTargets, pct } from '../../utils/nutrition';
import { todayKey, toDateKey, formatDate } from '../../utils/formatDate';

// ── Constants ─────────────────────────────────────────────────────────────────

const MEAL_META = {
  'Sarapan':     { icon: '🌅', color: 'text-orange-500', bg: 'bg-orange-50'  },
  'Makan Siang': { icon: '☀️',  color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'Makan Malam': { icon: '🌙', color: 'text-indigo-500', bg: 'bg-indigo-50'  },
  'Camilan':     { icon: '🍎', color: 'text-green-500',  bg: 'bg-green-50'   },
};

const MACRO_CFG = [
  { key: 'protein', label: 'Protein',     unit: 'g', bar: 'bg-blue-400',   text: 'text-blue-600'   },
  { key: 'carbs',   label: 'Karbohidrat', unit: 'g', bar: 'bg-yellow-400', text: 'text-yellow-600' },
  { key: 'fat',     label: 'Lemak',       unit: 'g', bar: 'bg-red-400',    text: 'text-red-500'    },
];

// ── Date helpers ──────────────────────────────────────────────────────────────

const addDays = (dateKey, n) => {
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function DateNav({ date, onChange }) {
  const isToday = date === todayKey();
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
      <button
        onClick={() => onChange(addDays(date, -1))}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 font-semibold"
      >
        ‹
      </button>

      <div className="text-center">
        <p className="text-sm font-bold text-gray-800">
          {isToday ? '📅 Hari Ini' : formatDate(date).split(',')[0]}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(date)}</p>
      </div>

      <button
        onClick={() => !isToday && onChange(addDays(date, 1))}
        disabled={isToday}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-500 font-semibold"
      >
        ›
      </button>
    </div>
  );
}

function MacroBar({ label, value, target, barColor, unit }) {
  const p = pct(value, target);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">
          {value}
          <span className="font-normal text-gray-400"> / {target} {unit}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${p}%` }}
        />
      </div>
      <p className="text-right text-[10px] text-gray-400 mt-0.5">{p}%</p>
    </div>
  );
}

function LogItem({ log, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
        {log.thumbnail
          ? <img src={log.thumbnail} alt={log.title} className="w-full h-full object-cover" />
          : <span className="w-full h-full flex items-center justify-center text-lg">🍽️</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{log.title}</p>
        <div className="flex gap-2 mt-0.5 flex-wrap">
          {log.calories > 0 && (
            <span className="text-[11px] text-orange-600 font-semibold">{log.calories} kkal</span>
          )}
          {log.protein > 0 && (
            <span className="text-[11px] text-blue-500">P {log.protein}g</span>
          )}
          {log.carbs > 0 && (
            <span className="text-[11px] text-yellow-600">K {log.carbs}g</span>
          )}
          {log.fat > 0 && (
            <span className="text-[11px] text-red-400">L {log.fat}g</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(log.logId)}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors text-sm"
        title="Hapus entri"
      >
        ✕
      </button>
    </div>
  );
}

function MealSection({ mealTime, logs, onDelete, onAdd }) {
  const meta  = MEAL_META[mealTime] ?? { icon: '🍽️', color: 'text-gray-500', bg: 'bg-gray-50' };
  const total = logs.reduce((s, l) => s + (l.calories ?? 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${meta.color}`}>{meta.icon}</span>
          <span className="text-sm font-semibold text-gray-700">{mealTime}</span>
          {total > 0 && (
            <span className="text-xs text-gray-400 font-medium">{total} kkal</span>
          )}
        </div>
        <button
          onClick={() => onAdd(mealTime)}
          className="flex items-center gap-1 text-xs text-green-600 font-semibold hover:bg-green-50 px-2.5 py-1 rounded-lg transition-colors"
        >
          + Tambah
        </button>
      </div>

      <div className="px-4">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">Belum ada yang dicatat.</p>
        ) : (
          logs.map((log) => (
            <LogItem key={log.logId} log={log} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Add Food Modal ─────────────────────────────────────────────────────────────

const EMPTY_FORM = { title: '', calories: '', protein: '', carbs: '', fat: '' };

function AddFoodModal({ isOpen, defaultMealTime, onClose, onAdd }) {
  const { recipes } = useUserRecipes();
  const [mealTime,   setMealTime]   = useState(defaultMealTime ?? 'Makan Siang');
  const [activeTab,  setActiveTab]  = useState('my-recipes');
  const [search,     setSearch]     = useState('');
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formError,  setFormError]  = useState('');

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddRecipe = (recipe) => {
    onAdd({
      mealTime,
      title:     recipe.title,
      thumbnail: recipe.thumbnail ?? '',
      calories:  recipe.nutrition?.calories ?? 0,
      protein:   recipe.nutrition?.protein  ?? 0,
      carbs:     recipe.nutrition?.carbs    ?? 0,
      fat:       recipe.nutrition?.fat      ?? 0,
    });
    onClose();
  };

  const handleManualAdd = () => {
    if (!form.title.trim()) { setFormError('Nama makanan wajib diisi.'); return; }
    onAdd({
      mealTime,
      title:     form.title.trim(),
      thumbnail: '',
      calories:  Number(form.calories) || 0,
      protein:   Number(form.protein)  || 0,
      carbs:     Number(form.carbs)    || 0,
      fat:       Number(form.fat)      || 0,
    });
    setForm(EMPTY_FORM);
    setFormError('');
    onClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setSearch('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800">Catat Makanan</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Meal time pills */}
        <div className="px-5 pb-3 flex-shrink-0">
          <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Waktu makan</p>
          <div className="flex gap-2 flex-wrap">
            {MEAL_TIMES.map((mt) => {
              const meta = MEAL_META[mt];
              return (
                <button
                  key={mt}
                  onClick={() => setMealTime(mt)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    mealTime === mt
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {meta?.icon} {mt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 gap-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab('my-recipes')}
            className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'my-recipes'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-400'
            }`}
          >
            📝 Resep Saya
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-400'
            }`}
          >
            ✏️ Manual
          </button>
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Tab: Resep Saya ────────────────────────────────────── */}
          {activeTab === 'my-recipes' && (
            <div className="px-5 py-4 space-y-3">
              {recipes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-3">📝</p>
                  <p className="text-sm font-semibold text-gray-700">Belum ada resep</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Buat resepmu sendiri agar bisa dilacak nutrisinya di sini.
                  </p>
                  <Link
                    to={ROUTES.MY_RECIPES_CREATE}
                    onClick={handleClose}
                    className="mt-4 inline-block text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    + Buat Resep Baru
                  </Link>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama resep..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition"
                  />

                  {/* Recipe list */}
                  {filtered.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      Tidak ada resep yang cocok.
                    </p>
                  ) : (
                    filtered.map((recipe) => (
                      <button
                        key={recipe.id}
                        onClick={() => handleAddRecipe(recipe)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-gray-100">
                          {recipe.thumbnail
                            ? <img src={recipe.thumbnail} alt={recipe.title} className="w-full h-full object-cover" />
                            : <span className="w-full h-full flex items-center justify-center text-xl">🍽️</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{recipe.title}</p>
                          <div className="flex gap-2 mt-0.5 flex-wrap">
                            {recipe.nutrition?.calories != null && (
                              <span className="text-[11px] text-orange-500 font-medium">
                                {recipe.nutrition.calories} kkal
                              </span>
                            )}
                            {recipe.nutrition?.protein != null && (
                              <span className="text-[11px] text-gray-400">P {recipe.nutrition.protein}g</span>
                            )}
                            {recipe.nutrition?.carbs != null && (
                              <span className="text-[11px] text-gray-400">K {recipe.nutrition.carbs}g</span>
                            )}
                            {recipe.nutrition?.fat != null && (
                              <span className="text-[11px] text-gray-400">L {recipe.nutrition.fat}g</span>
                            )}
                            {!recipe.nutrition && (
                              <span className="text-[11px] text-gray-300 italic">Nutrisi belum diisi</span>
                            )}
                          </div>
                        </div>
                        <span className="text-green-400 text-lg flex-shrink-0">+</span>
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Tab: Manual ───────────────────────────────────────── */}
          {activeTab === 'manual' && (
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Nama Makanan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setFormError(''); }}
                  placeholder="Contoh: Nasi Goreng, Salad Buah..."
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 transition ${
                    formError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-300 focus:border-green-400'
                  }`}
                />
                {formError && <p className="text-xs text-red-500 mt-1">{formError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'calories', label: 'Kalori',      unit: 'kkal', placeholder: '300'  },
                  { key: 'protein',  label: 'Protein',     unit: 'g',    placeholder: '20'   },
                  { key: 'carbs',    label: 'Karbohidrat', unit: 'g',    placeholder: '40'   },
                  { key: 'fat',      label: 'Lemak',       unit: 'g',    placeholder: '10'   },
                ].map(({ key, label, unit, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      {label}
                      <span className="text-gray-400 font-normal"> ({unit})</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={form[key]}
                        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        {unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400">
                💡 Nilai nutrisi bisa dikosongkan jika tidak diketahui.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {activeTab === 'manual' && (
          <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex-shrink-0">
            <button
              onClick={handleManualAdd}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Simpan ke {mealTime}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Tracker() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [modalOpen,    setModalOpen]    = useState(false);
  const [defaultMT,    setDefaultMT]    = useState('Makan Siang');

  const { logs, totals, addLog, removeLog } = useTracker(selectedDate);
  const { getTotalCaloriesBurned }          = useExercise();

  const caloriesBurned = getTotalCaloriesBurned(selectedDate);
  const calorieTarget  = user?.calorieTarget ?? DAILY_TARGETS.calories;
  const macroTargets   = calcMacroTargets(calorieTarget);
  const netCalories    = totals.calories - caloriesBurned;
  const calPct         = pct(totals.calories, calorieTarget);
  const remaining      = Math.max(0, calorieTarget - netCalories);
  const isOver         = calPct >= 100;

  const openModal = useCallback((mealTime = 'Makan Siang') => {
    setDefaultMT(mealTime);
    setModalOpen(true);
  }, []);

  const handleAdd = useCallback((mealData) => {
    addLog(mealData);
  }, [addLog]);

  // Group logs by meal time, preserving MEAL_TIMES order
  const grouped = Object.fromEntries(MEAL_TIMES.map((mt) => [mt, []]));
  logs.forEach((log) => {
    const mt = MEAL_TIMES.includes(log.mealTime) ? log.mealTime : 'Camilan';
    grouped[mt].push(log);
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-28 space-y-4">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Tracker Gizi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Pantau asupan nutrisi harianmu</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          + Catat
        </button>
      </div>

      {/* ── Date nav ─────────────────────────────────────────────────── */}
      <DateNav date={selectedDate} onChange={setSelectedDate} />

      {/* ── Calorie card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Ringkasan Kalori</p>

        <div className="flex items-center gap-4 mb-4">
          {/* Circular */}
          <div className="relative flex-shrink-0 w-[72px] h-[72px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#f0fdf4" strokeWidth="7" />
              <circle
                cx="28" cy="28" r="22"
                fill="none"
                stroke={isOver ? '#ef4444' : '#22c55e'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(calPct, 100) / 100 * 138.2} 138.2`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-gray-800">{calPct}%</span>
            </div>
          </div>

          {/* Numbers */}
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black ${isOver ? 'text-red-500' : 'text-gray-800'}`}>
                {totals.calories.toLocaleString('id-ID')}
              </span>
              <span className="text-sm text-gray-400">kkal</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              dari target <span className="font-semibold text-gray-600">{calorieTarget.toLocaleString('id-ID')} kkal</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-400' : 'bg-green-400'}`}
            style={{ width: `${Math.min(calPct, 100)}%` }}
          />
        </div>

        {/* 3 chips */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 rounded-xl py-2.5">
            <p className="text-[10px] text-green-600 font-medium">Dikonsumsi</p>
            <p className="text-sm font-bold text-green-700 mt-0.5">{totals.calories.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-green-500">kkal</p>
          </div>
          <div className="bg-blue-50 rounded-xl py-2.5">
            <p className="text-[10px] text-blue-600 font-medium">Dibakar</p>
            <p className="text-sm font-bold text-blue-700 mt-0.5">{caloriesBurned.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-blue-500">kkal</p>
          </div>
          <div className={`${isOver ? 'bg-red-50' : 'bg-orange-50'} rounded-xl py-2.5`}>
            <p className={`text-[10px] font-medium ${isOver ? 'text-red-600' : 'text-orange-600'}`}>
              {isOver ? 'Kelebihan' : 'Sisa'}
            </p>
            <p className={`text-sm font-bold mt-0.5 ${isOver ? 'text-red-700' : 'text-orange-700'}`}>
              {isOver
                ? (netCalories - calorieTarget).toLocaleString('id-ID')
                : remaining.toLocaleString('id-ID')
              }
            </p>
            <p className={`text-[10px] ${isOver ? 'text-red-500' : 'text-orange-500'}`}>kkal</p>
          </div>
        </div>

        {isOver && (
          <p className="mt-3 text-xs text-red-500 text-center font-medium bg-red-50 rounded-lg py-2">
            ⚠️ Asupan kalori melebihi target hari ini.
          </p>
        )}
      </div>

      {/* ── Macro card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">Makronutrien</p>
        <div className="space-y-4">
          {MACRO_CFG.map(({ key, label, unit, bar, text }) => (
            <MacroBar
              key={key}
              label={label}
              value={totals[key] ?? 0}
              target={macroTargets[key]}
              barColor={bar}
              unit={unit}
            />
          ))}
        </div>
      </div>

      {/* ── Meal sections ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
          Log Makanan — {logs.length} entri
        </p>
        <div className="space-y-3">
          {MEAL_TIMES.map((mt) => (
            <MealSection
              key={mt}
              mealTime={mt}
              logs={grouped[mt]}
              onDelete={removeLog}
              onAdd={openModal}
            />
          ))}
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {logs.length === 0 && (
        <div className="text-center py-6">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm font-semibold text-gray-700">Belum ada yang dicatat hari ini</p>
          <p className="text-xs text-gray-400 mt-1">Mulai catat makananmu untuk melacak nutrisi harian.</p>
          <button
            onClick={() => openModal()}
            className="mt-4 text-sm text-green-600 font-semibold bg-green-50 border border-green-200 px-5 py-2 rounded-xl hover:bg-green-100 transition-colors"
          >
            + Catat Makanan Pertama
          </button>
        </div>
      )}

      {/* ── Daily summary tip ─────────────────────────────────────────── */}
      {logs.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 text-xs text-gray-500">
          📊 Total hari ini: {' '}
          <span className="font-semibold text-orange-500">{totals.calories} kkal</span>
          {' · '}
          <span className="font-semibold text-blue-500">P {totals.protein}g</span>
          {' · '}
          <span className="font-semibold text-yellow-600">K {totals.carbs}g</span>
          {' · '}
          <span className="font-semibold text-red-400">L {totals.fat}g</span>
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      <AddFoodModal
        isOpen={modalOpen}
        defaultMealTime={defaultMT}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
