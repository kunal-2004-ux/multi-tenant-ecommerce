import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const OrderListPage = () => {
    const { user } = useAuth();
    const isOwner = user?.role === 'OWNER';

    const [orders, setOrders] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
        if (isOwner) {
            fetchStaff();
        }
    }, [isOwner]);

    const fetchOrders = async () => {
        try {
            const response = await client.get('/api/orders/');
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err.response?.status, err.response?.data);
            setError('Failed to fetch orders');
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

    const handleAssignStaff = async (orderId, staffId) => {
        try {
            const payload = { assigned_to: staffId || null };
            await client.patch(`/api/orders/${orderId}/`, payload);

            // Optimistic update
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, assigned_to: staffId, assigned_to_username: staffList.find(s => s.id == staffId)?.username }
                    : order
            ));
        } catch (err) {
            console.error("Assignment Error:", err);
            alert("Failed to assign staff.");
        }
    };

    const toggleDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Orders</h2>

            {loading && <div className="text-gray-600">Loading orders...</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

            {!loading && !error && (
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                {isOwner && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Staff</th>}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={isOwner ? "6" : "5"} className="px-6 py-4 text-center text-gray-500">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleDetails(order.id)}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total_amount}</td>
                                            {isOwner && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={order.assigned_to || ""}
                                                        onChange={(e) => handleAssignStaff(order.id, e.target.value)}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs border p-1"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {staffList.map(staff => (
                                                            <option key={staff.id} value={staff.id}>
                                                                {staff.username}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600">
                                                {expandedOrderId === order.id ? 'Hide' : 'View'}
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={isOwner ? "6" : "5"} className="px-6 py-4">
                                                    <div className="text-sm text-gray-700">
                                                        <h4 className="font-bold mb-2">Order Items:</h4>
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            {order.items.map((item) => (
                                                                <li key={item.id}>
                                                                    {item.product_name} - {item.quantity} x ${item.unit_price} = <strong>${item.line_total}</strong>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <p><strong>Customer:</strong> {order.customer_username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default OrderListPage;
