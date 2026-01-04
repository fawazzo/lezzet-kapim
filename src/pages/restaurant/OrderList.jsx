// src/pages/restaurant/OrderList.jsx
import React from 'react';

// Defines the status flow and the next possible status button text
// Durum akışını ve bir sonraki olası durum butonu metnini tanımlar
const statusOptions = {
    // Çeviriler: Beklemede, Onaylandı, Hazırlanıyor, Teslimat için Yolda (Ready for Pickup), Teslim Ediliyor, Teslim Edildi, İptal Edildi
    Pending: { next: 'Confirmed', btnText: 'Siparişi Onayla', color: 'bg-yellow-500' },
    Confirmed: { next: 'Preparing', btnText: 'Hazırlamaya Başla', color: 'bg-blue-500' },
    Preparing: { next: 'Out for Delivery', btnText: 'Teslim Alınmaya Hazırla', color: 'bg-indigo-500' },
    'Out for Delivery': { next: 'Cancelled', btnText: 'İptal Et (Hazır)', color: 'bg-red-500' }, // Restaurant's final state for Pickup
    Delivering: { next: 'Delivered', btnText: 'Teslim Edildi Olarak İşaretle', color: 'bg-green-500' }, // ADDED status for Delivery role
    Delivered: { next: null, btnText: 'Teslim Edildi', color: 'bg-gray-400' },
    Cancelled: { next: null, btnText: 'İptal Edildi', color: 'bg-red-500' },
};

const statusTranslationMap = {
    Pending: 'Beklemede',
    Confirmed: 'Onaylandı',
    Preparing: 'Hazırlanıyor',
    'Out for Delivery': 'Teslim Alınmaya Hazır', // MODIFIED: Changed translation to reflect 'Ready for Pickup'
    Delivering: 'Yolda', // ADDED
    Delivered: 'Teslim Edildi',
    Cancelled: 'İptal Edildi',
};

const OrderList = ({ orders, handleStatusUpdate, isRestaurantView = false }) => {

    const getStatusBadge = (status) => {
        const statusMap = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Confirmed: 'bg-blue-100 text-blue-800',
            Preparing: 'bg-indigo-100 text-indigo-800',
            'Out for Delivery': 'bg-primary-orange text-white',
            Delivering: 'bg-green-300 text-green-800', // NEW COLOR
            Delivered: 'bg-green-100 text-green-800',
            Cancelled: 'bg-red-100 text-red-800',
        };
        const turkishStatus = statusTranslationMap[status] || status;
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusMap[status]}`}>
                {turkishStatus}
            </span>
        );
    };

    const OrderCard = ({ order }) => {
        // Use a fallback empty object to prevent the 'undefined' error
        // This is crucial for when an unrecognized status is passed
        const currentStatusData = statusOptions[order.status] || { next: null, btnText: 'Durum Bilinmiyor', color: 'bg-gray-500' };
        
        // Only show action button if it's the restaurant/delivery view AND there is a defined next step.
        const showActionButton = isRestaurantView && currentStatusData.next; 
        
        // Calculate subtotal for item display
        const subTotal = order.items.reduce((acc, item) => acc + item.quantity * item.priceAtTimeOfOrder, 0);

        return (
            <div className="bg-secondary-light p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-3 border-b pb-2">
                    {/* Display info based on who is viewing / Görüntüleyene göre bilgiyi göster */}
                    {isRestaurantView ? (
                        <div>
                            {/* Metin Çevirisi */}
                            <p className="text-lg font-bold text-primary-dark">Sipariş Veren: {order.customer.name}</p>
                            {/* Metin Çevirisi */}
                            <p className="text-sm text-gray-500">Teslimat Adresi: {order.customerAddress}</p>
                            {/* NEW: Show Delivery Person if assigned and available */}
                            {order.deliveryPerson?.name && (
                                <p className="text-sm font-medium text-primary-orange">
                                    Teslimatçı: {order.deliveryPerson.name}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            {/* Metin Çevirisi */}
                            <p className="text-lg font-bold text-primary-dark">Restoran: {order.restaurant.name}</p>
                            {/* MODIFIED: Total is now displayed below the detailed breakdown */}
                            {/* <p className="text-sm text-gray-500">Toplam: {order.totalAmount.toFixed(2)} TL</p> */}
                        </div>
                    )}
                    
                    <div>
                        {getStatusBadge(order.status)}
                    </div>
                </div>

                {/* Items / Ürünler */}
                <ul className="text-sm text-gray-700 space-y-1 my-3 border-b pb-3">
                    {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            {/* Metin Çevirisi */}
                            <span>{item.name} (x{item.quantity})</span>
                            <span className="font-medium">{(item.quantity * item.priceAtTimeOfOrder).toFixed(2)} TL</span>
                        </li>
                    ))}
                    
                    {/* NEW: DISPLAY DELIVERY FEE */}
                    {/* Check if deliveryFee is present and greater than 0 */}
                    {order.deliveryFee > 0 && (
                        <li className="flex justify-between pt-1 border-t border-dashed mt-1">
                            <span className="font-semibold text-primary-dark">Teslimat Ücreti</span>
                            <span className="font-semibold text-primary-dark">{order.deliveryFee.toFixed(2)} TL</span>
                        </li>
                    )}
                </ul>

                {/* FINAL TOTAL (Visible for both Restaurant and Customer) */}
                <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-primary-dark">Sipariş Toplamı</span>
                    <span className="text-lg font-bold text-primary-dark">{order.totalAmount.toFixed(2)} TL</span>
                </div>


                {/* Restaurant Action Buttons / Restoran Eylem Butonları */}
                {showActionButton && (
                    <div className="pt-3 border-t mt-3 flex justify-end space-x-3">
                        <button
                            onClick={() => handleStatusUpdate(order._id, currentStatusData.next)}
                            className={`py-2 px-4 text-sm font-semibold rounded-lg text-white ${currentStatusData.color} hover:opacity-90 transition`}
                        >
                            {/* Buton Metni Çevirisi (statusOptions'ta yapıldı) */}
                            {currentStatusData.btnText}
                        </button>
                        
                        {/* Option to Cancel before Confirmed/Delivering state. Logic adjusted for new flow. */}
                        {isRestaurantView && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            // Only allow cancelling if status is Pending, Confirmed, Preparing, or Out for Delivery (unclaimed)
                            (order.status === 'Pending' || order.status === 'Confirmed' || order.status === 'Preparing' || order.status === 'Out for Delivery') && (
                                <button
                                    onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                    className="py-2 px-4 text-sm font-semibold rounded-lg text-white bg-red-700 hover:bg-red-800 transition"
                                >
                                    Siparişi İptal Et
                                </button>
                            )
                        )}
                    </div>
                )}
                
                {/* Tarih Metni Çevirisi */}
                <p className="text-xs text-gray-400 mt-2 text-right">Sipariş Tarihi: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {orders.map(order => (
                <OrderCard key={order._id} order={order} />
            ))}
        </div>
    );
};

export default OrderList;