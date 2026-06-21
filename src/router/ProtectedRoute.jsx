import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

function AuthSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
      <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Memuat...</p>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Tunggu sampai localStorage selesai dibaca — cegah flash redirect ke /login
  if (loading) return <AuthSpinner />;

  if (!isAuthenticated) {
    // Simpan URL asal agar setelah login bisa redirect balik ke halaman yang dituju
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}
