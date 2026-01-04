import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

const Navbar = ({ onCartClick, cartItemCount = 0 }) => {
  const { isAuthenticated, role, logout, user } = useAuth();
  const navigate = useNavigate();

  // =====================
  // Handlers
  // =====================
  const handleLoginClick = () => {
    navigate('/login-options');
  };

  const handleRegisterClick = () => {
    navigate('/register-options');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'customer') return '/customer/dashboard';
    if (role === 'restaurant') return '/restaurant/dashboard';
    if (role === 'delivery') return '/delivery/dashboard';
    return '/';
  };

  const displayIl = user?.il || 'Şehir Seçiniz';

  return (
    <header
      className="
        bg-primary-orange
        shadow-md
        sticky top-0
        z-[9999]             /* 🔴 VERY IMPORTANT FOR MOBILE */
        pointer-events-auto
      "
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">

          {/* =====================
              LOGO
          ===================== */}
          <Link
            to="/"
            className="text-white text-2xl font-bold tracking-wider hover:text-white/90"
          >
            YEMEKSEPETİ CLONE
          </Link>

          {/* =====================
              NAVIGATION
          ===================== */}
          <nav className="flex items-center space-x-4 sm:space-x-6 pointer-events-auto">

            <Link
              to="/"
              className="text-white hover:text-secondary-light transition"
            >
              Restoranlar
            </Link>

            {/* =====================
                CART (CUSTOMER)
            ===================== */}
            {role === 'customer' && (
              <button
                type="button"
                onClick={onCartClick}
                className="relative p-2 text-white hover:text-secondary-light transition pointer-events-auto"
                aria-label="Sepetim"
              >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="
                    absolute -top-1 -right-1
                    bg-red-600 text-white text-xs
                    w-5 h-5 flex items-center justify-center
                    rounded-full
                  ">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* =====================
                AUTH SECTION
            ===================== */}
            {isAuthenticated ? (
              <>
                {/* Location */}
                <div className="hidden sm:flex items-center text-white bg-primary-dark/50 px-3 py-1 rounded-full text-sm">
                  📍 {displayIl}
                </div>

                {/* Dashboard */}
                <Link
                  to={getDashboardPath()}
                  className="text-white font-medium hover:text-secondary-light transition"
                >
                  {user?.name || 'Kontrol Paneli'}
                </Link>

                {/* Orders */}
                {role === 'customer' && (
                  <Link
                    to="/customer/orders"
                    className="text-white hover:text-secondary-light transition"
                  >
                    Siparişlerim
                  </Link>
                )}

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    bg-white text-primary-orange font-semibold
                    py-1.5 px-4 rounded-full
                    hover:bg-gray-100 transition
                    pointer-events-auto
                  "
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                {/* LOGIN */}
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="
                    text-white hover:text-secondary-light
                    px-2 py-1.5
                    pointer-events-auto
                  "
                >
                  Giriş Yap
                </button>

                {/* REGISTER */}
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="
                    bg-primary-dark text-white font-semibold
                    py-1.5 px-4 rounded-full
                    hover:bg-primary-dark/90 transition
                    pointer-events-auto
                  "
                >
                  Kaydol
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
