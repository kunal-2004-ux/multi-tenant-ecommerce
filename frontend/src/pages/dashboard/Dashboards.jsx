import React from 'react';

export const OwnerDashboard = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Welcome, Owner!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Total Products" value="12" />
            <Card title="Total Orders" value="45" />
            <Card title="Revenue" value="$12,450" />
        </div>
    </div>
);

export const StaffDashboard = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Welcome, Staff!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Assigned Products" value="5" />
            <Card title="Orders to Ship" value="8" />
        </div>
    </div>
);

export const CustomerDashboard = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold">Welcome, Customer!</h2>
        <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Browse Products</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded">My Orders</button>
        </div>
    </div>
);

const Card = ({ title, value }) => (
    <div className="bg-white p-6 rounded shadow">
        <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
);

export const ProductListPage = () => <div className="text-2xl font-bold">Products List (Placeholder)</div>;
export const OrderListPage = () => <div className="text-2xl font-bold">Orders List (Placeholder)</div>;
