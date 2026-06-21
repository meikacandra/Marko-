import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DAILY_TARGETS } from '../constants/nutrition';

// ── Storage keys ──────────────────────────────────────────────────────────────
const KEYS = {
  USERS:   'marko_users',    // array semua akun terdaftar
  SESSION: 'marko_session',  // sesi user yang sedang login
};

// ── localStorage helpers ──────────────────────────────────────────────────────
const readUsers   = () => { try { return JSON.parse(localStorage.getItem(KEYS.USERS))   ?? []; } catch { return []; } };
const readSession = () => { try { return JSON.parse(localStorage.getItem(KEYS.SESSION)) ?? null; } catch { return null; } };

// ── Pesan error ───────────────────────────────────────────────────────────────
const ERRORS = {
  FIELD_EMPTY:   'Email dan password wajib diisi.',
  EMAIL_INVALID: 'Format email tidak valid.',
  EMAIL_TAKEN:   'Email sudah terdaftar. Gunakan email lain.',
  PASS_SHORT:    'Password minimal 6 karakter.',
  WRONG_CRED:    'Email atau password salah.',
};

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true sampai localStorage dibaca
  const [error,   setError]   = useState(null);

  // Pulihkan sesi dari localStorage saat app dibuka
  useEffect(() => {
    setUser(readSession());
    setLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ── Buat & simpan sesi (password TIDAK disertakan) ────────────────────────
  const openSession = useCallback((userData) => {
    const session = {
      uid:           userData.uid,
      email:         userData.email,
      displayName:   userData.displayName,
      calorieTarget: userData.calorieTarget ?? DAILY_TARGETS.calories,
      // Profil kesehatan opsional — diisi di halaman Profile
      profile: userData.profile ?? null,
      // Token sederhana, diperbarui setiap login
      token:   crypto.randomUUID(),
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  // Params: email, password, displayName (nama), calorieTarget (target kalori/hari)
  const register = useCallback((email, password, displayName = '', calorieTarget = DAILY_TARGETS.calories) => {
    setError(null);

    const trimEmail = email.trim().toLowerCase();
    const trimName  = displayName.trim();

    // Validasi
    if (!trimEmail || !password) { const m = ERRORS.FIELD_EMPTY;   setError(m); throw new Error(m); }
    if (!isValidEmail(trimEmail)) { const m = ERRORS.EMAIL_INVALID; setError(m); throw new Error(m); }
    if (password.length < 6)      { const m = ERRORS.PASS_SHORT;    setError(m); throw new Error(m); }

    const users = readUsers();
    if (users.find((u) => u.email === trimEmail)) {
      setError(ERRORS.EMAIL_TAKEN);
      throw new Error(ERRORS.EMAIL_TAKEN);
    }

    // Simpan user baru ke daftar
    const newUser = {
      uid:           crypto.randomUUID(),
      email:         trimEmail,
      password,                                    // plain-text, hanya untuk demo lokal
      displayName:   trimName || trimEmail.split('@')[0],
      calorieTarget: Number(calorieTarget) || DAILY_TARGETS.calories,
      profile:       null,
      createdAt:     new Date().toISOString(),
    };
    localStorage.setItem(KEYS.USERS, JSON.stringify([...users, newUser]));

    return openSession(newUser);
  }, [openSession]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    setError(null);

    const match = readUsers().find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    );

    if (!match) {
      setError(ERRORS.WRONG_CRED);
      throw new Error(ERRORS.WRONG_CRED);
    }

    return openSession(match);
  }, [openSession]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(KEYS.SESSION);
    setUser(null);
  }, []);

  // ── Update profil kesehatan & target kalori ───────────────────────────────
  // profileData: { weight?, height?, age?, gender?, activityLevel?, calorieTarget? }
  const updateProfile = useCallback((profileData) => {
    if (!user) return;

    const updated = {
      ...user,
      calorieTarget: profileData.calorieTarget ?? user.calorieTarget,
      profile: { ...(user.profile ?? {}), ...profileData },
    };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(updated));
    setUser(updated);

    // Sinkronisasi ke daftar user agar data terbawa saat login berikutnya
    const users = readUsers().map((u) =>
      u.uid === user.uid
        ? { ...u, calorieTarget: updated.calorieTarget, profile: updated.profile }
        : u,
    );
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }, [user]);

  const value = {
    user,              // { uid, email, displayName, calorieTarget, profile, token, loginAt } | null
    loading,           // true selama baca localStorage awal
    error,             // pesan error terakhir | null
    isAuthenticated: !!user,
    clearError,
    register,          // (email, password, displayName, calorieTarget) => session
    login,             // (email, password) => session
    logout,            // () => void
    updateProfile,     // (profileData) => void — update data kesehatan & target kalori
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom hook ───────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  return ctx;
}
