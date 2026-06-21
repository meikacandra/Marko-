import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../constants/config';
import { ROUTES } from '../../constants/routes';

const nl = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen]  = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="text-xl font-black text-green-600 tracking-tight">
          {APP_NAME}
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to={ROUTES.RECIPES}  className={nl}>Resep</NavLink>
          {user && (
            <>
              <NavLink to={ROUTES.MY_RECIPES}   className={nl}>Resep Saya</NavLink>
              <NavLink to={ROUTES.FAVORITES}    className={nl}>Favorit</NavLink>
              <NavLink to={ROUTES.MEAL_PLANNER} className={nl}>Meal Plan</NavLink>
              <NavLink to={ROUTES.TRACKER}      className={nl}>Tracker</NavLink>
              <NavLink to={ROUTES.EXERCISE}     className={nl}>Olahraga</NavLink>
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NavLink to={ROUTES.PROFILE} className="text-sm text-gray-600 hover:text-green-600 font-medium">{user.displayName}</NavLink>
              <button onClick={logout} className="text-sm text-red-400 hover:text-red-500 font-medium">Keluar</button>
            </>
          ) : (
            <>
              <NavLink to={ROUTES.LOGIN} className="text-sm text-gray-600 hover:text-green-600 font-medium">Masuk</NavLink>
              <Link to={ROUTES.REGISTER} className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Daftar</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-gray-600 text-2xl" onClick={() => setOpen(o => !o)}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          <NavLink to={ROUTES.RECIPES}  className={nl} onClick={() => setOpen(false)}>Resep</NavLink>
          {user && (
            <>
              <NavLink to={ROUTES.MY_RECIPES}   className={nl} onClick={() => setOpen(false)}>Resep Saya</NavLink>
              <NavLink to={ROUTES.FAVORITES}    className={nl} onClick={() => setOpen(false)}>Favorit</NavLink>
              <NavLink to={ROUTES.MEAL_PLANNER} className={nl} onClick={() => setOpen(false)}>Meal Plan</NavLink>
              <NavLink to={ROUTES.TRACKER}      className={nl} onClick={() => setOpen(false)}>Tracker</NavLink>
              <NavLink to={ROUTES.EXERCISE}     className={nl} onClick={() => setOpen(false)}>Olahraga</NavLink>
              <NavLink to={ROUTES.PROFILE}      className={nl} onClick={() => setOpen(false)}>Profil</NavLink>
              <button onClick={() => { logout(); setOpen(false); }} className="text-left text-sm text-red-400 font-medium">Keluar</button>
            </>
          )}
          {!user && (
            <>
              <NavLink to={ROUTES.LOGIN}    className={nl} onClick={() => setOpen(false)}>Masuk</NavLink>
              <NavLink to={ROUTES.REGISTER} className={nl} onClick={() => setOpen(false)}>Daftar</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
