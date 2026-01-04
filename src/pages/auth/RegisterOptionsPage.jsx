import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const OptionCard = ({ title, description, to }) => (
    <Link 
        to={to} 
        className="block p-6 bg-white rounded-lg shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 border-t-4 border-primary-dark"
    >
        <div className="flex items-center space-x-4">
            <UserPlus className="text-primary-orange" size={32} />
            <div>
                <h2 className="text-xl font-semibold text-primary-dark">{title}</h2>
                <p className="text-gray-600 text-sm mt-1">{description}</p>
            </div>
        </div>
    </Link>
);

const RegisterOptionsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-center text-primary-dark mb-10">
        Kayıt Seçenekleri
      </h1>
      <p className="text-center text-gray-700 mb-12">
        Lütfen kayıt olmak istediğiniz hesap türünü seçiniz.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <OptionCard 
            title="Müşteri Kaydı" 
            description="Hemen sipariş vermeye başlayın." 
            to="/customer/register" 
        />
        <OptionCard 
            title="Restoran Kaydı" 
            description="Platformumuzda restoranınızı listeleyin." 
            to="/restaurant/register" 
        />
        <OptionCard 
            title="Teslimatçı Kaydı" 
            description="Hemen para kazanmaya başlayın." 
            to="/delivery/register" 
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

export default RegisterOptionsPage;
