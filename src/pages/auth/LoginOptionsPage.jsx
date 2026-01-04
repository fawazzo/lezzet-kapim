import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const OptionCard = ({ title, description, to }) => (
    <Link 
        to={to} 
        className="block p-6 bg-white rounded-lg shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 border-t-4 border-primary-orange"
    >
        <div className="flex items-center space-x-4">
            <LogIn className="text-primary-dark" size={32} />
            <div>
                <h2 className="text-xl font-semibold text-primary-dark">{title}</h2>
                <p className="text-gray-600 text-sm mt-1">{description}</p>
            </div>
        </div>
    </Link>
);

const LoginOptionsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-center text-primary-dark mb-10">
        Giriş Seçenekleri
      </h1>
      <p className="text-center text-gray-700 mb-12">
        Lütfen giriş yapmak istediğiniz hesap türünü seçiniz.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <OptionCard 
            title="Müşteri Girişi" 
            description="Yemek siparişi vermek için kullanın." 
            to="/customer/login" 
        />
        <OptionCard 
            title="Restoran Girişi" 
            description="Menüleri yönetmek ve siparişleri takip etmek için kullanın." 
            to="/restaurant/login" 
        />
        <OptionCard 
            title="Teslimatçı Girişi" 
            description="Siparişleri teslim etmek ve teslimat durumunu güncellemek için kullanın." 
            to="/delivery/login" 
        />
      </div>
      
      <div className="text-center mt-12">
        <Link to="/" className="text-primary-orange hover:text-primary-dark transition duration-200">
            Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default LoginOptionsPage;
