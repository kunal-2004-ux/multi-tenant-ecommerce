import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const isOwner = user?.role === 'OWNER';
    const canEdit = isOwner || user?.role === 'STAFF';

    useEffect(() => {
        fetchProducts();
        if (isOwner) {
            fetchStaff();
        }
    }, [isOwner]);

    const fetchProducts = async () => {
        try {
            const response = await client.get('/api/products/');
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err.response?.status, err.response?.data);
            setError('Failed to fetch products');
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await client.get('/api/auth/staff/');
            setStaffList(response.data);
        } catch (err) {
            console.error("Fetch Staff Error:", err);
        }
    };

    const handleAssignProduct = async (productId, staffId, e) => {
        // Prevent row click navigation
        e.stopPropagation();

        try {
            const payload = { assigned_to: staffId || null };
            await client.patch(`/api/products/${productId}/`, payload);

            // Optimistic update
            setProducts(products.map(p =>
                p.id === productId
                    ? { ...p, assigned_to: staffId, assigned_to_username: staffList.find(s => s.id == staffId)?.username }
                    : p
            ));
        } catch (err) {
            console.error("Assignment Error:", err);
            alert("Failed to assign staff.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                {canEdit && (
                    <button
                        onClick={() => navigate('/products/new')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                    >
                        Add Product
                    </button>
                )}
            </div>

            {loading && <div className="text-gray-600">Loading products...</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

            {!loading && !error && (
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                {canEdit && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>}
                                {canEdit && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.is_active ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {isOwner ? (
                                                    <select
                                                        value={product.assigned_to || ""}
                                                        onChange={(e) => handleAssignProduct(product.id, e.target.value, e)}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs border p-1"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {staffList.map(staff => (
                                                            <option key={staff.id} value={staff.id}>
                                                                {staff.username}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    // Staff view - just text
                                                    product.assigned_to_username ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {product.assigned_to_username}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Unassigned</span>
                                                    )
                                                )}
                                            </td>
                                        )}
                                        {canEdit && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/products/${product.id}/edit`)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductListPage;
