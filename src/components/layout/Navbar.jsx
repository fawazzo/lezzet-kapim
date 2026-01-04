// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

const Navbar = ({ onCartClick, cartItemCount }) => {
  const { isAuthenticated, role, logout, user } = useAuth();
  const navigate = useNavigate();
  
  // REMOVED: Unnecessary click handlers for login and register
  // const handleLoginClick = () => { ... };
  // const handleRegisterClick = () => { ... };
  
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
  
  const locationDisplay = (
    <div className="flex items-center space-x-1 text-white bg-primary-dark/50 py-1 px-3 rounded-full text-sm font-medium">
      <span>📍</span> 
      <span>{displayIl}</span>
    </div>
  );

  return (
    <header className="bg-primary-orange shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold tracking-wider hover:text-white/90">
          YEMEKSEPETİ CLONE
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-secondary-light transition duration-200">
            Restoranlar
          </Link>
          
          {role === 'customer' && (
            <button
                onClick={onCartClick}
                className="relative p-2 text-white hover:text-secondary-light transition duration-200"
                title="Sepetim"
            >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {cartItemCount}
                    </span>
                )}
            </button>
          )}

          {isAuthenticated ? (
            // Authenticated section
            <>
              {locationDisplay}

              <Link 
                to={getDashboardPath()} 
                className="text-white font-medium hover:text-secondary-light transition duration-200"
              >
                {user?.name || 'Kontrol Paneli'}
              </Link>

              {role === 'customer' && (
                <Link 
                  to="/customer/orders" 
                  className="text-white hover:text-secondary-light transition duration-200"
                >
                  Siparişlerim
                </Link>
              )}

              <button 
                onClick={handleLogout} 
                className="bg-white text-primary-orange font-semibold py-1.5 px-4 rounded-full shadow-lg hover:bg-gray-100 transition duration-200"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            // Not Authenticated section
            <>
              {/* Not Logged In Links */}
              
              {/* MODIFIED: Changed Giriş Yap button to a Link */}
              <Link
                to="/login-options"
                className="text-white hover:text-secondary-light transition duration-200"
              >
                Giriş Yap
              </Link>

              {/* MODIFIED: Changed Kaydol button to a Link */}
              <Link
                to="/register-options"
                className="bg-primary-dark text-white font-semibold py-1.5 px-4 rounded-full shadow-lg hover:bg-primary-dark/90 transition duration-200"
              >
                Kaydol
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
