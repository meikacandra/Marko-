import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';
import { APP_NAME, APP_TAGLINE } from '../../../constants/config';

const inputClass =
  'w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 transition';
const inputNormal = `${inputClass} border-gray-200 focus:border-green-400 focus:ring-green-200`;
const inputError  = `${inputClass} border-red-300 focus:border-red-400 focus:ring-red-100`;

export default function Login() {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? ROUTES.HOME;

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);
  useEffect(() => () => clearError(), []);

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.password)        e.password = 'Password wajib diisi.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch {
      // error sudah di-set oleh AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-3 shadow-md">
            <span className="text-white text-2xl font-black">M</span>
          </div>
          <h1 className="text-2xl font-black text-gray-800">{APP_NAME}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{APP_TAGLINE}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Masuk ke Akun</h2>

          {/* Error dari AuthContext */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2.5 mb-4">
              <span className="mt-px">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: '' })); }}
                placeholder="nama@email.com"
                autoComplete="email"
                className={errors.email ? inputError : inputNormal}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: '' })); }}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className={`${errors.password ? inputError : inputNormal} pr-10`}
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
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors mt-1"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Belum punya akun?{' '}
          <Link to={ROUTES.REGISTER} className="text-green-600 font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
