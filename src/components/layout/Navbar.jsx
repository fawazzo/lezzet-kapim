import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Menu, X } from 'lucide-react';

const Navbar = ({ onCartClick, cartItemCount = 0 }) => {
  const { isAuthenticated, role, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLoginClick = () => {
    setMobileOpen(false);
    navigate('/login-options');
  };

  const handleRegisterClick = () => {
    setMobileOpen(false);
    navigate('/register-options');
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'customer') return '/customer/dashboard';
    if (role === 'restaurant') return '/restaurant/dashboard';
    if (role === 'delivery') return '/delivery/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-[9999] bg-primary-orange shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="text-white text-xl font-bold">
          YEMEKSEPETİ CLONE
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center space-x-6">

          <Link to="/" className="text-white">Restoranlar</Link>

          {role === 'customer' && (
            <button onClick={onCartClick} className="relative text-white">
              <ShoppingCart />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="text-white">
                {user?.name || 'Panel'}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-primary-orange px-4 py-1.5 rounded-full"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <button onClick={handleLoginClick} className="text-white">
                Giriş Yap
              </button>
              <button
                onClick={handleRegisterClick}
                className="bg-primary-dark px-4 py-1.5 rounded-full text-white"
              >
                Kaydol
              </button>
            </>
          )}
        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={28} />
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />

          {/* MENU */}
          <div className="fixed top-0 right-0 w-72 h-full bg-white z-50 p-6 flex flex-col space-y-4">
            <button
              className="self-end"
              onClick={() => setMobileOpen(false)}
            >
              <X size={24} />
            </button>

            <Link to="/" onClick={() => setMobileOpen(false)}>
              Restoranlar
            </Link>

            {role === 'customer' && (
              <button onClick={onCartClick} className="flex items-center gap-2">
                <ShoppingCart /> Sepetim
              </button>
            )}

            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} onClick={() => setMobileOpen(false)}>
                  {user?.name || 'Panel'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary-orange text-white py-2 rounded"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <button onClick={handleLoginClick}>Giriş Yap</button>
                <button
                  onClick={handleRegisterClick}
                  className="bg-primary-orange text-white py-2 rounded"
                >
                  Kaydol
                </button>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
