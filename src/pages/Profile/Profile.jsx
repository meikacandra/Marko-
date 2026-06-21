import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calcBMR, calcTDEE, calcMacroTargets } from '../../utils/nutrition';
import { DAILY_TARGETS } from '../../constants/nutrition';
import { ROUTES } from '../../constants/routes';

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',   label: 'Sangat Jarang',  desc: 'Hampir tidak olahraga'     },
  { value: 'light',       label: 'Ringan',          desc: '1–3x olahraga/minggu'      },
  { value: 'moderate',    label: 'Sedang',          desc: '3–5x olahraga/minggu'      },
  { value: 'active',      label: 'Aktif',           desc: '6–7x olahraga/minggu'      },
  { value: 'very_active', label: 'Sangat Aktif',    desc: 'Latihan berat 2x/hari'     },
];

const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition';

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcSuggested(form) {
  const w = Number(form.weight);
  const h = Number(form.height);
  const a = Number(form.age);
  if (!w || !h || !a || w < 10 || h < 50 || a < 10) return null;
  const bmr  = calcBMR(form.gender || 'male', w, h, a);
  const tdee = calcTDEE(bmr, form.activityLevel || 'moderate');
  return tdee;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value ?? '—'}</span>
    </div>
  );
}

function MacroChip({ label, value, unit, bg, text }) {
  return (
    <div className={`${bg} rounded-xl p-3 text-center`}>
      <p className={`text-lg font-black ${text}`}>{value ?? '—'}</p>
      <p className={`text-[10px] ${text} opacity-70`}>{unit}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [form,     setForm]     = useState({
    weight:        '',
    height:        '',
    age:           '',
    gender:        'male',
    activityLevel: 'moderate',
    calorieTarget: '',
  });

  // Populate form from stored profile
  useEffect(() => {
    if (!user) return;
    setForm({
      weight:        user.profile?.weight        ?? '',
      height:        user.profile?.height        ?? '',
      age:           user.profile?.age           ?? '',
      gender:        user.profile?.gender        ?? 'male',
      activityLevel: user.profile?.activityLevel ?? 'moderate',
      calorieTarget: user.calorieTarget !== DAILY_TARGETS.calories
                       ? String(user.calorieTarget)
                       : '',
    });
  }, [user]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const suggested     = calcSuggested(form);
  const calorieTarget = user?.calorieTarget ?? DAILY_TARGETS.calories;
  const macros        = calcMacroTargets(calorieTarget);

  const handleSave = () => {
    setSaving(true);
    const calTarget = form.calorieTarget
      ? Number(form.calorieTarget)
      : (suggested ?? DAILY_TARGETS.calories);

    updateProfile({
      weight:        form.weight        ? Number(form.weight)  : undefined,
      height:        form.height        ? Number(form.height)  : undefined,
      age:           form.age           ? Number(form.age)     : undefined,
      gender:        form.gender        || undefined,
      activityLevel: form.activityLevel || undefined,
      calorieTarget: calTarget,
    });

    setSaving(false);
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-5">

      {/* ── Avatar + name ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl p-6 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mx-auto mb-3">
          {user.displayName?.[0]?.toUpperCase() ?? '👤'}
        </div>
        <h1 className="text-xl font-black">{user.displayName}</h1>
        <p className="text-sm opacity-80 mt-0.5">{user.email}</p>
        <p className="text-xs opacity-60 mt-1">
          Bergabung sejak {new Date(user.loginAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl px-4 py-3 flex items-center gap-2">
          ✅ Profil berhasil diperbarui!
        </div>
      )}

      {/* ── Kalori target ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Target Harianmu</p>
        <div className="grid grid-cols-4 gap-2">
          <MacroChip label="Kalori"  value={calorieTarget} unit="kkal" bg="bg-orange-50" text="text-orange-600" />
          <MacroChip label="Protein" value={macros.protein} unit="g"    bg="bg-blue-50"   text="text-blue-600"   />
          <MacroChip label="Karbo"   value={macros.carbs}   unit="g"    bg="bg-yellow-50" text="text-yellow-600" />
          <MacroChip label="Lemak"   value={macros.fat}     unit="g"    bg="bg-red-50"    text="text-red-500"    />
        </div>
      </div>

      {/* ── Data Kesehatan ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-700">🩺 Data Kesehatan</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-green-600 font-semibold hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {/* View mode */}
        {!editing && (
          <div>
            <InfoRow label="Berat Badan"     value={user.profile?.weight ? `${user.profile.weight} kg` : null} />
            <InfoRow label="Tinggi Badan"    value={user.profile?.height ? `${user.profile.height} cm` : null} />
            <InfoRow label="Usia"            value={user.profile?.age    ? `${user.profile.age} tahun`  : null} />
            <InfoRow label="Jenis Kelamin"   value={user.profile?.gender === 'female' ? 'Perempuan' : user.profile?.gender === 'male' ? 'Laki-laki' : null} />
            <InfoRow
              label="Tingkat Aktivitas"
              value={ACTIVITY_OPTIONS.find((a) => a.value === user.profile?.activityLevel)?.label ?? null}
            />
            {!user.profile?.weight && !user.profile?.height && (
              <p className="text-xs text-gray-400 text-center py-3">
                Data kesehatan belum diisi.{' '}
                <button onClick={() => setEditing(true)} className="text-green-600 font-medium hover:underline">
                  Isi sekarang
                </button>
              </p>
            )}
          </div>
        )}

        {/* Edit mode */}
        {editing && (
          <div className="space-y-4">
            {/* Jenis kelamin */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Jenis Kelamin</label>
              <div className="flex gap-2">
                {[{ value: 'male', label: '👨 Laki-laki' }, { value: 'female', label: '👩 Perempuan' }].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, gender: g.value }))}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                      form.gender === g.value
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight, height, age */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'weight', label: 'Berat',  unit: 'kg',  placeholder: '60', min: 10,  max: 300 },
                { key: 'height', label: 'Tinggi', unit: 'cm',  placeholder: '165', min: 50, max: 250 },
                { key: 'age',    label: 'Usia',   unit: 'thn', placeholder: '21', min: 10,  max: 100 },
              ].map(({ key, label, unit, placeholder, min, max }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={min} max={max}
                      value={form[key]}
                      onChange={set(key)}
                      placeholder={placeholder}
                      className={`${inputClass} pr-8`}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity level */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tingkat Aktivitas</label>
              <div className="space-y-1.5">
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, activityLevel: opt.value }))}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-colors ${
                      form.activityLevel === opt.value
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-green-200'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
                    </div>
                    {form.activityLevel === opt.value && (
                      <span className="text-green-500 text-sm">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Calorie target */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Target Kalori Harian
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={500} max={6000}
                  value={form.calorieTarget}
                  onChange={set('calorieTarget')}
                  placeholder={suggested ? String(suggested) : String(DAILY_TARGETS.calories)}
                  className={`${inputClass} pr-12`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  kkal
                </span>
              </div>

              {/* Suggestion chip */}
              {suggested && !form.calorieTarget && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, calorieTarget: String(suggested) }))}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors"
                >
                  ✓ Pakai hasil hitung: {suggested.toLocaleString('id-ID')} kkal
                </button>
              )}
              {suggested && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Estimasi TDEE berdasarkan data tubuh & aktivitasmu.
                </p>
              )}
              {!suggested && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Isi berat, tinggi & usia untuk mendapatkan estimasi otomatis.
                </p>
              )}
            </div>

            {/* Edit actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Akun ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-700 mb-3">👤 Akun</p>
        <InfoRow label="Email"      value={user.email} />
        <InfoRow label="Nama"       value={user.displayName} />
        <InfoRow label="Token Login" value={user.token?.slice(0, 8) + '...'} />
      </div>

      {/* ── Logout ────────────────────────────────────────────────────── */}
      <button
        onClick={handleLogout}
        className="w-full py-3 border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 font-semibold rounded-2xl text-sm transition-colors"
      >
        🚪 Keluar dari Akun
      </button>
    </div>
  );
}
