import { useState, useMemo } from 'react';
import { useExercise } from '../../hooks/useExercise';
import { useAuth } from '../../context/AuthContext';
import { todayKey, toDateKey, formatDate } from '../../utils/formatDate';
import { EXERCISE_TYPES } from '../../constants/nutrition';

// ── Preset exercises with MET values ──────────────────────────────────────────
// MET (Metabolic Equivalent of Task) — sumber: Compendium of Physical Activities

const PRESETS = [
  { id: 'lari',       name: 'Lari',            type: 'Kardio',        met: 9.8,  icon: '🏃' },
  { id: 'jalan',      name: 'Jalan Cepat',     type: 'Kardio',        met: 4.3,  icon: '🚶' },
  { id: 'sepeda',     name: 'Bersepeda',       type: 'Kardio',        met: 8.0,  icon: '🚴' },
  { id: 'renang',     name: 'Berenang',        type: 'Kardio',        met: 7.0,  icon: '🏊' },
  { id: 'lompat',     name: 'Lompat Tali',     type: 'Kardio',        met: 11.8, icon: '🪢' },
  { id: 'zumba',      name: 'Zumba / Dance',   type: 'Kardio',        met: 6.0,  icon: '💃' },
  { id: 'pushup',     name: 'Push-up',         type: 'Kekuatan',      met: 3.8,  icon: '💪' },
  { id: 'squat',      name: 'Squat',           type: 'Kekuatan',      met: 5.0,  icon: '🏋️' },
  { id: 'plank',      name: 'Plank',           type: 'Kekuatan',      met: 3.0,  icon: '🧘' },
  { id: 'pullup',     name: 'Pull-up',         type: 'Kekuatan',      met: 4.0,  icon: '🙌' },
  { id: 'dumbbell',   name: 'Angkat Beban',    type: 'Kekuatan',      met: 5.5,  icon: '🏋️' },
  { id: 'yoga',       name: 'Yoga',            type: 'Fleksibilitas', met: 2.5,  icon: '🧘' },
  { id: 'stretching', name: 'Stretching',      type: 'Fleksibilitas', met: 2.3,  icon: '🤸' },
  { id: 'pilates',    name: 'Pilates',         type: 'Fleksibilitas', met: 3.0,  icon: '🩰' },
  { id: 'hiit',       name: 'HIIT',            type: 'HIIT',          met: 10.0, icon: '🔥' },
  { id: 'burpees',    name: 'Burpees',         type: 'HIIT',          met: 10.0, icon: '💥' },
  { id: 'mountain',   name: 'Mountain Climber',type: 'HIIT',          met: 8.0,  icon: '⛰️' },
  { id: 'jumping',    name: 'Jumping Jacks',   type: 'HIIT',          met: 8.0,  icon: '⚡' },
];

