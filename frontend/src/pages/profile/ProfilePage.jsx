import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

            <div className="bg-white shadow rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500">Username</label>
                        <p className="mt-1 text-lg font-medium text-slate-900">{user?.username || "N/A"}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500">Role</label>
                        <p className="mt-1 text-lg font-medium text-slate-900">{user?.role || "N/A"}</p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Store Name</label>
                    <p className="mt-1 text-lg font-medium text-slate-900">{user?.tenant_name || "No store associated"}</p>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500">Store ID</label>
                    <p className="mt-1 text-sm text-slate-600">{user?.tenant_id || "N/A"}</p>
                </div>
            </div>
        </div>
    );
}
