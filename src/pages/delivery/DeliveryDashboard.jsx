// src/pages/delivery/DeliveryDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import OrderList from '../restaurant/OrderList'; 

const DeliveryDashboard = () => {
    const { user, login, token } = useAuth(); 
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    // --- NEW STATE ---
    const [deliveryHistory, setDeliveryHistory] = useState([]); 
    // -----------------
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all lists of orders
    const fetchOrders = useCallback(async () => {
        if (!token) { 
            setLoading(false);
            return; 
        } 
        
        try {
            setLoading(true);
            
            // 1. Fetch Active Deliveries
            const { data: activeData } = await axios.get('/api/orders/delivery/active');
            setActiveDeliveries(activeData);
            
            // 2. Fetch Available Orders
            const { data: availableData } = await axios.get('/api/orders/delivery/available');
            setAvailableOrders(availableData);

            // --- NEW FETCH: Delivery History ---
            const { data: historyData } = await axios.get('/api/orders/delivery/history');
            setDeliveryHistory(historyData);
            // -----------------------------------
            
            setLoading(false);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Oturum zaman aşımına uğradı veya yetkiniz yok. Lütfen tekrar giriş yapın.');
            } else {
                setError('Sipariş listeleri alınamadı.');
            }
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    // Function to handle Delivery Person claiming an order (sets status to 'Delivering')
    const handleAcceptOrder = async (orderId) => {
        if (!window.confirm('Bu siparişi teslimat için almak istediğinizden emin misiniz?')) return;
        
        try {
            const { data } = await axios.put(`/api/orders/${orderId}/accept`);
            
            alert(`Sipariş ${data._id} başarıyla teslimat için alındı! Durum: ${data.status}`);
            fetchOrders(); // Re-fetch to move the order from 'Available' to 'Active' list

        } catch (err) {
            alert(`Sipariş alınırken hata oluştu: ${err.response?.data?.message || 'Zaten alınmış olabilir.'}`);
        }
    };
    
    // Function to handle Delivery Person completing the delivery (sets status to 'Delivered')
    const handleStatusUpdate = async (orderId, newStatus) => {
        if (newStatus !== 'Delivered') return; // Safety check for delivery role

        if (!window.confirm('Siparişi tamamlandı (Teslim Edildi) olarak işaretlemek istediğinizden emin misiniz?')) return;
        
        try {
            const { data: orderUpdateData } = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            
            alert(`Sipariş ${orderId} durumu ${newStatus} olarak güncellendi. Bakiyeniz güncellendi.`);
            
            const { data: userData } = await axios.get(`/api/auth/delivery/me`);
            
            const updatedUserData = {
                ...userData,
                token: token, 
            };
            
            login(updatedUserData); 
            
            fetchOrders(); // Re-fetch to update all lists (removes from active, adds to history)

        } catch (err) {
            alert(`Durum güncellenirken hata oluştu: ${err.response?.data?.message || 'Geçersiz geçiş.'}`);
        }
    };

    if (loading) return <div className="text-center text-xl text-primary-dark">Teslimat Paneli Yükleniyor...</div>;
    if (error) return <div className="text-center text-red-500 text-xl">{error}</div>;

    // Helper component to render a card for available orders (since OrderList is too complex here)
    const AvailableOrderCard = ({ order }) => (
        <div className="p-4 border rounded-lg bg-secondary-light shadow-md border-l-4 border-primary-orange flex justify-between items-center">
            <div>
                <p className="text-lg font-bold text-primary-dark">Restoran: {order.restaurant.name}</p>
                <p className="text-sm text-gray-500">Teslimat Adresi: {order.customerAddress}</p>
                <p className="text-sm font-medium text-red-600">Durum: Teslim Alınmayı Bekliyor</p>
            </div>
            <button
                onClick={() => handleAcceptOrder(order._id)}
                className="py-2 px-4 text-sm font-semibold rounded-lg text-white bg-primary-orange hover:bg-primary-orange/90 transition"
            >
                Siparişi Teslim Al
            </button>
        </div>
    );
    
    // Simple wrapper to pass active deliveries to OrderList without status override.
    const ActiveOrderListWrapper = ({ orders }) => {
        return (
            <OrderList 
                orders={orders} 
                handleStatusUpdate={handleStatusUpdate} 
                isRestaurantView={true} 
            />
        );
    }

    return (
        <div className="space-y-10">
            {/* Başlık Çevirisi */}
            <h1 className="text-4xl font-extrabold text-primary-dark">Teslimat Kontrol Paneli, {user.name}</h1>
            
            {/* DELIVERY BALANCE CARD */}
            <div className="bg-primary-dark text-white p-6 rounded-xl shadow-2xl flex justify-between items-center">
                <h2 className="text-3xl font-bold">Kazanılan Bakiye</h2>
                <span className="text-4xl font-extrabold text-primary-orange">
                    {user.deliveryBalance?.toFixed(2) || '0.00'} TL
                </span>
            </div>

            {/* 1. Available Orders (Ready for Pickup) */}
            <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-primary-orange">
                <h2 className="text-3xl font-bold text-primary-dark mb-6">TESLİMAT İÇİN HAZIR (Bekleyen) ({availableOrders.length})</h2>
                
                {availableOrders.length === 0 ? (
                    <p className="text-gray-500 italic">Şu anda teslim alabileceğiniz hazır sipariş bulunmamaktadır.</p>
                ) : (
                    <div className="space-y-4">
                        {availableOrders.map(order => <AvailableOrderCard key={order._id} order={order} />)}
                    </div>
                )}
            </div>

            {/* 2. My Active Deliveries (On the Way) */}
            <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-primary-dark">
                <h2 className="text-3xl font-bold text-primary-dark mb-6">AKTİF TESLİMATLARIM ({activeDeliveries.length})</h2>
                
                {activeDeliveries.length === 0 ? (
                    <p className="text-gray-500 italic">Şu anda teslimatta olan bir siparişiniz bulunmamaktadır.</p>
                ) : (
                    <ActiveOrderListWrapper orders={activeDeliveries} />
                )}
            </div>
            
            {/* --- NEW SECTION: DELIVERY HISTORY --- */}
            <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-green-500">
                <h2 className="text-3xl font-bold text-primary-dark mb-6">TAMAMLANAN TESLİMATLARIM ({deliveryHistory.length})</h2>
                
                {deliveryHistory.length === 0 ? (
                    <p className="text-gray-500 italic">Daha önce tamamladığınız bir teslimat bulunmamaktadır.</p>
                ) : (
                    // Display history using OrderList, setting isRestaurantView=false to remove action buttons
                    <OrderList 
                        orders={deliveryHistory} 
                        isRestaurantView={false} 
                    />
                )}
            </div>
            {/* ------------------------------------- */}
        </div>
    );
};

export default DeliveryDashboard;