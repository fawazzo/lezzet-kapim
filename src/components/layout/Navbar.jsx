// src/components/layout/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react'; // ADDED useState, useRef, useEffect
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart } from 'lucide-react'; // Added lucide-react icon

// ADDED new props: onCartClick, cartItemCount
const Navbar = ({ onCartClick, cartItemCount }) => {
  const { isAuthenticated, role, logout, user } = useAuth();
  const navigate = useNavigate();
  
  // ADDED State for managing dropdown visibility
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // ADDED Refs to detect clicks outside the dropdowns
  const loginRef = useRef(null);
  const registerRef = useRef(null);

  // ADDED Function to close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is outside BOTH dropdown areas
      const isOutsideLogin = loginRef.current && !loginRef.current.contains(event.target);
      const isOutsideRegister = registerRef.current && !registerRef.current.contains(event.target);
      
      if (isOutsideLogin) {
        setIsLoginOpen(false);
      }
      if (isOutsideRegister) {
        setIsRegisterOpen(false);
      }
    }
    // Using 'mousedown' is generally better for dropdowns than 'click'
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // MODIFIED: Toggle Handlers with e.stopPropagation() for mobile reliability
  const toggleLogin = (e) => {
    e.stopPropagation(); // Prevents the click from immediately triggering handleClickOutside on document
    setIsLoginOpen(!isLoginOpen);
    setIsRegisterOpen(false); // Close the other one
  };

  const toggleRegister = (e) => {
    e.stopPropagation(); // Prevents the click from immediately triggering handleClickOutside on document
    setIsRegisterOpen(!isRegisterOpen);
    setIsLoginOpen(false); // Close the other one
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'customer') return '/customer/dashboard';
    if (role === 'restaurant') return '/restaurant/dashboard';
    if (role === 'delivery') return '/delivery/dashboard'; // ADDED: Delivery Dashboard
    return '/';
  };

  // Determine the display location
  const displayIl = user?.il || 'Şehir Seçiniz'; // Changed to Turkish default
  
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
              
              {/* Giriş Yap - Click-to-Open Dropdown */}
              {/* Ref added for outside click detection */}
              <div className="relative" ref={loginRef}>
                {/* Click handler added to button */}
                <button 
                  onClick={toggleLogin} 
                  className="text-white hover:text-secondary-light px-2 py-1.5"
                >
                  {/* Buton Metni Çevirisi */}
                  Giriş Yap
                </button>
                {/* Conditional visibility based on state */}
                <div 
                  className={`absolute right-0 w-48 bg-white rounded-md shadow-xl transition duration-300 ${
                    isLoginOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                  // Removed style={{ marginTop: 0 }}
                > 
                  <Link to="/customer/login" className="block px-4 py-2 text-primary-dark hover:bg-gray-100 rounded-t-md" onClick={() => setIsLoginOpen(false)}>
                    {/* Bağlantı Metni Çevirisi */}
                    Müşteri Girişi
                  </Link>
                  <Link to="/restaurant/login" className="block px-4 py-2 text-primary-dark hover:bg-gray-100" onClick={() => setIsLoginOpen(false)}>
                    {/* Bağlantı Metni Çevirisi */}
                    Restoran Girişi
                  </Link>
                  <Link to="/delivery/login" className="block px-4 py-2 text-primary-dark hover:bg-gray-100 rounded-b-md" onClick={() => setIsLoginOpen(false)}>
                    {/* Bağlantı Metni Çevirisi */}
                    Teslimatçı Girişi
                  </Link>
                </div>
              </div>

              {/* Kaydol - Click-to-Open Dropdown */}
              {/* Ref added for outside click detection */}
              <div className="relative" ref={registerRef}>
                {/* Click handler added to button */}
                <button 
                  onClick={toggleRegister} 
                  className="bg-primary-dark text-white font-semibold py-1.5 px-4 rounded-full shadow-lg hover:bg-primary-dark/90 transition duration-200"
                >
                  {/* Buton Metni Çevirisi */}
                  Kaydol
                </button>
                {/* Conditional visibility based on state */}
                <div 
                  className={`absolute right-0 w-48 bg-white rounded-md shadow-xl transition duration-300 ${
                    isRegisterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                  // Removed style={{ marginTop: 0 }}
                >
                  <Link to="/customer/register" className="block px-4 py-2 text-primary-dark hover:bg-gray-100 rounded-t-md" onClick={() => setIsRegisterOpen(false)}>
                    {/* Bağlantı Metni Çevirisi */}
                    Müşteri Kaydı
                  </Link>
                  <Link to="/restaurant/register" className="block px-4 py-2 text-primary-dark hover:bg-gray-100" onClick={() => setIsRegisterOpen(false)}>
                    {/* Bağlantı Metni Çevirisi */}
                    Restoran Kaydı
                  </Link>
                  <Link to="/delivery/register" className="block px-4 py-2 text-primary-dark hover:bg-gray-100 rounded-b-md" onClick={() => setIsRegisterOpen(false)}>
                    {/* Bağlantı Metni Çevirisi */}
                    Teslimatçı Kaydı
                  </Link>
                </div>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
