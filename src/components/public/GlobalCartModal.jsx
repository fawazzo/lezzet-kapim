// src/components/public/GlobalCartModal.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react'; 
import { X, Plus, Minus, Trash2, ChevronLeft, CreditCard, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// --- NEW CONSTANT: DELIVERY FEE ---
const DELIVERY_FEE = 50.00;
// ----------------------------------

// Define the minimum required date for this specific fake payment system rule (02/26)
const MIN_EXPIRY_MONTH = 2; // February
const MIN_EXPIRY_YEAR = 26; // 2026

const GlobalCartModal = ({ cart, updateQuantity, removeFromCart, handleCheckout, onClose }) => {
    const { isAuthenticated, role } = useAuth();
    
    // State for checkout steps and payment method
    const [checkoutStep, setCheckoutStep] = useState('cart');
    const [paymentMethod, setPaymentMethod] = useState(null);
    
    // State for the fake credit card details
    const [cardNumber, setCardNumber] = useState(''); 
    const [cardExpiry, setCardExpiry] = useState(''); // MM/YY
    const [cardCvv, setCardCvv] = useState(''); // 3 or 4 digits
    
    // NEW: State for displaying card-specific errors
    const [cardError, setCardError] = useState(null); 

    // Refs to hold the input elements
    const cardNumberInputRef = useRef(null);
    const cardExpiryInputRef = useRef(null); 
    const cardCvvInputRef = useRef(null);   

    // --- MODIFIED: Calculate Totals ---
    // 1. Calculate Subtotal (only menu items)
    const subTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    // 2. Calculate Final Total (items + fee)
    const finalTotal = subTotal + DELIVERY_FEE;
    // ----------------------------------


    // --- Card Detail Handlers with Minimal Logic for Performance ---

    const handleCardNumberChange = (e) => {
        let digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 16);
        setCardNumber(digitsOnly); 
        setCardError(null); // Clear error on change
    };
    
    const handleCardExpiryChange = (e) => {
        let rawValue = e.target.value.replace(/\D/g, ''); 
        let cursorPosition = e.target.selectionStart;

        // **Month validation constraints**
        if (rawValue.length === 1 && rawValue > '1') {
             // If first digit is > 1 (e.g., '2', '3'), prepend '0' and add '/' (e.g., 2 -> 02/)
             rawValue = '0' + rawValue;
             cursorPosition += 1; // Cursor moves past the '0'
        } else if (rawValue.length === 2) {
             const month = parseInt(rawValue, 10);
             if (month === 0) { // Disallow '00'
                rawValue = '01'; 
             } else if (month > 12) {
                 // If month > 12 (e.g., 13), force to 12
                 rawValue = '12';
             }
        }
        
        let value = rawValue.slice(0, 4); 

        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
            // Adjust cursor position if the '/' was just inserted
            if (cursorPosition === 2 && value.length === 3) {
                cursorPosition = 3; 
            }
        }
        
        setCardExpiry(value);
        setCardError(null); // Clear error on change

        // Save the new cursor position to the ref to be used in useEffect
        cardExpiryInputRef.current.cursorPosition = cursorPosition;
    };

    const handleCardCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCardCvv(value);
        setCardError(null); // Clear error on change
    };


    // --- useEffect Hooks to Maintain Focus (Unchanged) ---

    // 1. Card Number Focus
    useEffect(() => {
        if (paymentMethod === 'credit_card' && cardNumberInputRef.current) {
            const input = cardNumberInputRef.current;
            input.focus(); 
            input.setSelectionRange(cardNumber.length, cardNumber.length); 
        }
    }, [cardNumber, paymentMethod]); 

    // 2. Card Expiry Focus
    useEffect(() => {
        if (paymentMethod === 'credit_card' && cardExpiryInputRef.current) {
            const input = cardExpiryInputRef.current;
            const newCursorPos = input.cursorPosition !== undefined ? input.cursorPosition : input.value.length;
            
            input.focus();
            input.setSelectionRange(newCursorPos, newCursorPos);
            input.cursorPosition = undefined; 
        }
    }, [cardExpiry, paymentMethod]); 

    // 3. CVV Focus
    useEffect(() => {
        if (paymentMethod === 'credit_card' && cardCvvInputRef.current) {
            const input = cardCvvInputRef.current;
            input.focus(); 
            input.setSelectionRange(cardCvv.length, cardCvv.length); 
        }
    }, [cardCvv, paymentMethod]); 
    
    // NEW/FIXED: Function to validate the expiry date against the 02/26 rule
    const validateCardDate = (expiryStr) => {
        if (expiryStr.length !== 5) return false;

        const [monthStr, yearStr] = expiryStr.split('/');
        const expYear = parseInt(yearStr, 10);
        const expMonth = parseInt(monthStr, 10);

        // Check 1: Must be a valid month
        if (expMonth < 1 || expMonth > 12) return false;

        // Check 2: The specific rule: date must be MIN_EXPIRY_MONTH/MIN_EXPIRY_YEAR or later
        if (expYear < MIN_EXPIRY_YEAR) {
            // Expired before the minimum year (e.g., 25 is less than 26)
            return false;
        }
        
        // If year is exactly the minimum year (26), the month must be the minimum month (02) or later
        if (expYear === MIN_EXPIRY_YEAR && expMonth < MIN_EXPIRY_MONTH) {
             // Expired in the same year but before the minimum month (e.g., 01/26 is less than 02/26)
             return false;
        }
        
        // Note: For a real application, you would also check against the CURRENT date.
        
        return true; // Date is 02/26 or later
    };

    // Helper function to validate all credit card fields
    const isCreditCardValid = useCallback(() => {
        const isNumberValid = cardNumber.length === 16;
        const isExpiryFormatValid = cardExpiry.length === 5 && cardExpiry.includes('/');
        const isCvvValid = cardCvv.length >= 3 && cardCvv.length <= 4;
        
        let isDateValid = false;
        if (isExpiryFormatValid) {
            isDateValid = validateCardDate(cardExpiry); // Use the new function
        }
        
        return isNumberValid && isExpiryFormatValid && isCvvValid && isDateValid;
    }, [cardNumber, cardExpiry, cardCvv]);
    
    // --- Payment Method Change and Final Checkout Handlers ---

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setCardError(null);
    };

    const handleFinalCheckout = () => {
        if (!paymentMethod) {
            alert("Lütfen bir ödeme yöntemi seçin.");
            return;
        }

        if (paymentMethod === 'credit_card') {
            setCardError(null);
            
            // Check card number and CVV first, which are format errors
            if (cardNumber.length !== 16) {
                setCardError("Kart numarası 16 hane olmalıdır.");
                return;
            }
            if (cardCvv.length < 3 || cardCvv.length > 4) {
                 setCardError("CVV 3 veya 4 hane olmalıdır.");
                 return;
            }
            
            // Apply the specific 02/26 rule
            if (!validateCardDate(cardExpiry)) {
                // This will show the error on button click if they missed the red border/alert
                setCardError("Kartın son kullanma tarihi 02/26 veya sonrası olmalıdır.");
                return;
            }

            // If all card validations pass:
            handleCheckout('credit_card');
        } else {
            // If payment method is cash
            handleCheckout('cash_on_delivery');
        }
    };

    const checkoutButtonText = isAuthenticated && role === 'customer' 
        // --- MODIFIED: Use finalTotal ---
        ? (checkoutStep === 'cart' ? `Ödeme Adımına Geç (${finalTotal.toFixed(2)} TL)` : `Siparişi Tamamla`)
        : 'Sipariş vermek için Giriş Yapın';
        
    const isCheckoutDisabled = cart.length === 0 || !isAuthenticated || role !== 'customer';

    // --- RENDER PAYMENT STEP CONTENT ---
    const PaymentStep = () => {
        // The final checkout button is disabled if no payment is selected, OR if card is selected and invalid
        const isFinalCheckoutDisabled = !paymentMethod || (paymentMethod === 'credit_card' && !isCreditCardValid());
        
        // NEW: This variable is used for the red border and the immediate visual alert
        const isExpiryInputInvalid = cardExpiry.length === 5 && !validateCardDate(cardExpiry);

        return (
            <div className="flex flex-col h-full">
                {/* Header with Back Button and Close Button - (Unchanged) */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                     <div className="flex items-center">
                        <button 
                            onClick={() => setCheckoutStep('cart')}
                            className="mr-3 p-1 text-gray-500 hover:text-primary-orange transition"
                            title="Sepete Geri Dön"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-primary-dark">Ödeme Seçenekleri</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-primary-orange transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Total Breakdown Display - MODIFIED */}
                <div className="bg-primary-orange/10 p-4 rounded-lg mb-6 space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                        <span>Ürün Toplamı:</span>
                        <span>{subTotal.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-primary-dark border-b border-dashed pb-2">
                        <span>Teslimat Ücreti:</span>
                        <span>{DELIVERY_FEE.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-semibold text-primary-dark">Toplam Tutar:</span>
                        <span className="text-2xl font-bold text-primary-orange">{finalTotal.toFixed(2)} TL</span>
                    </div>
                </div>
                {/* End Total Breakdown Display */}
                
                {/* Card Error Display - Shows error on final submit, or other generic errors */}
                {cardError && (
                    <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm mb-4">{cardError}</p>
                )}
                {/* Visual alert for invalid date if no other error is shown AND Credit Card is the selected method */}
                {!cardError && paymentMethod === 'credit_card' && isExpiryInputInvalid && (
                    <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm mb-4">
                        Kartın son kullanma tarihi hatalıdır. Lütfen geçerli bir tarih girin.
                    </p>
                )}

                {/* Payment Options */}
                <div className="flex-grow space-y-4">
                    {/* 1. Kredi Kartı (Fake) - With Input */}
                    <div className={`p-4 rounded-lg shadow-sm transition border ${
                            paymentMethod === 'credit_card' ? 'border-primary-orange bg-primary-orange/5' : 'border-gray-200 bg-secondary-light'
                        }`}>
                        <label 
                            className={`flex items-center cursor-pointer`}
                            onClick={() => handlePaymentMethodChange('credit_card')}
                        >
                            <input 
                                type="radio" 
                                name="payment" 
                                value="credit_card" 
                                checked={paymentMethod === 'credit_card'}
                                onChange={() => {}} 
                                className="form-radio h-5 w-5 mr-3 text-primary-orange border-gray-300"
                            />
                            <CreditCard size={24} className="mr-3" />
                            <span className="font-semibold text-lg">Kredi Kartı ile Ödeme (Sahte)</span>
                        </label>

                        {/* Card Details Inputs */}
                        <div className={`mt-3 pl-8 space-y-3 ${paymentMethod === 'credit_card' ? 'block' : 'hidden'}`}>
                            {/* 1.1 Card Number Input */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Kart Numarası (16 Hane)</label>
                                <input 
                                    type="text"
                                    ref={cardNumberInputRef} 
                                    value={cardNumber} 
                                    onChange={handleCardNumberChange}
                                    maxLength="16" 
                                    placeholder="XXXXXXXXXXXXXXXX"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-orange transition border-gray-300`}
                                    inputMode="numeric" 
                                />
                            </div>

                            {/* 1.2 Expiry Date and CVV */}
                            <div className="flex space-x-4">
                                {/* Expiry Date */}
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1 text-gray-600">Son Kullanma Tarihi (AA/YY)</label>
                                    <input 
                                        type="text"
                                        ref={cardExpiryInputRef} 
                                        value={cardExpiry}
                                        onChange={handleCardExpiryChange}
                                        maxLength="5"
                                        placeholder="AA/YY"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-orange transition ${
                                            isExpiryInputInvalid // Use the derived variable for the red border
                                                ? 'border-red-500' 
                                                : 'border-gray-300'
                                        }`}
                                        inputMode="numeric" 
                                    />
                                </div>
                                
                                {/* CVV */}
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium mb-1 text-gray-600">CVV</label>
                                    <input 
                                        type="text"
                                        ref={cardCvvInputRef} 
                                        value={cardCvv}
                                        onChange={handleCardCvvChange}
                                        maxLength="4"
                                        placeholder="CVV"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-orange transition border-gray-300`}
                                        inputMode="numeric" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Kapıda Ödeme (Cash on Delivery) - (Unchanged) */}
                    <label 
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition shadow-sm border ${
                            paymentMethod === 'cash_on_delivery' ? 'border-primary-orange bg-primary-orange/5' : 'border-gray-200 hover:bg-gray-200'
                        }`}
                        onClick={() => handlePaymentMethodChange('cash_on_delivery')}
                    >
                        <input 
                            type="radio" 
                            name="payment" 
                            value="cash_on_delivery" 
                            checked={paymentMethod === 'cash_on_delivery'}
                            onChange={() => {}} 
                            className="form-radio h-5 w-5 mr-3 text-primary-orange border-gray-300"
                        />
                        <DollarSign size={24} className="mr-3" />
                        <span className="font-semibold text-lg">Kapıda Ödeme (Nakit/Kredi Kartı)</span>
                    </label>
                </div>
                
                {/* Footer / Final Checkout Button */}
                <div className="mt-6 border-t pt-4 flex-shrink-0">
                    <button
                        onClick={handleFinalCheckout}
                        disabled={isFinalCheckoutDisabled} 
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                            isFinalCheckoutDisabled
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                : 'bg-primary-orange text-white hover:bg-primary-orange/90 shadow-md'
                        }`}
                    >
                        {/* --- MODIFIED: Use finalTotal --- */}
                        {`Şimdi Sipariş Ver (${finalTotal.toFixed(2)} TL)`}
                    </button>
                </div>
            </div>
        );
    };

    // --- RENDER CART STEP CONTENT (Modified for Breakdown) ---
    const CartStep = () => (
        <>
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-primary-dark">Sepetiniz ({cart.length} Ürün)</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-primary-orange transition">
                    <X size={24} />
                </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {cart.length === 0 ? (
                    <p className="text-center text-gray-500 italic mt-10">Sepetinizde ürün bulunmamaktadır.</p>
                ) : (
                    cart.map(item => (
                        <div key={item._id} className="flex justify-between items-center border p-3 rounded-lg bg-secondary-light">
                            <div className="flex-grow">
                                <h3 className="font-semibold text-primary-dark">{item.name}</h3>
                                <p className="text-sm text-gray-600">Birim Fiyat: {item.price.toFixed(2)} TL</p>
                                <p className="text-md font-bold text-primary-orange mt-1">
                                    {(item.price * item.quantity).toFixed(2)} TL
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                                >
                                    <Plus size={16} />
                                </button>
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="p-1 text-red-500 hover:text-red-700 transition"
                                    title="Ürünü tamamen kaldır"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer / Checkout Button - MODIFIED for Breakdown */}
            <div className="mt-6 border-t pt-4 flex-shrink-0">
                {/* Total Breakdown Display - NEW */}
                <div className="mb-4 space-y-1">
                    <div className="flex justify-between text-md text-gray-700">
                        <span>Ürünler ({cart.length} Çeşit):</span>
                        <span>{subTotal.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-md text-primary-dark">
                        <span>Teslimat Ücreti:</span>
                        <span className="font-semibold">{DELIVERY_FEE.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-2">
                        <span>Toplam Tutar:</span>
                        <span className="text-primary-orange">{finalTotal.toFixed(2)} TL</span>
                    </div>
                </div>
                
                <button
                    onClick={() => setCheckoutStep('payment')}
                    disabled={isCheckoutDisabled}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                        isCheckoutDisabled
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-primary-orange text-white hover:bg-primary-orange/90 shadow-md'
                    }`}
                >
                    {checkoutButtonText}
                </button>
                {!isAuthenticated && (
                    <p className="text-xs text-red-500 mt-2 text-center">Sipariş için müşteri girişi gereklidir.</p>
                )}
            </div>
        </>
    );

    return (
<div className="fixed inset-0 bg-black/20 z-[100] flex justify-end">
            <div className="bg-white h-full w-full md:w-1/3 shadow-2xl transform transition-transform duration-300 ease-in-out p-6 flex flex-col">
                {checkoutStep === 'cart' ? <CartStep /> : <PaymentStep />}
            </div>
        </div>
    );
};

export default GlobalCartModal;