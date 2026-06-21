import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTracker } from '../../hooks/useTracker';
import { useExercise } from '../../hooks/useExercise';
import { ROUTES } from '../../constants/routes';
import { pct, calcMacroTargets } from '../../utils/nutrition';
import { formatDate, todayKey } from '../../utils/formatDate';
import { getRandomRecipes } from '../../services/localRecipes/api';
import { DAILY_TARGETS } from '../../constants/nutrition';

const TIPS = [
  'Minum air putih 8 gelas sehari membantu metabolisme dan menjaga energimu kuliah sepanjang hari.',
  'Sarapan bergizi meningkatkan konsentrasi belajar hingga 20%. Jangan skip ya!',
  'Tidur 7–8 jam membantu pemulihan otot dan mengontrol hormon lapar.',
  'Olahraga 30 menit 3x seminggu cukup untuk menjaga kesehatan jantung.',
  'Makan pelan-pelan membantu otak mendeteksi rasa kenyang lebih baik.',
];

const QUICK_ACTIONS = [
  { to: ROUTES.TRACKER,      icon: '🍽️', label: 'Catat Makan',  bg: 'bg-orange-50 border-orange-100 text-orange-600' },
  { to: ROUTES.EXERCISE,     icon: '🏃', label: 'Log Olahraga', bg: 'bg-blue-50 border-blue-100 text-blue-600'   },
  { to: ROUTES.RECIPES,      icon: '🥗', label: 'Resep Sehat',  bg: 'bg-green-50 border-green-100 text-green-600' },
  { to: ROUTES.MEAL_PLANNER, icon: '📅', label: 'Meal Planner', bg: 'bg-purple-50 border-purple-100 text-purple-600' },
  { to: ROUTES.MY_RECIPES,   icon: '📝', label: 'Resep Saya',   bg: 'bg-yellow-50 border-yellow-100 text-yellow-600' },
  { to: ROUTES.FAVORITES,    icon: '❤️', label: 'Favorit',      bg: 'bg-red-50 border-red-100 text-red-500'      },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MacroBar({ label, value, target, color, unit }) {
  const p = pct(value, target);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">
          {value}
          <span className="text-gray-400 font-normal"> / {target} {unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}

function StatChip({ label, value, unit, chipColor, textColor }) {
  return (
    <div className={`${chipColor} rounded-xl py-2.5 px-1 text-center`}>
      <p className={`text-[10px] font-medium ${textColor} opacity-80`}>{label}</p>
      <p className={`text-sm font-bold ${textColor} mt-0.5`}>{value.toLocaleString('id-ID')}</p>
      <p className={`text-[10px] ${textColor} opacity-60`}>{unit}</p>
    </div>
  );
}

function RecipeCard({ recipe }) {
  return (
    <Link
      to={`/recipes/${recipe.id}?source=local`}
      className="flex-shrink-0 w-[130px] group"
    >
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square mb-1.5 shadow-sm">
        <img
          src={recipe.thumbnail}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentNode.innerHTML =
              '<div class="w-full h-full flex items-center justify-center text-3xl bg-green-50">🍽️</div>';
          }}
        />
      </div>
      <p className="text-xs font-medium text-gray-700 line-clamp-2 leading-tight">{recipe.title}</p>
      {recipe.category && (
        <p className="text-[10px] text-gray-400 mt-0.5">{recipe.category}</p>
      )}
    </Link>
  );
}

