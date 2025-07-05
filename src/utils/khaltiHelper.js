const axios = require('axios');

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_PUBLIC_KEY = process.env.KHALTI_PUBLIC_KEY;

// Use sandbox URL for development, production URL for production
const KHALTI_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://khalti.com/api/v2'
    : 'https://dev.khalti.com/api/v2';

/**
 * Generate client configuration for Khalti integration
 * @returns {Object} Config for frontend Khalti integration
 */
const getKhaltiConfig = () => {
    return {
        publicKey: KHALTI_PUBLIC_KEY,
        productIdentity: "laundry_service",
        productName: "LaundryEase Services",
        productUrl: "https://laundryease.com",
        paymentPreference: [
            "KHALTI",
            "EBANKING",
            "MOBILE_BANKING",
            "CONNECT_IPS",
            "SCT"
        ]
    };
};

/**
 * Initiate a payment with Khalti (New API)
 * @param {Object} paymentData - Payment initiation data
 * @returns {Promise<Object>} Khalti initiation response
 */
const initiatePayment = async (paymentData) => {
    try {
        const response = await axios.post(`${KHALTI_BASE_URL}/epayment/initiate/`, paymentData, {
            headers: {
                'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        
        return response.data;
    } catch (error) {
        console.error('Khalti initiation error:', error.response?.data || error.message);
        throw new Error('Payment initiation failed: ' + (error.response?.data?.detail || error.message));
    }
};

/**
 * Verify a payment with Khalti (New API - Lookup)
 * @param {String} pidx - Payment identifier from Khalti
 * @returns {Promise<Object>} Khalti verification response
 */
const verifyPayment = async (pidx) => {
    try {
        const response = await axios.post(`${KHALTI_BASE_URL}/epayment/lookup/`, {
            pidx: pidx
        }, {
            headers: {
                'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        
        return response.data;
    } catch (error) {
        console.error('Khalti verification error:', error.response?.data || error.message);
        throw new Error('Payment verification failed: ' + (error.response?.data?.detail || error.message));
    }
};

/**
 * Create payment initiation data for Khalti API
 * @param {Number} amount - Amount in NPR (will be converted to paisa)
 * @param {String} orderId - Order ID reference
 * @param {Object} customerInfo - Customer information
 * @param {String} returnUrl - Return URL after payment
 * @returns {Object} Payment initiation data
 */
const createPaymentData = (amount, orderId, customerInfo, returnUrl) => {
    return {
        return_url: returnUrl,
        website_url: "https://laundryease.com",
        amount: amount * 100, // Convert NPR to paisa
        purchase_order_id: orderId,
        purchase_order_name: `LaundryEase Order #${orderId}`,
        customer_info: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone
        },
        amount_breakdown: [
            {
                label: "Laundry Service",
                amount: amount * 100
            }
        ],
        product_details: [
            {
                identity: orderId,
                name: `LaundryEase Order #${orderId}`,
                total_price: amount * 100,
                quantity: 1,
                unit_price: amount * 100
            }
        ],
        merchant_username: "laundryease",
        merchant_extra: "laundry_service_payment"
    };
};

module.exports = {
    getKhaltiConfig,
    initiatePayment,
    verifyPayment,
    createPaymentData
};