const TYPE_COLOR = {
  'Kardio':        { bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-100',    pill: 'bg-red-500'    },
  'Kekuatan':      { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   pill: 'bg-blue-500'   },
  'Fleksibilitas': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', pill: 'bg-purple-500' },
  'HIIT':          { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', pill: 'bg-orange-500' },
};

// calories = MET * weight_kg * (duration_min / 60)
const estimateCal = (met, durationMin, weightKg = 65) =>
  Math.round(met * weightKg * (durationMin / 60));

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, unit, bg, textColor }) {
  return (
    <div className={`${bg} rounded-2xl p-4 text-center`}>
      <span className="text-2xl">{icon}</span>
      <p className={`text-xl font-black mt-1 ${textColor}`}>{value}</p>
      <p className={`text-[10px] font-medium ${textColor} opacity-70`}>{unit}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function WeekChart({ logs }) {
  const today = todayKey();
  const days  = Array.from({ length: 7 }, (_, i) => {
    const d  = new Date(); d.setDate(d.getDate() - (6 - i));
    const dk = toDateKey(d);
    const burned = logs
      .filter((l) => l.date === dk)
      .reduce((s, l) => s + (l.caloriesBurned ?? 0), 0);
    return { dk, burned, label: d.toLocaleDateString('id-ID', { weekday: 'short' }) };
  });

  const maxBurned = Math.max(...days.map((d) => d.burned), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
        Kalori Dibakar — 7 Hari Terakhir
      </p>
      <div className="flex items-end gap-1.5 h-24">
        {days.map(({ dk, burned, label }) => {
          const isToday = dk === today;
          const h = burned > 0 ? Math.max(8, Math.round((burned / maxBurned) * 88)) : 4;
          return (
            <div key={dk} className="flex-1 flex flex-col items-center gap-1">
              {burned > 0 && (
                <span className="text-[9px] text-gray-400 font-medium leading-none">{burned}</span>
              )}
              <div
                className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-green-400' : 'bg-gray-200'}`}
                style={{ height: h }}
              />
              <span className={`text-[10px] font-medium ${isToday ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LogItem({ log, onDelete }) {
  const c = TYPE_COLOR[log.type] ?? TYPE_COLOR['Kardio'];
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-lg`}>
        {PRESETS.find((p) => p.id === log.exerciseId)?.icon ?? '🏃'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{log.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[11px] font-medium ${c.text}`}>{log.type}</span>
          <span className="text-[11px] text-gray-400">·  {log.duration} menit</span>
          {log.caloriesBurned > 0 && (
            <span className="text-[11px] text-orange-500 font-semibold">−{log.caloriesBurned} kkal</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(log.logId)}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors text-sm"
      >
        ✕
      </button>
    </div>
  );
}


// ── Add Exercise Modal ────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', type: 'Kardio', duration: '', exerciseId: '' };

function AddExerciseModal({ isOpen, onClose, onLog, userWeight }) {
  const [step,        setStep]        = useState('pick');
  const [selected,    setSelected]    = useState(null);
  const [typeFilter,  setTypeFilter]  = useState('Semua');
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});

  const weight = userWeight ?? 65;

  const dur = Number(form.duration);
  const autoCalories = selected && dur > 0
    ? estimateCal(selected.met, dur, weight)
    : null;

  const handleDurationChange = (val) => {
    setForm((p) => ({ ...p, duration: val }));
    setErrors((p) => ({ ...p, duration: '' }));
  };

  const selectPreset = (preset) => {
    setSelected(preset);
    setForm({ name: preset.name, type: preset.type, duration: '', exerciseId: preset.id });
    setStep('detail');
  };

  const selectCustom = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setStep('detail');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi.';
    if (!form.duration || dur <= 0) e.duration = 'Durasi wajib diisi (menit > 0).';
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onLog({
      exerciseId:     form.exerciseId || 'custom',
      name:           form.name.trim(),
      type:           form.type,
      duration:       dur,
      caloriesBurned: autoCalories ?? 0,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep('pick'); setSelected(null); setForm(EMPTY_FORM);
    setErrors({}); setTypeFilter('Semua');
    onClose();
  };

  const filtered = typeFilter === 'Semua' ? PRESETS : PRESETS.filter((p) => p.type === typeFilter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {step === 'detail' && (
              <button onClick={() => setStep('pick')}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-sm font-semibold transition-colors">
                ←
              </button>
            )}
            <h2 className="text-base font-bold text-gray-800">
              {step === 'pick' ? 'Pilih Olahraga' : (selected ? selected.name : 'Olahraga Kustom')}
            </h2>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            ✕
          </button>
        </div>

        {/* ── Step 1: Pick ──────────────────────────────────────────── */}
        {step === 'pick' && (
          <>
            {/* Info MET singkat */}
            <div className="mx-5 mb-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex gap-2 items-start flex-shrink-0">
              <span className="text-blue-400 text-sm mt-0.5">ℹ️</span>
              <p className="text-[11px] text-blue-600 leading-relaxed">
                Nilai <strong>MET</strong> (Metabolic Equivalent of Task) menunjukkan intensitas olahraga.
                Makin tinggi MET, makin banyak kalori yang dibakar per menit.
              </p>
            </div>

            {/* Type filter */}
            <div className="px-5 pb-3 flex-shrink-0">
              <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {['Semua', ...EXERCISE_TYPES].map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      typeFilter === t
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {filtered.map((preset) => {
                  const c = TYPE_COLOR[preset.type];
                  return (
                    <button key={preset.id} onClick={() => selectPreset(preset)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border ${c.border} ${c.bg} hover:opacity-80 transition-opacity text-left`}>
                      <span className="text-xl flex-shrink-0">{preset.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${c.text} truncate`}>{preset.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">MET {preset.met}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={selectCustom}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-left">
                <span className="text-xl">➕</span>
                <div>
                  <p className="text-xs font-semibold text-gray-600">Olahraga Lainnya</p>
                  <p className="text-[10px] text-gray-400">Masukkan sendiri</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Detail ────────────────────────────────────────── */}
        {step === 'detail' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Nama Olahraga <span className="text-red-400">*</span>
                </label>
                <input type="text" value={form.name}
                  onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: '' })); }}
                  placeholder="Contoh: Lari pagi 5K"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 transition ${
                    errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-300 focus:border-green-400'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipe</label>
                <div className="flex gap-2 flex-wrap">
                  {EXERCISE_TYPES.map((t) => {
                    const c = TYPE_COLOR[t];
                    return (
                      <button key={t} onClick={() => setForm((p) => ({ ...p, type: t }))}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                          form.type === t
                            ? `${c.pill} text-white border-transparent`
                            : `bg-white ${c.text} ${c.border} hover:opacity-80`
                        }`}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Durasi <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input type="number" min="1" value={form.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    placeholder="30"
                    className={`w-full px-3 py-2.5 pr-16 border rounded-xl text-sm focus:outline-none focus:ring-1 transition ${
                      errors.duration ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-300 focus:border-green-400'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">menit</span>
                </div>
                {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
              </div>

              {/* ── Calorie estimate card (auto) ── */}
              {selected && dur > 0 && autoCalories !== null && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-orange-500 font-semibold uppercase tracking-wide mb-0.5">
                        🔥 Estimasi Kalori Dibakar
                      </p>
                      <p className="text-3xl font-black text-orange-600">
                        {autoCalories.toLocaleString('id-ID')}
                        <span className="text-base font-medium ml-1">kkal</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                        Otomatis
                      </span>
                    </div>
                  </div>

                  {/* Formula breakdown */}
                  <div className="mt-3 bg-white/60 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-gray-500 font-medium mb-1">Formula yang digunakan:</p>
                    <p className="text-[11px] text-gray-700 font-mono">
                      MET ({selected.met}) × BB ({weight} kg) × ({dur} mnt ÷ 60)
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      = {selected.met} × {weight} × {(dur / 60).toFixed(2)} ≈{' '}
                      <strong className="text-orange-600">{autoCalories} kkal</strong>
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                    Estimasi untuk berat badan <strong>{weight} kg</strong>.
                    {userWeight == null && ' Set berat badan di Profil untuk hasil lebih akurat.'}
                  </p>
                </div>
              )}

              {/* Kalori Dibakar — read only */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Kalori Dibakar
                </label>
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                  autoCalories != null
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <span className={`text-sm font-bold ${autoCalories != null ? 'text-orange-600' : 'text-gray-400'}`}>
                    {autoCalories != null
                      ? `${autoCalories.toLocaleString('id-ID')} kkal`
                      : '— isi durasi terlebih dahulu'}
                  </span>
                  <span className="text-[10px] font-semibold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    Otomatis
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Dihitung otomatis berdasarkan nilai MET, berat badan, dan durasi.
                </p>
              </div>


            </div>

            {/* Save button */}
            <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex-shrink-0">
              <button onClick={handleSave}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm">
                Simpan Olahraga
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Exercise() {
  const { user } = useAuth();
  const { logs, logExercise, removeLog, getTodayLogs } = useExercise();
  const [modalOpen, setModalOpen] = useState(false);

  const userWeight   = user?.profile?.weight ?? null;
  const todayLogs    = getTodayLogs();
  const todayBurned  = todayLogs.reduce((s, l) => s + (l.caloriesBurned ?? 0), 0);
  const todayMinutes = todayLogs.reduce((s, l) => s + (l.duration ?? 0), 0);

  const handleLog = (data) => {
    // If calories not filled, use estimate with user weight
    const cal = data.caloriesBurned > 0
      ? data.caloriesBurned
      : (() => {
          const preset = PRESETS.find((p) => p.id === data.exerciseId);
          return preset ? estimateCal(preset.met, data.duration, userWeight ?? 65) : 0;
        })();
    logExercise({ ...data, caloriesBurned: cal });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-28 space-y-5">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Olahraga</h1>
          <p className="text-sm text-gray-400 mt-0.5">Log aktivitas fisik harianmu</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          + Catat
        </button>
      </div>

      {/* ── Today summary ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon="🔥" label="Kalori Dibakar"
          value={todayBurned.toLocaleString('id-ID')} unit="kkal"
          bg="bg-orange-50" textColor="text-orange-600"
        />
        <StatCard
          icon="⏱️" label="Total Durasi"
          value={todayMinutes} unit="menit"
          bg="bg-blue-50" textColor="text-blue-600"
        />
        <StatCard
          icon="🏅" label="Sesi Hari Ini"
          value={todayLogs.length} unit="aktivitas"
          bg="bg-green-50" textColor="text-green-600"
        />
      </div>

      {/* ── Week chart ───────────────────────────────────────────────── */}
      <WeekChart logs={logs} />

      {/* ── Today's log ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-700">📋 Log Hari Ini</p>
          {todayBurned > 0 && (
            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
              −{todayBurned.toLocaleString('id-ID')} kkal
            </span>
          )}
        </div>
        <div className="px-4">
          {todayLogs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-2">🏃</p>
              <p className="text-sm text-gray-500 font-medium">Belum ada olahraga hari ini</p>
              <p className="text-xs text-gray-400 mt-1">Yuk mulai gerak untuk jaga kesehatan!</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors"
              >
                + Catat Olahraga
              </button>
            </div>
          ) : (
            todayLogs.map((log) => (
              <LogItem key={log.logId} log={log} onDelete={removeLog} />
            ))
          )}
        </div>
      </div>

      {/* ── Rekomendasi ──────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">💡 Rekomendasi untuk Kamu</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { preset: PRESETS[0],  tip: 'Bakar lemak efektif'        },
            { preset: PRESETS[11], tip: 'Rileks & fleksibel'          },
            { preset: PRESETS[14], tip: 'Maksimal dalam waktu singkat' },
            { preset: PRESETS[6],  tip: 'Bangun otot tanpa alat'      },
          ].map(({ preset, tip }) => {
            const c = TYPE_COLOR[preset.type];
            return (
              <button
                key={preset.id}
                onClick={() => setModalOpen(true)}
                className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border ${c.border} ${c.bg} text-left hover:opacity-80 transition-opacity`}
              >
                <span className="text-2xl">{preset.icon}</span>
                <p className={`text-sm font-bold ${c.text}`}>{preset.name}</p>
                <p className="text-[11px] text-gray-400 leading-snug">{tip}</p>
                <span className={`text-[10px] font-semibold ${c.text} opacity-70 mt-0.5`}>
                  MET {preset.met} · {c.text.replace('text-', '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tips ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-400 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold opacity-75 mb-1.5">🏆 Tips Olahraga</p>
        <p className="text-sm font-medium leading-relaxed">
          WHO merekomendasikan minimal <strong>150 menit</strong> aktivitas fisik sedang per minggu.
          Itu setara 30 menit olahraga, 5 hari seminggu — cocok untuk jadwal kuliah!
        </p>
      </div>

      {/* ── Modal ────────────────────────────────────────────────────── */}
      <AddExerciseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLog={handleLog}
        userWeight={userWeight}
      />
    </div>
  );
}