function RecipeSkeleton() {
  return (
    <div className="flex-shrink-0 w-[130px] animate-pulse">
      <div className="rounded-xl bg-gray-200 aspect-square mb-1.5" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const { user } = useAuth();
  const { totals, logs } = useTracker();
  const { getTodayLogs } = useExercise();

  const [meals,        setMeals]        = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);

  const todayExerciseLogs  = getTodayLogs();
  const caloriesBurned     = todayExerciseLogs.reduce((s, l) => s + (l.caloriesBurned ?? 0), 0);

  const calorieTarget  = user?.calorieTarget ?? DAILY_TARGETS.calories;
  const macroTargets   = calcMacroTargets(calorieTarget);
  const netCalories    = totals.calories - caloriesBurned;
  const calPct         = pct(totals.calories, calorieTarget);
  const remaining      = Math.max(0, calorieTarget - netCalories);
  const isOver         = calPct >= 100;

  const tip = TIPS[new Date().getDay() % TIPS.length];

  useEffect(() => {
    setLoadingMeals(true);
    setMeals(getRandomRecipes(6));
    setLoadingMeals(false);
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-28 space-y-5">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-gray-400">{formatDate(todayKey())}</p>
        <h1 className="text-xl font-bold text-gray-800 mt-0.5">
          {getGreeting()},{' '}
          <span className="text-green-600">
            {user?.displayName?.split(' ')[0] ?? 'Kamu'}
          </span>! 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Yuk pantau asupan gizi harianmu.</p>
      </div>

      {/* ── Calorie Overview ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Kalori Hari Ini</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-gray-800">
                {totals.calories.toLocaleString('id-ID')}
              </span>
              <span className="text-sm text-gray-400">
                / {calorieTarget.toLocaleString('id-ID')} kkal
              </span>
            </div>
          </div>

          {/* Circular progress */}
          <div className="relative w-[60px] h-[60px]">
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
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
              {calPct}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-400' : 'bg-green-400'}`}
            style={{ width: `${Math.min(calPct, 100)}%` }}
          />
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-2">
          <StatChip
            label="Dikonsumsi" value={totals.calories} unit="kkal"
            chipColor="bg-green-50" textColor="text-green-700"
          />
          <StatChip
            label="Dibakar" value={caloriesBurned} unit="kkal"
            chipColor="bg-blue-50" textColor="text-blue-700"
          />
          <StatChip
            label={isOver ? 'Kelebihan' : 'Sisa'} value={isOver ? netCalories - calorieTarget : remaining} unit="kkal"
            chipColor={isOver ? 'bg-red-50' : 'bg-orange-50'}
            textColor={isOver ? 'text-red-700' : 'text-orange-700'}
          />
        </div>
      </div>

      {/* ── Macro Summary ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">Makronutrien</p>
          <Link to={ROUTES.TRACKER} className="text-xs text-green-600 font-medium hover:underline">
            Catat makan →
          </Link>
        </div>
        <div className="space-y-3.5">
          <MacroBar label="Protein"       value={totals.protein} target={macroTargets.protein} color="bg-blue-400"   unit="g" />
          <MacroBar label="Karbohidrat"   value={totals.carbs}   target={macroTargets.carbs}   color="bg-yellow-400" unit="g" />
          <MacroBar label="Lemak"         value={totals.fat}     target={macroTargets.fat}     color="bg-red-400"   unit="g" />
        </div>

        {logs.length === 0 && (
          <div className="mt-4 border border-dashed border-gray-200 rounded-xl py-3 text-center">
            <p className="text-xs text-gray-400">Belum ada makanan yang dicatat hari ini.</p>
            <Link to={ROUTES.TRACKER} className="text-xs text-green-600 font-semibold hover:underline mt-0.5 inline-block">
              + Catat sekarang
            </Link>
          </div>
        )}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Akses Cepat</p>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map(({ to, icon, label, bg }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-transform active:scale-95 hover:scale-[1.02] ${bg}`}
            >
              <span className="text-2xl leading-none">{icon}</span>
              <span className="text-[11px] font-semibold leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Exercise Today ─────────────────────────────────────────────────── */}
      {todayExerciseLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">🏃 Olahraga Hari Ini</p>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              −{caloriesBurned.toLocaleString('id-ID')} kkal
            </span>
          </div>
          <div className="space-y-2">
            {todayExerciseLogs.slice(0, 3).map((ex) => (
              <div key={ex.logId} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{ex.name}</span>
                <span className="text-xs text-gray-400">
                  {ex.duration} mnt &middot; {ex.caloriesBurned} kkal
                </span>
              </div>
            ))}
            {todayExerciseLogs.length > 3 && (
              <Link to={ROUTES.EXERCISE} className="text-xs text-green-600 font-medium hover:underline">
                +{todayExerciseLogs.length - 3} aktivitas lainnya
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Recipe Suggestions ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">💡 Rekomendasi Resep</p>
          <Link to={ROUTES.RECIPES} className="text-xs text-green-600 font-medium hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loadingMeals
            ? Array.from({ length: 5 }).map((_, i) => <RecipeSkeleton key={i} />)
            : meals.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
          }
        </div>
      </div>

      {/* ── Motivational Tip ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl p-5 text-white shadow-sm">
        <p className="text-xs font-semibold opacity-75 mb-1.5">💪 Tips Hari Ini</p>
        <p className="text-sm leading-relaxed font-medium">{tip}</p>
      </div>
    </div>
  );
}
