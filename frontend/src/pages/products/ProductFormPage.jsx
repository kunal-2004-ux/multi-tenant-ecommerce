import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditMode = !!id;
    const isOwner = user?.role === 'OWNER';

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        is_active: true,
        assigned_to: ''
    });
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
        if (isOwner) {
            fetchStaff();
        }
    }, [id, isOwner]);

    const fetchStaff = async () => {
        try {
            const response = await client.get('/api/auth/staff/');
            setStaffList(response.data);
        } catch (err) {
            console.error("Fetch Staff Error:", err);
            // Don't block product editing if staff list fails
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await client.get(`/api/products/${id}/`);
            setFormData({
                name: response.data.name,
                description: response.data.description,
                price: response.data.price,
                stock: response.data.stock,
                is_active: response.data.is_active,
                assigned_to: response.data.assigned_to || ''
            });
        } catch (err) {
            console.error("Fetch Error:", err.response?.status, err.response?.data);
            setError('Failed to fetch product details.');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = { ...formData };
        if (payload.assigned_to === '') {
            payload.assigned_to = null;
        }

        try {
            if (isEditMode) {
                await client.put(`/api/products/${id}/`, payload);
            } else {
                await client.post('/api/products/', payload);
            }
            navigate('/products');
        } catch (err) {
            console.error("Submit Error:", err);
            setError(err.response?.data?.detail || 'Failed to save product.');
        } finally {
            setLoading(false);
        }
    };

    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        placeholder="e.g. Wireless Headphones"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        placeholder="Product description..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="0"
                        />
                    </div>
                </div>

                {isOwner && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assign to Staff</label>
                        <select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        >
                            <option value="">Unassigned</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.username} ({staff.email})
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Assigned staff can verify and manage this product.</p>
                    </div>
                )}

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                        Active (Visible to customers)
                    </label>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;
