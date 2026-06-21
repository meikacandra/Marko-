import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';
import { APP_NAME, APP_TAGLINE } from '../../../constants/config';
import { DAILY_TARGETS } from '../../../constants/nutrition';

// ── Kalkulasi saran kalori dari BB & TB (Mifflin-St Jeor, usia 22, moderat) ──
const suggestCalories = (weight, height) => {
  if (!weight || !height || weight < 30 || height < 100) return null;
  // Rata-rata gender: pakai nilai tengah formula pria & wanita
  const bmrMale   = 10 * weight + 6.25 * height - 5 * 22 + 5;
  const bmrFemale = 10 * weight + 6.25 * height - 5 * 22 - 161;
  const bmr       = (bmrMale + bmrFemale) / 2;
  return Math.round(bmr * 1.55); // faktor aktivitas moderat
};

const inputBase  = 'w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 transition';
const inputOk    = `${inputBase} border-gray-200 focus:border-green-400 focus:ring-green-200`;
const inputErr   = `${inputBase} border-red-300 focus:border-red-400 focus:ring-red-100`;

function Field({ label, error, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {!required && <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Password strength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const level = password.length >= 10 ? 3 : password.length >= 8 ? 2 : password.length >= 6 ? 1 : 0;
  const labels = ['', 'Lemah', 'Cukup', 'Kuat'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-0.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= level ? colors[level] : 'bg-gray-200'}`} />
        ))}
      </div>
      {level > 0 && <p className={`text-xs ${level === 3 ? 'text-green-600' : level === 2 ? 'text-yellow-600' : 'text-red-500'}`}>{labels[level]}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Register() {
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:          '',
    email:         '',
    password:      '',
    confirm:       '',
    weight:        '',   // kg
    height:        '',   // cm
    calorieTarget: '',   // kkal — jika kosong pakai default atau saran
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  useEffect(() => { if (isAuthenticated) navigate(ROUTES.HOME, { replace: true }); }, [isAuthenticated]);
  useEffect(() => () => clearError(), []);

  // Auto-isi saran kalori saat BB/TB berubah dan kolom kalori masih kosong
  useEffect(() => {
    if (form.calorieTarget) return; // jangan override jika user sudah isi sendiri
    const suggestion = suggestCalories(Number(form.weight), Number(form.height));
    if (suggestion) setForm((p) => ({ ...p, _calorieSuggestion: suggestion }));
    else            setForm((p) => ({ ...p, _calorieSuggestion: null }));
  }, [form.weight, form.height]);

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  // ── Validasi ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name     = 'Nama wajib diisi.';
    if (!form.email.trim())       e.email    = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.password)           e.password = 'Password wajib diisi.';
    else if (form.password.length < 6)        e.password = 'Password minimal 6 karakter.';
    if (form.password !== form.confirm)       e.confirm  = 'Password tidak cocok.';
    if (form.weight && (isNaN(form.weight) || Number(form.weight) < 10 || Number(form.weight) > 300))
      e.weight = 'Masukkan berat yang valid (10–300 kg).';
    if (form.height && (isNaN(form.height) || Number(form.height) < 50 || Number(form.height) > 250))
      e.height = 'Masukkan tinggi yang valid (50–250 cm).';
    if (form.calorieTarget && (isNaN(form.calorieTarget) || Number(form.calorieTarget) < 500 || Number(form.calorieTarget) > 6000))
      e.calorieTarget = 'Target kalori harus antara 500–6000 kkal.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    // Tentukan target kalori: input user → saran → default
    const calorieTarget = form.calorieTarget
      ? Number(form.calorieTarget)
      : (form._calorieSuggestion ?? DAILY_TARGETS.calories);

    try {
      await register(form.email.trim(), form.password, form.name.trim(), calorieTarget);
      // Setelah register, update data kesehatan jika diisi
      // (updateProfile dipanggil terpisah di Profile page, tapi bisa juga langsung di sini)
      navigate(ROUTES.HOME, { replace: true });
    } catch {
      // error sudah di-set oleh AuthContext
    } finally {
      setLoading(false);
    }
  };

  const suggestion = form._calorieSuggestion;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-3 shadow-md">
            <span className="text-white text-2xl font-black">M</span>
          </div>
          <h1 className="text-2xl font-black text-gray-800">{APP_NAME}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{APP_TAGLINE}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Buat Akun Baru</h2>

          {/* Error dari AuthContext */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2.5 mb-4">
              <span className="mt-px">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── Seksi 1: Data Akun ────────────────────────────────────── */}
            <div className="space-y-4">
              <SectionTitle icon="👤" title="Data Akun" />

              <Field label="Nama Lengkap" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Nama kamu"
                  autoComplete="name"
                  className={errors.name ? inputErr : inputOk}
                />
              </Field>

              <Field label="Email" required error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className={errors.email ? inputErr : inputOk}
                />
              </Field>

              <Field label="Password" required error={errors.password}>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    className={`${errors.password ? inputErr : inputOk} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm select-none"
                    tabIndex={-1}
                  >
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </Field>

              <Field label="Konfirmasi Password" required error={errors.confirm}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  className={
                    errors.confirm
                      ? inputErr
                      : form.confirm && form.confirm !== form.password
                      ? inputErr
                      : inputOk
                  }
                />
                {form.confirm && form.confirm !== form.password && !errors.confirm && (
                  <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>
                )}
              </Field>
            </div>

            {/* ── Seksi 2: Data Kesehatan (opsional) ───────────────────── */}
            <div className="space-y-4">
              <SectionTitle
                icon="🩺"
                title="Data Kesehatan"
                subtitle="Opsional — untuk fitur tracker nutrisi & kalori"
              />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Berat Badan" error={errors.weight} hint="kg">
                  <input
                    type="number"
                    value={form.weight}
                    onChange={set('weight')}
                    placeholder="55"
                    min={10} max={300}
                    className={errors.weight ? inputErr : inputOk}
                  />
                </Field>
                <Field label="Tinggi Badan" error={errors.height} hint="cm">
                  <input
                    type="number"
                    value={form.height}
                    onChange={set('height')}
                    placeholder="165"
                    min={50} max={250}
                    className={errors.height ? inputErr : inputOk}
                  />
                </Field>
              </div>

              <Field
                label="Target Kalori Harian"
                error={errors.calorieTarget}
                hint={
                  suggestion && !form.calorieTarget
                    ? `Saran berdasarkan BB & TB kamu: ±${suggestion.toLocaleString('id-ID')} kkal/hari`
                    : `Default: ${DAILY_TARGETS.calories.toLocaleString('id-ID')} kkal/hari jika dikosongkan`
                }
              >
                <div className="relative">
                  <input
                    type="number"
                    value={form.calorieTarget}
                    onChange={set('calorieTarget')}
                    placeholder={suggestion ? String(suggestion) : String(DAILY_TARGETS.calories)}
                    min={500} max={6000}
                    className={`${errors.calorieTarget ? inputErr : inputOk} pr-14`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    kkal
                  </span>
                </div>

                {/* Chip saran kalori */}
                {suggestion && !form.calorieTarget && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, calorieTarget: String(suggestion) }))}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors"
                  >
                    ✓ Pakai saran: {suggestion.toLocaleString('id-ID')} kkal
                  </button>
                )}
              </Field>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-xs text-blue-600 leading-relaxed">
                💡 Data kesehatan digunakan untuk menghitung kebutuhan kalori harianmu secara otomatis.
                Kamu bisa mengisinya nanti di halaman <strong>Profil</strong>.
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Membuat akun...' : 'Buat Akun'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{' '}
          <Link to={ROUTES.LOGIN} className="text-green-600 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
