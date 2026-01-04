// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart } from 'lucide-react'; 

// ADDED new props: onCartClick, cartItemCount
const Navbar = ({ onCartClick, cartItemCount }) => {
  const { isAuthenticated, role, logout, user } = useAuth();
  const navigate = useNavigate();
  
  // MODIFIED: Handlers now navigate directly to a new options page/route
  const handleLoginClick = () => {
    // Navigate to a dedicated page/route that shows the three login options
    navigate('/login-options');
  };

  const handleRegisterClick = () => {
    // Navigate to a dedicated page/route that shows the three registration options
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

  // Determine the display location
  const displayIl = user?.il || 'Şehir Seçiniz'; 
  
  // Define styles for the location display (using simple text)
  const locationDisplay = (
    <div className="flex items-center space-x-1 text-white bg-primary-dark/50 py-1 px-3 rounded-full text-sm font-medium">
      {/* Simple location indicator */}
      <span>📍</span> 
      <span>{displayIl}</span>
    </div>
  );

  return (
    <header className="bg-primary-orange shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold tracking-wider hover:text-white/90">
          {/* Logo Metni Çevirisi */}
          YEMEKSEPETİ CLONE
        </Link>

        {/* Navigation Links / Navigasyon Bağlantıları */}
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-secondary-light transition duration-200">
            {/* Bağlantı Metni Çevirisi */}
            Restoranlar
          </Link>
          
          {/* Added Cart Button for Customers */}
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
            // Authenticated section starts here
            <>
              {/* Display User/Restaurant IL */}
              {locationDisplay}

              {/* Logged In Links / Giriş Yapılmış Bağlantılar */}
              <Link 
                to={getDashboardPath()} 
                className="text-white font-medium hover:text-secondary-light transition duration-200"
              >
                {/* Kullanıcı Adı veya Kontrol Paneli Çevirisi */}
                {user?.name || 'Kontrol Paneli'}
              </Link>

              {role === 'customer' && (
                <Link 
                  to="/customer/orders" 
                  className="text-white hover:text-secondary-light transition duration-200"
                >
                  {/* Bağlantı Metni Çevirisi */}
                  Siparişlerim
                </Link>
              )}

              <button 
                onClick={handleLogout} 
                className="bg-white text-primary-orange font-semibold py-1.5 px-4 rounded-full shadow-lg hover:bg-gray-100 transition duration-200"
              >
                {/* Buton Metni Çevirisi */}
                Çıkış Yap
              </button>
            </>
          ) : (
            // Not Authenticated section starts here
            <>
              {/* Not Logged In Links / Giriş Yapılmamış Bağlantılar */}
              
              {/* Giriş Yap - Direct Navigation to Options Page */}
              <div className="relative">
                <button 
                  onClick={handleLoginClick} // MODIFIED: Use new handler
                  className="text-white hover:text-secondary-light px-2 py-1.5"
                  // TEMP DEBUG: Add a distinct border for mobile troubleshooting
                  // style={{ border: '2px solid yellow' }} 
                >
                  {/* Buton Metni Çevirisi */}
                  Giriş Yap
                </button>
              </div>

              {/* Kaydol - Direct Navigation to Options Page */}
              <div className="relative">
                <button 
                  onClick={handleRegisterClick} // MODIFIED: Use new handler
                  className="bg-primary-dark text-white font-semibold py-1.5 px-4 rounded-full shadow-lg hover:bg-primary-dark/90 transition duration-200"
                  // TEMP DEBUG: Add a distinct border for mobile troubleshooting
                  // style={{ border: '2px solid lime' }} 
                >
                  {/* Buton Metni Çevirisi */}
                  Kaydol
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
