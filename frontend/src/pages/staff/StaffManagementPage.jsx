import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function StaffManagementPage() {
    const { user } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/api/auth/staff/');
            setStaff(response.data);
        } catch (err) {
            console.error("Fetch staff error:", err);
            setError("Failed to load staff list");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (staffId, action, currentStatus) => {
        let confirmMessage = "";
        if (action === "remove") {
            confirmMessage = "Are you sure you want to permanently remove this staff member?";
        } else {
            const verb = action === "activate" ? "activate" : "deactivate";
            confirmMessage = `Are you sure you want to ${verb} this staff member?`;
        }

        if (!confirm(confirmMessage)) return;

        try {
            if (action === "remove") {
                // Permanently delete
                await api.delete(`/api/auth/staff/${staffId}/?permanent=true`);
            } else if (action === "deactivate") {
                await api.delete(`/api/auth/staff/${staffId}/`);
            } else if (action === "activate") {
                await api.patch(`/api/auth/staff/${staffId}/`, { is_active: true });
            }
            fetchStaff();
        } catch (err) {
            console.error(`${action} staff error:`, err);
            alert(`Failed to ${action} staff member`);
        }
    };

    if (user?.role !== "OWNER") {
        return <div>You are not authorized to view this page.</div>;
    }

    if (loading) {
        return <div className="text-slate-600">Loading staff...</div>;
    }

    if (error) {
        return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
            </div>

            {staff.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center text-slate-500">
                    No staff members yet. Use "Invite Staff" to add staff.
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {staff.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{member.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{member.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {member.is_active ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <select
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAction(member.id, e.target.value, member.is_active);
                                                    e.target.value = ""; // Reset dropdown
                                                }
                                            }}
                                            className="rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Actions</option>
                                            {member.is_active ? (
                                                <option value="deactivate">Deactivate</option>
                                            ) : (
                                                <option value="activate">Activate</option>
                                            )}
                                            <option value="remove" className="text-red-600">Remove</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
