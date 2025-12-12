import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

/* Reusable Dashboard Card */
const StatCard = ({ title, value, subtext }) => (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
        </div>
        <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
        <p className="mt-1 text-xs font-medium text-slate-400">
            {subtext}
        </p>
    </div>
);

export const OwnerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await client.get('/api/dashboard/stats/');
                setStats(response.data);
            } catch (err) {
                console.error("Stats fetch error:", err);
                setError("Failed to load dashboard stats.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-slate-600">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
    }

    return (
        <section className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back, {user?.username || "Owner"}
                </h1>
                <p className="mt-2 text-base text-slate-600">
                    Here's what's happening in your store today.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    title="Total Products"
                    value={stats?.total_products ?? 0}
                    subtext="Active in catalog"
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.total_orders ?? 0}
                    subtext="All time"
                />
                <StatCard
                    title="Revenue"
                    value={`$${(stats?.total_revenue ?? 0).toLocaleString()}`}
                    subtext="From paid orders"
                />
            </div>

            {/* Placeholder for Recent Activity or Charts */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 min-h-[200px] flex items-center justify-center text-slate-400">
                <span className="text-sm">Activity Chart Placeholder</span>
            </div>
        </section>
    );
};

export const StaffDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await client.get('/api/auth/staff-stats/');
                setStats(response.data);
            } catch (err) {
                console.error("Stats fetch error:", err);
                setError("Failed to load dashboard stats.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-slate-600">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Staff Dashboard</h1>
                <p className="text-slate-600">Overview of your assigned tasks.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <StatCard title="Assigned Products" value={stats?.assigned_products ?? 0} subtext="Products managed by you" />
                <StatCard title="Orders to Process" value={stats?.orders_to_process ?? 0} subtext="Pending shipment" />
            </div>
        </section>
    );
};

export const CustomerDashboard = () => {
    const navigate = useNavigate();
    return (
        <section className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center md:text-left md:flex justify-between items-center border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome to our store!</h1>
                    <p className="mt-2 text-slate-600 max-w-xl">
                        Browse our collection of premium products and place your order today.
                        Check back here to track your order status.
                    </p>
                </div>
                <div className="mt-6 md:mt-0 flex gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium shadow-sm transition"
                    >
                        Browse Products
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-md font-medium transition"
                    >
                        My Orders
                    </button>
                </div>
            </div>
        </section>
    );
};
