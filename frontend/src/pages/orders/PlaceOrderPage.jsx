import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';

const PlaceOrderPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({}); // { productId: quantity }
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await client.get('/api/products/');
            // Filter active products client-side for simplicity if backend returns all
            const active = response.data.filter(p => p.is_active && p.stock > 0);
            setProducts(active);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch products for ordering.');
            setLoading(false);
        }
    };

    const handleQuantityChange = (productId, qty) => {
        const val = parseInt(qty, 10);
        if (val >= 0) {
            setCart(prev => ({
                ...prev,
                [productId]: val
            }));
        }
    };

    const handleSubmit = async () => {
        const items = Object.entries(cart)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, qty]) => ({
                product_id: parseInt(productId, 10),
                quantity: qty
            }));

        if (items.length === 0) {
            alert("Please select at least one item.");
            return;
        }

        try {
            await client.post('/api/orders/', { items });
            alert("Order placed successfully!");
            navigate('/orders');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.join ? err.response.data.join(' ') : JSON.stringify(err.response?.data) || "Order failed";
            alert(`Failed to place order: ${msg}`);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Place New Order</h2>

            {loading && <div>Loading catalog...</div>}
            {error && <div className="text-red-600">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded shadow p-4 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                            <p className="text-blue-600 font-semibold">${product.price}</p>
                            <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input
                                type="number"
                                min="0"
                                max={product.stock}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={cart[product.id] || 0}
                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-end items-center gap-4 z-10 md:pl-64">
                <button
                    onClick={handleSubmit}
                    disabled={Object.values(cart).reduce((a, b) => a + b, 0) === 0}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Place Order
                </button>
            </div>
            {/* Spacer for fixed footer */}
            <div className="h-20"></div>
        </div>
    );
};

export default PlaceOrderPage;
